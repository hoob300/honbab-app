'use client'

import { useState, useEffect } from 'react'
import { Restaurant, FilterOptions, LatLng } from '@/lib/types'
import { calculateDistance } from '@/lib/mockData'

export function useRestaurants(
  filters: FilterOptions,
  userLocation: LatLng | null,
  searchCenter?: LatLng | null
) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // 검색 중심 좌표 우선, 없으면 현재 위치, 없으면 강남역 기본값
        const lat = searchCenter?.lat ?? userLocation?.lat ?? 37.4979
        const lng = searchCenter?.lng ?? userLocation?.lng ?? 127.0276

        const params = new URLSearchParams({
          lat: String(lat),
          lng: String(lng),
          soloFriendly: String(filters.soloFriendly),
          hasSoloSeat: String(filters.hasSoloSeat),
          isOpen: String(filters.isOpen),
        })
        if (filters.categories.length > 0) params.set('categories', filters.categories.join(','))
        if (filters.priceRanges.length > 0) params.set('priceRanges', filters.priceRanges.join(','))
        if (filters.searchQuery) params.set('q', filters.searchQuery)

        const res = await fetch(`/api/restaurants?${params}`)
        const data = await res.json()

        let result: Restaurant[] = (data.restaurants || []).map((r: Restaurant) => ({
          ...r,
          distance: calculateDistance(lat, lng, r.location.lat, r.location.lng),
        }))

        // 카테고리 필터
        if (filters.categories.length > 0) {
          result = result.filter(r => filters.categories.includes(r.category))
        }

        // 가격대 필터
        if (filters.priceRanges.length > 0) {
          result = result.filter(r => filters.priceRanges.includes(r.priceRange))
        }

        // 혼밥 가능 필터
        if (filters.soloFriendly) {
          result = result.filter(r => r.soloFriendly)
        }

        // 1인석 필터
        if (filters.hasSoloSeat) {
          result = result.filter(r => r.hasSoloSeat)
        }

        // 영업 중 필터
        if (filters.isOpen) {
          result = result.filter(r => r.isOpen)
        }

        // 거리 필터
        if (filters.maxDistance > 0) {
          result = result.filter(r => r.distance !== undefined && r.distance <= filters.maxDistance)
        }

        // 최소 평점 필터
        if (filters.minRating > 0) {
          result = result.filter(r => r.rating >= filters.minRating)
        }

        // 정렬
        result.sort((a, b) => {
          switch (filters.sortBy) {
            case 'distance':
              if (a.distance === undefined) return 1
              if (b.distance === undefined) return -1
              return a.distance - b.distance
            case 'rating':
              return b.rating - a.rating
            case 'price_asc':
              return a.minPrice - b.minPrice
            case 'price_desc':
              return b.avgPrice - a.avgPrice
            case 'review':
              return b.reviewCount - a.reviewCount
            default:
              return 0
          }
        })

        setRestaurants(result)
      } catch (e) {
        console.error('식당 데이터 불러오기 실패:', e)
        setRestaurants([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters, userLocation, searchCenter])

  return {
    restaurants,
    total: restaurants.length,
    hasResults: restaurants.length > 0,
    loading,
  }
}
