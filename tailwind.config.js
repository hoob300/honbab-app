/** @type {import('tailwindcss').Config} */

// Tailwind CSS 설정 - 앱에서 사용할 색상, 폰트, 크기 등을 정의합니다
module.exports = {
  // Tailwind가 스타일을 적용할 파일 범위를 지정합니다
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 앱 전용 색상 정의 (혼밥 앱 브랜드 색상)
      colors: {
        brand: {
          50:  '#f0fdf4',  // 매우 연한 초록
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // 메인 브랜드 색상 (초록)
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        naver: '#03C75A',  // 네이버 공식 초록색
      },
      // 하단 네비게이션 바 높이 (모바일용)
      spacing: {
        'bottom-nav': '64px',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      // 지도 영역 높이
      height: {
        'map': 'calc(100vh - 180px)',
        'map-mobile': 'calc(100vh - 240px)',
      },
    },
  },
  plugins: [],
}
