-- Footer Settings 테이블에 새로운 이미지 필드 추가
-- 다음 SQL을 Supabase SQL 에디터에서 실행하세요

-- 1. 메인 추천 이미지 필드 추가
ALTER TABLE footer_settings 
ADD COLUMN feature_image_url TEXT;

-- 2. 갤러리 이미지 배열 필드 추가 (JSONB 타입으로 저장)
ALTER TABLE footer_settings 
ADD COLUMN gallery_images JSONB DEFAULT '[]'::jsonb;

-- 3. 기본값 업데이트 (선택사항)
UPDATE footer_settings 
SET 
  feature_image_url = NULL,
  gallery_images = '[]'::jsonb
WHERE gallery_images IS NULL;

-- 확인 쿼리 (실행 결과 확인용)
SELECT 
  company_name,
  feature_image_url,
  gallery_images
FROM footer_settings;

-- 갤러리 이미지 추가 예시 (테스트용)
-- UPDATE footer_settings 
-- SET gallery_images = '[
--   {"name": "예시 이미지 1", "url": "https://example.com/image1.jpg"},
--   {"name": "예시 이미지 2", "url": "https://example.com/image2.jpg"},
--   {"name": "예시 이미지 3", "url": "https://example.com/image3.jpg"}
-- ]'::jsonb; 