'use client'

// =====================================================
// 식당 카드 컴포넌트 - 식당 정보를 카드 형태로 보여주는 UI입니다
// 리스트 뷰와 바텀시트에서 공통으로 사용합니다
// =====================================================

import { Restaurant } from '@/lib/types'
import { formatDistance, formatPrice } from '@/lib/mockData'
import { FavoriteButton } from './FavoriteButton'

// 컴포넌트가 받는 속성 타입 정의
interface RestaurantCardProps {
  restaurant: Restaurant           // 식당 정보
  isFavorite: boolean             // 즐겨찾기 여부
  onToggleFavorite: (id: string) => void  // 즐겨찾기 토글 함수
  onClick: (restaurant: Restaurant) => void  // 카드 클릭 함수
  isSelected?: boolean            // 현재 선택된 카드인지 (지도 마커와 연동)
}

export function RestaurantCard({
  restaurant,
  isFavorite,
  onToggleFavorite,
  onClick,
  isSelected = false,
}: RestaurantCardProps) {

  // 평점을 별 이모지로 표시하는 함수 (예: 4.5 → "★★★★☆")
  const renderStars = (rating: number) => {
    const full = Math.floor(rating)     // 완전한 별 개수
    const half = rating % 1 >= 0.5     // 반 별 필요한지
    return (
      <span className="text-yellow-400">
        {'★'.repeat(full)}
        {half ? '½' : ''}
        {'☆'.repeat(5 - full - (half ? 1 : 0))}
      </span>
    )
  }

  // 가격대 색상 (저렴→초록, 보통→노랑, 비쌈→빨강)
  const priceColors = {
    cheap: 'text-green-600 bg-green-50',
    moderate: 'text-yellow-600 bg-yellow-50',
    expensive: 'text-red-600 bg-red-50',
  }

  const priceLabels = {
    cheap: '저렴',
    moderate: '보통',
    expensive: '프리미엄',
  }

  return (
    <div
      onClick={() => onClick(restaurant)}
      className={`
        bg-white rounded-2xl overflow-hidden cursor-pointer
        transition-all duration-200 hover:shadow-lg active:scale-98
        ${isSelected
          ? 'ring-2 ring-brand-500 shadow-lg'   // 선택된 카드: 브랜드 색 테두리
          : 'shadow-sm hover:shadow-md'           // 일반 카드
        }
      `}
    >
      {/* 식당 이미지 영역 */}
      <div className="relative h-40 bg-gray-200 overflow-hidden">
        {/* 실제 이미지 (로딩 실패 시 회색 배경으로 대체) */}
        <img
          src={restaurant.thumbnail}
          alt={restaurant.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // 이미지 로딩 실패 시 플레이스홀더 표시
            (e.target as HTMLImageElement).style.display = 'none'
          }}
        />

        {/* 현재 영업 중 배지 */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
            restaurant.isOpen
              ? 'bg-green-500 text-white'   // 영업 중: 초록
              : 'bg-gray-400 text-white'    // 마감: 회색
          }`}>
            {restaurant.isOpen ? '🟢 영업 중' : '🔴 마감'}
          </span>
        </div>

        {/* 즐겨찾기 버튼 (이미지 오른쪽 상단) */}
        <div className="absolute top-3 right-3">
          <FavoriteButton
            isFavorite={isFavorite}
            onClick={(e) => {
              e.stopPropagation()  // 카드 클릭 이벤트가 함께 발생하지 않도록 막기
              onToggleFavorite(restaurant.id)
            }}
            size="sm"
          />
        </div>

        {/* 혼밥/1인석 배지들 */}
        <div className="absolute bottom-3 left-3 flex gap-1">
          {restaurant.soloFriendly && (
            <span className="px-2 py-0.5 bg-brand-500 text-white rounded-full text-xs font-medium">
              🍽 혼밥 OK
            </span>
          )}
          {restaurant.hasSoloSeat && (
            <span className="px-2 py-0.5 bg-blue-500 text-white rounded-full text-xs font-medium">
              💺 1인석
            </span>
          )}
        </div>
      </div>

      {/* 식당 정보 영역 */}
      <div className="p-4">
        {/* 식당 이름과 카테고리 */}
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 truncate text-base leading-tight">
              {restaurant.name}
            </h3>
            <span className="text-xs text-gray-500 font-medium">{restaurant.category}</span>
          </div>

          {/* 가격대 배지 */}
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${priceColors[restaurant.priceRange]}`}>
            {priceLabels[restaurant.priceRange]}
          </span>
        </div>

        {/* 평점 및 리뷰 수 */}
        <div className="flex items-center gap-2 mb-2">
          {renderStars(restaurant.rating)}
          <span className="text-sm font-bold text-gray-800">{restaurant.rating.toFixed(1)}</span>
          <span className="text-xs text-gray-500">({restaurant.reviewCount.toLocaleString()}명)</span>
        </div>

        {/* 가격과 거리 정보 */}
        <div className="flex items-center justify-between text-sm">
          <div>
            {/* 최저 가격 표시 */}
            <span className="text-gray-500">최저 </span>
            <span className="font-bold text-brand-600">{formatPrice(restaurant.minPrice)}</span>
            <span className="text-gray-400"> ~ {formatPrice(restaurant.avgPrice)}</span>
          </div>

          {/* 거리 표시 */}
          {restaurant.distance !== undefined && (
            <div className="flex items-center gap-1 text-gray-500">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span className="font-medium">{formatDistance(restaurant.distance)}</span>
            </div>
          )}
        </div>

        {/* 태그 목록 */}
        {restaurant.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {restaurant.tags.slice(0, 3).map(tag => (  // 최대 3개만 표시
              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
