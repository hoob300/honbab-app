'use client'

// =====================================================
// 즐겨찾기 훅 - 마음에 드는 식당을 저장하고 관리하는 기능입니다
// 브라우저의 localStorage에 저장하여 앱을 꺼도 유지됩니다
// =====================================================

import { useState, useEffect, useCallback } from 'react'

// localStorage에 저장할 키 이름
const FAVORITES_KEY = 'solo-dining-favorites'

// useFavorites 훅 - 즐겨찾기 기능을 사용하고 싶은 컴포넌트에서 사용합니다
export function useFavorites() {
  // 즐겨찾기된 식당 ID 목록 (예: ['1', '3', '5'])
  const [favorites, setFavorites] = useState<string[]>([])

  // 컴포넌트가 처음 나타날 때 저장된 즐겨찾기 불러오기
  useEffect(() => {
    try {
      // localStorage에서 저장된 즐겨찾기 목록 읽기
      const saved = localStorage.getItem(FAVORITES_KEY)
      if (saved) {
        setFavorites(JSON.parse(saved))  // 문자열을 배열로 변환
      }
    } catch (error) {
      // localStorage 읽기 실패 시 (개인정보 보호 모드 등) 무시
      console.warn('즐겨찾기를 불러올 수 없어요:', error)
    }
  }, [])

  // 즐겨찾기 목록이 바뀔 때마다 localStorage에 자동 저장
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    } catch (error) {
      console.warn('즐겨찾기를 저장할 수 없어요:', error)
    }
  }, [favorites])

  // 특정 식당이 즐겨찾기에 있는지 확인하는 함수
  const isFavorite = useCallback((restaurantId: string): boolean => {
    return favorites.includes(restaurantId)
  }, [favorites])

  // 즐겨찾기 추가/제거를 토글하는 함수 (있으면 제거, 없으면 추가)
  const toggleFavorite = useCallback((restaurantId: string) => {
    setFavorites(prev => {
      if (prev.includes(restaurantId)) {
        // 이미 즐겨찾기에 있으면 제거
        return prev.filter(id => id !== restaurantId)
      } else {
        // 즐겨찾기에 없으면 추가
        return [...prev, restaurantId]
      }
    })
  }, [])

  // 즐겨찾기 전체 삭제
  const clearFavorites = useCallback(() => {
    setFavorites([])
  }, [])

  return {
    favorites,           // 즐겨찾기된 식당 ID 목록
    isFavorite,          // 특정 식당이 즐겨찾기인지 확인
    toggleFavorite,      // 즐겨찾기 추가/제거
    clearFavorites,      // 전체 삭제
    count: favorites.length,  // 즐겨찾기 개수
  }
}
