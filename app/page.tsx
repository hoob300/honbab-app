'use client'

// =====================================================
// 메인 페이지 - 앱의 핵심 화면입니다
// 네이버 지도 + 식당 리스트 + 필터가 모두 이 페이지에 있습니다
// =====================================================

import { useState, useCallback, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { FilterBar } from '@/components/FilterBar'
import { RestaurantCard } from '@/components/RestaurantCard'
import { BottomSheet } from '@/components/BottomSheet'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useFavorites } from '@/hooks/useFavorites'
import { useRestaurants } from '@/hooks/useRestaurants'
import { Restaurant, FilterOptions, ViewMode, DEFAULT_FILTERS } from '@/lib/types'

// 네이버 지도는 브라우저에서만 동작하므로 SSR을 완전히 비활성화합니다
// window, document, naver 같은 브라우저 전용 객체를 서버에서 실행하면 오류가 발생합니다
const MapView = dynamic(
  () => import('@/components/MapView').then(mod => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">지도 불러오는 중...</p>
        </div>
      </div>
    ),
  }
)

export default function HomePage() {
  // ── 클라이언트 마운트 여부 확인 ──
  // 서버에서는 false, 브라우저에서 hydration 완료 후 true가 됩니다
  // 브라우저 전용 API(navigator, localStorage 등)는 이 값이 true일 때만 안전하게 사용 가능합니다
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // 브라우저에서 컴포넌트가 마운트된 후 실행됩니다
    setMounted(true)
  }, [])

  // ── 상태(State) 관리 ──
  const [viewMode, setViewMode] = useState<ViewMode>('map')
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchCenter, setSearchCenter] = useState<{ lat: number; lng: number } | null>(null)
  const [geocoding, setGeocoding] = useState(false)
  const [geocodeMsg, setGeocodeMg] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // ── 커스텀 훅 ──
  const { location: userLocation, error: locationError, loading: locationLoading } = useGeolocation()
  const { favorites, isFavorite, toggleFavorite, count: favoriteCount } = useFavorites()
  const { restaurants, total, loading: searchLoading } = useRestaurants(filters, userLocation, searchCenter)

  // 즐겨찾기 필터 적용
  const displayedRestaurants = showFavoritesOnly
    ? restaurants.filter(r => favorites.includes(r.id))
    : restaurants

  // ── 이벤트 핸들러 ──
  const handleSelectRestaurant = useCallback((restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
    if (viewMode === 'list') setViewMode('map')
  }, [viewMode])

  const handleCloseBottomSheet = useCallback(() => {
    setSelectedRestaurant(null)
  }, [])

  const handleToggleFavoritesTab = () => {
    setShowFavoritesOnly(!showFavoritesOnly)
    setSelectedRestaurant(null)
  }

  // 검색 실행 (엔터 or 버튼 클릭)
  const handleSearch = useCallback(async () => {
    const q = searchInput.trim()
    if (!q) return

    setGeocoding(true)
    setGeocodeMg(null)

    // 지역명을 좌표로 변환 (Nominatim 지오코딩 - 한국 우선)
    try {
      // 1차 시도: 한국 내 검색 (countrycodes=kr)
      let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&accept-language=ko&countrycodes=kr`
      let res = await fetch(url, { headers: { 'User-Agent': 'honbab-app/1.0' } })
      let data = await res.json()

      // 2차 시도: "대한민국" 붙여서 검색
      if (!data.length) {
        url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ' 대한민국')}&format=json&limit=1&accept-language=ko`
        res = await fetch(url, { headers: { 'User-Agent': 'honbab-app/1.0' } })
        data = await res.json()
      }

      if (data.length > 0) {
        setSearchCenter({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) })
        setGeocodeMg(`📍 "${data[0].display_name.split(',')[0]}" 으로 이동`)
        setTimeout(() => setGeocodeMg(null), 3000)
      } else {
        setGeocodeMg(`⚠️ "${q}" 위치를 찾지 못했어요. 현재 위치 기준으로 검색합니다.`)
        setTimeout(() => setGeocodeMg(null), 3000)
      }
    } catch {
      setGeocodeMg('위치 검색 중 오류가 발생했어요.')
      setTimeout(() => setGeocodeMg(null), 2000)
    } finally {
      setGeocoding(false)
    }

    setFilters(prev => ({ ...prev, searchQuery: q }))
    setShowFavoritesOnly(false)
    setViewMode('map')   // 지도 뷰 유지
    searchRef.current?.blur()
  }, [searchInput])

  // 검색어 초기화
  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    setSearchCenter(null)
    setGeocodeMg(null)
    setFilters(prev => ({ ...prev, searchQuery: '' }))
  }, [])

  // ── 마운트 전 로딩 화면 ──
  // 서버 렌더링 결과와 클라이언트 초기 렌더링을 동일하게 유지하기 위해
  // 완전히 마운트되기 전까지는 빈 로딩 화면을 보여줍니다
  if (!mounted) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
            <span className="text-white text-2xl">🍽</span>
          </div>
          <div className="w-8 h-8 border-[3px] border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">혼밥 지도 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">

      {/* ── 헤더 ── */}
      <header className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          {/* 앱 로고와 타이틀 */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">🍽</span>
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-gray-900 leading-tight">혼밥 지도</h1>
              <p className="text-xs text-gray-500 leading-tight">1인 식당 찾기</p>
            </div>
          </div>

          {/* 위치 상태 표시 */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            {locationLoading ? (
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                위치 확인 중...
              </span>
            ) : locationError ? (
              <span className="text-orange-500">📍 강남역 기준</span>
            ) : (
              <span className="text-green-600 font-medium">📍 내 위치 기준</span>
            )}
          </div>
        </div>

        {/* ── 검색바 ── */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
            {searchLoading && filters.searchQuery ? (
              <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            ) : (
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
            <input
              ref={searchRef}
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="지역명, 음식 종류 검색... (예: 라멘, 한식)"
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
            />
            {searchInput && (
              <button onClick={handleClearSearch} className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={geocoding || searchLoading || !searchInput.trim()}
            className="px-4 py-2.5 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 active:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 flex items-center gap-1.5"
          >
            {geocoding ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            검색
          </button>
        </div>

        {/* 지오코딩 결과 메시지 */}
        {geocodeMsg && (
          <div className="mb-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 text-center">
            {geocodeMsg}
          </div>
        )}

        {/* 검색 결과 안내 */}
        {filters.searchQuery && !searchLoading && !geocodeMsg && (
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-green-600">"{filters.searchQuery}"</span> 검색 결과{' '}
              <span className="font-bold text-gray-800">{total}개</span>
            </p>
            <button
              onClick={handleClearSearch}
              className="text-xs text-gray-400 underline hover:text-gray-600"
            >
              검색 초기화
            </button>
          </div>
        )}

        {/* 뷰 모드 전환 탭 */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
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

          <button
            onClick={() => { setViewMode('list'); setShowFavoritesOnly(false) }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
              viewMode === 'list' && !showFavoritesOnly
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📋 목록
            <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {total > 99 ? '99+' : total}
            </span>
          </button>

          <button
            onClick={handleToggleFavoritesTab}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
              showFavoritesOnly
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ❤️ 즐겨찾기
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

        {/* 지도 뷰 (항상 마운트 유지 - 상태 보존용) */}
        <div className={`absolute inset-0 ${(viewMode === 'list' || showFavoritesOnly) ? 'invisible' : 'visible'}`}>
          <MapView
            restaurants={displayedRestaurants}
            userLocation={userLocation}
            selectedRestaurant={selectedRestaurant}
            onMarkerClick={handleSelectRestaurant}
            favorites={favorites}
            searchCenter={searchCenter}
          />
        </div>

        {/* 리스트 뷰 */}
        {(viewMode === 'list' || showFavoritesOnly) && (
          <div className="absolute inset-0 overflow-y-auto bg-gray-50">
            <div className="px-4 py-3 bg-white border-b border-gray-100">
              <p className="text-sm text-gray-600">
                {showFavoritesOnly ? (
                  <>❤️ <strong>{displayedRestaurants.length}개</strong> 즐겨찾기 식당</>
                ) : (
                  <>주변 <strong className="text-green-600">{total}개</strong> 식당 발견</>
                )}
              </p>
            </div>

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
              <div className="flex flex-col items-center justify-center h-64 gap-4 text-center px-8">
                <div className="text-5xl">{showFavoritesOnly ? '💔' : '🔍'}</div>
                <div>
                  <p className="font-bold text-gray-700 mb-1">
                    {showFavoritesOnly ? '즐겨찾기가 없어요' : '조건에 맞는 식당이 없어요'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {showFavoritesOnly
                      ? '마음에 드는 식당의 ❤️ 버튼을 눌러보세요'
                      : '필터 조건을 조금 더 넓혀보세요'}
                  </p>
                </div>
                {!showFavoritesOnly && (
                  <button
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium"
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

      {/* ── 위치 오류 토스트 ── */}
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
