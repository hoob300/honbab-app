-- =====================================================
-- 혼밥 지도 앱 DB 스키마
-- Supabase 대시보드 > SQL Editor에서 실행하세요
-- =====================================================

-- 식당 테이블: 모든 식당 정보를 저장합니다
CREATE TABLE IF NOT EXISTS restaurants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,                    -- 식당 이름
  category    TEXT NOT NULL,                    -- 음식 종류 (한식, 일식 등)
  address     TEXT NOT NULL,                    -- 주소
  phone       TEXT,                             -- 전화번호
  lat         DOUBLE PRECISION NOT NULL,        -- 위도
  lng         DOUBLE PRECISION NOT NULL,        -- 경도

  -- 혼밥 관련
  solo_friendly  BOOLEAN DEFAULT false,         -- 혼밥 가능 여부
  has_solo_seat  BOOLEAN DEFAULT false,         -- 1인 전용석 여부

  -- 가격 정보
  avg_price   INTEGER DEFAULT 0,               -- 평균 가격 (원)
  min_price   INTEGER DEFAULT 0,               -- 최저 가격 (원)
  price_range TEXT DEFAULT 'moderate'          -- cheap / moderate / expensive
    CHECK (price_range IN ('cheap', 'moderate', 'expensive')),

  -- 평점
  rating        NUMERIC(2,1) DEFAULT 0.0,      -- 평점 (0.0 ~ 5.0)
  review_count  INTEGER DEFAULT 0,             -- 리뷰 수

  -- 영업 시간
  open_time   TEXT DEFAULT '11:00',            -- 영업 시작 (예: "11:00")
  close_time  TEXT DEFAULT '21:00',            -- 영업 종료 (예: "21:00")
  is_open     BOOLEAN DEFAULT true,            -- 현재 영업 중 여부
  closed_days TEXT[] DEFAULT '{}',             -- 휴무일 배열

  -- 이미지
  thumbnail   TEXT DEFAULT '',                 -- 대표 이미지 URL
  images      TEXT[] DEFAULT '{}',             -- 추가 이미지 URL 목록

  -- 태그
  tags        TEXT[] DEFAULT '{}',             -- 특징 태그 배열

  -- 네이버 지도 링크
  naver_map_url  TEXT DEFAULT '',

  -- 메타 정보
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 메뉴 테이블: 각 식당의 메뉴 목록
CREATE TABLE IF NOT EXISTS menus (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,                 -- 메뉴 이름
  price         INTEGER NOT NULL,              -- 가격 (원)
  is_popular    BOOLEAN DEFAULT false,         -- 인기 메뉴 여부
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 즐겨찾기 테이블: 사용자별 즐겨찾기 (로그인 기능 추가 시 사용)
CREATE TABLE IF NOT EXISTS favorites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID,                          -- 사용자 ID (auth.users 연동 시)
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  session_id    TEXT,                          -- 비로그인 사용자용 세션 ID
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, restaurant_id),
  UNIQUE(session_id, restaurant_id)
);

-- ── 인덱스: 자주 검색하는 컬럼에 인덱스를 추가해 속도를 높입니다 ──
CREATE INDEX IF NOT EXISTS idx_restaurants_solo_friendly ON restaurants(solo_friendly);
CREATE INDEX IF NOT EXISTS idx_restaurants_has_solo_seat ON restaurants(has_solo_seat);
CREATE INDEX IF NOT EXISTS idx_restaurants_price_range ON restaurants(price_range);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating DESC);
CREATE INDEX IF NOT EXISTS idx_restaurants_is_open ON restaurants(is_open);
-- 위치 기반 검색을 위한 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants(lat, lng);
CREATE INDEX IF NOT EXISTS idx_menus_restaurant_id ON menus(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- ── RLS (Row Level Security): 데이터 접근 권한 설정 ──
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 식당/메뉴는 누구나 읽을 수 있음 (공개 데이터)
CREATE POLICY "restaurants_public_read" ON restaurants FOR SELECT USING (true);
CREATE POLICY "menus_public_read" ON menus FOR SELECT USING (true);

-- 즐겨찾기는 본인 것만 읽기/쓰기 가능
CREATE POLICY "favorites_own_read" ON favorites FOR SELECT
  USING (auth.uid() = user_id OR session_id IS NOT NULL);
CREATE POLICY "favorites_own_insert" ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id OR session_id IS NOT NULL);
CREATE POLICY "favorites_own_delete" ON favorites FOR DELETE
  USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- ── updated_at 자동 갱신 트리거 ──
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
