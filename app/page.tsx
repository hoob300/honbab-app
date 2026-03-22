'use client'

// =====================================================
// 메인 페이지 - 앱의 핵심 화면입니다
// 네이버 지도 + 식당 리스트 + 필터가 모두 이 페이지에 있습니다
// =====================================================

import { useState, useCallback } from 'react'
import { FilterBar } from '@/components/FilterBar'
import { MapView } from '@/components/MapView'
import { RestaurantCard } from '@/components/RestaurantCard'
import { BottomSheet } from '@/components/BottomSheet'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useFavorites } from '@/hooks/useFavorites'
import { useRestaurants } from '@/hooks/useRestaurants'
import { Restaurant, FilterOptions, ViewMode, DEFAULT_FILTERS } from '@/lib/types'

export default function HomePage() {
  // ── 상태(State) 관리 ──

  // 현재 뷰 모드: 지도 보기 vs 리스트 보기
  const [viewMode, setViewMode] = useState<ViewMode>('map')

  // 사용자가 설정한 필터 조건
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS)

  // 선택된 식당 (바텀 시트에 표시됨)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)

  // 즐겨찾기 탭 보기 여부
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  // ── 커스텀 훅 ──

  // 사용자 위치 정보 가져오기
  const { location: userLocation, error: locationError, loading: locationLoading } = useGeolocation()

  // 즐겨찾기 관리
  const { favorites, isFavorite, toggleFavorite, count: favoriteCount } = useFavorites()

  // 필터링된 식당 목록 가져오기
  const { restaurants, total } = useRestaurants(filters, userLocation)

  // 즐겨찾기 필터 적용 (즐겨찾기 탭일 때는 즐겨찾기된 것만)
  const displayedRestaurants = showFavoritesOnly
    ? restaurants.filter(r => favorites.includes(r.id))
    : restaurants

  // ── 이벤트 핸들러 ──

  // 식당 선택 (카드 클릭 또는 마커 클릭)
  const handleSelectRestaurant = useCallback((restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
    // 리스트 뷰에서 선택하면 지도 뷰로 전환
    if (viewMode === 'list') {
      setViewMode('map')
    }
  }, [viewMode])

  // 바텀 시트 닫기
  const handleCloseBottomSheet = useCallback(() => {
    setSelectedRestaurant(null)
  }, [])

  // 즐겨찾기 탭 토글
  const handleToggleFavoritesTab = () => {
    setShowFavoritesOnly(!showFavoritesOnly)
    setSelectedRestaurant(null)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">

      {/* ── 헤더 ── */}
      <header className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          {/* 앱 로고와 타이틀 */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">🍽</span>
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-gray-900 leading-tight">혼밥 지도</h1>
              <p className="text-xs text-gray-500 leading-tight">1인 식당 찾기</p>
            </div>
          </div>

          {/* 위치 표시 또는 로딩 */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            {locationLoading ? (
              // 위치 불러오는 중
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                위치 확인 중...
              </span>
            ) : locationError ? (
              // 위치 오류 (기본 위치 사용)
              <span className="text-orange-500">📍 강남역 기준</span>
            ) : (
              // 위치 성공
              <span className="text-brand-600 font-medium">📍 내 위치 기준</span>
            )}
          </div>
        </div>

        {/* 뷰 모드 전환 탭 (지도 / 리스트 / 즐겨찾기) */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {/* 지도 탭 */}
          <button
            onClick={() => { setViewMode('map'); setShowFavoritesOnly(false) }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
              viewMode === 'map' && !showFavoritesOnly
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🗺 지도
          </button>

          {/* 리스트 탭 */}
          <button
            onClick={() => { setViewMode('list'); setShowFavoritesOnly(false) }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
              viewMode === 'list' && !showFavoritesOnly
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📋 목록
            {/* 검색 결과 수 배지 */}
            <span className="bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {total > 99 ? '99+' : total}
            </span>
          </button>

          {/* 즐겨찾기 탭 */}
          <button
            onClick={handleToggleFavoritesTab}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
              showFavoritesOnly
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ❤️ 즐겨찾기
            {/* 즐겨찾기 수 배지 */}
            {favoriteCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {favoriteCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── 필터 바 ── */}
      <div className="flex-shrink-0">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          totalResults={total}
        />
      </div>

      {/* ── 메인 콘텐츠 영역 ── */}
      <main className="flex-1 overflow-hidden relative">

        {/* 지도 뷰 (항상 렌더링하되 리스트 뷰일 때는 숨김 - 지도 상태 유지) */}
        <div className={`absolute inset-0 ${(viewMode === 'list' || showFavoritesOnly) ? 'invisible' : 'visible'}`}>
          <MapView
            restaurants={displayedRestaurants}
            userLocation={userLocation}
            selectedRestaurant={selectedRestaurant}
            onMarkerClick={handleSelectRestaurant}
            favorites={favorites}
          />
        </div>

        {/* 리스트 뷰 */}
        {(viewMode === 'list' || showFavoritesOnly) && (
          <div className="absolute inset-0 overflow-y-auto bg-gray-50">
            {/* 리스트 뷰 헤더 */}
            <div className="px-4 py-3 bg-white border-b border-gray-100">
              <p className="text-sm text-gray-600">
                {showFavoritesOnly ? (
                  <>❤️ <strong>{displayedRestaurants.length}개</strong> 즐겨찾기 식당</>
                ) : (
                  <>주변 <strong className="text-brand-600">{total}개</strong> 식당 발견</>
                )}
              </p>
            </div>

            {/* 식당 카드 그리드 */}
            {displayedRestaurants.length > 0 ? (
              <div className="p-4 grid grid-cols-1 gap-4">
                {displayedRestaurants.map(restaurant => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    isFavorite={isFavorite(restaurant.id)}
                    onToggleFavorite={toggleFavorite}
                    onClick={handleSelectRestaurant}
                    isSelected={selectedRestaurant?.id === restaurant.id}
                  />
                ))}
              </div>
            ) : (
              /* 결과 없을 때 빈 상태 UI */
              <div className="flex flex-col items-center justify-center h-64 gap-4 text-center px-8">
                <div className="text-5xl">
                  {showFavoritesOnly ? '💔' : '🔍'}
                </div>
                <div>
                  <p className="font-bold text-gray-700 mb-1">
                    {showFavoritesOnly ? '즐겨찾기가 없어요' : '조건에 맞는 식당이 없어요'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {showFavoritesOnly
                      ? '마음에 드는 식당의 ❤️ 버튼을 눌러보세요'
                      : '필터 조건을 조금 더 넓혀보세요'
                    }
                  </p>
                </div>
                {!showFavoritesOnly && (
                  <button
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="px-4 py-2 bg-brand-500 text-white rounded-xl text-sm font-medium"
                  >
                    필터 초기화
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── 식당 상세 바텀 시트 ── */}
      <BottomSheet
        restaurant={selectedRestaurant}
        isFavorite={selectedRestaurant ? isFavorite(selectedRestaurant.id) : false}
        onToggleFavorite={toggleFavorite}
        onClose={handleCloseBottomSheet}
      />

      {/* ── 위치 오류 알림 토스트 ── */}
      {locationError && !locationLoading && (
        <div className="absolute bottom-4 left-4 right-4 z-50 pointer-events-none">
          <div className="bg-gray-800 text-white text-xs rounded-xl px-4 py-2.5 shadow-lg text-center">
            📍 {locationError}
          </div>
        </div>
      )}
    </div>
  )
}
