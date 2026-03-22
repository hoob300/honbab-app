/** @type {import('next').NextConfig} */

// Next.js 설정 파일 - 앱 전체 동작 방식을 정의합니다
const nextConfig = {
  // 외부 이미지 도메인 허용 (식당 이미지 불러오기용)
  images: {
    domains: ['ldb-phinf.pstatic.net', 'via.placeholder.com'],
  },
}

module.exports = nextConfig
