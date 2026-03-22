// =====================================================
// 샘플 식당 데이터 - 실제 API 연동 전 테스트용 더미 데이터입니다
// 실제 서비스에서는 네이버 로컬 검색 API에서 데이터를 가져옵니다
// =====================================================

import { Restaurant } from './types'

// 서울 강남구 기준 샘플 식당 목록
export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: '혼밥식당 강남점',
    category: '한식',
    address: '서울 강남구 테헤란로 123',
    phone: '02-1234-5678',
    location: { lat: 37.4979, lng: 127.0276 },
    soloFriendly: true,
    hasSoloSeat: true,
    avgPrice: 8500,
    priceRange: 'cheap',
    minPrice: 6000,
    rating: 4.5,
    reviewCount: 234,
    openTime: '11:00',
    closeTime: '21:00',
    isOpen: true,
    closedDays: ['일요일'],
    thumbnail: 'https://via.placeholder.com/400x300/22c55e/ffffff?text=혼밥식당',
    images: [],
    menus: [
      { name: '제육볶음 정식', price: 8500, isPopular: true },
      { name: '된장찌개 정식', price: 7000, isPopular: false },
      { name: '비빔밥', price: 6000, isPopular: true },
    ],
    tags: ['조용해요', '1인석 완비', '점심 특선'],
    naverMapUrl: 'https://map.naver.com',
  },
  {
    id: '2',
    name: '일인분 라멘',
    category: '일식',
    address: '서울 강남구 역삼동 456',
    phone: '02-9876-5432',
    location: { lat: 37.4985, lng: 127.0310 },
    soloFriendly: true,
    hasSoloSeat: true,
    avgPrice: 12000,
    priceRange: 'moderate',
    minPrice: 10000,
    rating: 4.8,
    reviewCount: 512,
    openTime: '11:30',
    closeTime: '22:00',
    isOpen: true,
    closedDays: ['월요일'],
    thumbnail: 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=라멘집',
    images: [],
    menus: [
      { name: '돈코츠 라멘', price: 12000, isPopular: true },
      { name: '간장 라멘', price: 11000, isPopular: false },
      { name: '미소 라멘', price: 11000, isPopular: true },
    ],
    tags: ['칸막이석', '혼밥 천국', '빠른 서비스'],
    naverMapUrl: 'https://map.naver.com',
  },
  {
    id: '3',
    name: '착한가격 김밥천국',
    category: '분식',
    address: '서울 강남구 논현동 789',
    phone: '02-1111-2222',
    location: { lat: 37.5100, lng: 127.0250 },
    soloFriendly: true,
    hasSoloSeat: false,
    avgPrice: 5000,
    priceRange: 'cheap',
    minPrice: 3500,
    rating: 3.9,
    reviewCount: 89,
    openTime: '07:00',
    closeTime: '20:00',
    isOpen: true,
    closedDays: [],
    thumbnail: 'https://via.placeholder.com/400x300/ef4444/ffffff?text=김밥천국',
    images: [],
    menus: [
      { name: '참치김밥', price: 4000, isPopular: true },
      { name: '순대국밥', price: 6000, isPopular: false },
      { name: '떡볶이', price: 3500, isPopular: true },
    ],
    tags: ['저렴해요', '연중무휴', '포장 가능'],
    naverMapUrl: 'https://map.naver.com',
  },
  {
    id: '4',
    name: '직장인 중국집',
    category: '중식',
    address: '서울 강남구 삼성동 321',
    phone: '02-3333-4444',
    location: { lat: 37.5140, lng: 127.0540 },
    soloFriendly: false,
    hasSoloSeat: false,
    avgPrice: 15000,
    priceRange: 'moderate',
    minPrice: 9000,
    rating: 4.2,
    reviewCount: 167,
    openTime: '11:00',
    closeTime: '21:30',
    isOpen: false,
    closedDays: ['일요일'],
    thumbnail: 'https://via.placeholder.com/400x300/8b5cf6/ffffff?text=중국집',
    images: [],
    menus: [
      { name: '짜장면', price: 9000, isPopular: true },
      { name: '짬뽕', price: 10000, isPopular: true },
      { name: '탕수육 (소)', price: 18000, isPopular: false },
    ],
    tags: ['짜장면 맛집', '빠른 배달', '가성비'],
    naverMapUrl: 'https://map.naver.com',
  },
  {
    id: '5',
    name: '스테이크 하우스 1인',
    category: '양식',
    address: '서울 강남구 청담동 555',
    phone: '02-5555-6666',
    location: { lat: 37.5255, lng: 127.0481 },
    soloFriendly: true,
    hasSoloSeat: true,
    avgPrice: 28000,
    priceRange: 'expensive',
    minPrice: 22000,
    rating: 4.7,
    reviewCount: 341,
    openTime: '12:00',
    closeTime: '22:00',
    isOpen: true,
    closedDays: ['월요일'],
    thumbnail: 'https://via.placeholder.com/400x300/0ea5e9/ffffff?text=스테이크',
    images: [],
    menus: [
      { name: '등심 스테이크 (150g)', price: 28000, isPopular: true },
      { name: '안심 스테이크 (150g)', price: 32000, isPopular: false },
      { name: '파스타 세트', price: 22000, isPopular: true },
    ],
    tags: ['프리미엄', '1인 코스', '분위기 좋음'],
    naverMapUrl: 'https://map.naver.com',
  },
  {
    id: '6',
    name: '맥도날드 강남역점',
    category: '패스트푸드',
    address: '서울 강남구 강남대로 396',
    phone: '02-7777-8888',
    location: { lat: 37.4979, lng: 127.0261 },
    soloFriendly: true,
    hasSoloSeat: false,
    avgPrice: 8000,
    priceRange: 'cheap',
    minPrice: 5500,
    rating: 3.5,
    reviewCount: 1200,
    openTime: '07:00',
    closeTime: '24:00',
    isOpen: true,
    closedDays: [],
    thumbnail: 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=맥도날드',
    images: [],
    menus: [
      { name: '빅맥 세트', price: 8300, isPopular: true },
      { name: '1955 버거 세트', price: 8900, isPopular: false },
      { name: '맥모닝', price: 5500, isPopular: true },
    ],
    tags: ['24시간', '혼밥 OK', '키오스크 주문'],
    naverMapUrl: 'https://map.naver.com',
  },
  {
    id: '7',
    name: '혼카페 스터디룸',
    category: '카페',
    address: '서울 강남구 선릉역 근처',
    phone: '02-9999-0000',
    location: { lat: 37.5044, lng: 127.0491 },
    soloFriendly: true,
    hasSoloSeat: true,
    avgPrice: 6500,
    priceRange: 'cheap',
    minPrice: 4500,
    rating: 4.4,
    reviewCount: 278,
    openTime: '08:00',
    closeTime: '23:00',
    isOpen: true,
    closedDays: [],
    thumbnail: 'https://via.placeholder.com/400x300/06b6d4/ffffff?text=카페',
    images: [],
    menus: [
      { name: '아메리카노', price: 4500, isPopular: true },
      { name: '카페라떼', price: 5500, isPopular: true },
      { name: '샌드위치 세트', price: 8500, isPopular: false },
    ],
    tags: ['노트북 환영', '조용해요', '콘센트 많음'],
    naverMapUrl: 'https://map.naver.com',
  },
  {
    id: '8',
    name: '본죽 역삼점',
    category: '한식',
    address: '서울 강남구 역삼동 234',
    phone: '02-2222-3333',
    location: { lat: 37.5003, lng: 127.0366 },
    soloFriendly: true,
    hasSoloSeat: false,
    avgPrice: 9000,
    priceRange: 'cheap',
    minPrice: 7000,
    rating: 4.1,
    reviewCount: 145,
    openTime: '09:00',
    closeTime: '20:00',
    isOpen: false,
    closedDays: ['일요일'],
    thumbnail: 'https://via.placeholder.com/400x300/10b981/ffffff?text=죽집',
    images: [],
    menus: [
      { name: '전복죽', price: 12000, isPopular: true },
      { name: '야채죽', price: 7000, isPopular: false },
      { name: '김치죽', price: 8000, isPopular: true },
    ],
    tags: ['건강식', '혼자 먹기 편함', '점심 추천'],
    naverMapUrl: 'https://map.naver.com',
  },
]

// 두 위치 사이의 거리를 계산하는 함수 (미터 단위)
// Haversine 공식을 사용합니다 - 지구가 둥글다는 걸 고려한 정확한 거리 계산법
export function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000 // 지구 반지름 (미터)
  const dLat = (lat2 - lat1) * Math.PI / 180  // 위도 차이를 라디안으로 변환
  const dLng = (lng2 - lng1) * Math.PI / 180  // 경도 차이를 라디안으로 변환

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)  // 미터 단위 거리 반환
}

// 거리를 사람이 읽기 쉬운 텍스트로 변환 (예: "350m", "1.2km")
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

// 가격을 한국 원화 형식으로 변환 (예: 12000 → "12,000원")
export function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`
}
