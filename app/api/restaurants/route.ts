// =====================================================
// 식당 API 엔드포인트 - Supabase DB에서 식당 데이터를 가져옵니다
// Supabase가 연결되지 않은 경우 Mock 데이터로 대체합니다
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { MOCK_RESTAURANTS, calculateDistance } from '@/lib/mockData'
import { fetchRestaurants } from '@/lib/supabase'
import { Restaurant } from '@/lib/types'

// GET /api/restaurants - 식당 목록 가져오기
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = parseFloat(searchParams.get('lat') || '37.4979')
  const lng = parseFloat(searchParams.get('lng') || '127.0276')
  const soloFriendly = searchParams.get('soloFriendly') === 'true'
  const hasSoloSeat = searchParams.get('hasSoloSeat') === 'true'
  const isOpen = searchParams.get('isOpen') === 'true'
  const categories = searchParams.get('categories')?.split(',').filter(Boolean) || []
  const priceRanges = searchParams.get('priceRanges')?.split(',').filter(Boolean) || []

  try {
    // Supabase 환경 변수가 설정되어 있으면 DB에서 데이터 가져오기
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
      const restaurants = await fetchRestaurants({
        lat, lng, soloFriendly, hasSoloSeat, isOpen,
        categories: categories.length > 0 ? categories : undefined,
        priceRanges: priceRanges.length > 0 ? priceRanges : undefined,
      })

      // 거리 계산 후 정렬
      const withDistance = restaurants.map(r => ({
        ...r,
        distance: calculateDistance(lat, lng, r.location.lat, r.location.lng),
      }))
      withDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0))

      return NextResponse.json({ restaurants: withDistance, total: withDistance.length, source: 'supabase' })
    }

    // Supabase 미연결 시 Mock 데이터 반환
    const restaurantsWithDistance: Restaurant[] = MOCK_RESTAURANTS.map(r => ({
      ...r,
      distance: calculateDistance(lat, lng, r.location.lat, r.location.lng),
    }))
    restaurantsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0))

    return NextResponse.json({ restaurants: restaurantsWithDistance, total: restaurantsWithDistance.length, source: 'mock' })

  } catch (error) {
    console.error('식당 데이터 불러오기 실패:', error)
    return NextResponse.json({ error: '식당 정보를 불러올 수 없어요.' }, { status: 500 })
  }
}
