// =====================================================
// 타입 정의 파일 - 앱 전체에서 사용하는 데이터 구조를 정의합니다
// TypeScript를 사용하면 잘못된 데이터가 들어올 때 미리 오류를 잡을 수 있어요
// =====================================================

// 위치 좌표 (위도/경도)
export interface LatLng {
  lat: number  // 위도 (북쪽/남쪽 위치, 예: 37.5665)
  lng: number  // 경도 (동쪽/서쪽 위치, 예: 126.9780)
}

// 음식 카테고리 목록
export type FoodCategory =
  | '한식'
  | '중식'
  | '일식'
  | '양식'
  | '분식'
  | '패스트푸드'
  | '카페'
  | '기타'

// 가격대 구분
export type PriceRange =
  | 'cheap'    // 저렴 (1만원 미만)
  | 'moderate' // 보통 (1~2만원)
  | 'expensive' // 비쌈 (2만원 이상)

// 식당 정보 구조
export interface Restaurant {
  id: string           // 식당 고유 번호
  name: string         // 식당 이름
  category: FoodCategory  // 음식 종류
  address: string      // 주소
  phone: string        // 전화번호
  location: LatLng     // 지도 위치 (위도/경도)

  // 혼밥 관련 정보
  soloFriendly: boolean   // 혼밥 가능 여부
  hasSoloSeat: boolean    // 전용 1인석 존재 여부

  // 가격 정보
  avgPrice: number        // 평균 가격 (원)
  priceRange: PriceRange  // 가격대 구분
  minPrice: number        // 최저가 메뉴 가격

  // 평점 및 리뷰
  rating: number          // 평균 평점 (0~5)
  reviewCount: number     // 리뷰 수

  // 운영 정보
  openTime: string        // 영업 시작 시간 (예: "11:00")
  closeTime: string       // 영업 종료 시간 (예: "21:00")
  isOpen: boolean         // 현재 영업 중 여부
  closedDays: string[]    // 휴무일 (예: ["일요일"])

  // 이미지
  thumbnail: string       // 대표 이미지 URL
  images: string[]        // 추가 이미지 URL 목록

  // 거리 (위치 기반으로 계산됨)
  distance?: number       // 내 위치에서의 거리 (미터)

  // 메뉴 목록
  menus: Menu[]

  // 태그 (예: "조용해요", "빠른 서비스" 등)
  tags: string[]

  // 네이버 지도 링크
  naverMapUrl?: string
}

// 메뉴 정보 구조
export interface Menu {
  name: string    // 메뉴 이름
  price: number   // 가격 (원)
  isPopular: boolean  // 인기 메뉴 여부
}

// 필터 조건 구조 - 사용자가 설정한 검색 조건
export interface FilterOptions {
  soloFriendly: boolean    // 혼밥 가능 식당만 보기
  hasSoloSeat: boolean     // 1인석 있는 식당만 보기
  isOpen: boolean          // 지금 영업 중인 곳만 보기
  categories: FoodCategory[]  // 선택한 음식 카테고리들
  priceRanges: PriceRange[]   // 선택한 가격대들
  maxDistance: number         // 최대 거리 (미터, 0 = 제한 없음)
  minRating: number           // 최소 평점 (0 = 제한 없음)
  sortBy: SortOption          // 정렬 기준
  searchQuery: string         // 키워드 검색어
}

// 정렬 기준 옵션
export type SortOption =
  | 'distance'   // 거리순 (가까운 곳부터)
  | 'rating'     // 평점순 (높은 곳부터)
  | 'price_asc'  // 가격 낮은순
  | 'price_desc' // 가격 높은순
  | 'review'     // 리뷰 많은순

// 필터 기본값
export const DEFAULT_FILTERS: FilterOptions = {
  soloFriendly: false,
  hasSoloSeat: false,
  isOpen: false,
  categories: [],
  priceRanges: [],
  maxDistance: 0,
  minRating: 0,
  sortBy: 'distance',
  searchQuery: '',
}

// 뷰 모드 (지도 or 리스트)
export type ViewMode = 'map' | 'list'
