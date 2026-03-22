'use client'

// =====================================================
// 식당 데이터 훅 - 식당 목록을 가져오고 필터링/정렬하는 기능입니다
// =====================================================

import { useMemo } from 'react'
import { Restaurant, FilterOptions, LatLng } from '@/lib/types'
import { MOCK_RESTAURANTS, calculateDistance } from '@/lib/mockData'

// useRestaurants 훅 - 필터와 위치 정보를 받아 알맞은 식당 목록을 반환합니다
export function useRestaurants(
  filters: FilterOptions,    // 사용자가 설정한 필터 조건
  userLocation: LatLng | null  // 사용자의 현재 위치
) {
  // useMemo: 필터나 위치가 바뀔 때만 다시 계산 (성능 최적화)
  const restaurants = useMemo(() => {
    // 기본 데이터에 거리 정보 추가
    let result: Restaurant[] = MOCK_RESTAURANTS.map(restaurant => ({
      ...restaurant,
      // 사용자 위치가 있으면 거리 계산, 없으면 undefined
      distance: userLocation
        ? calculateDistance(
            userLocation.lat, userLocation.lng,
            restaurant.location.lat, restaurant.location.lng
          )
        : undefined,
    }))

    // ── 필터 적용 단계 ──

    // 혼밥 가능 필터: 혼밥이 가능한 식당만 보기
    if (filters.soloFriendly) {
      result = result.filter(r => r.soloFriendly)
    }

    // 1인석 필터: 전용 1인석이 있는 식당만 보기
    if (filters.hasSoloSeat) {
      result = result.filter(r => r.hasSoloSeat)
    }

    // 영업 중 필터: 지금 영업하는 식당만 보기
    if (filters.isOpen) {
      result = result.filter(r => r.isOpen)
    }

    // 음식 카테고리 필터: 선택한 카테고리에 해당하는 식당만 보기
    if (filters.categories.length > 0) {
      result = result.filter(r => filters.categories.includes(r.category))
    }

    // 가격대 필터: 선택한 가격대에 해당하는 식당만 보기
    if (filters.priceRanges.length > 0) {
      result = result.filter(r => filters.priceRanges.includes(r.priceRange))
    }

    // 거리 필터: 특정 거리 이내의 식당만 보기
    if (filters.maxDistance > 0) {
      result = result.filter(r =>
        r.distance !== undefined && r.distance <= filters.maxDistance
      )
    }

    // 최소 평점 필터: 설정한 평점 이상인 식당만 보기
    if (filters.minRating > 0) {
      result = result.filter(r => r.rating >= filters.minRating)
    }

    // ── 정렬 단계 ──
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'distance':
          // 거리순: 가까운 곳 먼저 (거리 정보 없으면 맨 뒤로)
          if (a.distance === undefined) return 1
          if (b.distance === undefined) return -1
          return a.distance - b.distance

        case 'rating':
          // 평점순: 높은 평점 먼저
          return b.rating - a.rating

        case 'price_asc':
          // 가격 낮은순: 저렴한 곳 먼저 (최저가 기준)
          return a.minPrice - b.minPrice

        case 'price_desc':
          // 가격 높은순: 비싼 곳 먼저
          return b.avgPrice - a.avgPrice

        case 'review':
          // 리뷰 많은순: 리뷰가 많은 곳 먼저
          return b.reviewCount - a.reviewCount

        default:
          return 0
      }
    })

    return result
  }, [filters, userLocation])  // 이 두 값이 바뀔 때만 재계산

  return {
    restaurants,                    // 필터링/정렬된 식당 목록
    total: restaurants.length,      // 전체 결과 수
    hasResults: restaurants.length > 0,  // 결과가 하나라도 있는지
  }
}
