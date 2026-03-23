'use client'

import { useState } from 'react'
import { FilterOptions, FoodCategory, PriceRange, SortOption, DEFAULT_FILTERS } from '@/lib/types'

interface FilterBarProps {
  filters: FilterOptions
  onChange: (filters: FilterOptions) => void
  totalResults: number
}

const CATEGORIES: FoodCategory[] = ['한식', '중식', '일식', '양식', '분식', '패스트푸드', '카페', '기타']

const PRICE_RANGES: { value: PriceRange; label: string }[] = [
  { value: 'cheap', label: '1만원 미만' },
  { value: 'moderate', label: '1~2만원' },
  { value: 'expensive', label: '2만원 이상' },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'distance', label: '거리순' },
  { value: 'rating', label: '평점순' },
  { value: 'price_asc', label: '가격 낮은순' },
  { value: 'review', label: '리뷰 많은순' },
]

const DISTANCE_OPTIONS = [
  { value: 0, label: '제한 없음' },
  { value: 300, label: '300m' },
  { value: 500, label: '500m' },
  { value: 1000, label: '1km' },
  { value: 2000, label: '2km' },
]

export function FilterBar({ filters, onChange, totalResults }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    onChange({ ...filters, [key]: value })
  }

  const toggleCategory = (category: FoodCategory) => {
    const updated = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]
    updateFilter('categories', updated)
  }

  const togglePriceRange = (range: PriceRange) => {
    const updated = filters.priceRanges.includes(range)
      ? filters.priceRanges.filter(r => r !== range)
      : [...filters.priceRanges, range]
    updateFilter('priceRanges', updated)
  }

  const isDefault =
    !filters.soloFriendly &&
    !filters.hasSoloSeat &&
    !filters.isOpen &&
    filters.categories.length === 0 &&
    filters.priceRanges.length === 0 &&
    filters.maxDistance === 0

  const activeFilterCount = [
    filters.soloFriendly,
    filters.hasSoloSeat,
    filters.isOpen,
    filters.categories.length > 0,
    filters.priceRanges.length > 0,
    filters.maxDistance > 0,
  ].filter(Boolean).length

  return (
    <div className="bg-white border-b border-gray-100">

      {/* ── 1행: 핵심 필터 버튼 (항상 표시) ── */}
      <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>

        {/* 전체 버튼 - 기본 선택 상태 */}
        <button
          onClick={() => onChange({ ...DEFAULT_FILTERS, sortBy: filters.sortBy, searchQuery: filters.searchQuery })}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full border text-sm font-semibold transition-colors ${
            isDefault
              ? 'bg-green-500 text-white border-green-500'
              : 'bg-white text-gray-500 border-gray-300'
          }`}
        >
          전체
        </button>

        <button
          onClick={() => updateFilter('soloFriendly', !filters.soloFriendly)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full border text-sm font-semibold transition-colors ${
            filters.soloFriendly
              ? 'bg-green-500 text-white border-green-500'
              : 'bg-white text-gray-500 border-gray-300'
          }`}
        >
          🍽 혼밥 가능
        </button>

        <button
          onClick={() => updateFilter('hasSoloSeat', !filters.hasSoloSeat)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full border text-sm font-semibold transition-colors ${
            filters.hasSoloSeat
              ? 'bg-green-500 text-white border-green-500'
              : 'bg-white text-gray-500 border-gray-300'
          }`}
        >
          💺 1인석
        </button>

        <button
          onClick={() => updateFilter('isOpen', !filters.isOpen)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full border text-sm font-semibold transition-colors ${
            filters.isOpen
              ? 'bg-green-500 text-white border-green-500'
              : 'bg-white text-gray-500 border-gray-300'
          }`}
        >
          🟢 영업 중
        </button>

        {/* 구분선 */}
        <div className="flex-shrink-0 h-5 w-px bg-gray-200" />

        {/* 상세 필터 토글 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm font-semibold transition-colors ${
            isExpanded || activeFilterCount > 0
              ? 'bg-gray-800 text-white border-gray-800'
              : 'bg-white text-gray-500 border-gray-300'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          상세
          {activeFilterCount > 0 && (
            <span className="bg-white text-gray-800 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* 정렬 */}
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value as SortOption)}
          className="flex-shrink-0 px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-600 bg-white focus:outline-none"
        >
          {SORT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* ── 2행: 상세 필터 패널 (토글) ── */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-3 border-t border-gray-100 bg-gray-50 space-y-4">

          {/* 음식 종류 */}
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">음식 종류</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    filters.categories.includes(cat)
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 가격대 */}
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">가격대</p>
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map(r => (
                <button
                  key={r.value}
                  onClick={() => togglePriceRange(r.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    filters.priceRanges.includes(r.value)
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* 최대 거리 */}
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">최대 거리</p>
            <div className="flex flex-wrap gap-2">
              {DISTANCE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateFilter('maxDistance', opt.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    filters.maxDistance === opt.value
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 하단 */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm text-gray-500">
              <strong className="text-green-600">{totalResults}개</strong> 식당
            </span>
            <button
              onClick={() => onChange(DEFAULT_FILTERS)}
              className="text-sm text-gray-500 underline hover:text-gray-700"
            >
              전체 초기화
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
