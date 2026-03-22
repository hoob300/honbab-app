// =====================================================
// Supabase 클라이언트 설정 파일
// Supabase는 Firebase와 비슷한 오픈소스 백엔드 서비스입니다
// 여기서 DB 연결을 초기화합니다
// =====================================================

import { createClient } from '@supabase/supabase-js'

// 환경 변수에서 Supabase 연결 정보 가져오기
// (Supabase 대시보드 > Settings > API 에서 확인)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Supabase 클라이언트 인스턴스 생성
// 이 객체를 통해 DB 조회, 삽입, 수정, 삭제를 합니다
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── 식당 관련 DB 함수들 ──

// 주변 식당 목록 가져오기 (위치 기반, 필터 적용)
export async function fetchRestaurants(options: {
  lat: number          // 내 위도
  lng: number          // 내 경도
  soloFriendly?: boolean   // 혼밥 가능 필터
  hasSoloSeat?: boolean    // 1인석 필터
  isOpen?: boolean         // 영업 중 필터
  categories?: string[]    // 음식 카테고리 필터
  priceRanges?: string[]   // 가격대 필터
}) {
  // 기본 쿼리: 식당 테이블에서 메뉴 포함해서 가져오기
  let query = supabase
    .from('restaurants')
    .select(`
      *,
      menus (id, name, price, is_popular)
    `)

  // 혼밥 가능 필터 적용
  if (options.soloFriendly) {
    query = query.eq('solo_friendly', true)
  }

  // 1인석 필터 적용
  if (options.hasSoloSeat) {
    query = query.eq('has_solo_seat', true)
  }

  // 영업 중 필터 적용
  if (options.isOpen) {
    query = query.eq('is_open', true)
  }

  // 음식 카테고리 필터 적용 (여러 개 선택 가능)
  if (options.categories && options.categories.length > 0) {
    query = query.in('category', options.categories)
  }

  // 가격대 필터 적용
  if (options.priceRanges && options.priceRanges.length > 0) {
    query = query.in('price_range', options.priceRanges)
  }

  // 평점 높은 순으로 정렬
  query = query.order('rating', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('식당 데이터 불러오기 오류:', error.message)
    return []
  }

  // DB 컬럼명(snake_case)을 앱 타입(camelCase)으로 변환
  return data.map(row => ({
    id: row.id,
    name: row.name,
    category: row.category,
    address: row.address,
    phone: row.phone || '',
    location: { lat: row.lat, lng: row.lng },
    soloFriendly: row.solo_friendly,
    hasSoloSeat: row.has_solo_seat,
    avgPrice: row.avg_price,
    minPrice: row.min_price,
    priceRange: row.price_range,
    rating: parseFloat(row.rating),
    reviewCount: row.review_count,
    openTime: row.open_time,
    closeTime: row.close_time,
    isOpen: row.is_open,
    closedDays: row.closed_days || [],
    thumbnail: row.thumbnail || '',
    images: row.images || [],
    menus: (row.menus || []).map((m: any) => ({
      name: m.name,
      price: m.price,
      isPopular: m.is_popular,
    })),
    tags: row.tags || [],
    naverMapUrl: row.naver_map_url || '',
  }))
}

// 즐겨찾기 목록 가져오기 (세션 ID 기반)
export async function fetchFavorites(sessionId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select('restaurant_id')
    .eq('session_id', sessionId)

  if (error) return []
  return data.map(row => row.restaurant_id as string)
}

// 즐겨찾기 추가
export async function addFavorite(sessionId: string, restaurantId: string) {
  const { error } = await supabase
    .from('favorites')
    .insert({ session_id: sessionId, restaurant_id: restaurantId })

  return !error
}

// 즐겨찾기 제거
export async function removeFavorite(sessionId: string, restaurantId: string) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('session_id', sessionId)
    .eq('restaurant_id', restaurantId)

  return !error
}
