// =====================================================
// 앱 레이아웃 파일 - 모든 페이지에 공통으로 적용되는 기본 구조입니다
// HTML의 <html>과 <body> 태그를 여기서 정의합니다
// =====================================================

import type { Metadata, Viewport } from 'next'
import './globals.css'

// 브라우저 탭에 표시될 앱 정보
export const metadata: Metadata = {
  title: '혼밥 지도 | 1인 식당 찾기',
  description: '혼밥 가능한 식당을 지도로 찾아보세요. 1인석, 최저가, 내 주변 맛집 탐색.',
  keywords: ['혼밥', '1인석', '혼자밥먹기', '직장인점심', '위치기반맛집'],
  // 모바일에서 웹앱처럼 보이기 위한 설정
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '혼밥 지도',
  },
}

// 모바일 뷰포트 설정
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,          // 핀치 줌 방지 (앱처럼 동작)
  themeColor: '#22c55e',    // 모바일 브라우저 상단 색상 (브랜드 초록)
}

// 루트 레이아웃 컴포넌트 - 모든 페이지를 감쌉니다
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        {/* 한국어 폰트 (Pretendard) - 깔끔한 한글 표시 */}
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="antialiased">
        {/* 모바일 앱처럼 최대 너비를 제한하고 중앙 정렬 */}
        <div className="max-w-md mx-auto min-h-screen relative bg-white shadow-xl overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  )
}
