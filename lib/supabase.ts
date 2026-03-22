// =====================================================
// Supabase 클라이언트 설정 파일
// Supabase는 Firebase와 비슷한 오픈소스 백엔드 서비스입니다
// 환경 변수가 없을 때도 빌드가 정상 동작하도록 안전하게 초기화합니다
// =====================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Supabase 연결 여부를 확인하는 함수
// 환경 변수가 제대로 설정되어 있는지 체크합니다
export function isSupabaseEnabled(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(url && key && url !== 'YOUR_SUPABASE_URL' && url.startsWith('https://'))
}

// Supabase 클라이언트를 필요할 때만 생성 (lazy initialization)
// 환경 변수가 없으면 null을 반환합니다
let _supabase: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseEnabled()) return null

  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _supabase
}

// 외부에서 사용할 supabase 클라이언트 (null일 수 있음)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient()
    if (!client) return undefined
    return (client as any)[prop]
  }
})

// ── 식당 관련 DB 함수들 ──

// 주변 식당 목록 가져오기 (위치 기반, 필터 적용)
export async function fetchRestaurants(options: {
  lat: number
  lng: number
  soloFriendly?: boolean
  hasSoloSeat?: boolean
  isOpen?: boolean
  categories?: string[]
  priceRanges?: string[]
}) {
  const client = getSupabaseClient()
  if (!client) return []  // Supabase 미연결 시 빈 배열 반환

  let query = client
    .from('restaurants')
    .select(`*, menus (id, name, price, is_popular)`)

  if (options.soloFriendly) query = query.eq('solo_friendly', true)
  if (options.hasSoloSeat) query = query.eq('has_solo_seat', true)
  if (options.isOpen) query = query.eq('is_open', true)
  if (options.categories?.length) query = query.in('category', options.categories)
  if (options.priceRanges?.length) query = query.in('price_range', options.priceRanges)

  query = query.order('rating', { ascending: false })

  const { data, error } = await query
  if (error) { console.error('식당 데이터 오류:', error.message); return [] }

  return data.map((row: any) => ({
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
      name: m.name, price: m.price, isPopular: m.is_popular,
    })),
    tags: row.tags || [],
    naverMapUrl: row.naver_map_url || '',
  }))
}

// 즐겨찾기 목록 가져오기
export async function fetchFavorites(sessionId: string): Promise<string[]> {
  const client = getSupabaseClient()
  if (!client) return []

  const { data, error } = await client
    .from('favorites').select('restaurant_id').eq('session_id', sessionId)

  if (error) return []
  return data.map((row: any) => row.restaurant_id as string)
}

// 즐겨찾기 추가
export async function addFavorite(sessionId: string, restaurantId: string): Promise<boolean> {
  const client = getSupabaseClient()
  if (!client) return false

  const { error } = await client
    .from('favorites').insert({ session_id: sessionId, restaurant_id: restaurantId })
  return !error
}

// 즐겨찾기 제거
export async function removeFavorite(sessionId: string, restaurantId: string): Promise<boolean> {
  const client = getSupabaseClient()
  if (!client) return false

  const { error } = await client
    .from('favorites').delete()
    .eq('session_id', sessionId).eq('restaurant_id', restaurantId)
  return !error
}
