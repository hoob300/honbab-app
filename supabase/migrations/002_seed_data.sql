-- =====================================================
-- 샘플 식당 데이터 삽입 (초기 테스트 데이터)
-- 001_create_restaurants.sql 실행 후 이어서 실행하세요
-- =====================================================

-- 식당 데이터 삽입
INSERT INTO restaurants (name, category, address, phone, lat, lng, solo_friendly, has_solo_seat, avg_price, min_price, price_range, rating, review_count, open_time, close_time, is_open, closed_days, thumbnail, tags, naver_map_url)
VALUES
  ('혼밥식당 강남점', '한식', '서울 강남구 테헤란로 123', '02-1234-5678',
   37.4979, 127.0276, true, true, 8500, 6000, 'cheap', 4.5, 234,
   '11:00', '21:00', true, ARRAY['일요일'],
   'https://via.placeholder.com/400x300/22c55e/ffffff?text=혼밥식당',
   ARRAY['조용해요', '1인석 완비', '점심 특선'],
   'https://map.naver.com'),

  ('일인분 라멘', '일식', '서울 강남구 역삼동 456', '02-9876-5432',
   37.4985, 127.0310, true, true, 12000, 10000, 'moderate', 4.8, 512,
   '11:30', '22:00', true, ARRAY['월요일'],
   'https://via.placeholder.com/400x300/f59e0b/ffffff?text=라멘집',
   ARRAY['칸막이석', '혼밥 천국', '빠른 서비스'],
   'https://map.naver.com'),

  ('착한가격 김밥천국', '분식', '서울 강남구 논현동 789', '02-1111-2222',
   37.5100, 127.0250, true, false, 5000, 3500, 'cheap', 3.9, 89,
   '07:00', '20:00', true, ARRAY[]::TEXT[],
   'https://via.placeholder.com/400x300/ef4444/ffffff?text=김밥천국',
   ARRAY['저렴해요', '연중무휴', '포장 가능'],
   'https://map.naver.com'),

  ('직장인 중국집', '중식', '서울 강남구 삼성동 321', '02-3333-4444',
   37.5140, 127.0540, false, false, 15000, 9000, 'moderate', 4.2, 167,
   '11:00', '21:30', false, ARRAY['일요일'],
   'https://via.placeholder.com/400x300/8b5cf6/ffffff?text=중국집',
   ARRAY['짜장면 맛집', '빠른 배달', '가성비'],
   'https://map.naver.com'),

  ('스테이크 하우스 1인', '양식', '서울 강남구 청담동 555', '02-5555-6666',
   37.5255, 127.0481, true, true, 28000, 22000, 'expensive', 4.7, 341,
   '12:00', '22:00', true, ARRAY['월요일'],
   'https://via.placeholder.com/400x300/0ea5e9/ffffff?text=스테이크',
   ARRAY['프리미엄', '1인 코스', '분위기 좋음'],
   'https://map.naver.com'),

  ('맥도날드 강남역점', '패스트푸드', '서울 강남구 강남대로 396', '02-7777-8888',
   37.4979, 127.0261, true, false, 8000, 5500, 'cheap', 3.5, 1200,
   '07:00', '24:00', true, ARRAY[]::TEXT[],
   'https://via.placeholder.com/400x300/f59e0b/ffffff?text=맥도날드',
   ARRAY['24시간', '혼밥 OK', '키오스크 주문'],
   'https://map.naver.com'),

  ('혼카페 스터디룸', '카페', '서울 강남구 선릉역 근처', '02-9999-0000',
   37.5044, 127.0491, true, true, 6500, 4500, 'cheap', 4.4, 278,
   '08:00', '23:00', true, ARRAY[]::TEXT[],
   'https://via.placeholder.com/400x300/06b6d4/ffffff?text=카페',
   ARRAY['노트북 환영', '조용해요', '콘센트 많음'],
   'https://map.naver.com'),

  ('본죽 역삼점', '한식', '서울 강남구 역삼동 234', '02-2222-3333',
   37.5003, 127.0366, true, false, 9000, 7000, 'cheap', 4.1, 145,
   '09:00', '20:00', false, ARRAY['일요일'],
   'https://via.placeholder.com/400x300/10b981/ffffff?text=죽집',
   ARRAY['건강식', '혼자 먹기 편함', '점심 추천'],
   'https://map.naver.com');

-- 메뉴 데이터 삽입 (식당 이름으로 ID 조회)
INSERT INTO menus (restaurant_id, name, price, is_popular)
SELECT r.id, m.name, m.price, m.is_popular
FROM restaurants r
JOIN (VALUES
  ('혼밥식당 강남점', '제육볶음 정식', 8500, true),
  ('혼밥식당 강남점', '된장찌개 정식', 7000, false),
  ('혼밥식당 강남점', '비빔밥', 6000, true),
  ('일인분 라멘', '돈코츠 라멘', 12000, true),
  ('일인분 라멘', '간장 라멘', 11000, false),
  ('일인분 라멘', '미소 라멘', 11000, true),
  ('착한가격 김밥천국', '참치김밥', 4000, true),
  ('착한가격 김밥천국', '순대국밥', 6000, false),
  ('착한가격 김밥천국', '떡볶이', 3500, true),
  ('맥도날드 강남역점', '빅맥 세트', 8300, true),
  ('맥도날드 강남역점', '맥모닝', 5500, true),
  ('혼카페 스터디룸', '아메리카노', 4500, true),
  ('혼카페 스터디룸', '카페라떼', 5500, true),
  ('본죽 역삼점', '전복죽', 12000, true),
  ('본죽 역삼점', '야채죽', 7000, false)
) AS m(restaurant_name, name, price, is_popular) ON r.name = m.restaurant_name;
