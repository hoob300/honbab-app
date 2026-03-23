'use client'

// =====================================================
// 필터 바 컴포넌트 - 식당 검색 조건을 설정하는 UI입니다
// 혼밥 가능, 가격대, 음식 종류 등을 선택할 수 있어요
// =====================================================

import { useState } from 'react'
import { FilterOptions, FoodCategory, PriceRange, SortOption, DEFAULT_FILTERS } from '@/lib/types'

// 컴포넌트가 받는 속성(props) 타입 정의
interface FilterBarProps {
  filters: FilterOptions                        // 현재 적용된 필터 상태
  onChange: (filters: FilterOptions) => void   // 필터가 바뀔 때 호출하는 함수
  totalResults: number                          // 현재 필터로 찾은 식당 수
}

// 음식 카테고리 목록
const CATEGORIES: FoodCategory[] = ['한식', '중식', '일식', '양식', '분식', '패스트푸드', '카페', '기타']

// 가격대 옵션 목록
const PRICE_RANGES: { value: PriceRange; label: string }[] = [
  { value: 'cheap', label: '💚 1만원 미만' },
  { value: 'moderate', label: '💛 1~2만원' },
  { value: 'expensive', label: '❤️ 2만원 이상' },
]

// 정렬 옵션 목록
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'distance', label: '🗺 거리순' },
  { value: 'rating', label: '⭐ 평점순' },
  { value: 'price_asc', label: '💰 가격 낮은순' },
  { value: 'review', label: '💬 리뷰 많은순' },
]

// 최대 거리 옵션
const DISTANCE_OPTIONS = [
  { value: 0, label: '제한 없음' },
  { value: 300, label: '300m' },
  { value: 500, label: '500m' },
  { value: 1000, label: '1km' },
  { value: 2000, label: '2km' },
]

export function FilterBar({ filters, onChange, totalResults }: FilterBarProps) {
  // 필터 패널 열림/닫힘 상태
  const [isExpanded, setIsExpanded] = useState(false)

  // 특정 필터 값을 변경하는 함수 (나머지 필터는 그대로 유지)
  const updateFilter = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    onChange({ ...filters, [key]: value })
  }

  // 카테고리 선택 토글 (선택된 카테고리 배열에서 추가/제거)
  const toggleCategory = (category: FoodCategory) => {
    const current = filters.categories
    const updated = current.includes(category)
      ? current.filter(c => c !== category)  // 이미 선택됨 → 제거
      : [...current, category]               // 선택 안 됨 → 추가
    updateFilter('categories', updated)
  }

  // 가격대 선택 토글
  const togglePriceRange = (range: PriceRange) => {
    const current = filters.priceRanges
    const updated = current.includes(range)
      ? current.filter(r => r !== range)
      : [...current, range]
    updateFilter('priceRanges', updated)
  }

  // 적용된 필터 개수 계산 (배지에 표시할 숫자)
  const activeFilterCount = [
    filters.soloFriendly,
    filters.hasSoloSeat,
    filters.isOpen,
    filters.categories.length > 0,
    filters.priceRanges.length > 0,
    filters.maxDistance > 0,
    filters.minRating > 0,
  ].filter(Boolean).length

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      {/* 상단 필터 요약 바 */}
      <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">

        {/* 필터 토글 버튼 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${
            activeFilterCount > 0
              ? 'bg-brand-500 text-white border-brand-500'  // 필터 적용 중: 초록색
              : 'bg-white text-gray-600 border-gray-300'    // 필터 없음: 흰색
          }`}
        >
          {/* 필터 아이콘 */}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          필터
          {/* 적용된 필터 수 배지 */}
          {activeFilterCount > 0 && (
            <span className="bg-white text-brand-600 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* 구분선 */}
        <div className="h-5 w-px bg-gray-200 flex-shrink-0" />

        {/* 전체 버튼 (기본값 - 아무 필터도 없는 상태) */}
        <button
          onClick={() => onChange(DEFAULT_FILTERS)}
          className={`px-3 py-1.5 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${
            activeFilterCount === 0
              ? 'bg-brand-500 text-white border-brand-500'
              : 'bg-white text-gray-600 border-gray-300 hover:border-brand-400'
          }`}
        >
          전체
        </button>

        {/* 빠른 필터 버튼들 (가장 자주 쓰는 필터) */}
        <button
          onClick={() => updateFilter('soloFriendly', !filters.soloFriendly)}
          className={`px-3 py-1.5 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${
            filters.soloFriendly
              ? 'bg-brand-500 text-white border-brand-500'
              : 'bg-white text-gray-600 border-gray-300 hover:border-brand-400'
          }`}
        >
          🍽 혼밥 가능
        </button>

        <button
          onClick={() => updateFilter('hasSoloSeat', !filters.hasSoloSeat)}
          className={`px-3 py-1.5 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${
            filters.hasSoloSeat
              ? 'bg-brand-500 text-white border-brand-500'
              : 'bg-white text-gray-600 border-gray-300 hover:border-brand-400'
          }`}
        >
          💺 1인석 있음
        </button>

        <button
          onClick={() => updateFilter('isOpen', !filters.isOpen)}
          className={`px-3 py-1.5 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${
            filters.isOpen
              ? 'bg-green-500 text-white border-green-500'
              : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
          }`}
        >
          🟢 영업 중
        </button>

        {/* 구분선 */}
        <div className="h-5 w-px bg-gray-200 flex-shrink-0" />

        {/* 정렬 선택 드롭다운 */}
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value as SortOption)}
          className="px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-600 bg-white focus:outline-none focus:border-brand-500 whitespace-nowrap"
        >
          {SORT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* 확장된 필터 패널 */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
          <div className="pt-4 space-y-4">

            {/* 음식 카테고리 선택 */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                음식 종류
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filters.categories.includes(category)
                        ? 'bg-brand-500 text-white'
                        : 'bg-white text-gray-600 border border-gray-300 hover:border-brand-400'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* 가격대 선택 */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                가격대
              </p>
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGES.map(range => (
                  <button
                    key={range.value}
                    onClick={() => togglePriceRange(range.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filters.priceRanges.includes(range.value)
                        ? 'bg-brand-500 text-white'
                        : 'bg-white text-gray-600 border border-gray-300 hover:border-brand-400'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 최대 거리 선택 */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                최대 거리
              </p>
              <div className="flex flex-wrap gap-2">
                {DISTANCE_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateFilter('maxDistance', option.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filters.maxDistance === option.value
                        ? 'bg-brand-500 text-white'
                        : 'bg-white text-gray-600 border border-gray-300 hover:border-brand-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 필터 초기화 버튼 및 결과 표시 */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-gray-500">
                <strong className="text-brand-600">{totalResults}개</strong> 식당 발견
              </span>
              <button
                onClick={() => onChange(DEFAULT_FILTERS)}
                className="text-sm text-gray-500 underline hover:text-gray-700"
              >
                필터 초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
