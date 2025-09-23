-- =====================================================
-- LACHERADA MARKETPLACE SCHEMA (CORE ENTITIES)
-- =====================================================
-- This script defines the marketplace domain tables, enums,
-- policies, triggers, and storage configuration required for
-- items/services listings, images, favorites, messaging, and ratings.
-- The design supports items that can be sold, donated, borrowed,
-- lent, exchanged, or offered as services.
-- =====================================================

BEGIN;

-- =====================================================
-- 1. EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "cube";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "earthdistance";

-- =====================================================
-- 2. ENUMERATED TYPES
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_type') THEN
        CREATE TYPE public.listing_type AS ENUM (
            'lend',
            'borrow',
            'sell',
            'donate',
            'exchange',
            'service'
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pricing_model') THEN
        CREATE TYPE public.pricing_model AS ENUM (
            'free',
            'fixed',
            'negotiable',
            'donation',
            'request'
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'item_condition_type') THEN
        CREATE TYPE public.item_condition_type AS ENUM (
            'new',
            'like_new',
            'good',
            'fair',
            'poor'
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'item_status_type') THEN
        CREATE TYPE public.item_status_type AS ENUM (
            'draft',
            'published',
            'paused',
            'completed',
            'archived'
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fulfillment_option') THEN
        CREATE TYPE public.fulfillment_option AS ENUM (
            'in_person',
            'pickup',
            'delivery',
            'shipping',
            'digital'
        );
    END IF;
END $$;

-- =====================================================
-- 3. SUPPORT FUNCTIONS
-- =====================================================

-- Generic updated_at trigger helper (re-usable)
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Maintain search vector for items in both Spanish & English
CREATE OR REPLACE FUNCTION public.handle_item_search_vector()
RETURNS TRIGGER AS $$
DECLARE
    title_text TEXT := COALESCE(NEW.title, '');
    description_text TEXT := COALESCE(NEW.description, '');
    tags_text TEXT := COALESCE(array_to_string(NEW.tags, ' '), '');
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('spanish', unaccent(title_text)), 'A') ||
        setweight(to_tsvector('english', unaccent(title_text)), 'A') ||
        setweight(to_tsvector('spanish', unaccent(description_text)), 'B') ||
        setweight(to_tsvector('english', unaccent(description_text)), 'B') ||
        setweight(to_tsvector('spanish', unaccent(tags_text)), 'C') ||
        setweight(to_tsvector('english', unaccent(tags_text)), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Maintain favorite_count metric on items
CREATE OR REPLACE FUNCTION public.handle_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.items
        SET favorite_count = favorite_count + 1,
            updated_at = timezone('utc'::text, now())
        WHERE id = NEW.item_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.items
        SET favorite_count = GREATEST(favorite_count - 1, 0),
            updated_at = timezone('utc'::text, now())
        WHERE id = OLD.item_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Maintain last_message_at on items
CREATE OR REPLACE FUNCTION public.handle_item_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.items
    SET last_message_at = timezone('utc'::text, now()),
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.item_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Automatically stamp published_at transitions
CREATE OR REPLACE FUNCTION public.handle_item_published_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'published' AND (OLD.status IS DISTINCT FROM 'published') THEN
        NEW.published_at = COALESCE(NEW.published_at, timezone('utc'::text, now()));
    ELSIF OLD.status = 'published' AND NEW.status <> 'published' THEN
        NEW.published_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. TABLE: categories
-- =====================================================

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories public read" ON public.categories;
CREATE POLICY "Categories public read"
    ON public.categories
    FOR SELECT
    USING (is_active = TRUE);

DROP POLICY IF EXISTS "Service role manage categories" ON public.categories;
CREATE POLICY "Service role manage categories"
    ON public.categories
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS categories_touch_updated_at ON public.categories;
CREATE TRIGGER categories_touch_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX IF NOT EXISTS categories_parent_idx ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS categories_active_idx ON public.categories(is_active);

-- =====================================================
-- 5. TABLE: items
-- =====================================================

CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    listing_type public.listing_type NOT NULL,
    pricing_mode public.pricing_model NOT NULL DEFAULT 'free',
    price NUMERIC(12, 2) CHECK (price IS NULL OR price >= 0),
    currency CHAR(3) DEFAULT 'USD',
    allow_negotiation BOOLEAN DEFAULT FALSE,
    quantity INTEGER DEFAULT 1 CHECK (quantity >= 1),
    condition public.item_condition_type,
    fulfillment_options public.fulfillment_option[] NOT NULL DEFAULT ARRAY['in_person']::public.fulfillment_option[],
    status public.item_status_type NOT NULL DEFAULT 'draft',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    availability_start TIMESTAMPTZ,
    availability_end TIMESTAMPTZ,
    location_city TEXT,
    location_state TEXT,
    location_country TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    contact_method TEXT,
    tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    rental_terms JSONB,
    exchange_terms TEXT,
    view_count INTEGER NOT NULL DEFAULT 0,
    favorite_count INTEGER NOT NULL DEFAULT 0,
    last_message_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT items_price_required CHECK (
        pricing_mode NOT IN ('fixed', 'negotiable') OR price IS NOT NULL
    )
);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Items public read" ON public.items;
CREATE POLICY "Items public read"
    ON public.items
    FOR SELECT
    USING (
        status = 'published' AND is_active = TRUE
    );

DROP POLICY IF EXISTS "Items owner read" ON public.items;
CREATE POLICY "Items owner read"
    ON public.items
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Items owner insert" ON public.items;
CREATE POLICY "Items owner insert"
    ON public.items
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Items owner update" ON public.items;
CREATE POLICY "Items owner update"
    ON public.items
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Items owner delete" ON public.items;
CREATE POLICY "Items owner delete"
    ON public.items
    FOR DELETE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Items service role manage" ON public.items;
CREATE POLICY "Items service role manage"
    ON public.items
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS items_touch_updated_at ON public.items;
CREATE TRIGGER items_touch_updated_at
    BEFORE UPDATE ON public.items
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS items_handle_search_vector ON public.items;
CREATE TRIGGER items_handle_search_vector
    BEFORE INSERT OR UPDATE ON public.items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_item_search_vector();

DROP TRIGGER IF EXISTS items_handle_published_at ON public.items;
CREATE TRIGGER items_handle_published_at
    BEFORE UPDATE ON public.items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_item_published_at();

CREATE INDEX IF NOT EXISTS items_user_idx ON public.items(user_id);
CREATE INDEX IF NOT EXISTS items_category_idx ON public.items(category_id);
CREATE INDEX IF NOT EXISTS items_status_idx ON public.items(status);
CREATE INDEX IF NOT EXISTS items_search_vector_idx ON public.items USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS items_location_idx ON public.items (location_country, location_state, location_city);
CREATE INDEX IF NOT EXISTS items_created_at_idx ON public.items (created_at DESC);
CREATE INDEX IF NOT EXISTS items_listings_geo_idx ON public.items USING GIST (ll_to_earth(latitude, longitude));

-- =====================================================
-- 6. TABLE: item_images
-- =====================================================

CREATE TABLE IF NOT EXISTS public.item_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    public_url TEXT,
    position INTEGER DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.item_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Item images public read" ON public.item_images;
CREATE POLICY "Item images public read"
    ON public.item_images
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.items i
            WHERE i.id = item_images.item_id
              AND (
                    i.status = 'published'
                    AND i.is_active = TRUE
                  OR i.user_id = auth.uid()
                  OR auth.role() = 'service_role'
              )
        )
    );

DROP POLICY IF EXISTS "Item images owner manage" ON public.item_images;
CREATE POLICY "Item images owner insert"
    ON public.item_images
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.items i
            WHERE i.id = item_images.item_id AND i.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Item images owner update" ON public.item_images;
CREATE POLICY "Item images owner update"
    ON public.item_images
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.items i
            WHERE i.id = item_images.item_id AND i.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.items i
            WHERE i.id = item_images.item_id AND i.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Item images owner delete" ON public.item_images;
CREATE POLICY "Item images owner delete"
    ON public.item_images
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.items i
            WHERE i.id = item_images.item_id AND i.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Item images service role manage" ON public.item_images;
CREATE POLICY "Item images service role manage"
    ON public.item_images
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS item_images_item_idx ON public.item_images(item_id);
CREATE INDEX IF NOT EXISTS item_images_position_idx ON public.item_images(item_id, position);

-- =====================================================
-- 7. TABLE: favorites
-- =====================================================

CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (user_id, item_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Favorites owner read" ON public.favorites;
CREATE POLICY "Favorites owner read"
    ON public.favorites
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Favorites owner insert" ON public.favorites;
CREATE POLICY "Favorites owner insert"
    ON public.favorites
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Favorites owner delete" ON public.favorites;
CREATE POLICY "Favorites owner delete"
    ON public.favorites
    FOR DELETE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Favorites service role manage" ON public.favorites;
CREATE POLICY "Favorites service role manage"
    ON public.favorites
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS favorites_handle_count_insert ON public.favorites;
CREATE TRIGGER favorites_handle_count_insert
    AFTER INSERT ON public.favorites
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_favorite_count();

DROP TRIGGER IF EXISTS favorites_handle_count_delete ON public.favorites;
CREATE TRIGGER favorites_handle_count_delete
    AFTER DELETE ON public.favorites
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_favorite_count();

CREATE INDEX IF NOT EXISTS favorites_user_idx ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_item_idx ON public.favorites(item_id);

-- =====================================================
-- 8. TABLE: messages
-- =====================================================

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT messages_sender_recipient_check CHECK (sender_id <> recipient_id)
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Messages participants read" ON public.messages;
CREATE POLICY "Messages participants read"
    ON public.messages
    FOR SELECT
    USING (
        auth.role() = 'service_role'
        OR auth.uid() = sender_id
        OR auth.uid() = recipient_id
    );

DROP POLICY IF EXISTS "Messages participants insert" ON public.messages;
CREATE POLICY "Messages participants insert"
    ON public.messages
    FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
    );

DROP POLICY IF EXISTS "Messages participants update" ON public.messages;
CREATE POLICY "Messages participants update"
    ON public.messages
    FOR UPDATE
    USING (
        auth.uid() = sender_id
        OR auth.uid() = recipient_id
    )
    WITH CHECK (
        auth.uid() = sender_id
        OR auth.uid() = recipient_id
    );

DROP POLICY IF EXISTS "Messages service role manage" ON public.messages;
CREATE POLICY "Messages service role manage"
    ON public.messages
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS messages_touch_item ON public.messages;
CREATE TRIGGER messages_touch_item
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_item_last_message();

CREATE INDEX IF NOT EXISTS messages_item_idx ON public.messages(item_id);
CREATE INDEX IF NOT EXISTS messages_sender_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_recipient_idx ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at DESC);

-- =====================================================
-- 9. TABLE: user_ratings
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
    rater_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ratee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (rater_id, ratee_id, item_id)
);

ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ratings public read" ON public.user_ratings;
CREATE POLICY "Ratings public read"
    ON public.user_ratings
    FOR SELECT
    USING (TRUE);

DROP POLICY IF EXISTS "Ratings rater insert" ON public.user_ratings;
CREATE POLICY "Ratings rater insert"
    ON public.user_ratings
    FOR INSERT
    WITH CHECK (auth.uid() = rater_id);

DROP POLICY IF EXISTS "Ratings rater update" ON public.user_ratings;
CREATE POLICY "Ratings rater update"
    ON public.user_ratings
    FOR UPDATE
    USING (auth.uid() = rater_id)
    WITH CHECK (auth.uid() = rater_id);

DROP POLICY IF EXISTS "Ratings rater delete" ON public.user_ratings;
CREATE POLICY "Ratings rater delete"
    ON public.user_ratings
    FOR DELETE
    USING (auth.uid() = rater_id);

DROP POLICY IF EXISTS "Ratings service role manage" ON public.user_ratings;
CREATE POLICY "Ratings service role manage"
    ON public.user_ratings
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS user_ratings_touch_updated_at ON public.user_ratings;
CREATE TRIGGER user_ratings_touch_updated_at
    BEFORE UPDATE ON public.user_ratings
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX IF NOT EXISTS user_ratings_ratee_idx ON public.user_ratings(ratee_id);
CREATE INDEX IF NOT EXISTS user_ratings_item_idx ON public.user_ratings(item_id);
CREATE INDEX IF NOT EXISTS user_ratings_created_at_idx ON public.user_ratings(created_at DESC);

-- =====================================================
-- 10. STORAGE CONFIGURATION FOR ITEM IMAGES
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'item-images',
    'item-images',
    TRUE,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Item images public access" ON storage.objects;
CREATE POLICY "Item images public access"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'item-images');

DROP POLICY IF EXISTS "Item images owner upload" ON storage.objects;
CREATE POLICY "Item images owner upload"
    ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'item-images'
        AND auth.uid()::text = split_part(name, '/', 1)
    );

DROP POLICY IF EXISTS "Item images owner update" ON storage.objects;
CREATE POLICY "Item images owner update"
    ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'item-images'
        AND auth.uid()::text = split_part(name, '/', 1)
    )
    WITH CHECK (
        bucket_id = 'item-images'
        AND auth.uid()::text = split_part(name, '/', 1)
    );

DROP POLICY IF EXISTS "Item images owner delete" ON storage.objects;
CREATE POLICY "Item images owner delete"
    ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'item-images'
        AND auth.uid()::text = split_part(name, '/', 1)
    );

DROP POLICY IF EXISTS "Item images service role manage" ON storage.objects;
CREATE POLICY "Item images service role manage"
    ON storage.objects
    FOR ALL TO service_role
    USING (bucket_id = 'item-images')
    WITH CHECK (bucket_id = 'item-images');

-- =====================================================
-- 11. FINAL VERIFICATION QUERIES (SAFE TO RUN MULTIPLE TIMES)
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Marketplace schema ready: % categories, % items',
        (SELECT COUNT(*) FROM public.categories),
        (SELECT COUNT(*) FROM public.items);
END;
$$;

COMMIT;
