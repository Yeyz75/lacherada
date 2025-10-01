-- =====================================================
-- FUNCIONES RPC PARA MARKETPLACE
-- =====================================================
-- Estas funciones optimizan operaciones comunes del marketplace
-- usando lógica del lado del servidor para mejor performance

-- =====================================================
-- 1. INCREMENTAR CONTADOR DE VISTAS
-- =====================================================
-- Incrementa el contador de vistas de un item de forma atómica
-- Evita condiciones de carrera usando UPDATE directo

CREATE OR REPLACE FUNCTION increment_view_count(item_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE marketplace_items
  SET 
    view_count = COALESCE(view_count, 0) + 1,
    updated_at = NOW()
  WHERE id = item_id;
END;
$$;

-- Comentario de la función
COMMENT ON FUNCTION increment_view_count IS 
'Incrementa el contador de vistas de un item de forma atómica';

-- =====================================================
-- 2. INCREMENTAR CONTADOR DE FAVORITOS
-- =====================================================
-- Incrementa el contador de favoritos cuando se agrega a favoritos
-- Se llama automáticamente desde el trigger o manualmente

CREATE OR REPLACE FUNCTION increment_favorite_count(item_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE marketplace_items
  SET 
    favorite_count = COALESCE(favorite_count, 0) + 1,
    updated_at = NOW()
  WHERE id = item_id;
END;
$$;

COMMENT ON FUNCTION increment_favorite_count IS 
'Incrementa el contador de favoritos de un item';

-- =====================================================
-- 3. DECREMENTAR CONTADOR DE FAVORITOS
-- =====================================================
-- Decrementa el contador de favoritos cuando se remueve de favoritos
-- Asegura que nunca sea negativo

CREATE OR REPLACE FUNCTION decrement_favorite_count(item_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE marketplace_items
  SET 
    favorite_count = GREATEST(COALESCE(favorite_count, 0) - 1, 0),
    updated_at = NOW()
  WHERE id = item_id;
END;
$$;

COMMENT ON FUNCTION decrement_favorite_count IS 
'Decrementa el contador de favoritos de un item (mínimo 0)';

-- =====================================================
-- 4. TRIGGER PARA AUTO-ACTUALIZAR CONTADOR DE FAVORITOS
-- =====================================================
-- Actualiza automáticamente el contador cuando se agregan/eliminan favoritos

CREATE OR REPLACE FUNCTION handle_favorite_count_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementar cuando se agrega a favoritos
    PERFORM increment_favorite_count(NEW.item_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementar cuando se remueve de favoritos
    PERFORM decrement_favorite_count(OLD.item_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Crear trigger en la tabla de favoritos
DROP TRIGGER IF EXISTS on_favorite_change ON user_favorites;
CREATE TRIGGER on_favorite_change
  AFTER INSERT OR DELETE ON user_favorites
  FOR EACH ROW
  EXECUTE FUNCTION handle_favorite_count_change();

COMMENT ON TRIGGER on_favorite_change ON user_favorites IS 
'Actualiza automáticamente el contador de favoritos del item';

-- =====================================================
-- 5. OBTENER ITEMS CON ESTADÍSTICAS
-- =====================================================
-- Función optimizada para obtener items con todas sus relaciones
-- y estadísticas calculadas

CREATE OR REPLACE FUNCTION get_items_with_stats(
  p_user_id UUID DEFAULT NULL,
  p_category_id UUID DEFAULT NULL,
  p_listing_type TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'published',
  p_query TEXT DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  slug TEXT,
  user_id UUID,
  category_id UUID,
  listing_type TEXT,
  pricing_mode TEXT,
  price DECIMAL,
  status TEXT,
  view_count INT,
  favorite_count INT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  category_name TEXT,
  user_name TEXT,
  user_avatar TEXT,
  image_count INT,
  is_favorited BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.title,
    i.description,
    i.slug,
    i.user_id,
    i.category_id,
    i.listing_type,
    i.pricing_mode,
    i.price,
    i.status,
    COALESCE(i.view_count, 0) as view_count,
    COALESCE(i.favorite_count, 0) as favorite_count,
    i.created_at,
    i.updated_at,
    c.name as category_name,
    p.full_name as user_name,
    p.avatar_url as user_avatar,
    (SELECT COUNT(*) FROM item_images WHERE item_id = i.id)::INT as image_count,
    EXISTS(
      SELECT 1 FROM user_favorites 
      WHERE item_id = i.id AND user_id = p_user_id
    ) as is_favorited
  FROM marketplace_items i
  LEFT JOIN categories c ON i.category_id = c.id
  LEFT JOIN user_profiles p ON i.user_id = p.id
  WHERE 
    (p_user_id IS NULL OR i.user_id = p_user_id)
    AND (p_category_id IS NULL OR i.category_id = p_category_id)
    AND (p_listing_type IS NULL OR i.listing_type = p_listing_type)
    AND (p_status IS NULL OR i.status = p_status)
    AND (
      p_query IS NULL OR 
      i.title ILIKE '%' || p_query || '%' OR 
      i.description ILIKE '%' || p_query || '%'
    )
  ORDER BY i.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

COMMENT ON FUNCTION get_items_with_stats IS 
'Obtiene items con todas sus relaciones y estadísticas en una sola query';

-- =====================================================
-- 6. VERIFICAR SI UN ITEM ES FAVORITO
-- =====================================================
-- Verifica rápidamente si un usuario tiene un item en favoritos

CREATE OR REPLACE FUNCTION is_item_favorite(
  p_user_id UUID,
  p_item_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM user_favorites
    WHERE user_id = p_user_id AND item_id = p_item_id
  ) INTO v_exists;
  
  RETURN v_exists;
END;
$$;

COMMENT ON FUNCTION is_item_favorite IS 
'Verifica si un item está en los favoritos de un usuario';

-- =====================================================
-- 7. OBTENER ESTADÍSTICAS DE UN ITEM
-- =====================================================
-- Obtiene todas las estadísticas de un item en una sola llamada

CREATE OR REPLACE FUNCTION get_item_stats(p_item_id UUID)
RETURNS TABLE (
  view_count INT,
  favorite_count INT,
  image_count INT,
  created_days_ago INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(i.view_count, 0)::INT as view_count,
    COALESCE(i.favorite_count, 0)::INT as favorite_count,
    (SELECT COUNT(*)::INT FROM item_images WHERE item_id = p_item_id) as image_count,
    EXTRACT(DAY FROM NOW() - i.created_at)::INT as created_days_ago
  FROM marketplace_items i
  WHERE i.id = p_item_id;
END;
$$;

COMMENT ON FUNCTION get_item_stats IS 
'Obtiene todas las estadísticas de un item';

-- =====================================================
-- 8. BÚSQUEDA FULL-TEXT DE ITEMS
-- =====================================================
-- Búsqueda optimizada usando índices full-text

CREATE OR REPLACE FUNCTION search_items_fulltext(
  p_query TEXT,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  slug TEXT,
  relevance REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.title,
    i.description,
    i.slug,
    ts_rank(
      to_tsvector('spanish', i.title || ' ' || COALESCE(i.description, '')),
      plainto_tsquery('spanish', p_query)
    ) as relevance
  FROM marketplace_items i
  WHERE 
    i.status = 'published'
    AND to_tsvector('spanish', i.title || ' ' || COALESCE(i.description, '')) 
        @@ plainto_tsquery('spanish', p_query)
  ORDER BY relevance DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

COMMENT ON FUNCTION search_items_fulltext IS 
'Búsqueda full-text optimizada de items publicados';

-- =====================================================
-- PERMISOS
-- =====================================================
-- Otorgar permisos de ejecución a usuarios autenticados

GRANT EXECUTE ON FUNCTION increment_view_count TO authenticated;
GRANT EXECUTE ON FUNCTION increment_favorite_count TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_favorite_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_items_with_stats TO authenticated;
GRANT EXECUTE ON FUNCTION is_item_favorite TO authenticated;
GRANT EXECUTE ON FUNCTION get_item_stats TO authenticated;
GRANT EXECUTE ON FUNCTION search_items_fulltext TO authenticated;

-- También permitir a usuarios anónimos ver items (solo lectura)
GRANT EXECUTE ON FUNCTION get_items_with_stats TO anon;
GRANT EXECUTE ON FUNCTION get_item_stats TO anon;
GRANT EXECUTE ON FUNCTION search_items_fulltext TO anon;
GRANT EXECUTE ON FUNCTION increment_view_count TO anon;

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================
-- Crear índices para mejorar el performance de las queries

-- Índice para búsqueda full-text
CREATE INDEX IF NOT EXISTS idx_items_fulltext 
ON marketplace_items 
USING GIN (to_tsvector('spanish', title || ' ' || COALESCE(description, '')));

-- Índice para filtros comunes
CREATE INDEX IF NOT EXISTS idx_items_status_created 
ON marketplace_items (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_items_category_status 
ON marketplace_items (category_id, status);

CREATE INDEX IF NOT EXISTS idx_items_user_status 
ON marketplace_items (user_id, status);

-- Índice para favoritos
CREATE INDEX IF NOT EXISTS idx_favorites_user_item 
ON user_favorites (user_id, item_id);

CREATE INDEX IF NOT EXISTS idx_favorites_item 
ON user_favorites (item_id);

-- =====================================================
-- FIN DE MIGRACION
-- =====================================================
