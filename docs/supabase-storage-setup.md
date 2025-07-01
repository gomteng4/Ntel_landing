# Supabase Storage 설정 가이드

이미지 업로드 기능을 사용하기 위해 Supabase Storage를 설정해야 합니다.

## 1. Storage 버킷 생성

Supabase 대시보드에서 다음 SQL을 실행하세요:

```sql
-- Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

-- Storage 정책 설정 (모든 사용자가 업로드/읽기 가능)
CREATE POLICY "모든 사용자가 이미지를 업로드할 수 있습니다" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'images');

CREATE POLICY "모든 사용자가 이미지를 볼 수 있습니다" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "인증된 사용자가 이미지를 업데이트할 수 있습니다" ON storage.objects
FOR UPDATE USING (bucket_id = 'images');

CREATE POLICY "인증된 사용자가 이미지를 삭제할 수 있습니다" ON storage.objects
FOR DELETE USING (bucket_id = 'images');
```

## 2. 폴더 구조

업로드된 이미지는 다음과 같이 폴더별로 정리됩니다:

```
images/
├── logos/          # 로고 이미지
├── banners/        # 히어로 배너 이미지
├── service-icons/  # 서비스 카드 아이콘
├── pricing/        # 요금제 이미지
├── events/         # 이벤트 배너 이미지
├── qr-codes/       # QR 코드 이미지
└── general/        # 기타 이미지
```

## 3. 이미지 업로드 기능

각 관리 페이지에서 ImageUpload 컴포넌트를 통해 이미지를 업로드할 수 있습니다:

- **사이트 설정**: 로고 이미지
- **배너 관리**: 히어로 배너 이미지
- **서비스 카드**: 서비스 아이콘 (이미지 또는 이모지)
- **요금제 관리**: 요금제 설명 이미지
- **이벤트 배너**: 이벤트 배너 이미지
- **푸터 설정**: QR 코드 이미지

## 4. 주요 기능

### 이미지 업로드
- 드래그 앤 드롭 또는 클릭으로 이미지 선택
- 실시간 미리보기
- 자동 파일명 생성 (타임스탬프 기반)
- 파일 타입 검증 (JPG, PNG, GIF만 허용)
- 파일 크기 제한 (5MB)

### 실시간 반영
- 이미지 업로드 즉시 홈페이지에 반영
- Supabase Storage의 공개 URL 자동 생성
- 데이터베이스에 URL 자동 저장

## 5. 환경 변수 확인

`.env.local` 파일에 Supabase 설정이 올바른지 확인하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 6. 문제 해결

### 이미지 업로드가 안 되는 경우
1. Supabase Storage 정책이 올바르게 설정되었는지 확인
2. 버킷이 public으로 설정되었는지 확인
3. 파일 크기가 5MB 이하인지 확인
4. 지원하는 파일 형식인지 확인 (JPG, PNG, GIF)

### 이미지가 표시되지 않는 경우
1. Supabase Storage의 공개 URL이 올바른지 확인
2. 브라우저 캐시를 클리어하고 새로고침
3. 네트워크 탭에서 이미지 로딩 오류 확인 