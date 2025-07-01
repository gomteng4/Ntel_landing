-- 미리 정의된 5개의 게시판 테이블 생성
-- Supabase SQL Editor에서 실행해주세요.

-- 1. board_notice (공지사항)
CREATE TABLE IF NOT EXISTS public.board_notice (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    author TEXT DEFAULT '관리자',
    view_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. board_faq (자주묻는질문)
CREATE TABLE IF NOT EXISTS public.board_faq (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    author TEXT DEFAULT '관리자',
    view_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. board_qna (질문답변)
CREATE TABLE IF NOT EXISTS public.board_qna (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    author TEXT DEFAULT '관리자',
    view_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. board_news (뉴스/소식)
CREATE TABLE IF NOT EXISTS public.board_news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    author TEXT DEFAULT '관리자',
    view_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. board_free (자유게시판)
CREATE TABLE IF NOT EXISTS public.board_free (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    author TEXT DEFAULT '관리자',
    view_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 각 테이블에 인덱스 생성
CREATE INDEX IF NOT EXISTS board_notice_created_at_idx ON public.board_notice (created_at DESC);
CREATE INDEX IF NOT EXISTS board_notice_is_active_idx ON public.board_notice (is_active);
CREATE INDEX IF NOT EXISTS board_notice_is_pinned_idx ON public.board_notice (is_pinned);

CREATE INDEX IF NOT EXISTS board_faq_created_at_idx ON public.board_faq (created_at DESC);
CREATE INDEX IF NOT EXISTS board_faq_is_active_idx ON public.board_faq (is_active);
CREATE INDEX IF NOT EXISTS board_faq_is_pinned_idx ON public.board_faq (is_pinned);

CREATE INDEX IF NOT EXISTS board_qna_created_at_idx ON public.board_qna (created_at DESC);
CREATE INDEX IF NOT EXISTS board_qna_is_active_idx ON public.board_qna (is_active);
CREATE INDEX IF NOT EXISTS board_qna_is_pinned_idx ON public.board_qna (is_pinned);

CREATE INDEX IF NOT EXISTS board_news_created_at_idx ON public.board_news (created_at DESC);
CREATE INDEX IF NOT EXISTS board_news_is_active_idx ON public.board_news (is_active);
CREATE INDEX IF NOT EXISTS board_news_is_pinned_idx ON public.board_news (is_pinned);

CREATE INDEX IF NOT EXISTS board_free_created_at_idx ON public.board_free (created_at DESC);
CREATE INDEX IF NOT EXISTS board_free_is_active_idx ON public.board_free (is_active);
CREATE INDEX IF NOT EXISTS board_free_is_pinned_idx ON public.board_free (is_pinned);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 updated_at 트리거 생성
DROP TRIGGER IF EXISTS update_board_notice_updated_at ON public.board_notice;
CREATE TRIGGER update_board_notice_updated_at
    BEFORE UPDATE ON public.board_notice
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_board_faq_updated_at ON public.board_faq;
CREATE TRIGGER update_board_faq_updated_at
    BEFORE UPDATE ON public.board_faq
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_board_qna_updated_at ON public.board_qna;
CREATE TRIGGER update_board_qna_updated_at
    BEFORE UPDATE ON public.board_qna
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_board_news_updated_at ON public.board_news;
CREATE TRIGGER update_board_news_updated_at
    BEFORE UPDATE ON public.board_news
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_board_free_updated_at ON public.board_free;
CREATE TRIGGER update_board_free_updated_at
    BEFORE UPDATE ON public.board_free
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 설정
ALTER TABLE public.board_notice ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_qna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_free ENABLE ROW LEVEL SECURITY;

-- 읽기 권한: 모든 사용자가 활성화된 게시글 조회 가능
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.board_notice FOR SELECT USING (is_active = true);
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.board_faq FOR SELECT USING (is_active = true);
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.board_qna FOR SELECT USING (is_active = true);
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.board_news FOR SELECT USING (is_active = true);
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.board_free FOR SELECT USING (is_active = true);

-- 쓰기 권한: 모든 사용자가 가능 (나중에 제한 가능)
CREATE POLICY IF NOT EXISTS "Enable all access for all users" ON public.board_notice FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Enable all access for all users" ON public.board_faq FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Enable all access for all users" ON public.board_qna FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Enable all access for all users" ON public.board_news FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Enable all access for all users" ON public.board_free FOR ALL USING (true);

-- 샘플 데이터 삽입
INSERT INTO public.board_notice (title, content, author, is_pinned) VALUES
('공지사항 게시판 개설', '공지사항 게시판이 개설되었습니다. 중요한 공지사항을 확인해주세요.', '관리자', true),
('이용 안내', '게시판 이용 시 주의사항을 꼭 확인해주세요.', '관리자', false)
ON CONFLICT DO NOTHING;

INSERT INTO public.board_faq (title, content, author, is_pinned) VALUES
('자주 묻는 질문 게시판 안내', '자주 묻는 질문들을 정리해놓았습니다. 문의하기 전에 먼저 확인해보세요.', '관리자', true),
('서비스 이용 방법', 'Q: 서비스는 어떻게 이용하나요?\nA: 회원가입 후 로그인하여 이용하실 수 있습니다.', '관리자', false)
ON CONFLICT DO NOTHING;

INSERT INTO public.board_qna (title, content, author, is_pinned) VALUES
('질문답변 게시판 개설', '궁금한 점이 있으시면 언제든 질문해주세요. 빠르게 답변드리겠습니다.', '관리자', true),
('질문 작성 가이드', '효과적인 질문 작성 방법을 안내드립니다.', '관리자', false)
ON CONFLICT DO NOTHING;

INSERT INTO public.board_news (title, content, author, is_pinned) VALUES
('뉴스 게시판 개설', '최신 뉴스와 소식을 전해드립니다.', '관리자', true),
('서비스 업데이트 소식', '새로운 기능이 추가되었습니다.', '관리자', false)
ON CONFLICT DO NOTHING;

INSERT INTO public.board_free (title, content, author, is_pinned) VALUES
('자유게시판 개설', '자유롭게 의견을 나누는 공간입니다. 건전한 토론 문화를 만들어가요.', '관리자', true),
('게시판 이용 규칙', '서로 존중하는 마음으로 이용해주세요.', '관리자', false)
ON CONFLICT DO NOTHING; 