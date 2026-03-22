'use client'

// =====================================================
// 즐겨찾기 버튼 컴포넌트 - 하트 버튼을 눌러 식당을 저장합니다
// =====================================================

interface FavoriteButtonProps {
  isFavorite: boolean           // 현재 즐겨찾기 상태
  onClick: (e: React.MouseEvent) => void  // 클릭 시 실행할 함수
  size?: 'sm' | 'md' | 'lg'    // 버튼 크기 (기본: md)
  className?: string            // 추가 CSS 클래스
}

export function FavoriteButton({
  isFavorite,
  onClick,
  size = 'md',
  className = '',
}: FavoriteButtonProps) {
  // 크기에 따른 스타일 설정
  const sizeClasses = {
    sm: 'w-7 h-7',   // 작은 크기
    md: 'w-9 h-9',   // 기본 크기
    lg: 'w-11 h-11', // 큰 크기
  }

  // 아이콘 크기 설정
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <button
      onClick={onClick}
      aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}  // 스크린리더용 설명
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-full shadow-md
        transition-all duration-200 active:scale-90
        ${isFavorite
          ? 'bg-red-500 text-white hover:bg-red-600'   // 즐겨찾기 됨: 빨간 하트
          : 'bg-white text-gray-400 hover:text-red-400' // 즐겨찾기 안 됨: 빈 하트
        }
        ${className}
      `}
    >
      {/* 하트 아이콘 (즐겨찾기 여부에 따라 채워진/빈 하트 표시) */}
      <svg
        className={`${iconSizes[size]} transition-transform duration-200 ${isFavorite ? 'scale-110' : 'scale-100'}`}
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={isFavorite ? 0 : 2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  )
}
