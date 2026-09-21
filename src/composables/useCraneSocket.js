// src/composables/useCraneSocket.js
import { ref } from 'vue'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

/**
 * 실시간 크레인 좌표 수신을 위한 WebSocket(STOMP) Composable
 * @returns {Object} { isConnected, connectionStatusText, connectCraneSocket, disconnectCraneSocket }
 */
export function useCraneSocket() {
  const isConnected = ref(false)
  const connectionStatusText = ref('WebSocket 연결 대기')

  let stompClient = null
  let currentSubscription = null

  /**
   * WebSocket(STOMP) 연결 및 크레인 토픽 구독
   * @param {string|number} warehouseId - 창고 ID (예: '1')
   * @param {Function} onPositionReceived - 좌표 수신 콜백 (payload: { x: number, y: number, ... })
   */
  function connectCraneSocket(warehouseId, onPositionReceived) {
    if (stompClient && stompClient.active) {
      console.log('[useCraneSocket] 이미 연결되어 있습니다.')
      return
    }

    // ✅ 수정 코드: 상대 경로 지정 (접속 중인 도메인/IP의 80번 포트 Nginx로 전달됨)
    const wsUrl = import.meta.env.VITE_WS_URL || '/wcs-web/ws-stomp'
    const topicPath = '/topic/warehouse/' + warehouseId + '/crane'

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
        console.log('[useCraneSocket] STOMP 연결 성공. 토픽 구독:', topicPath)

        currentSubscription = stompClient.subscribe(topicPath, function (message) {
          if (!message || !message.body) {
            return
          }
          try {
            const payload = JSON.parse(message.body)
            if (onPositionReceived && typeof onPositionReceived === 'function') {
              onPositionReceived(payload)
            }
          } catch (err) {
            console.error('[useCraneSocket] 메시지 파싱 오류:', err, message.body)
          }
        })
      },

      onDisconnect: function () {
        isConnected.value = false
        connectionStatusText.value = 'WebSocket 연결 대기'
        console.log('[useCraneSocket] STOMP 연결 해제됨')
      },

      onStompError: function (frame) {
        isConnected.value = false
        connectionStatusText.value = 'WebSocket 오류'
        console.error(
          '[useCraneSocket] Broker reported error:',
          frame.headers['message'],
          frame.body,
        )
      },

      onWebSocketClose: function () {
        isConnected.value = false
        connectionStatusText.value = 'WebSocket 연결 대기'
        console.log('[useCraneSocket] WebSocket 소켓 종료됨')
      },
    })

    stompClient.activate()
  }

  /**
   * WebSocket(STOMP) 연결 해제
   */
  function disconnectCraneSocket() {
    if (currentSubscription) {
      try {
        currentSubscription.unsubscribe()
      } catch (e) {
        console.warn('[useCraneSocket] 구독 해제 중 오류:', e)
      }
      currentSubscription = null
    }

    if (stompClient) {
      try {
        stompClient.deactivate()
      } catch (e) {
        console.warn('[useCraneSocket] STOMP 비활성화 중 오류:', e)
      }
      stompClient = null
    }

    isConnected.value = false
    connectionStatusText.value = 'WebSocket 연결 대기'
  }

  return {
    isConnected,
    connectionStatusText,
    connectCraneSocket,
    disconnectCraneSocket,
  }
}
