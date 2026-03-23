'use client'

// =====================================================
// 네이버 지도 컴포넌트 - 식당 위치를 지도에 마커로 표시합니다
// 네이버 지도 JavaScript API v3를 사용합니다
// 공식 문서: https://navermaps.github.io/maps.js.ncp/docs/
// =====================================================

import { useEffect, useRef, useState } from 'react'
import { Restaurant, LatLng } from '@/lib/types'
import { formatPrice } from '@/lib/mockData'

// 네이버 지도 타입을 TypeScript에서 사용하기 위한 선언
// (네이버 지도 SDK는 window.naver 객체에 로드됩니다)
declare global {
  interface Window {
    naver: any
  }
}

interface MapViewProps {
  restaurants: Restaurant[]           // 지도에 표시할 식당 목록
  userLocation: LatLng | null        // 내 현재 위치
  selectedRestaurant: Restaurant | null  // 선택된 식당 (마커 강조 표시)
  onMarkerClick: (restaurant: Restaurant) => void  // 마커 클릭 시 실행
  favorites: string[]                // 즐겨찾기된 식당 ID 목록
}

export function MapView({
  restaurants,
  userLocation,
  selectedRestaurant,
  onMarkerClick,
  favorites,
}: MapViewProps) {
  // 지도를 렌더링할 HTML 요소 참조
  const mapRef = useRef<HTMLDivElement>(null)

  // 네이버 지도 인스턴스 (초기에는 null, 지도 로드 후 설정됨)
  const mapInstance = useRef<any>(null)

  // 지도 위의 마커들을 저장하는 Map (식당ID → 마커 객체)
  const markersRef = useRef<Map<string, any>>(new Map())

  // 내 위치 마커 (파란 점)
  const myLocationMarkerRef = useRef<any>(null)

  // 지도 로딩 상태
  const [mapLoaded, setMapLoaded] = useState(false)
  const [scriptError, setScriptError] = useState(false)

  // ── 네이버 지도 스크립트 로드 ──
  useEffect(() => {
    // 이미 로드된 경우 중복 로드 방지
    if (window.naver && window.naver.maps) {
      setMapLoaded(true)
      return
    }

    // 네이버 지도 API 키 (환경 변수에서 가져옴)
    const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID

    // API 키가 없거나 플레이스홀더이면 더미 지도 표시
    if (!clientId || clientId.startsWith('YOUR_')) {
      setScriptError(true)
      return
    }

    // 네이버 지도 스크립트 동적으로 추가
    const script = document.createElement('script')
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}&submodules=geocoder`
    script.async = true

    // 스크립트 로드 성공 - onload 시점에 naver.maps가 아직 세팅 중일 수 있어
    // 짧게 대기 후 확인
    script.onload = () => {
      const check = (retries: number) => {
        if (window.naver && window.naver.maps) {
          setMapLoaded(true)
        } else if (retries > 0) {
          setTimeout(() => check(retries - 1), 200)
        } else {
          setScriptError(true)
        }
      }
      check(10) // 최대 2초(10 × 200ms) 대기
    }

    // 스크립트 로드 실패 (잘못된 API 키, 도메인 미등록 등)
    script.onerror = () => {
      console.error('네이버 지도 스크립트를 불러올 수 없어요.')
      setScriptError(true)
    }

    document.head.appendChild(script)

    // 컴포넌트가 사라질 때 스크립트 제거
    return () => {
      document.head.removeChild(script)
    }
  }, [])

  // ── 지도 초기화 (스크립트 로드 완료 후) ──
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstance.current) return
    if (!window.naver || !window.naver.maps) {
      setScriptError(true)
      return
    }

    // 초기 지도 중심 위치 (사용자 위치 또는 강남역)
    const center = userLocation || { lat: 37.4979, lng: 127.0276 }

    try {
      // 네이버 지도 생성
      mapInstance.current = new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(center.lat, center.lng),
        zoom: 15,
        zoomControl: true,
        zoomControlOptions: {
          position: window.naver.maps.Position.TOP_RIGHT,
        },
        mapTypeControl: false,
      })
    } catch (e) {
      console.error('지도 초기화 실패:', e)
      setScriptError(true)
    }
  }, [mapLoaded, userLocation])

  // ── 내 위치 마커 표시 ──
  useEffect(() => {
    if (!mapLoaded || !mapInstance.current || !userLocation) return

    // 기존 내 위치 마커 제거
    if (myLocationMarkerRef.current) {
      myLocationMarkerRef.current.setMap(null)
    }

    // 내 위치를 나타내는 파란 원형 마커 생성
    myLocationMarkerRef.current = new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(userLocation.lat, userLocation.lng),
      map: mapInstance.current,
      icon: {
        // SVG로 파란 점 마커 직접 그리기
        content: `
          <div style="position:relative; width:20px; height:20px;">
            <div style="
              width:20px; height:20px;
              background:#4285f4;
              border:3px solid white;
              border-radius:50%;
              box-shadow:0 2px 6px rgba(0,0,0,0.3);
            "></div>
            <div style="
              position:absolute; top:50%; left:50%;
              transform:translate(-50%,-50%);
              width:40px; height:40px;
              background:rgba(66,133,244,0.2);
              border-radius:50%;
              animation:pulse 2s ease-in-out infinite;
            "></div>
          </div>
        `,
        anchor: new window.naver.maps.Point(10, 10),  // 마커 앵커 포인트 (중앙)
      },
      title: '내 위치',
    })
  }, [mapLoaded, userLocation])

  // ── 식당 마커들 표시 ──
  useEffect(() => {
    if (!mapLoaded || !mapInstance.current) return

    // 기존 마커 모두 제거
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current.clear()

    // 각 식당에 대해 마커 생성
    restaurants.forEach(restaurant => {
      const isSelected = selectedRestaurant?.id === restaurant.id  // 선택된 식당인지
      const isFav = favorites.includes(restaurant.id)              // 즐겨찾기인지
      const isSolo = restaurant.soloFriendly || restaurant.hasSoloSeat  // 혼밥 가능한지

      // 마커 색상 결정
      // - 선택됨: 진한 초록 (강조)
      // - 즐겨찾기: 빨강 하트
      // - 혼밥 가능: 브랜드 초록
      // - 일반: 회색
      const markerColor = isSelected ? '#15803d'
        : isFav ? '#ef4444'
        : isSolo ? '#22c55e'
        : '#64748b'

      // 마커 크기 (선택된 것은 더 크게)
      const size = isSelected ? 42 : 36

      // HTML로 커스텀 마커 만들기
      const markerContent = `
        <div style="
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: transform 0.15s ease;
          ${isSelected ? 'transform: scale(1.15);' : ''}
        ">
          <!-- 마커 본체 (원형 + 가격 표시) -->
          <div style="
            background: ${markerColor};
            color: white;
            border-radius: 20px;
            padding: 4px 8px;
            font-size: 11px;
            font-weight: bold;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: 2px solid white;
            min-width: ${size}px;
            text-align: center;
            line-height: 1.4;
          ">
            ${isFav ? '❤️ ' : isSolo ? '🍽 ' : ''}${(restaurant.minPrice / 1000).toFixed(0)}천원~
          </div>
          <!-- 마커 아랫쪽 꼭짓점 (화살표 모양) -->
          <div style="
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 8px solid ${markerColor};
            margin-top: -1px;
          "></div>
        </div>
      `

      // 네이버 지도에 마커 추가
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(
          restaurant.location.lat,
          restaurant.location.lng
        ),
        map: mapInstance.current,
        icon: {
          content: markerContent,
          anchor: new window.naver.maps.Point(size / 2, size + 8),
        },
        title: restaurant.name,
      })

      // 마커 클릭 이벤트 등록
      window.naver.maps.Event.addListener(marker, 'click', () => {
        onMarkerClick(restaurant)
        // 클릭한 식당으로 지도 중심 이동
        mapInstance.current.panTo(
          new window.naver.maps.LatLng(restaurant.location.lat, restaurant.location.lng)
        )
      })

      // 마커를 Map에 저장 (나중에 삭제/업데이트용)
      markersRef.current.set(restaurant.id, marker)
    })
  }, [mapLoaded, restaurants, selectedRestaurant, favorites, onMarkerClick])

  // ── API 키가 없을 때 보여줄 더미 지도 UI ──
  if (scriptError) {
    return (
      <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center gap-4 p-6">
        {/* 더미 지도 배경 (격자 패턴) */}
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* 안내 메시지 */}
        <div className="relative z-10 bg-white rounded-2xl p-6 shadow-lg text-center max-w-sm">
          <div className="text-4xl mb-3">🗺</div>
          <h3 className="font-bold text-gray-800 mb-2">네이버 지도 API 키 필요</h3>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            지도를 표시하려면 네이버 클라우드 플랫폼에서
            API 키를 발급받아 <code className="bg-gray-100 px-1 rounded">.env.local</code> 파일에 설정해주세요.
          </p>
          <div className="bg-gray-50 rounded-lg p-3 text-left text-xs font-mono text-gray-600">
            <p className="text-gray-400 mb-1"># .env.local 파일에 추가</p>
            <p>NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=</p>
            <p className="text-brand-500">your_client_id_here</p>
          </div>
          <a
            href="https://www.ncloud.com/product/applicationService/maps"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block px-4 py-2 bg-naver text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
          >
            네이버 클라우드 플랫폼 바로가기 →
          </a>
        </div>

        {/* 더미 마커들 (데모용) */}
        <div className="absolute top-1/3 left-1/4 z-10">
          <div className="bg-brand-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-md">
            🍽 6천원~
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 z-10">
          <div className="bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-md">
            💺 10천원~
          </div>
        </div>
        <div className="absolute top-2/3 left-2/3 z-10">
          <div className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-md">
            ❤️ 8천원~
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* 네이버 지도가 렌더링될 컨테이너 */}
      <div ref={mapRef} className="w-full h-full" />

      {/* 지도 로딩 중 스피너 */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">지도 불러오는 중...</p>
          </div>
        </div>
      )}

      {/* 내 위치로 이동 버튼 */}
      {userLocation && mapInstance.current && (
        <button
          onClick={() => {
            mapInstance.current?.panTo(
              new window.naver.maps.LatLng(userLocation.lat, userLocation.lng)
            )
          }}
          className="absolute bottom-6 right-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
          title="내 위치로 이동"
        >
          {/* 위치 아이콘 */}
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}
    </div>
  )
}
