const sql = require('../utils/database');

const getTrackingByNumber = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const events = await sql`
      SELECT * FROM tracking_events 
      WHERE tracking_number = ${trackingNumber}
      ORDER BY event_timestamp ASC
    `;

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tracking number not found'
      });
    }

    const tracking = {
      tracking_number: trackingNumber,
      courier: events[0].courier_name || 'Unknown',
      status: events[events.length - 1].status,
      events: events.map(e => ({
        timestamp: e.event_timestamp,
        location: e.location,
        status: e.status,
        description: e.description
      })),
      estimated_delivery: events[0].estimated_delivery
    };

    res.json({
      success: true,
      data: tracking
    });
  } catch (error) {
    console.error('Error fetching tracking:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const addIncomingTracking = async (req, res) => {
  try {
    const { tracking_number, courier, description, estimated_arrival } = req.body;
    const userId = req.user.id;

    if (!tracking_number || !courier) {
      return res.status(400).json({
        success: false,
        error: 'tracking_number and courier are required'
      });
    }

    const tracking = await sql`
      INSERT INTO tracking_events (
        tracking_number, courier_name, description, estimated_delivery, 
        user_id, status, event_timestamp
      )
      VALUES (
        ${tracking_number}, ${courier}, ${description || null}, 
        ${estimated_arrival || null}, ${userId}, 'pending', NOW()
      )
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      message: 'Tracking added',
      data: {
        id: tracking[0].id,
        tracking_number
      }
    });
  } catch (error) {
    console.error('Error adding tracking:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getOutgoingTracking = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    let query = sql`SELECT DISTINCT tracking_number, courier_name, status, MAX(event_timestamp) as last_update 
      FROM tracking_events WHERE user_id = ${userId}`;

    if (status) {
      query = sql`SELECT DISTINCT tracking_number, courier_name, status, MAX(event_timestamp) as last_update 
        FROM tracking_events WHERE user_id = ${userId} AND status = ${status}`;
    }

    const tracking = await sql`
      ${query}
      GROUP BY tracking_number, courier_name, status
      ORDER BY last_update DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    res.json({
      success: true,
      data: tracking,
      count: tracking.length
    });
  } catch (error) {
    console.error('Error fetching outgoing tracking:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getTrackingByNumber,
  addIncomingTracking,
  getOutgoingTracking
};


