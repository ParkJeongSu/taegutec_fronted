<template>
  <div class="svg-drawing-viewer-root">
    <!-- 로딩 인디케이터 -->
    <div v-if="isLoading" class="svg-loading-overlay d-flex flex-column align-center justify-center">
      <v-progress-circular indeterminate color="primary" size="40" class="mb-2"></v-progress-circular>
      <span class="text-caption text-medium-emphasis">도면 로딩 중...</span>
    </div>

    <!-- 에러 표시 영역 -->
    <div v-if="hasError" class="svg-error-overlay pa-4 d-flex flex-column align-center justify-center">
      <v-icon icon="$alertCircle" size="36" color="error" class="mb-2" />
      <span class="text-body-2 text-error font-weight-medium">도면을 불러오지 못했습니다.</span>
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
})

const emit = defineEmits(['click-position', 'loaded', 'error'])

const containerRef = ref(null)
const isLoading = ref(false)
const hasError = ref(false)
const errorMessage = ref('')

// 1. 크레인 위치 업데이트 함수 (SVG 내부 #crane-unit 변형)
function updateCranePosition(pos) {
  if (!containerRef.value || !pos) {
    return
  }
  const craneEl = containerRef.value.querySelector('#crane-unit')
  if (craneEl) {
    const x = typeof pos.x === 'number' ? pos.x : 200
    const y = typeof pos.y === 'number' ? pos.y : 190
    craneEl.setAttribute('transform', 'translate(' + x + ', ' + y + ')')
  }
}

// 2. 이벤트 위임: 트레이 포지션(id="pos-...") 클릭 감지 핸들러
function handleContainerClick(event) {
  if (!containerRef.value) {
    return
  }
  let target = event.target
  while (target && target !== containerRef.value) {
    if (target.id && target.id.indexOf('pos-') === 0) {
      emit('click-position', target.id)
      break
    }
    target = target.parentElement
  }
}

// 3. 외부 SVG 파일 fetch 및 주입 함수
async function loadSvg(url) {
  if (!url) {
    return
  }
  isLoading.value = true
  hasError.value = false
  errorMessage.value = ''

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('도면 파일을 불러올 수 없습니다 (상태코드: ' + response.status + ')')
    }
    const svgText = await response.text()
    if (containerRef.value) {
      containerRef.value.innerHTML = svgText
      updateCranePosition(props.cranePos)
    }
    emit('loaded')
  } catch (err) {
    hasError.value = true
    errorMessage.value = err && err.message ? err.message : 'SVG 로드 실패'
    emit('error', err)
  } finally {
    isLoading.value = false
  }
}

// 4. 라이프사이클 훅
onMounted(function () {
  if (containerRef.value) {
    containerRef.value.addEventListener('click', handleContainerClick)
  }
  loadSvg(props.src)
})

onBeforeUnmount(function () {
  if (containerRef.value) {
    containerRef.value.removeEventListener('click', handleContainerClick)
  }
})

// 5. Props 변경 감지
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
</script>

<style scoped>
.svg-drawing-viewer-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 420px;
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
  background-color: rgba(248, 250, 252, 0.85);
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
  display: block;
}
</style>
