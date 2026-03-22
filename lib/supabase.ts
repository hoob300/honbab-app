// =====================================================
// Supabase 클라이언트 설정 파일
// 환경 변수가 없을 때도 앱이 정상 동작하도록 안전하게 초기화합니다
// =====================================================

import { createClient } from '@supabase/supabase-js'

// Supabase 연결이 활성화되어 있는지 확인하는 함수
export function isSupabaseEnabled(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(
    url && key &&
    url !== 'YOUR_SUPABASE_URL' &&
    url.startsWith('https://')
  )
}

// Supabase 클라이언트를 한 번만 생성하기 위한 변수 (싱글톤 패턴)
let _client: ReturnType<typeof createClient> | null = null

// 클라이언트를 가져오는 함수 - 환경 변수가 없으면 null 반환
function getClient() {
  if (!isSupabaseEnabled()) return null
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _client
}

// ── 식당 관련 DB 함수들 ──

// 식당 목록 가져오기 (필터 조건 적용)
export async function fetchRestaurants(options: {
  lat: number
  lng: number
  soloFriendly?: boolean
  hasSoloSeat?: boolean
  isOpen?: boolean
  categories?: string[]
  priceRanges?: string[]
}) {
  const client = getClient()
  if (!client) return []  // Supabase 미설정 시 빈 배열 반환

  let query = client
    .from('restaurants')
    .select('*, menus (id, name, price, is_popular)')

  if (options.soloFriendly) query = query.eq('solo_friendly', true)
  if (options.hasSoloSeat)  query = query.eq('has_solo_seat', true)
  if (options.isOpen)       query = query.eq('is_open', true)
  if (options.categories?.length)  query = query.in('category', options.categories)
  if (options.priceRanges?.length) query = query.in('price_range', options.priceRanges)

  query = query.order('rating', { ascending: false })

  const { data, error } = await query
  if (error) { console.error('식당 데이터 오류:', error.message); return [] }

  // DB 컬럼명(snake_case) → 앱 타입(camelCase) 변환
  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    address: row.address,
    phone: row.phone || '',
    location: { lat: row.lat, lng: row.lng },
    soloFriendly: row.solo_friendly,
    hasSoloSeat:  row.has_solo_seat,
    avgPrice:     row.avg_price,
    minPrice:     row.min_price,
    priceRange:   row.price_range,
    rating:       parseFloat(row.rating),
    reviewCount:  row.review_count,
    openTime:     row.open_time,
    closeTime:    row.close_time,
    isOpen:       row.is_open,
    closedDays:   row.closed_days || [],
    thumbnail:    row.thumbnail || '',
    images:       row.images || [],
    menus: (row.menus || []).map((m: any) => ({
      name: m.name, price: m.price, isPopular: m.is_popular,
    })),
    tags:        row.tags || [],
    naverMapUrl: row.naver_map_url || '',
  }))
}

// 즐겨찾기 목록 가져오기 (세션 ID 기반)
export async function fetchFavorites(sessionId: string): Promise<string[]> {
  const client = getClient()
  if (!client) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client as any)
    .from('favorites').select('restaurant_id').eq('session_id', sessionId)
  if (error) return []
  return (data || []).map((row: any) => row.restaurant_id as string)
}

// 즐겨찾기 추가
export async function addFavorite(sessionId: string, restaurantId: string): Promise<boolean> {
  const client = getClient()
  if (!client) return false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (client as any)
    .from('favorites').insert({ session_id: sessionId, restaurant_id: restaurantId })
  return !error
}

// 즐겨찾기 제거
export async function removeFavorite(sessionId: string, restaurantId: string): Promise<boolean> {
  const client = getClient()
  if (!client) return false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (client as any)
    .from('favorites').delete()
    .eq('session_id', sessionId).eq('restaurant_id', restaurantId)
  return !error
}
