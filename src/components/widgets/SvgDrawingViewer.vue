<template>
  <div class="svg-drawing-viewer-root">
    <!-- 로딩 인디케이터 -->
    <div
      v-if="isLoading"
      class="svg-loading-overlay d-flex flex-column align-center justify-center"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="40"
        class="mb-2"
      ></v-progress-circular>
      <span class="text-caption text-medium-emphasis">도면 불러오는 중...</span>
    </div>

    <!-- 에러 표시 영역 -->
    <div
      v-if="hasError"
      class="svg-error-overlay pa-4 d-flex flex-column align-center justify-center"
    >
      <v-icon icon="$alertCircle" size="36" color="error" class="mb-2" />
      <span class="text-body-2 text-error font-weight-medium">도면 파일을 불러올 수 없습니다.</span>
      <span class="text-caption text-medium-emphasis mt-1">{{ errorMessage }}</span>
    </div>

    <!-- SVG DOM 주입 컨테이너 -->
    <div ref="containerRef" class="svg-container-viewport"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  cranePos: {
    type: Object,
    default: function () {
      return { x: 200, y: 190 }
    },
  },
  // 트레이 목록: [{ carrierName: 'TRAY_01', positionId: 'pos-31101', state: 'MOVING' }]
  trayList: {
    type: Array,
    default: function () {
      return []
    },
  },
})

const emit = defineEmits(['click-position', 'dblclick-tray', 'loaded', 'error'])

const containerRef = ref(null)
const isLoading = ref(false)
const hasError = ref(false)
const errorMessage = ref('')

// pos 노드 ID별 중심 좌표 맵: { "pos-31101": { x: 420, y: 180 }, ... }
const nodeCoordsMap = {}

// 1. SVG 내의 pos- 노드 중심 좌표 자동 추출
function cacheNodePositions() {
  if (!containerRef.value) return
  const svg = containerRef.value.querySelector('svg')
  if (!svg) return

  const posElements = svg.querySelectorAll('[id^="pos-"]')
  const svgCTM = svg.getScreenCTM() // SVG 루트의 기준 CTM
  if (!svgCTM) return

  for (let i = 0; i < posElements.length; i++) {
    const el = posElements[i]
    try {
      // 1. 해당 엘리먼트의 로컬 바운딩 박스
      const bbox = el.getBBox()
      const localCenterX = bbox.x + bbox.width / 2
      const localCenterY = bbox.y + bbox.height / 2

      // 2. SVG 루트 기준의 실제 절대 좌표로 변환 (부모 <g>의 transform 전부 합산)
      const pt = svg.createSVGPoint()
      pt.x = localCenterX
      pt.y = localCenterY

      // 엘리먼트의 변환 행렬을 거친 뒤 SVG 루트 좌표계로 매핑
      const elCTM = el.getScreenCTM()
      if (elCTM) {
        const screenPt = pt.matrixTransform(elCTM)
        const finalSvgPt = screenPt.matrixTransform(svgCTM.inverse())

        nodeCoordsMap[el.id] = {
          x: Math.round(finalSvgPt.x),
          y: Math.round(finalSvgPt.y),
        }
      }
    } catch (err) {
      console.warn('Failed to calculate absolute coords for node:', el.id, err)
    }
  }

  console.log('[SvgDrawingViewer] Cached node positions:', nodeCoordsMap)
}

// 2. 크레인 위치 업데이트
function updateCranePosition(pos) {
  if (!containerRef.value || !pos) return
  const craneEl = containerRef.value.querySelector('#crane-unit')
  if (craneEl) {
    const x = typeof pos.x === 'number' ? pos.x : 200
    const y = typeof pos.y === 'number' ? pos.y : 190
    craneEl.setAttribute('transform', 'translate(' + x + ', ' + y + ')')
  }
}

// 3. 트레이 SVG 엘리먼트 렌더링 및 부드러운 위치 갱신
function updateTrayPositions(trays) {
  if (!containerRef.value) return
  const svg = containerRef.value.querySelector('svg')
  if (!svg) return

  // 트레이 전용 레이어 컨테이너 가져오기 or 생성
  let trayLayer = svg.querySelector('#tray-layer')
  if (!trayLayer) {
    trayLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    trayLayer.setAttribute('id', 'tray-layer')
    svg.appendChild(trayLayer)
  }

  // 현재 활성 트레이 ID 추적용 맵
  const activeTrayIds = {}

  for (let i = 0; i < trays.length; i++) {
    const tray = trays[i]
    if (!tray || !tray.carrierName || !tray.positionId) continue

    const targetCoord = nodeCoordsMap[tray.positionId]
    if (!targetCoord) continue // 등록되지 않은 노드면 패스

    activeTrayIds[tray.carrierName] = true
    let trayEl = trayLayer.querySelector('#tray-' + tray.carrierName)

    // 신규 트레이 엘리먼트 생성
    if (!trayEl) {
      trayEl = createTraySvgElement(tray.carrierName)
      trayLayer.appendChild(trayEl)
      // 생성 직후 첫 위치 세팅 (애니메이션 없이 즉시 배치)
      trayEl.setAttribute('transform', 'translate(' + targetCoord.x + ', ' + targetCoord.y + ')')
    } else {
      // 이미 존재하는 트레이는 translate만 갱신 -> CSS transition에 의해 부드럽게 이동
      trayEl.setAttribute('transform', 'translate(' + targetCoord.x + ', ' + targetCoord.y + ')')
    }
  }

  // 메시지에서 사라진 트레이(작업 완료/반출) 엘리먼트 자동 제거
  const allExistingTrays = trayLayer.querySelectorAll('.tray-unit')
  for (let j = 0; j < allExistingTrays.length; j++) {
    const el = allExistingTrays[j]
    const cName = el.getAttribute('data-carrier')
    if (!activeTrayIds[cName]) {
      trayLayer.removeChild(el)
    }
  }
}

// 표준 트레이(Tray/Carrier) SVG 그래픽 노드 생성
function createTraySvgElement(carrierName) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  g.setAttribute('id', 'tray-' + carrierName)
  g.setAttribute('class', 'tray-unit')
  g.setAttribute('data-carrier', carrierName)

  // 1. 트레이 베이스 (너비 68 x 높이 46, 중심 기준 -34, -23)
  const base = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  base.setAttribute('x', '-34')
  base.setAttribute('y', '-23')
  base.setAttribute('width', '68')
  base.setAttribute('height', '46')
  base.setAttribute('class', 'tray-base')

  // 2. 내부 포켓
  const inner = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  inner.setAttribute('x', '-28')
  inner.setAttribute('y', '-18')
  inner.setAttribute('width', '56')
  inner.setAttribute('height', '36')
  inner.setAttribute('class', 'tray-inner')

  // 3. 트레이 캐리어 라벨
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  text.setAttribute('x', '0')
  text.setAttribute('y', '0')
  text.setAttribute('class', 'tray-label')
  text.textContent = carrierName

  g.appendChild(base)
  g.appendChild(inner)
  g.appendChild(text)

  return g
}

// 트레이(Carrier) 더블클릭 감지 핸들러
function handleContainerDblClick(event) {
  if (!containerRef.value) return
  let target = event.target
  while (target && target !== containerRef.value) {
    if (target.classList && target.classList.contains('tray-unit')) {
      const carrierName = target.getAttribute('data-carrier')
      if (carrierName) {
        emit('dblclick-tray', carrierName)
      }
      break
    }
    target = target.parentElement
  }
}

// 4. 클릭 이벤트 위임
function handleContainerClick(event) {
  if (!containerRef.value) return
  let target = event.target
  while (target && target !== containerRef.value) {
    if (target.id && target.id.indexOf('pos-') === 0) {
      emit('click-position', target.id)
      break
    }
    target = target.parentElement
  }
}

// 5. SVG 비동기 로드
async function loadSvg(url) {
  if (!url) return
  isLoading.value = true
  hasError.value = false
  errorMessage.value = ''

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('도면 파일을 불러오지 못했습니다. (status: ' + response.status + ')')
    }
    const svgText = await response.text()
    if (containerRef.value) {
      containerRef.value.innerHTML = svgText
      cacheNodePositions()
      updateCranePosition(props.cranePos)
      updateTrayPositions(props.trayList)
    }
    emit('loaded')
  } catch (err) {
    hasError.value = true
    errorMessage.value = err && err.message ? err.message : 'Failed to load SVG'
    emit('error', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(function () {
  if (containerRef.value) {
    containerRef.value.addEventListener('click', handleContainerClick)
    containerRef.value.addEventListener('dblclick', handleContainerDblClick) // 👈 추가
  }
  loadSvg(props.src)
})

onBeforeUnmount(function () {
  if (containerRef.value) {
    containerRef.value.removeEventListener('click', handleContainerClick)
    containerRef.value.removeEventListener('dblclick', handleContainerDblClick) // 👈 추가
  }
})

watch(
  function () {
    return props.src
  },
  function (newUrl) {
    loadSvg(newUrl)
  },
)

watch(
  function () {
    return props.cranePos
  },
  function (newPos) {
    updateCranePosition(newPos)
  },
  { deep: true },
)

// 트레이 목록 변경(웹소켓 수신) 시 실시간 위치 갱신
watch(
  function () {
    return props.trayList
  },
  function (newTrays) {
    updateTrayPositions(newTrays)
  },
  { deep: true },
)
</script>

<style scoped>
.svg-drawing-viewer-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 480px;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.svg-loading-overlay,
.svg-error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(248, 250, 252, 0.88);
  z-index: 10;
}

.svg-container-viewport {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(svg) {
  width: 100%;
  height: 100%;
  max-width: 1000px;
  display: block;
}

/* 크레인 부드러운 주행 애니메이션 */
:deep(#crane-unit) {
  transition: transform 1.2s cubic-bezier(0.25, 0.1, 0.25, 1);
  will-change: transform;
}

/* 트레이 이동 애니메이션 (컨베이어 속도에 맞게 0.7초 보간) */
:deep(.tray-unit) {
  transition: transform 0.7s cubic-bezier(0.25, 0.1, 0.25, 1);
  will-change: transform;
  cursor: pointer;
}

/* 트레이 외형 스타일링 */
:deep(.tray-body) {
  fill: #2563eb;
  stroke: #1d4ed8;
  stroke-width: 1.5;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

:deep(.tray-unit:hover .tray-body) {
  fill: #1d4ed8;
}

:deep(.tray-label) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 10px;
  font-weight: 700;
  fill: #ffffff;
  text-anchor: middle;
  dominant-baseline: middle;
  pointer-events: none;
}
</style>
