import { createClient } from '@supabase/supabase-js'
import { FoodCategory, PriceRange } from './types'

export function isSupabaseEnabled(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(url && key && url !== 'YOUR_SUPABASE_URL' && url.startsWith('https://'))
}

let _client: ReturnType<typeof createClient> | null = null

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

// DB category(영문) → 앱 카테고리(한글) 변환
function mapCategory(cat: string): FoodCategory {
  const map: Record<string, FoodCategory> = {
    korean: '한식', japanese: '일식', chinese: '중식',
    western: '양식', snack: '분식', fastfood: '패스트푸드', cafe: '카페',
  }
  return map[cat] ?? '기타'
}

// DB price_range(숫자) → 앱 priceRange(문자) 변환
function mapPriceRange(price: number): PriceRange {
  if (price < 10000) return 'cheap'
  if (price <= 20000) return 'moderate'
  return 'expensive'
}

// "06:00 - 22:00" 형식에서 open/close time 파싱
function parseOpenHours(openHours: string): { openTime: string; closeTime: string; isOpen: boolean } {
  const parts = openHours?.split(' - ') ?? []
  const openTime = parts[0]?.trim() ?? ''
  const closeTime = parts[1]?.trim() ?? ''

  let isOpen = false
  if (openTime && closeTime) {
    const now = new Date()
    const [oh, om] = openTime.split(':').map(Number)
    const [ch, cm] = closeTime.split(':').map(Number)
    const nowMin = now.getHours() * 60 + now.getMinutes()
    const openMin = oh * 60 + om
    const closeMin = ch * 60 + cm
    isOpen = nowMin >= openMin && nowMin < closeMin
  }

  return { openTime, closeTime, isOpen }
}

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
  if (!client) return []

  let query = client.from('restaurants').select('*')

  if (options.soloFriendly) query = query.eq('solo_friendly', true)
  if (options.hasSoloSeat)  query = query.eq('has_single_seat', true)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (query as any)
  if (error) { console.error('식당 데이터 오류:', error.message); return [] }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((row: any) => {
    const { openTime, closeTime, isOpen } = parseOpenHours(row.open_hours)
    const priceRange = mapPriceRange(row.price_range)

    return {
      id: row.id,
      name: row.name,
      category: mapCategory(row.category),
      address: row.road_address || row.address || '',
      phone: row.phone || '',
      location: { lat: row.lat, lng: row.lng },
      soloFriendly: row.solo_friendly ?? false,
      hasSoloSeat: row.has_single_seat ?? false,
      avgPrice: row.price_range ?? 0,
      minPrice: row.price_range ?? 0,
      priceRange,
      rating: row.rating ?? 0,
      reviewCount: row.review_count ?? 0,
      openTime,
      closeTime,
      isOpen,
      closedDays: row.closed_days ?? [],
      thumbnail: row.thumbnail ?? '',
      images: row.images ?? [],
      menus: row.menu_highlight
        ? [{ name: row.menu_highlight, price: row.price_range ?? 0, isPopular: true }]
        : [],
      tags: row.tags ?? [],
      naverMapUrl: row.naver_map_url ?? '',
    }
  })
}

export async function fetchFavorites(sessionId: string): Promise<string[]> {
  const client = getClient()
  if (!client) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client as any)
    .from('favorites').select('restaurant_id').eq('session_id', sessionId)
  if (error) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((row: any) => row.restaurant_id as string)
}

export async function addFavorite(sessionId: string, restaurantId: string): Promise<boolean> {
  const client = getClient()
  if (!client) return false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (client as any)
    .from('favorites').insert({ session_id: sessionId, restaurant_id: restaurantId })
  return !error
}

export async function removeFavorite(sessionId: string, restaurantId: string): Promise<boolean> {
  const client = getClient()
  if (!client) return false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (client as any)
    .from('favorites').delete()
    .eq('session_id', sessionId).eq('restaurant_id', restaurantId)
  return !error
}
