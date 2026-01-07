const sql = require('../utils/database');

const getProducts = async (req, res) => {
  try {
    const { category, status, product_type, page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let query = sql`SELECT * FROM products WHERE 1=1`;
    const conditions = [];

    if (category) {
      conditions.push(sql`category = ${category}`);
    }
    if (status) {
      conditions.push(sql`status = ${status}`);
    }
    if (product_type) {
      conditions.push(sql`product_type = ${product_type}`);
    }
    if (search) {
      conditions.push(sql`(name ILIKE ${'%' + search + '%'} OR description ILIKE ${'%' + search + '%'})`);
    }

    if (conditions.length > 0) {
      query = sql`SELECT * FROM products WHERE ${sql.join(conditions, sql` AND `)}`;
    }

    const products = await sql`
      ${query}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const totalResult = await sql`SELECT COUNT(*) as total FROM products`;
    const total = parseInt(totalResult[0].total);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
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
      SELECT * FROM products WHERE id = ${id}
    `;

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Get variations if any
    const variations = await sql`
      SELECT * FROM product_variations WHERE product_id = ${id}
    `;

    res.json({
      success: true,
      data: {
        ...products[0],
        variations
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

const getOnhandProducts = async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = sql`SELECT * FROM products WHERE product_type = 'onhand' AND status = 'active'`;
    
    if (category) {
      query = sql`SELECT * FROM products WHERE product_type = 'onhand' AND status = 'active' AND category = ${category}`;
    }

    const products = await sql`
      ${query}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching onhand products:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getPreorderProducts = async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = sql`SELECT * FROM products WHERE product_type = 'preorder' AND status = 'active'`;
    
    if (category) {
      query = sql`SELECT * FROM products WHERE product_type = 'preorder' AND status = 'active' AND category = ${category}`;
    }

    const products = await sql`
      ${query}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching preorder products:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
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


