const sql = require('../utils/database');

// Helper function to format product with all related data
const formatProduct = async (product) => {
  const productId = product.id;
  
  // Get variations
  const variations = await sql`
    SELECT 
      id,
      type,
      name,
      value,
      sku,
      price_adjustment as price_modifier,
      stock,
      image_url
    FROM product_variations 
    WHERE product_id = ${productId}
    ORDER BY created_at ASC
  `;

  // Get store information (with error handling for backward compatibility)
  let productStores = [];
  try {
    productStores = await sql`
      SELECT 
        ps.stock,
        ps.reserved_stock,
        ps.min_threshold,
        ps.is_available,
        s.id as store_id,
        s.name as store_name,
        s.location as store_location
      FROM product_stores ps
      JOIN stores s ON ps.store_id = s.id
      WHERE ps.product_id = ${productId} AND s.is_active = true
      ORDER BY s.name ASC
    `;
  } catch (error) {
    // Tables might not exist yet - silently continue without store data
    console.warn('Store tables not found, continuing without store data:', error.message);
  }

  // Format images
  const images = (product.images || []).map((url, index) => ({
    url,
    alt: product.name,
    is_primary: index === 0,
    order: index + 1
  }));

  // Calculate PHP price if not set
  const phpPrice = product.php_price || (product.price * (product.price_conversion_rate || 0.042));

  // Format category
  const category = product.category ? {
    id: product.category.toLowerCase().replace(/\s+/g, '-'),
    name: product.category,
    slug: product.category.toLowerCase().replace(/\s+/g, '-')
  } : null;

  // Format brand
  const brand = product.brand ? {
    id: product.brand.toLowerCase().replace(/\s+/g, '-'),
    name: product.brand,
    slug: product.brand.toLowerCase().replace(/\s+/g, '-')
  } : null;

  // Format stock
  const stock = {
    available: (product.stock || 0) - (product.reserved_stock || 0),
    reserved: product.reserved_stock || 0,
    total: product.stock || 0,
    min_threshold: product.min_threshold || 10,
    location: productStores.length > 0 ? productStores[0].store_location : null
  };

  // Format stores
  const stores = productStores.map(ps => ({
    store_id: ps.store_id,
    store_name: ps.store_name,
    store_location: ps.store_location,
    stock: ps.stock,
    available: ps.is_available
  }));

  // Format preorder data if applicable
  let preorder = null;
  if (product.product_type === 'preorder' && product.order_deadline) {
    const now = new Date();
    const deadline = new Date(product.order_deadline);
    const releaseDate = product.release_date ? new Date(product.release_date) : null;
    
    const daysUntilRelease = releaseDate 
      ? Math.ceil((releaseDate - now) / (1000 * 60 * 60 * 24))
      : null;

    preorder = {
      order_deadline: product.order_deadline,
      release_date: product.release_date,
      expected_delivery: product.expected_delivery,
      days_until_release: daysUntilRelease,
      is_deadline_passed: deadline < now
    };
  }

  // Format variations
  const formattedVariations = variations.map(v => ({
    id: v.id,
    type: v.type || 'size',
    name: v.name,
    value: v.value,
    sku: v.sku,
    price_modifier: parseFloat(v.price_modifier || 0),
    stock: v.stock || 0,
    image_url: v.image_url
  }));

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    sku: product.sku,
    price: parseFloat(product.price),
    currency: product.currency || 'KRW',
    php_price: parseFloat(phpPrice),
    price_conversion_rate: parseFloat(product.price_conversion_rate || 0.042),
    images,
    category,
    brand,
    product_type: product.product_type,
    status: product.status,
    stock,
    stores: stores.length > 0 ? stores : undefined,
    preorder,
    weight: product.weight ? parseFloat(product.weight) : undefined,
    dimensions: product.dimensions || undefined,
    variations: formattedVariations.length > 0 ? formattedVariations : undefined,
    seo_title: product.seo_title,
    seo_description: product.seo_description,
    tags: product.tags || [],
    created_at: product.created_at,
    updated_at: product.updated_at
  };
};

// Unified products endpoint with advanced filtering
const getProducts = async (req, res) => {
  try {
    const {
      product_type,
      status,
      category,
      brand,
      search,
      page = 1,
      limit = 20,
      sort = 'created_desc',
      min_price,
      max_price,
      store_id,
      include_out_of_stock = false
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build query inline - check each condition one by one, no joins
    // Simple approach: build WHERE clause by checking each condition directly in the template literal
    const hasProductType = product_type && product_type !== 'all';
    const hasStatus = status !== undefined && status !== null;
    const hasCategory = category !== undefined && category !== null && category !== '';
    const hasBrand = brand !== undefined && brand !== null && brand !== '';
    const hasSearch = search !== undefined && search !== null && search !== '';
    const hasMinPrice = min_price !== undefined && min_price !== null;
    const hasMaxPrice = max_price !== undefined && max_price !== null;
    const hasStoreId = store_id !== undefined && store_id !== null;
    const excludeOutOfStock = !include_out_of_stock && !hasStatus;
    const searchPattern = hasSearch ? `%${search}%` : null;

    // Build products query - check each condition one by one inline
    // Most common case: /onhand with product_type and status
    if (hasProductType && hasStatus && !hasCategory && !hasBrand && !hasSearch && !hasMinPrice && !hasMaxPrice && !hasStoreId) {
      // Simple case: product_type + status only
      if (sort === 'created_desc' || !sort) {
        products = await sql`
          SELECT 
            p.*,
            COALESCE(p.reserved_stock, 0) as reserved_stock,
            COALESCE(p.min_threshold, 10) as min_threshold,
            COALESCE(p.php_price, p.price * COALESCE(p.price_conversion_rate, 0.042)) as php_price,
            COALESCE(p.price_conversion_rate, 0.042) as price_conversion_rate
          FROM products p
          WHERE p.product_type = ${product_type} AND p.status = ${status}
          ORDER BY p.created_at DESC
          LIMIT ${limitNum}
          OFFSET ${offset}
        `;
      } else if (sort === 'price_asc') {
        products = await sql`
          SELECT 
            p.*,
            COALESCE(p.reserved_stock, 0) as reserved_stock,
            COALESCE(p.min_threshold, 10) as min_threshold,
            COALESCE(p.php_price, p.price * COALESCE(p.price_conversion_rate, 0.042)) as php_price,
            COALESCE(p.price_conversion_rate, 0.042) as price_conversion_rate
          FROM products p
          WHERE p.product_type = ${product_type} AND p.status = ${status}
          ORDER BY p.price ASC
          LIMIT ${limitNum}
          OFFSET ${offset}
        `;
      } else if (sort === 'price_desc') {
        products = await sql`
          SELECT 
            p.*,
            COALESCE(p.reserved_stock, 0) as reserved_stock,
            COALESCE(p.min_threshold, 10) as min_threshold,
            COALESCE(p.php_price, p.price * COALESCE(p.price_conversion_rate, 0.042)) as php_price,
            COALESCE(p.price_conversion_rate, 0.042) as price_conversion_rate
          FROM products p
          WHERE p.product_type = ${product_type} AND p.status = ${status}
          ORDER BY p.price DESC
          LIMIT ${limitNum}
          OFFSET ${offset}
        `;
      } else {
        products = await sql`
          SELECT 
            p.*,
            COALESCE(p.reserved_stock, 0) as reserved_stock,
            COALESCE(p.min_threshold, 10) as min_threshold,
            COALESCE(p.php_price, p.price * COALESCE(p.price_conversion_rate, 0.042)) as php_price,
            COALESCE(p.price_conversion_rate, 0.042) as price_conversion_rate
          FROM products p
          WHERE p.product_type = ${product_type} AND p.status = ${status}
          ORDER BY p.created_at DESC
          LIMIT ${limitNum}
          OFFSET ${offset}
        `;
      }
    } else if (hasProductType && excludeOutOfStock && !hasStatus && !hasCategory && !hasBrand && !hasSearch && !hasMinPrice && !hasMaxPrice && !hasStoreId) {
      // Product type + exclude out of stock
      if (sort === 'created_desc' || !sort) {
        products = await sql`
          SELECT 
            p.*,
            COALESCE(p.reserved_stock, 0) as reserved_stock,
            COALESCE(p.min_threshold, 10) as min_threshold,
            COALESCE(p.php_price, p.price * COALESCE(p.price_conversion_rate, 0.042)) as php_price,
            COALESCE(p.price_conversion_rate, 0.042) as price_conversion_rate
          FROM products p
          WHERE p.product_type = ${product_type} AND p.status != 'out_of_stock'
          ORDER BY p.created_at DESC
          LIMIT ${limitNum}
          OFFSET ${offset}
        `;
      } else if (sort === 'price_asc') {
        products = await sql`
          SELECT 
            p.*,
            COALESCE(p.reserved_stock, 0) as reserved_stock,
            COALESCE(p.min_threshold, 10) as min_threshold,
            COALESCE(p.php_price, p.price * COALESCE(p.price_conversion_rate, 0.042)) as php_price,
            COALESCE(p.price_conversion_rate, 0.042) as price_conversion_rate
          FROM products p
          WHERE p.product_type = ${product_type} AND p.status != 'out_of_stock'
          ORDER BY p.price ASC
          LIMIT ${limitNum}
          OFFSET ${offset}
        `;
      } else {
        products = await sql`
          SELECT 
            p.*,
            COALESCE(p.reserved_stock, 0) as reserved_stock,
            COALESCE(p.min_threshold, 10) as min_threshold,
            COALESCE(p.php_price, p.price * COALESCE(p.price_conversion_rate, 0.042)) as php_price,
            COALESCE(p.price_conversion_rate, 0.042) as price_conversion_rate
          FROM products p
          WHERE p.product_type = ${product_type} AND p.status != 'out_of_stock'
          ORDER BY p.created_at DESC
          LIMIT ${limitNum}
          OFFSET ${offset}
        `;
      }
    } else {
      // More complex case - build WHERE clause inline checking each condition one by one
      // No arrays, no joins - just check conditions directly in the query
      if (sort === 'created_desc' || !sort) {
        if (hasProductType && hasStatus) {
          products = await sql`
            SELECT 
              p.*,
              COALESCE(p.reserved_stock, 0) as reserved_stock,
              COALESCE(p.min_threshold, 10) as min_threshold,
              COALESCE(p.php_price, p.price * COALESCE(p.price_conversion_rate, 0.042)) as php_price,
              COALESCE(p.price_conversion_rate, 0.042) as price_conversion_rate
            FROM products p
            WHERE p.product_type = ${product_type}
              AND p.status = ${status}
              ${hasCategory ? sql`AND LOWER(p.category) = LOWER(${category})` : sql``}
              ${hasBrand ? sql`AND LOWER(p.brand) = LOWER(${brand})` : sql``}
              ${hasSearch ? sql`AND (p.name ILIKE ${searchPattern} OR p.description ILIKE ${searchPattern} OR p.sku ILIKE ${searchPattern})` : sql``}
              ${hasMinPrice ? sql`AND p.price >= ${parseFloat(min_price)}` : sql``}
              ${hasMaxPrice ? sql`AND p.price <= ${parseFloat(max_price)}` : sql``}
              ${hasStoreId ? sql`AND EXISTS (SELECT 1 FROM product_stores ps WHERE ps.product_id = p.id AND ps.store_id = ${store_id} AND ps.is_available = true)` : sql``}
            ORDER BY p.created_at DESC
            LIMIT ${limitNum}
            OFFSET ${offset}
          `;
        } else if (hasProductType && excludeOutOfStock) {
          products = await sql`
            SELECT 
              p.*,
              COALESCE(p.reserved_stock, 0) as reserved_stock,
              COALESCE(p.min_threshold, 10) as min_threshold,
              COALESCE(p.php_price, p.price * COALESCE(p.price_conversion_rate, 0.042)) as php_price,
              COALESCE(p.price_conversion_rate, 0.042) as price_conversion_rate
            FROM products p
            WHERE p.product_type = ${product_type}
              AND p.status != 'out_of_stock'
              ${hasCategory ? sql`AND LOWER(p.category) = LOWER(${category})` : sql``}
              ${hasBrand ? sql`AND LOWER(p.brand) = LOWER(${brand})` : sql``}
              ${hasSearch ? sql`AND (p.name ILIKE ${searchPattern} OR p.description ILIKE ${searchPattern} OR p.sku ILIKE ${searchPattern})` : sql``}
              ${hasMinPrice ? sql`AND p.price >= ${parseFloat(min_price)}` : sql``}
              ${hasMaxPrice ? sql`AND p.price <= ${parseFloat(max_price)}` : sql``}
              ${hasStoreId ? sql`AND EXISTS (SELECT 1 FROM product_stores ps WHERE ps.product_id = p.id AND ps.store_id = ${store_id} AND ps.is_available = true)` : sql``}
            ORDER BY p.created_at DESC
            LIMIT ${limitNum}
            OFFSET ${offset}
          `;
        } else {
          products = await sql`
            SELECT 
              p.*,
              COALESCE(p.reserved_stock, 0) as reserved_stock,
              COALESCE(p.min_threshold, 10) as min_threshold,
              COALESCE(p.php_price, p.price * COALESCE(p.price_conversion_rate, 0.042)) as php_price,
              COALESCE(p.price_conversion_rate, 0.042) as price_conversion_rate
            FROM products p
            WHERE 1=1
              ${hasProductType ? sql`AND p.product_type = ${product_type}` : sql``}
              ${hasStatus ? sql`AND p.status = ${status}` : sql``}
              ${excludeOutOfStock ? sql`AND p.status != 'out_of_stock'` : sql``}
              ${hasCategory ? sql`AND LOWER(p.category) = LOWER(${category})` : sql``}
              ${hasBrand ? sql`AND LOWER(p.brand) = LOWER(${brand})` : sql``}
              ${hasSearch ? sql`AND (p.name ILIKE ${searchPattern} OR p.description ILIKE ${searchPattern} OR p.sku ILIKE ${searchPattern})` : sql``}
              ${hasMinPrice ? sql`AND p.price >= ${parseFloat(min_price)}` : sql``}
              ${hasMaxPrice ? sql`AND p.price <= ${parseFloat(max_price)}` : sql``}
              ${hasStoreId ? sql`AND EXISTS (SELECT 1 FROM product_stores ps WHERE ps.product_id = p.id AND ps.store_id = ${store_id} AND ps.is_available = true)` : sql``}
            ORDER BY p.created_at DESC
            LIMIT ${limitNum}
            OFFSET ${offset}
          `;
        }
      } else if (sort === 'price_asc') {
        if (hasProductType && hasStatus) {
          products = await sql`
            SELECT 
              p.*,
              COALESCE(p.reserved_stock, 0) as reserved_stock,
              COALESCE(p.min_threshold, 10) as min_threshold,
              COALESCE(p.php_price, p.price * COALESCE(p.price_conversion_rate, 0.042)) as php_price,
              COALESCE(p.price_conversion_rate, 0.042) as price_conversion_rate
            FROM products p
            WHERE p.product_type = ${product_type}
              AND p.status = ${status}
              ${hasCategory ? sql`AND LOWER(p.category) = LOWER(${category})` : sql``}
              ${hasBrand ? sql`AND LOWER(p.brand) = LOWER(${brand})` : sql``}
              ${hasSearch ? sql`AND (p.name ILIKE ${searchPattern} OR p.description ILIKE ${searchPattern} OR p.sku ILIKE ${searchPattern})` : sql``}
              ${hasMinPrice ? sql`AND p.price >= ${parseFloat(min_price)}` : sql``}
              ${hasMaxPrice ? sql`AND p.price <= ${parseFloat(max_price)}` : sql``}
              ${hasStoreId ? sql`AND EXISTS (SELECT 1 FROM product_stores ps WHERE ps.product_id = p.id AND ps.store_id = ${store_id} AND ps.is_available = true)` : sql``}
            ORDER BY p.price ASC
            LIMIT ${limitNum}
            OFFSET ${offset}
          `;
        } else {
          products = await sql`
            SELECT 
              p.*,
              COALESCE(p.reserved_stock, 0) as reserved_stock,
              COALESCE(p.min_threshold, 10) as min_threshold,
              COALESCE(p.php_price, p.price * COALESCE(p.price_conversion_rate, 0.042)) as php_price,
              COALESCE(p.price_conversion_rate, 0.042) as price_conversion_rate
            FROM products p
            WHERE 1=1
              ${hasProductType ? sql`AND p.product_type = ${product_type}` : sql``}
              ${hasStatus ? sql`AND p.status = ${status}` : sql``}
              ${excludeOutOfStock ? sql`AND p.status != 'out_of_stock'` : sql``}
              ${hasCategory ? sql`AND LOWER(p.category) = LOWER(${category})` : sql``}
              ${hasBrand ? sql`AND LOWER(p.brand) = LOWER(${brand})` : sql``}
              ${hasSearch ? sql`AND (p.name ILIKE ${searchPattern} OR p.description ILIKE ${searchPattern} OR p.sku ILIKE ${searchPattern})` : sql``}
              ${hasMinPrice ? sql`AND p.price >= ${parseFloat(min_price)}` : sql``}
              ${hasMaxPrice ? sql`AND p.price <= ${parseFloat(max_price)}` : sql``}
              ${hasStoreId ? sql`AND EXISTS (SELECT 1 FROM product_stores ps WHERE ps.product_id = p.id AND ps.store_id = ${store_id} AND ps.is_available = true)` : sql``}
            ORDER BY p.price ASC
            LIMIT ${limitNum}
            OFFSET ${offset}
          `;
        }
      } else if (sort === 'price_desc') {
        if (hasProductType && hasStatus) {
          products = await sql`
            SELECT 
              p.*,
              COALESCE(p.reserved_stock, 0) as reserved_stock,
              COALESCE(p.min_threshold, 10) as min_threshold,
              COALESCE(p.php_price, p.price * COALESCE(p.price_conversion_rate, 0.042)) as php_price,
              COALESCE(p.price_conversion_rate, 0.042) as price_conversion_rate
            FROM products p
            WHERE p.product_type = ${product_type}
              AND p.status = ${status}
              ${hasCategory ? sql`AND LOWER(p.category) = LOWER(${category})` : sql``}
              ${hasBrand ? sql`AND LOWER(p.brand) = LOWER(${brand})` : sql``}
              ${hasSearch ? sql`AND (p.name ILIKE ${searchPattern} OR p.description ILIKE ${searchPattern} OR p.sku ILIKE ${searchPattern})` : sql``}
              ${hasMinPrice ? sql`AND p.price >= ${parseFloat(min_price)}` : sql``}
              ${hasMaxPrice ? sql`AND p.price <= ${parseFloat(max_price)}` : sql``}
              ${hasStoreId ? sql`AND EXISTS (SELECT 1 FROM product_stores ps WHERE ps.product_id = p.id AND ps.store_id = ${store_id} AND ps.is_available = true)` : sql``}
            ORDER BY p.price DESC
            LIMIT ${limitNum}
            OFFSET ${offset}
          `;
        } else {
          products = await sql`
            SELECT 
              p.*,
              COALESCE(p.reserved_stock, 0) as reserved_stock,
              COALESCE(p.min_threshold, 10) as min_threshold,
              COALESCE(p.php_price, p.price * COALESCE(p.price_conversion_rate, 0.042)) as php_price,
              COALESCE(p.price_conversion_rate, 0.042) as price_conversion_rate
            FROM products p
            WHERE 1=1
              ${hasProductType ? sql`AND p.product_type = ${product_type}` : sql``}
              ${hasStatus ? sql`AND p.status = ${status}` : sql``}
              ${excludeOutOfStock ? sql`AND p.status != 'out_of_stock'` : sql``}
              ${hasCategory ? sql`AND LOWER(p.category) = LOWER(${category})` : sql``}
              ${hasBrand ? sql`AND LOWER(p.brand) = LOWER(${brand})` : sql``}
              ${hasSearch ? sql`AND (p.name ILIKE ${searchPattern} OR p.description ILIKE ${searchPattern} OR p.sku ILIKE ${searchPattern})` : sql``}
              ${hasMinPrice ? sql`AND p.price >= ${parseFloat(min_price)}` : sql``}
              ${hasMaxPrice ? sql`AND p.price <= ${parseFloat(max_price)}` : sql``}
              ${hasStoreId ? sql`AND EXISTS (SELECT 1 FROM product_stores ps WHERE ps.product_id = p.id AND ps.store_id = ${store_id} AND ps.is_available = true)` : sql``}
            ORDER BY p.price DESC
            LIMIT ${limitNum}
            OFFSET ${offset}
          `;
        }
      } else {
        // Default to created_desc
        products = await sql`
          SELECT 
            p.*,
            COALESCE(p.reserved_stock, 0) as reserved_stock,
            COALESCE(p.min_threshold, 10) as min_threshold,
            COALESCE(p.php_price, p.price * COALESCE(p.price_conversion_rate, 0.042)) as php_price,
            COALESCE(p.price_conversion_rate, 0.042) as price_conversion_rate
          FROM products p
          WHERE 1=1
            ${hasProductType ? sql`AND p.product_type = ${product_type}` : sql``}
            ${hasStatus ? sql`AND p.status = ${status}` : sql``}
            ${excludeOutOfStock ? sql`AND p.status != 'out_of_stock'` : sql``}
            ${hasCategory ? sql`AND LOWER(p.category) = LOWER(${category})` : sql``}
            ${hasBrand ? sql`AND LOWER(p.brand) = LOWER(${brand})` : sql``}
            ${hasSearch ? sql`AND (p.name ILIKE ${searchPattern} OR p.description ILIKE ${searchPattern} OR p.sku ILIKE ${searchPattern})` : sql``}
            ${hasMinPrice ? sql`AND p.price >= ${parseFloat(min_price)}` : sql``}
            ${hasMaxPrice ? sql`AND p.price <= ${parseFloat(max_price)}` : sql``}
            ${hasStoreId ? sql`AND EXISTS (SELECT 1 FROM product_stores ps WHERE ps.product_id = p.id AND ps.store_id = ${store_id} AND ps.is_available = true)` : sql``}
          ORDER BY p.created_at DESC
          LIMIT ${limitNum}
          OFFSET ${offset}
        `;
      }
    }

    // Build count query - check each condition one by one, no joins
    if (hasProductType && hasStatus && !hasCategory && !hasBrand && !hasSearch && !hasMinPrice && !hasMaxPrice && !hasStoreId) {
      countResult = await sql`SELECT COUNT(*) as total FROM products p WHERE p.product_type = ${product_type} AND p.status = ${status}`;
    } else if (hasProductType && excludeOutOfStock && !hasStatus && !hasCategory && !hasBrand && !hasSearch && !hasMinPrice && !hasMaxPrice && !hasStoreId) {
      countResult = await sql`SELECT COUNT(*) as total FROM products p WHERE p.product_type = ${product_type} AND p.status != 'out_of_stock'`;
    } else {
      // Complex case - check each condition inline
      if (hasProductType && hasStatus) {
        countResult = await sql`
          SELECT COUNT(*) as total FROM products p
          WHERE p.product_type = ${product_type}
            AND p.status = ${status}
            ${hasCategory ? sql`AND LOWER(p.category) = LOWER(${category})` : sql``}
            ${hasBrand ? sql`AND LOWER(p.brand) = LOWER(${brand})` : sql``}
            ${hasSearch ? sql`AND (p.name ILIKE ${searchPattern} OR p.description ILIKE ${searchPattern} OR p.sku ILIKE ${searchPattern})` : sql``}
            ${hasMinPrice ? sql`AND p.price >= ${parseFloat(min_price)}` : sql``}
            ${hasMaxPrice ? sql`AND p.price <= ${parseFloat(max_price)}` : sql``}
            ${hasStoreId ? sql`AND EXISTS (SELECT 1 FROM product_stores ps WHERE ps.product_id = p.id AND ps.store_id = ${store_id} AND ps.is_available = true)` : sql``}
        `;
      } else if (hasProductType && excludeOutOfStock) {
        countResult = await sql`
          SELECT COUNT(*) as total FROM products p
          WHERE p.product_type = ${product_type}
            AND p.status != 'out_of_stock'
            ${hasCategory ? sql`AND LOWER(p.category) = LOWER(${category})` : sql``}
            ${hasBrand ? sql`AND LOWER(p.brand) = LOWER(${brand})` : sql``}
            ${hasSearch ? sql`AND (p.name ILIKE ${searchPattern} OR p.description ILIKE ${searchPattern} OR p.sku ILIKE ${searchPattern})` : sql``}
            ${hasMinPrice ? sql`AND p.price >= ${parseFloat(min_price)}` : sql``}
            ${hasMaxPrice ? sql`AND p.price <= ${parseFloat(max_price)}` : sql``}
            ${hasStoreId ? sql`AND EXISTS (SELECT 1 FROM product_stores ps WHERE ps.product_id = p.id AND ps.store_id = ${store_id} AND ps.is_available = true)` : sql``}
        `;
      } else {
        countResult = await sql`
          SELECT COUNT(*) as total FROM products p
          WHERE 1=1
            ${hasProductType ? sql`AND p.product_type = ${product_type}` : sql``}
            ${hasStatus ? sql`AND p.status = ${status}` : sql``}
            ${excludeOutOfStock ? sql`AND p.status != 'out_of_stock'` : sql``}
            ${hasCategory ? sql`AND LOWER(p.category) = LOWER(${category})` : sql``}
            ${hasBrand ? sql`AND LOWER(p.brand) = LOWER(${brand})` : sql``}
            ${hasSearch ? sql`AND (p.name ILIKE ${searchPattern} OR p.description ILIKE ${searchPattern} OR p.sku ILIKE ${searchPattern})` : sql``}
            ${hasMinPrice ? sql`AND p.price >= ${parseFloat(min_price)}` : sql``}
            ${hasMaxPrice ? sql`AND p.price <= ${parseFloat(max_price)}` : sql``}
            ${hasStoreId ? sql`AND EXISTS (SELECT 1 FROM product_stores ps WHERE ps.product_id = p.id AND ps.store_id = ${store_id} AND ps.is_available = true)` : sql``}
        `;
      }
    }
    const total = parseInt(countResult[0].total);
    const totalPages = Math.ceil(total / limitNum);

    // Format products with related data
    const formattedProducts = await Promise.all(
      products.map(product => formatProduct(product))
    );

    // Get aggregations (categories, brands, price range) - check each condition one by one, no joins
    let categoryAgg, brandAgg, priceRangeResult;
    
    if (hasProductType && hasStatus && !hasCategory && !hasBrand && !hasSearch && !hasMinPrice && !hasMaxPrice && !hasStoreId) {
      // Simple case - product_type + status
      categoryAgg = await sql`
        SELECT category as name, COUNT(*) as count
        FROM products p
        WHERE p.product_type = ${product_type} AND p.status = ${status} AND category IS NOT NULL
        GROUP BY category
        ORDER BY count DESC
        LIMIT 20
      `;
      
      brandAgg = await sql`
        SELECT brand as name, COUNT(*) as count
        FROM products p
        WHERE p.product_type = ${product_type} AND p.status = ${status} AND brand IS NOT NULL
        GROUP BY brand
        ORDER BY count DESC
        LIMIT 20
      `;
      
      priceRangeResult = await sql`
        SELECT MIN(price) as min_price, MAX(price) as max_price
        FROM products p
        WHERE p.product_type = ${product_type} AND p.status = ${status}
      `;
    } else if (hasProductType && excludeOutOfStock && !hasStatus && !hasCategory && !hasBrand && !hasSearch && !hasMinPrice && !hasMaxPrice && !hasStoreId) {
      // Simple case - product_type + exclude out of stock
      categoryAgg = await sql`
        SELECT category as name, COUNT(*) as count
        FROM products p
        WHERE p.product_type = ${product_type} AND p.status != 'out_of_stock' AND category IS NOT NULL
        GROUP BY category
        ORDER BY count DESC
        LIMIT 20
      `;
      
      brandAgg = await sql`
        SELECT brand as name, COUNT(*) as count
        FROM products p
        WHERE p.product_type = ${product_type} AND p.status != 'out_of_stock' AND brand IS NOT NULL
        GROUP BY brand
        ORDER BY count DESC
        LIMIT 20
      `;
      
      priceRangeResult = await sql`
        SELECT MIN(price) as min_price, MAX(price) as max_price
        FROM products p
        WHERE p.product_type = ${product_type} AND p.status != 'out_of_stock'
      `;
    } else {
      // Complex case - check each condition inline
      if (hasProductType && hasStatus) {
        categoryAgg = await sql`
          SELECT category as name, COUNT(*) as count
          FROM products p
          WHERE p.product_type = ${product_type}
            AND p.status = ${status}
            ${hasCategory ? sql`AND LOWER(p.category) = LOWER(${category})` : sql``}
            ${hasBrand ? sql`AND LOWER(p.brand) = LOWER(${brand})` : sql``}
            ${hasSearch ? sql`AND (p.name ILIKE ${searchPattern} OR p.description ILIKE ${searchPattern} OR p.sku ILIKE ${searchPattern})` : sql``}
            ${hasMinPrice ? sql`AND p.price >= ${parseFloat(min_price)}` : sql``}
            ${hasMaxPrice ? sql`AND p.price <= ${parseFloat(max_price)}` : sql``}
            ${hasStoreId ? sql`AND EXISTS (SELECT 1 FROM product_stores ps WHERE ps.product_id = p.id AND ps.store_id = ${store_id} AND ps.is_available = true)` : sql``}
            AND category IS NOT NULL
          GROUP BY category
          ORDER BY count DESC
          LIMIT 20
        `;
        
        brandAgg = await sql`
          SELECT brand as name, COUNT(*) as count
          FROM products p
          WHERE p.product_type = ${product_type}
            AND p.status = ${status}
            ${hasCategory ? sql`AND LOWER(p.category) = LOWER(${category})` : sql``}
            ${hasBrand ? sql`AND LOWER(p.brand) = LOWER(${brand})` : sql``}
            ${hasSearch ? sql`AND (p.name ILIKE ${searchPattern} OR p.description ILIKE ${searchPattern} OR p.sku ILIKE ${searchPattern})` : sql``}
            ${hasMinPrice ? sql`AND p.price >= ${parseFloat(min_price)}` : sql``}
            ${hasMaxPrice ? sql`AND p.price <= ${parseFloat(max_price)}` : sql``}
            ${hasStoreId ? sql`AND EXISTS (SELECT 1 FROM product_stores ps WHERE ps.product_id = p.id AND ps.store_id = ${store_id} AND ps.is_available = true)` : sql``}
            AND brand IS NOT NULL
          GROUP BY brand
          ORDER BY count DESC
          LIMIT 20
        `;
        
        priceRangeResult = await sql`
          SELECT MIN(price) as min_price, MAX(price) as max_price
          FROM products p
          WHERE p.product_type = ${product_type}
            AND p.status = ${status}
            ${hasCategory ? sql`AND LOWER(p.category) = LOWER(${category})` : sql``}
            ${hasBrand ? sql`AND LOWER(p.brand) = LOWER(${brand})` : sql``}
            ${hasSearch ? sql`AND (p.name ILIKE ${searchPattern} OR p.description ILIKE ${searchPattern} OR p.sku ILIKE ${searchPattern})` : sql``}
            ${hasMinPrice ? sql`AND p.price >= ${parseFloat(min_price)}` : sql``}
            ${hasMaxPrice ? sql`AND p.price <= ${parseFloat(max_price)}` : sql``}
            ${hasStoreId ? sql`AND EXISTS (SELECT 1 FROM product_stores ps WHERE ps.product_id = p.id AND ps.store_id = ${store_id} AND ps.is_available = true)` : sql``}
        `;
      } else {
        categoryAgg = await sql`
          SELECT category as name, COUNT(*) as count
          FROM products p
          WHERE 1=1
            ${hasProductType ? sql`AND p.product_type = ${product_type}` : sql``}
            ${hasStatus ? sql`AND p.status = ${status}` : sql``}
            ${excludeOutOfStock ? sql`AND p.status != 'out_of_stock'` : sql``}
            ${hasCategory ? sql`AND LOWER(p.category) = LOWER(${category})` : sql``}
            ${hasBrand ? sql`AND LOWER(p.brand) = LOWER(${brand})` : sql``}
            ${hasSearch ? sql`AND (p.name ILIKE ${searchPattern} OR p.description ILIKE ${searchPattern} OR p.sku ILIKE ${searchPattern})` : sql``}
            ${hasMinPrice ? sql`AND p.price >= ${parseFloat(min_price)}` : sql``}
            ${hasMaxPrice ? sql`AND p.price <= ${parseFloat(max_price)}` : sql``}
            ${hasStoreId ? sql`AND EXISTS (SELECT 1 FROM product_stores ps WHERE ps.product_id = p.id AND ps.store_id = ${store_id} AND ps.is_available = true)` : sql``}
            AND category IS NOT NULL
          GROUP BY category
          ORDER BY count DESC
          LIMIT 20
        `;
        
        brandAgg = await sql`
          SELECT brand as name, COUNT(*) as count
          FROM products p
          WHERE 1=1
            ${hasProductType ? sql`AND p.product_type = ${product_type}` : sql``}
            ${hasStatus ? sql`AND p.status = ${status}` : sql``}
            ${excludeOutOfStock ? sql`AND p.status != 'out_of_stock'` : sql``}
            ${hasCategory ? sql`AND LOWER(p.category) = LOWER(${category})` : sql``}
            ${hasBrand ? sql`AND LOWER(p.brand) = LOWER(${brand})` : sql``}
            ${hasSearch ? sql`AND (p.name ILIKE ${searchPattern} OR p.description ILIKE ${searchPattern} OR p.sku ILIKE ${searchPattern})` : sql``}
            ${hasMinPrice ? sql`AND p.price >= ${parseFloat(min_price)}` : sql``}
            ${hasMaxPrice ? sql`AND p.price <= ${parseFloat(max_price)}` : sql``}
            ${hasStoreId ? sql`AND EXISTS (SELECT 1 FROM product_stores ps WHERE ps.product_id = p.id AND ps.store_id = ${store_id} AND ps.is_available = true)` : sql``}
            AND brand IS NOT NULL
          GROUP BY brand
          ORDER BY count DESC
          LIMIT 20
        `;
        
        priceRangeResult = await sql`
          SELECT MIN(price) as min_price, MAX(price) as max_price
          FROM products p
          WHERE 1=1
            ${hasProductType ? sql`AND p.product_type = ${product_type}` : sql``}
            ${hasStatus ? sql`AND p.status = ${status}` : sql``}
            ${excludeOutOfStock ? sql`AND p.status != 'out_of_stock'` : sql``}
            ${hasCategory ? sql`AND LOWER(p.category) = LOWER(${category})` : sql``}
            ${hasBrand ? sql`AND LOWER(p.brand) = LOWER(${brand})` : sql``}
            ${hasSearch ? sql`AND (p.name ILIKE ${searchPattern} OR p.description ILIKE ${searchPattern} OR p.sku ILIKE ${searchPattern})` : sql``}
            ${hasMinPrice ? sql`AND p.price >= ${parseFloat(min_price)}` : sql``}
            ${hasMaxPrice ? sql`AND p.price <= ${parseFloat(max_price)}` : sql``}
            ${hasStoreId ? sql`AND EXISTS (SELECT 1 FROM product_stores ps WHERE ps.product_id = p.id AND ps.store_id = ${store_id} AND ps.is_available = true)` : sql``}
        `;
      }
    }

    const priceRange = priceRangeResult[0] || { min_price: 0, max_price: 0 };

    // Format aggregations
    const categories = categoryAgg.map(cat => ({
      id: cat.name.toLowerCase().replace(/\s+/g, '-'),
      name: cat.name,
      count: parseInt(cat.count)
    }));

    const brands = brandAgg.map(b => ({
      id: b.name.toLowerCase().replace(/\s+/g, '-'),
      name: b.name,
      count: parseInt(b.count)
    }));

    // Build filters_applied object
    const filtersApplied = {};
    if (product_type && product_type !== 'all') filtersApplied.product_type = product_type;
    if (status) filtersApplied.status = status;
    if (category) filtersApplied.category = category;
    if (brand) filtersApplied.brand = brand;
    if (min_price) filtersApplied.min_price = parseFloat(min_price);
    if (max_price) filtersApplied.max_price = parseFloat(max_price);
    if (store_id) filtersApplied.store_id = store_id;

    res.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          total_pages: totalPages,
          has_next: pageNum < totalPages,
          has_prev: pageNum > 1
        },
        filters_applied: Object.keys(filtersApplied).length > 0 ? filtersApplied : undefined,
        aggregations: {
          total_products: total,
          price_range: {
            min: parseFloat(priceRange.min_price || 0),
            max: parseFloat(priceRange.max_price || 0)
          },
          categories,
          brands
        }
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const products = await sql`
      SELECT 
        p.*,
        COALESCE(p.reserved_stock, 0) as reserved_stock,
        COALESCE(p.min_threshold, 10) as min_threshold,
        COALESCE(p.php_price, p.price * COALESCE(p.price_conversion_rate, 0.042)) as php_price,
        COALESCE(p.price_conversion_rate, 0.042) as price_conversion_rate
      FROM products p
      WHERE p.id = ${id}
    `;

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const product = products[0];
    const formattedProduct = await formatProduct(product);

    // Add additional detail fields
    const detailedProduct = {
      ...formattedProduct,
      full_description: product.full_description || product.description,
      specifications: product.specifications || {}
    };

    // Get related products (same category, different product)
    const relatedProducts = await sql`
      SELECT 
        p.*,
        COALESCE(p.reserved_stock, 0) as reserved_stock,
        COALESCE(p.min_threshold, 10) as min_threshold,
        COALESCE(p.php_price, p.price * COALESCE(p.price_conversion_rate, 0.042)) as php_price,
        COALESCE(p.price_conversion_rate, 0.042) as price_conversion_rate
      FROM products p
      WHERE p.category = ${product.category}
        AND p.id != ${id}
        AND p.status = 'active'
      ORDER BY p.created_at DESC
      LIMIT 10
    `;

    const formattedRelated = await Promise.all(
      relatedProducts.map(p => formatProduct(p))
    );

    // Get price comparison data (mock for now)
    const priceComparison = {
      our_price: parseFloat(product.price),
      competitor_prices: [
        {
          website: 'Gmarket',
          url: `https://www.gmarket.co.kr/search?keyword=${encodeURIComponent(product.name)}`,
          price: parseFloat(product.price) * 1.2,
          currency: 'KRW',
          last_checked: new Date().toISOString()
        }
      ],
      best_price: parseFloat(product.price),
      savings: parseFloat(product.price) * 0.2,
      savings_percentage: 16.67
    };

    // Mock reviews data (in production, this would come from a reviews table)
    const reviews = {
      average_rating: 4.5,
      total_reviews: 120,
      rating_distribution: {
        '5': 80,
        '4': 25,
        '3': 10,
        '2': 3,
        '1': 2
      },
      recent_reviews: []
    };

    res.json({
      success: true,
      data: {
        ...detailedProduct,
        related_products: formattedRelated,
        price_comparison: priceComparison,
        reviews
      }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Convenience methods that use the unified endpoint
const getOnhandProducts = async (req, res) => {
  // Redirect to unified endpoint with product_type=onhand
  req.query.product_type = 'onhand';
  req.query.status = req.query.status || 'active';
  return getProducts(req, res);
};

const getPreorderProducts = async (req, res) => {
  // Redirect to unified endpoint with product_type=preorder
  req.query.product_type = 'preorder';
  req.query.status = req.query.status || 'active';
  return getProducts(req, res);
};

const getKRComparison = async (req, res) => {
  try {
    const { product_id } = req.query;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        error: 'product_id is required'
      });
    }

    const product = await sql`SELECT * FROM products WHERE id = ${product_id}`;

    if (product.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Mock comparison data - in production, this would query KR website data
    res.json({
      success: true,
      data: {
        product_id,
        hanbuy_price: parseFloat(product[0].price),
        comparisons: [
          {
            website: 'Gmarket',
            price: parseFloat(product[0].price) * 1.2,
            currency: 'KRW',
            url: `https://www.gmarket.co.kr/search?keyword=${encodeURIComponent(product[0].name)}`
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error getting KR comparison:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getOnhandProducts,
  getPreorderProducts,
  getKRComparison
};


UP