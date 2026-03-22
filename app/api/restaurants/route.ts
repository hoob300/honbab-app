// =====================================================
// 식당 API 엔드포인트 - 클라이언트에서 식당 데이터를 요청할 때 응답합니다
// 현재는 Mock 데이터를 반환하며, 실제 서비스에서는 네이버 로컬 검색 API를 사용합니다
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { MOCK_RESTAURANTS, calculateDistance } from '@/lib/mockData'
import { Restaurant } from '@/lib/types'

// GET /api/restaurants - 식당 목록 가져오기
// 쿼리 파라미터: lat(위도), lng(경도), keyword(검색어)
export async function GET(request: NextRequest) {
  // URL에서 쿼리 파라미터 추출
  const searchParams = request.nextUrl.searchParams
  const lat = parseFloat(searchParams.get('lat') || '37.4979')   // 위도
  const lng = parseFloat(searchParams.get('lng') || '127.0276')  // 경도
  const keyword = searchParams.get('keyword') || ''               // 검색어

  try {
    // 네이버 로컬 검색 API 키가 있으면 실제 API 사용
    // 없으면 Mock 데이터 반환
    const naverClientId = process.env.NAVER_CLIENT_ID
    const naverClientSecret = process.env.NAVER_CLIENT_SECRET

    if (naverClientId && naverClientSecret && keyword) {
      // 네이버 로컬 검색 API 호출
      // 공식 문서: https://developers.naver.com/docs/serviceapi/search/local/local.md
      const searchKeyword = keyword || '혼밥 맛집'
      const response = await fetch(
        `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(searchKeyword)}&display=20&sort=random`,
        {
          headers: {
            'X-Naver-Client-Id': naverClientId,
            'X-Naver-Client-Secret': naverClientSecret,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        // 네이버 API 응답을 우리 데이터 형식으로 변환
        // (실제 구현 시 여기서 변환 로직 추가)
        return NextResponse.json({ restaurants: data.items, source: 'naver' })
      }
    }

    // Mock 데이터에 거리 정보 추가해서 반환
    const restaurantsWithDistance: Restaurant[] = MOCK_RESTAURANTS.map(restaurant => ({
      ...restaurant,
      distance: calculateDistance(lat, lng, restaurant.location.lat, restaurant.location.lng),
    }))

    // 거리순으로 정렬
    restaurantsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0))

    // 성공 응답 반환
    return NextResponse.json({
      restaurants: restaurantsWithDistance,
      total: restaurantsWithDistance.length,
      source: 'mock',  // 데이터 출처 표시
    })

  } catch (error) {
    // 오류 발생 시 500 에러 반환
    console.error('식당 데이터 불러오기 실패:', error)
    return NextResponse.json(
      { error: '식당 정보를 불러올 수 없어요. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}
