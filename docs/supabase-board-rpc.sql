-- 게시판 테이블 자동 생성 RPC 함수
-- Supabase SQL Editor에서 실행해주세요.

CREATE OR REPLACE FUNCTION create_board_table(table_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    full_table_name TEXT;
BEGIN
    -- 테이블 이름 검증 (영문, 숫자, 언더스코어만 허용)
    IF table_name !~ '^[a-zA-Z0-9_]+$' THEN
        RAISE EXCEPTION 'Invalid table name. Only alphanumeric characters and underscores are allowed.';
    END IF;
    
    -- 테이블명 앞에 board_ 접두사가 없으면 추가
    IF table_name NOT LIKE 'board_%' THEN
        full_table_name := 'board_' || table_name;
    ELSE
        full_table_name := table_name;
    END IF;
    
    -- 테이블이 이미 존재하는지 확인
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = full_table_name
    ) THEN
        RAISE NOTICE 'Table % already exists', full_table_name;
        RETURN FALSE;
    END IF;
    
    -- 게시판 테이블 생성
    EXECUTE format('
        CREATE TABLE public.%I (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT,
            author TEXT DEFAULT ''관리자'',
            view_count INTEGER DEFAULT 0,
            is_pinned BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE(''utc''::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE(''utc''::text, NOW()) NOT NULL
        );
    ', full_table_name);
    
    -- 인덱스 생성
    EXECUTE format('CREATE INDEX %I_created_at_idx ON public.%I (created_at DESC);', full_table_name, full_table_name);
    EXECUTE format('CREATE INDEX %I_is_active_idx ON public.%I (is_active);', full_table_name, full_table_name);
    EXECUTE format('CREATE INDEX %I_is_pinned_idx ON public.%I (is_pinned);', full_table_name, full_table_name);
    
    -- updated_at 자동 업데이트 트리거 생성
    EXECUTE format('
        CREATE OR REPLACE FUNCTION update_%I_updated_at()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = TIMEZONE(''utc''::text, NOW());
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;
    ', full_table_name);
    
    EXECUTE format('
        CREATE TRIGGER %I_updated_at_trigger
            BEFORE UPDATE ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION update_%I_updated_at();
    ', full_table_name, full_table_name, full_table_name);
    
    -- RLS (Row Level Security) 설정
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', full_table_name);
    
    -- 읽기 권한: 모든 사용자가 활성화된 게시글 조회 가능
    EXECUTE format('
        CREATE POLICY "Enable read access for all users" ON public.%I
        FOR SELECT USING (is_active = true);
    ', full_table_name);
    
    -- 쓰기 권한: 인증된 사용자만 가능 (나중에 관리자 권한으로 제한 가능)
    EXECUTE format('
        CREATE POLICY "Enable insert for authenticated users only" ON public.%I
        FOR INSERT WITH CHECK (auth.role() = ''authenticated'');
    ', full_table_name);
    
    EXECUTE format('
        CREATE POLICY "Enable update for authenticated users only" ON public.%I
        FOR UPDATE USING (auth.role() = ''authenticated'');
    ', full_table_name);
    
    EXECUTE format('
        CREATE POLICY "Enable delete for authenticated users only" ON public.%I
        FOR DELETE USING (auth.role() = ''authenticated'');
    ', full_table_name);
    
    -- 샘플 데이터 삽입
    EXECUTE format('
        INSERT INTO public.%I (title, content, author, is_pinned)
        VALUES 
        (''게시판 개설 안내'', ''%s 게시판이 개설되었습니다. 자유롭게 이용해주세요.'', ''관리자'', true),
        (''게시판 이용 규칙'', ''- 서로 존중하는 마음으로 게시해주세요.\n- 광고성 게시글은 삭제될 수 있습니다.\n- 건전한 게시판 문화를 만들어가요.'', ''관리자'', true);
    ', full_table_name, replace(full_table_name, 'board_', ''));
    
    RAISE NOTICE 'Successfully created board table: %', full_table_name;
    RETURN TRUE;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error creating board table %: %', full_table_name, SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 게시판 테이블 삭제 RPC 함수 (필요시 사용)
CREATE OR REPLACE FUNCTION drop_board_table(table_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    full_table_name TEXT;
BEGIN
    -- 테이블명 앞에 board_ 접두사가 없으면 추가
    IF table_name NOT LIKE 'board_%' THEN
        full_table_name := 'board_' || table_name;
    ELSE
        full_table_name := table_name;
    END IF;
    
    -- 테이블 존재 확인
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = full_table_name
    ) THEN
        RAISE NOTICE 'Table % does not exist', full_table_name;
        RETURN FALSE;
    END IF;
    
    -- 연관된 함수 삭제
    EXECUTE format('DROP FUNCTION IF EXISTS update_%I_updated_at() CASCADE;', full_table_name);
    
    -- 테이블 삭제
    EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE;', full_table_name);
    
    RAISE NOTICE 'Successfully dropped board table: %', full_table_name;
    RETURN TRUE;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error dropping board table %: %', full_table_name, SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사용 예시:
-- SELECT create_board_table('notice'); -- board_notice 테이블 생성
-- SELECT create_board_table('board_faq'); -- board_faq 테이블 생성
-- SELECT drop_board_table('notice'); -- board_notice 테이블 삭제 