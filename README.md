# 🍽 혼밥 지도 — 1인 식당 찾기 앱

혼밥족 직장인을 위한 **위치 기반 식당 탐색 서비스**입니다.
네이버 지도와 연동하여 내 주변 혼밥 가능 식당을 쉽게 찾을 수 있습니다.

## 주요 기능

| 기능 | 설명 |
|------|------|
| 📍 LBS 위치 기반 | 현재 위치에서 가까운 식당 자동 탐색 |
| 🗺 네이버 지도 연동 | 식당 위치를 지도 마커로 표시, 최저가 표시 |
| 🍽 혼밥 필터 | 혼밥 가능 / 1인석 있는 식당만 보기 |
| 💰 가격 필터 | 저렴(1만원 미만) / 보통 / 프리미엄 분류 |
| ⭐ 평점/거리 정렬 | 거리순, 평점순, 가격순 정렬 |
| ❤️ 즐겨찾기 | 마음에 드는 식당 저장 (앱 꺼도 유지) |
| 📋 리스트 뷰 | 지도 ↔ 카드 리스트 전환 |

## 빠른 시작

### 1. 의존성 설치

```bash
cd solo-dining
npm install
```

### 2. 환경 변수 설정

```bash
# .env.example을 복사해서 .env.local 파일 만들기
cp .env.example .env.local
```

`.env.local` 파일을 열고 네이버 API 키를 입력하세요:

```env
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_client_id_here
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 으로 접속하세요.

---

## 네이버 지도 API 키 발급 방법

1. [네이버 클라우드 플랫폼](https://www.ncloud.com) 회원가입/로그인
2. **Console** → **AI·Application Service** → **Maps** 클릭
3. **이용 신청** → **Web Dynamic Map** 선택
4. Application 등록 후 **Client ID** 복사
5. `.env.local`에 붙여넣기

> 💡 무료 티어: 월 200만 건 호출 무료 (개인 프로젝트에 충분)

---

## 네이버 로컬 검색 API 연동 (실제 식당 데이터)

실제 식당 데이터를 사용하려면 추가 설정이 필요합니다:

1. [네이버 개발자 센터](https://developers.naver.com) 접속
2. **Application 등록** → **검색 API** 선택
3. Client ID / Client Secret 발급
4. `.env.local`에 추가:

```env
NAVER_CLIENT_ID=your_client_id
NAVER_CLIENT_SECRET=your_client_secret
```

---

## 프로젝트 구조

```
solo-dining/
├── app/
│   ├── layout.tsx          # 앱 기본 레이아웃 (HTML 구조)
│   ├── page.tsx            # 메인 페이지 (지도 + 리스트 + 필터)
│   ├── globals.css         # 전역 스타일 + 디자인 토큰
│   └── api/
│       └── restaurants/
│           └── route.ts    # 식당 데이터 API 엔드포인트
├── components/
│   ├── MapView.tsx         # 네이버 지도 + 마커 표시
│   ├── RestaurantCard.tsx  # 식당 정보 카드
│   ├── FilterBar.tsx       # 필터 옵션 UI
│   ├── FavoriteButton.tsx  # 즐겨찾기 하트 버튼
│   └── BottomSheet.tsx     # 식당 상세 바텀 시트
├── hooks/
│   ├── useGeolocation.ts   # GPS 위치 정보 훅
│   ├── useFavorites.ts     # 즐겨찾기 관리 훅
│   └── useRestaurants.ts   # 식당 필터링/정렬 훅
└── lib/
    ├── types.ts            # TypeScript 타입 정의
    └── mockData.ts         # 샘플 식당 데이터
```

## 기술 스택

- **Next.js 14** (App Router)
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 빠른 스타일링
- **네이버 지도 API v3** - 지도 및 마커
- **네이버 로컬 검색 API** - 실제 식당 데이터
- **React Hooks** - 상태 관리
- **localStorage** - 즐겨찾기 영구 저장
