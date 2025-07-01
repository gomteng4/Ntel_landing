# 앤플랫폼 랜딩페이지

승승통신과 유사한 관리 가능한 랜딩페이지입니다.

## 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Authentication)
- **배포**: GitHub Pages

## 주요 기능

### 사용자 페이지
- **반응형 헤더 네비게이션** (로고 이미지 지원)
- **히어로 배너 슬라이더** (자동/수동 조작, 최대 3개 버튼)
- **서비스 카드 섹션** (6개 카드, 이미지/이모지 아이콘)
- **추천 요금제 섹션** (BEST/HOT 태그, 요금제별 이미지)
- **고객 리뷰 섹션** (별점 표시)
- **이벤트 배너 슬라이더** (배경 이미지 지원)
- **푸터** (연락처, QR 코드 이미지, 로고)

### 관리자 페이지
- **비밀 URL 접근** (`/admin`)
- **실시간 이미지 업로드** (Supabase Storage)
- **실시간 콘텐츠 관리**
- **8개 관리 섹션**:
  - 사이트 설정 (로고 이미지 업로드)
  - 배너 관리 (이미지 업로드, 버튼 관리)
  - 메뉴 관리 (게시판 자동 생성)
  - 서비스 카드 관리 (아이콘 이미지 업로드)
  - 요금제 관리 (요금제 이미지 업로드)
  - 이벤트 배너 관리 (배경 이미지 업로드)
  - 고객 리뷰 관리
  - 푸터 설정 (로고, QR 코드 이미지 업로드)

## 🖼️ 이미지 업로드 시스템

### Supabase Storage 설정
프로젝트에서 이미지 업로드 기능을 사용하려면 Supabase Storage를 설정해야 합니다.

1. **Storage 버킷 생성**: [docs/supabase-storage-setup.md](docs/supabase-storage-setup.md) 참조
2. **폴더 구조**:
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

### 이미지 업로드 기능
- **드래그 앤 드롭** 또는 **클릭**으로 이미지 선택
- **실시간 미리보기**
- **자동 파일명 생성** (타임스탬프 기반)
- **파일 타입 검증** (JPG, PNG, GIF만 허용)
- **파일 크기 제한** (5MB)
- **즉시 반영**: 업로드 즉시 홈페이지에 실시간 반영

## 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone https://github.com/your-username/ntel-landing.git
cd ntel-landing
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경변수 설정
`.env.local.example`을 복사하여 `.env.local` 파일을 생성하고 Supabase 정보를 입력하세요.

```bash
cp .env.local.example .env.local
```

### 4. 개발 서버 실행
```bash
npm run dev
```

사이트는 [http://localhost:3001](http://localhost:3001)에서 확인할 수 있습니다.

## 관리자 접근

- URL: `/admin`
- 비밀번호: `ommeca1_admin_secret`

## 배포

### GitHub Pages 자동 배포
1. GitHub 저장소에 푸시
2. GitHub Actions가 자동으로 빌드 및 배포
3. `Settings > Pages`에서 Source를 `gh-pages` 브랜치로 설정

### 수동 빌드
```bash
npm run build
```

## Supabase 데이터베이스 구조

### 테이블 목록
- `site_settings` - 사이트 기본 설정
- `menu_items` - 상단 메뉴
- `banners` - 히어로 배너
- `service_cards` - 서비스 카드
- `pricing_plans` - 요금제
- `customer_reviews` - 고객 리뷰
- `event_banners` - 이벤트 배너
- `footer_settings` - 푸터 설정

## 라이센스

MIT License 