const sql = require('../utils/database');

const getHealth = async (req, res) => {
  try {
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    res.json({
      status: 'OK',
      database: 'Connected',
      timestamp: result[0].current_time,
      postgres_version: result[0].pg_version
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: error.message
    });
  }
};

module.exports = {
  getHealth
};

