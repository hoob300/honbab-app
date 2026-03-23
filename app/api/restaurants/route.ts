// =====================================================
// 식당 API 엔드포인트
// 1순위: 네이버 지역 검색 API (실제 데이터)
// 2순위: Supabase DB
// 3순위: Mock 데이터 (폴백)
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { MOCK_RESTAURANTS, calculateDistance } from '@/lib/mockData'
import { fetchRestaurants } from '@/lib/supabase'
import { Restaurant } from '@/lib/types'

// 네이버 API 응답의 HTML 태그 제거 (<b>태그 등)
function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '')
}

// 네이버 카테고리 문자열 → 앱 카테고리 변환
function mapCategory(category: string): string {
  if (category.includes('한식')) return '한식'
  if (category.includes('일식') || category.includes('초밥') || category.includes('라멘') || category.includes('스시')) return '일식'
  if (category.includes('중식') || category.includes('중국')) return '중식'
  if (category.includes('양식') || category.includes('이탈리') || category.includes('프랑스') || category.includes('스테이크')) return '양식'
  if (category.includes('분식') || category.includes('김밥') || category.includes('떡볶이')) return '분식'
  if (category.includes('카페') || category.includes('디저트') || category.includes('베이커리')) return '카페'
  if (category.includes('패스트') || category.includes('햄버거')) return '패스트푸드'
  return '기타'
}

// 역지오코딩: 위도/경도 → 행정구역명 (NCP Maps API 사용)
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID
  const clientSecret = process.env.NAVER_MAP_CLIENT_SECRET
  if (!clientId || !clientSecret) return ''

  try {
    const url = `https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${lng},${lat}&output=json&orders=admcode`
    const res = await fetch(url, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': clientId,
        'X-NCP-APIGW-API-KEY': clientSecret,
      },
    })
    if (!res.ok) return ''
    const data = await res.json()
    const region = data.results?.[0]?.region
    const area2 = region?.area2?.name || '' // 구 이름 (예: 강남구)
    const area3 = region?.area3?.name || '' // 동 이름 (예: 역삼동)
    return (area3 || area2).trim()
  } catch {
    return ''
  }
}

// 네이버 지역 검색 API 호출
async function searchNaverLocal(query: string, display = 20): Promise<any[]> {
  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET
  if (!clientId || !clientSecret) return []

  try {
    const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=${display}&sort=comment`
    const res = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.items || []
  } catch {
    return []
  }
}

// 네이버 지역 검색 결과 → Restaurant 타입 변환
function mapNaverItem(item: any, idx: number, userLat: number, userLng: number): Restaurant {
  // mapx/mapy는 WGS84 좌표 × 10,000,000
  const itemLat = Number(item.mapy) / 10000000
  const itemLng = Number(item.mapx) / 10000000
  const distance = calculateDistance(userLat, userLng, itemLat, itemLng)

  return {
    id: `naver-${idx}-${item.mapx}`,
    name: stripHtml(item.title),
    category: mapCategory(item.category) as any,
    address: item.roadAddress || item.address || '',
    phone: item.telephone || '',
    location: { lat: itemLat, lng: itemLng },
    soloFriendly: true,
    hasSoloSeat: false,
    avgPrice: 10000,
    minPrice: 8000,
    priceRange: 'moderate' as any,
    rating: 0,
    reviewCount: 0,
    openTime: '11:00',
    closeTime: '21:00',
    isOpen: true,
    closedDays: [],
    thumbnail: '',
    images: [],
    menus: [],
    tags: item.category ? [item.category.split('>').pop()?.trim()].filter(Boolean) as string[] : [],
    naverMapUrl: item.link || '',
    distance,
  }
}

// GET /api/restaurants
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = parseFloat(searchParams.get('lat') || '37.4979')
  const lng = parseFloat(searchParams.get('lng') || '127.0276')
  const soloFriendly = searchParams.get('soloFriendly') === 'true'
  const hasSoloSeat = searchParams.get('hasSoloSeat') === 'true'
  const isOpen = searchParams.get('isOpen') === 'true'
  const categories = searchParams.get('categories')?.split(',').filter(Boolean) || []

  // ── 1순위: 네이버 지역 검색 API ──
  const naverClientId = process.env.NAVER_CLIENT_ID
  const naverClientSecret = process.env.NAVER_CLIENT_SECRET

  if (naverClientId && naverClientSecret) {
    try {
      // 현재 위치 → 동네 이름 추출 (실패해도 계속 진행)
      const district = await reverseGeocode(lat, lng)

      // 검색 쿼리 구성: 동네명 + 키워드 조합으로 여러 번 검색
      const queries: string[] = []
      if (district) {
        queries.push(`${district} 혼밥 식당`)
        queries.push(`${district} 1인 식당`)
        if (categories.length > 0) queries.push(`${district} ${categories[0]}`)
      } else {
        queries.push('혼밥 식당')
        queries.push('1인 식당')
      }

      // 여러 쿼리 결과 합치기 (중복 제거)
      const seen = new Set<string>()
      let allItems: any[] = []
      for (const q of queries) {
        const items = await searchNaverLocal(q, 20)
        for (const item of items) {
          const key = `${item.mapx}-${item.mapy}`
          if (!seen.has(key)) {
            seen.add(key)
            allItems.push(item)
          }
        }
      }

      // 좌표 없는 항목 제외 후 Restaurant 타입으로 변환
      let restaurants: Restaurant[] = allItems
        .filter(item => item.mapx && item.mapy && item.mapx !== '0' && item.mapy !== '0')
        .map((item, idx) => mapNaverItem(item, idx, lat, lng))

      // 거리순 정렬 후 가까운 순으로 최대 30개
      restaurants.sort((a, b) => (a.distance ?? 99999) - (b.distance ?? 99999))
      restaurants = restaurants.slice(0, 30)

      if (isOpen) restaurants = restaurants.filter(r => r.isOpen)

      return NextResponse.json({
        restaurants,
        total: restaurants.length,
        source: 'naver',
        district,
      })
    } catch (error) {
      console.error('네이버 검색 실패:', error)
    }
  }

  // ── 2순위: Supabase DB ──
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
      const restaurants = await fetchRestaurants({
        lat, lng, soloFriendly, hasSoloSeat, isOpen,
        categories: categories.length > 0 ? categories : undefined,
      })
      const withDistance = restaurants.map((r: Restaurant) => ({
        ...r,
        distance: calculateDistance(lat, lng, r.location.lat, r.location.lng),
      }))
      withDistance.sort((a: Restaurant, b: Restaurant) => (a.distance || 0) - (b.distance || 0))
      return NextResponse.json({ restaurants: withDistance, total: withDistance.length, source: 'supabase' })
    }
  } catch (error) {
    console.error('Supabase 실패:', error)
  }

  // ── 3순위: Mock 데이터 ──
  const restaurantsWithDistance: Restaurant[] = MOCK_RESTAURANTS.map(r => ({
    ...r,
    distance: calculateDistance(lat, lng, r.location.lat, r.location.lng),
  }))
  restaurantsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0))
  return NextResponse.json({ restaurants: restaurantsWithDistance, total: restaurantsWithDistance.length, source: 'mock' })
}
