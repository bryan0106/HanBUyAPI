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

    // Build WHERE conditions
    const conditions = [sql`1=1`];

    // Product type filter
    if (product_type && product_type !== 'all') {
      conditions.push(sql`p.product_type = ${product_type}`);
    }

    // Status filter
    if (status) {
      conditions.push(sql`p.status = ${status}`);
    } else if (!include_out_of_stock) {
      conditions.push(sql`p.status != 'out_of_stock'`);
    }

    // Category filter
    if (category) {
      conditions.push(sql`LOWER(p.category) = LOWER(${category})`);
    }

    // Brand filter
    if (brand) {
      conditions.push(sql`LOWER(p.brand) = LOWER(${brand})`);
    }

    // Search filter
    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(sql`(
        p.name ILIKE ${searchPattern} OR 
        p.description ILIKE ${searchPattern} OR
        p.sku ILIKE ${searchPattern}
      )`);
    }

    // Price range filter
    if (min_price) {
      conditions.push(sql`p.price >= ${parseFloat(min_price)}`);
    }
    if (max_price) {
      conditions.push(sql`p.price <= ${parseFloat(max_price)}`);
    }

    // Store filter
    if (store_id) {
      conditions.push(sql`EXISTS (
        SELECT 1 FROM product_stores ps 
        WHERE ps.product_id = p.id 
        AND ps.store_id = ${store_id}
        AND ps.is_available = true
      )`);
    }

    // Build ORDER BY clause
    let orderBy;
    switch (sort) {
      case 'price_asc':
        orderBy = sql`p.price ASC`;
        break;
      case 'price_desc':
        orderBy = sql`p.price DESC`;
        break;
      case 'name_asc':
        orderBy = sql`p.name ASC`;
        break;
      case 'name_desc':
        orderBy = sql`p.name DESC`;
        break;
      case 'stock_desc':
        orderBy = sql`p.stock DESC`;
        break;
      case 'created_desc':
      default:
        orderBy = sql`p.created_at DESC`;
        break;
    }

    // Get products
    const products = await sql`
      SELECT 
        p.*,
        COALESCE(p.reserved_stock, 0) as reserved_stock,
        COALESCE(p.min_threshold, 10) as min_threshold,
        COALESCE(p.php_price, p.price * COALESCE(p.price_conversion_rate, 0.042)) as php_price,
        COALESCE(p.price_conversion_rate, 0.042) as price_conversion_rate
      FROM products p
      WHERE ${sql.join(conditions, sql` AND `)}
      ORDER BY ${orderBy}
      LIMIT ${limitNum}
      OFFSET ${offset}
    `;

    // Get total count for pagination
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM products p
      WHERE ${sql.join(conditions, sql` AND `)}
    `;
    const total = parseInt(countResult[0].total);
    const totalPages = Math.ceil(total / limitNum);

    // Format products with related data
    const formattedProducts = await Promise.all(
      products.map(product => formatProduct(product))
    );

    // Get aggregations (categories, brands, price range)
    const categoryAgg = await sql`
      SELECT 
        category as name,
        COUNT(*) as count
      FROM products p
      WHERE ${sql.join(conditions, sql` AND `)}
        AND category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
      LIMIT 20
    `;

    const brandAgg = await sql`
      SELECT 
        brand as name,
        COUNT(*) as count
      FROM products p
      WHERE ${sql.join(conditions, sql` AND `)}
        AND brand IS NOT NULL
      GROUP BY brand
      ORDER BY count DESC
      LIMIT 20
    `;

    const priceRangeResult = await sql`
      SELECT 
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM products p
      WHERE ${sql.join(conditions, sql` AND `)}
    `;

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
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch products',
      details: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        detail: error.detail,
        hint: error.hint,
        stack: error.stack
      } : undefined
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
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch product',
      details: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        detail: error.detail,
        hint: error.hint,
        stack: error.stack
      } : undefined
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
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get KR comparison',
      details: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        detail: error.detail,
        hint: error.hint
      } : undefined
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


