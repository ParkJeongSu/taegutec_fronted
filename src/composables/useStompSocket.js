// src/composables/useStompSocket.js
import { ref } from 'vue'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

// 1. 모듈 스코프 전역 상태 (단일 커넥션 및 상태 공유)
const isConnected = ref(false)
const connectionStatusText = ref('WebSocket 연결 대기')

let stompClient = null

// 등록된 토픽 및 콜백 배열, STOMP 구독 객체를 관리하는 맵
// 구조: Map<topicPath, { callbacks: Function[], subscription: Object|null }>
const subscriptions = new Map()

/**
 * 개별 토픽에 대한 실제 STOMP subscribe 처리
 * @param {string} topic
 * @param {Object} subInfo
 */
function subscribeTopicInternal(topic, subInfo) {
  if (!stompClient || !stompClient.connected) {
    return
  }

  // 이미 활성화된 STOMP 구독 객체가 있으면 해제 후 재구독
  if (subInfo.subscription) {
    try {
      subInfo.subscription.unsubscribe()
    } catch (e) {
      console.warn('[useStompSocket] 기존 토픽 구독 해제 실패 (' + topic + '):', e)
    }
    subInfo.subscription = null
  }

  try {
    const subscriptionInstance = stompClient.subscribe(topic, function (message) {
      if (!message || !message.body) {
        return
      }
      try {
        const payload = JSON.parse(message.body)
        for (let i = 0; i < subInfo.callbacks.length; i++) {
          const cb = subInfo.callbacks[i]
          if (typeof cb === 'function') {
            try {
              cb(payload, message)
            } catch (cbErr) {
              console.error('[useStompSocket] 콜백 실행 오류 (' + topic + '):', cbErr)
            }
          }
        }
      } catch (err) {
        console.error('[useStompSocket] 메시지 파싱 오류 (' + topic + '):', err, message.body)
      }
    })
    subInfo.subscription = subscriptionInstance
    console.log('[useStompSocket] 토픽 브로커 구독 완료:', topic)
  } catch (err) {
    console.error('[useStompSocket] 토픽 구독 실패 (' + topic + '):', err)
  }
}

/**
 * 등록되어 있는 모든 토픽 재구독 (재연결 시 복구용)
 */
function resubscribeAllTopics() {
  const entries = Array.from(subscriptions.entries())
  for (let i = 0; i < entries.length; i++) {
    const topic = entries[i][0]
    const subInfo = entries[i][1]
    if (subInfo && subInfo.callbacks && subInfo.callbacks.length > 0) {
      subInfo.subscription = null
      subscribeTopicInternal(topic, subInfo)
    }
  }
}

/**
 * SockJS 기반 STOMP 클라이언트 초기화 및 연결
 */
function initStompClient() {
  if (stompClient && stompClient.active) {
    return
  }

  const wsUrl = import.meta.env.VITE_WS_URL || '/wcs-web/ws-stomp'
  connectionStatusText.value = 'WebSocket 연결 시도 중...'

  stompClient = new Client({
    webSocketFactory: function () {
      return new SockJS(wsUrl)
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,

    onConnect: function () {
      isConnected.value = true
      connectionStatusText.value = 'WebSocket 실시간 연결됨'
      console.log('[useStompSocket] STOMP 연결 성공. 등록된 토픽 재구독 시작...')
      resubscribeAllTopics()
    },

    onDisconnect: function () {
      isConnected.value = false
      connectionStatusText.value = 'WebSocket 연결 대기'
      console.log('[useStompSocket] STOMP 연결 해제됨')

      // 연결 해제 시 구독 객체 참조 초기화
      const entries = Array.from(subscriptions.entries())
      for (let i = 0; i < entries.length; i++) {
        const subInfo = entries[i][1]
        subInfo.subscription = null
      }
    },

    onStompError: function (frame) {
      isConnected.value = false
      connectionStatusText.value = 'WebSocket 오류'
      console.error(
        '[useStompSocket] STOMP Broker 에러:',
        frame && frame.headers ? frame.headers['message'] : 'No message',
        frame ? frame.body : ''
      )
    },

    onWebSocketClose: function () {
      isConnected.value = false
      connectionStatusText.value = 'WebSocket 연결 대기'
      console.log('[useStompSocket] WebSocket 닫힘')

      const entries = Array.from(subscriptions.entries())
      for (let i = 0; i < entries.length; i++) {
        const subInfo = entries[i][1]
        subInfo.subscription = null
      }
    },
  })

  stompClient.activate()
}

/**
 * 특정 토픽 구독 등록 (다중 콜백 지원)
 * @param {string} topic - 구독할 STOMP 토픽 경로 (예: '/topic/warehouse/1/crane')
 * @param {Function} callback - 메시지 수신 시 실행될 콜백 함수
 */
function subscribe(topic, callback) {
  if (!topic || typeof topic !== 'string') {
    console.warn('[useStompSocket] 유효한 토픽 경로가 필요합니다.')
    return
  }

  // 토픽 맵에 등록 또는 콜백 배열에 추가
  let subInfo = subscriptions.get(topic)
  if (!subInfo) {
    subInfo = {
      callbacks: [],
      subscription: null,
    }
    subscriptions.set(topic, subInfo)
  }

  // 콜백 중복 등록 방지 검사
  if (typeof callback === 'function') {
    let alreadyExists = false
    for (let i = 0; i < subInfo.callbacks.length; i++) {
      if (subInfo.callbacks[i] === callback) {
        alreadyExists = true
        break
      }
    }
    if (!alreadyExists) {
      subInfo.callbacks.push(callback)
    }
  }

  // 클라이언트가 초기화되지 않았거나 비활성화되어 있다면 초기화 및 연결 시도
  if (!stompClient || !stompClient.active) {
    initStompClient()
  } else if (stompClient.connected) {
    // 이미 연결된 상태에서 아직 브로커 구독이 없다면 구독 수행
    if (!subInfo.subscription) {
      subscribeTopicInternal(topic, subInfo)
    }
  }
}

/**
 * 특정 토픽 또는 콜백 구독 해제
 * @param {string} topic - 구독 해제할 STOMP 토픽 경로
 * @param {Function} [callback] - 특정 콜백 함수 (생략 시 해당 토픽의 모든 콜백 및 구독 해제)
 */
function unsubscribe(topic, callback) {
  if (!topic || !subscriptions.has(topic)) {
    return
  }

  const subInfo = subscriptions.get(topic)
  if (!subInfo) {
    return
  }

  // 1. 콜백 함수가 인자로 전달된 경우: 해당 콜백만 배열에서 제거
  if (callback && typeof callback === 'function') {
    const remaining = []
    for (let i = 0; i < subInfo.callbacks.length; i++) {
      if (subInfo.callbacks[i] !== callback) {
        remaining.push(subInfo.callbacks[i])
      }
    }
    subInfo.callbacks = remaining
  } else {
    // 콜백 미지정 시 전체 콜백 비우기
    subInfo.callbacks = []
  }

  // 2. 등록된 콜백이 더 이상 없으면 실제 브로커 구독 해제 및 맵 삭제
  if (subInfo.callbacks.length === 0) {
    if (subInfo.subscription) {
      try {
        subInfo.subscription.unsubscribe()
      } catch (e) {
        console.warn('[useStompSocket] 토픽 구독 해제 중 오류 (' + topic + '):', e)
      }
      subInfo.subscription = null
    }

    subscriptions.delete(topic)
    console.log('[useStompSocket] 토픽 구독 완전 해제 완료:', topic)
  } else {
    console.log('[useStompSocket] 특정 콜백 해제 완료 (잔여 콜백: ' + subInfo.callbacks.length + '개):', topic)
  }
}

/**
 * 모든 토픽 구독 해제 및 WebSocket 전체 연결 종료
 */
function disconnectAll() {
  const entries = Array.from(subscriptions.entries())
  for (let i = 0; i < entries.length; i++) {
    const topic = entries[i][0]
    const subInfo = entries[i][1]
    if (subInfo && subInfo.subscription) {
      try {
        subInfo.subscription.unsubscribe()
      } catch (e) {
        console.warn('[useStompSocket] 전체 해제 중 오류 (' + topic + '):', e)
      }
    }
  }
  subscriptions.clear()

  if (stompClient) {
    try {
      stompClient.deactivate()
    } catch (e) {
      console.warn('[useStompSocket] STOMP 비활성화 중 오류:', e)
    }
    stompClient = null
  }

  isConnected.value = false
  connectionStatusText.value = 'WebSocket 연결 대기'
  console.log('[useStompSocket] 모든 구독 및 STOMP 연결 해제됨')
}

/**
 * 범용 STOMP WebSocket Composable
 * @returns {Object} { isConnected, connectionStatusText, initStompClient, subscribe, unsubscribe, disconnectAll }
 */
export function useStompSocket() {
  return {
    isConnected: isConnected,
    connectionStatusText: connectionStatusText,
    initStompClient: initStompClient,
    subscribe: subscribe,
    unsubscribe: unsubscribe,
    disconnectAll: disconnectAll,
  }
}
