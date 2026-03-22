'use client'

// =====================================================
// 위치 정보 훅 - 사용자의 현재 위치(GPS)를 가져오는 기능입니다
// 브라우저에 내장된 위치 정보 API를 사용합니다
// =====================================================

import { useState, useEffect } from 'react'
import { LatLng } from '@/lib/types'

// 위치 정보 상태 타입 정의
interface GeolocationState {
  location: LatLng | null  // 현재 위치 좌표 (없으면 null)
  error: string | null     // 오류 메시지 (없으면 null)
  loading: boolean         // 위치 정보를 불러오는 중인지 여부
}

// 서울 강남역 기본 위치 (GPS를 사용할 수 없을 때 대체 위치로 사용)
export const DEFAULT_LOCATION: LatLng = {
  lat: 37.4979,
  lng: 127.0276,
}

// useGeolocation 훅 - 컴포넌트에서 "const { location } = useGeolocation()" 으로 사용합니다
export function useGeolocation() {
  // ⚠️ 중요: 초기값을 서버/클라이언트 모두 동일하게 설정해야 합니다
  // navigator는 브라우저에만 있으므로 useState 초기값에서 참조하면 안 됩니다
  // → 무조건 loading: true, location: null 로 시작하고 useEffect에서 처리합니다
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: true,
  })

  // 컴포넌트가 브라우저에 나타난 후에만 실행됩니다 (서버에서는 실행 안 됨)
  useEffect(() => {
    // 브라우저가 위치 정보 기능을 지원하는지 확인
    const isSupported = 'geolocation' in navigator

    // 위치 기능이 지원되지 않으면 기본 위치(강남역) 사용
    if (!isSupported) {
      setState({
        location: DEFAULT_LOCATION,
        error: '이 기기에서는 위치 정보를 사용할 수 없어요. 기본 위치(강남역)를 사용합니다.',
        loading: false,
      })
      return
    }

    // 브라우저에 위치 정보 요청
    navigator.geolocation.getCurrentPosition(
      // 위치 정보를 성공적으로 받았을 때 실행
      (position) => {
        setState({
          location: {
            lat: position.coords.latitude,   // 위도
            lng: position.coords.longitude,  // 경도
          },
          error: null,
          loading: false,
        })
      },
      // 위치 정보 요청이 실패했을 때 실행 (거부하거나 시간 초과 등)
      (err) => {
        let errorMessage = '위치 정보를 가져올 수 없어요.'

        // 오류 종류에 따라 다른 메시지 표시
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = '위치 정보 접근이 거부되었어요. 브라우저 설정에서 허용해주세요.'
            break
          case err.POSITION_UNAVAILABLE:
            errorMessage = '현재 위치를 찾을 수 없어요. 기본 위치(강남역)를 사용합니다.'
            break
          case err.TIMEOUT:
            errorMessage = '위치 정보 요청 시간이 초과되었어요. 기본 위치(강남역)를 사용합니다.'
            break
        }

        // 오류가 나도 앱이 동작하도록 기본 위치 사용
        setState({
          location: DEFAULT_LOCATION,
          error: errorMessage,
          loading: false,
        })
      },
      // 위치 정보 요청 옵션
      {
        enableHighAccuracy: true,  // 높은 정확도 사용
        timeout: 10000,            // 10초 안에 응답 없으면 포기
        maximumAge: 60000,         // 1분 이내 캐시된 위치 사용 허용
      }
    )
  }, []) // 빈 배열 = 컴포넌트가 처음 나타날 때 한 번만 실행

  return state
}
