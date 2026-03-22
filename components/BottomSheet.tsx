'use client'

// =====================================================
// 바텀 시트 컴포넌트 - 식당을 선택하면 아래에서 올라오는 상세 정보 패널입니다
// 모바일에서 자주 쓰이는 UI 패턴으로, 지도를 가리지 않으면서 정보를 보여줍니다
// =====================================================

import { Restaurant } from '@/lib/types'
import { formatDistance, formatPrice } from '@/lib/mockData'
import { FavoriteButton } from './FavoriteButton'

interface BottomSheetProps {
  restaurant: Restaurant | null       // 선택된 식당 정보 (없으면 패널 숨김)
  isFavorite: boolean                 // 즐겨찾기 여부
  onToggleFavorite: (id: string) => void  // 즐겨찾기 토글
  onClose: () => void                 // 패널 닫기
}

export function BottomSheet({ restaurant, isFavorite, onToggleFavorite, onClose }: BottomSheetProps) {
  // 선택된 식당이 없으면 아무것도 렌더링하지 않음
  if (!restaurant) return null

  // 네이버 지도에서 검색하는 URL 생성
  const naverSearchUrl = `https://map.naver.com/v5/search/${encodeURIComponent(restaurant.name)}`

  return (
    <>
      {/* 반투명 배경 (클릭하면 닫힘) */}
      <div
        className="fixed inset-0 bg-black/20 z-20"
        onClick={onClose}
      />

      {/* 바텀 시트 본체 */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto">

        {/* 드래그 핸들 (위로 당길 수 있다는 시각적 힌트) */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
        >
          ✕
        </button>

        {/* 식당 상세 내용 */}
        <div className="px-5 pb-8 pt-2">

          {/* 헤더: 이름, 즐겨찾기, 상태 */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 pr-4">
              {/* 영업 상태 */}
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold mb-1 ${
                restaurant.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {restaurant.isOpen
                  ? `🟢 영업 중 · ${restaurant.closeTime} 마감`
                  : `🔴 영업 종료 · ${restaurant.openTime} 오픈`
                }
              </span>
              <h2 className="text-xl font-bold text-gray-900">{restaurant.name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{restaurant.category} · {restaurant.address}</p>
            </div>

            {/* 즐겨찾기 버튼 */}
            <FavoriteButton
              isFavorite={isFavorite}
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(restaurant.id)
              }}
              size="lg"
            />
          </div>

          {/* 혼밥 정보 배지들 */}
          <div className="flex gap-2 mb-4">
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              restaurant.soloFriendly
                ? 'bg-brand-100 text-brand-700'
                : 'bg-gray-100 text-gray-400 line-through'
            }`}>
              🍽 혼밥 가능
            </span>
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              restaurant.hasSoloSeat
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-400 line-through'
            }`}>
              💺 1인 전용석
            </span>
          </div>

          {/* 평점 및 리뷰 */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{restaurant.rating.toFixed(1)}</div>
              <div className="text-yellow-400 text-lg">{'★'.repeat(Math.round(restaurant.rating))}</div>
              <div className="text-xs text-gray-500">{restaurant.reviewCount}개 리뷰</div>
            </div>
            <div className="flex-1 space-y-1">
              {restaurant.tags.map(tag => (
                <span key={tag} className="inline-block mr-1 mb-1 px-2 py-0.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 거리 및 가격 정보 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* 거리 */}
            {restaurant.distance !== undefined && (
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-500 font-medium mb-1">📍 거리</p>
                <p className="font-bold text-blue-800">{formatDistance(restaurant.distance)}</p>
                <p className="text-xs text-blue-500">내 위치에서</p>
              </div>
            )}

            {/* 최저가 */}
            <div className="p-3 bg-green-50 rounded-xl">
              <p className="text-xs text-green-500 font-medium mb-1">💚 최저 가격</p>
              <p className="font-bold text-green-800">{formatPrice(restaurant.minPrice)}</p>
              <p className="text-xs text-green-500">평균 {formatPrice(restaurant.avgPrice)}</p>
            </div>
          </div>

          {/* 메뉴 목록 */}
          <div className="mb-5">
            <h3 className="font-bold text-gray-800 mb-2">대표 메뉴</h3>
            <div className="space-y-2">
              {restaurant.menus.map(menu => (
                <div key={menu.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-800">{menu.name}</span>
                    {/* 인기 메뉴 배지 */}
                    {menu.isPopular && (
                      <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded text-xs font-bold">
                        인기
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-brand-600">{formatPrice(menu.price)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 연락처 및 영업시간 */}
          <div className="space-y-2 mb-5 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>📞</span>
              <a href={`tel:${restaurant.phone}`} className="hover:text-brand-600">
                {restaurant.phone}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span>🕐</span>
              <span>{restaurant.openTime} ~ {restaurant.closeTime}</span>
              {restaurant.closedDays.length > 0 && (
                <span className="text-red-400">({restaurant.closedDays.join(', ')} 휴무)</span>
              )}
            </div>
            <div className="flex items-start gap-2">
              <span>📍</span>
              <span>{restaurant.address}</span>
            </div>
          </div>

          {/* 외부 링크 버튼들 */}
          <div className="flex gap-2">
            {/* 네이버 지도에서 보기 버튼 */}
            <a
              href={naverSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-naver text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-colors"
            >
              {/* 네이버 로고 색상 */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
              </svg>
              네이버 지도에서 보기
            </a>

            {/* 전화 걸기 버튼 */}
            <a
              href={`tel:${restaurant.phone}`}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              📞 전화
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
