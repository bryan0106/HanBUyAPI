const sql = require('../utils/database');

const getNotifications = async (req, res) => {
  try {
    const { read, type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    let query = sql`SELECT * FROM notifications WHERE user_id = ${userId}`;
    const conditions = [sql`user_id = ${userId}`];

    if (read !== undefined) {
      conditions.push(sql`read = ${read === 'true'}`);
    }
    if (type) {
      conditions.push(sql`type = ${type}`);
    }

    query = sql`SELECT * FROM notifications WHERE ${sql.join(conditions, sql` AND `)}`;

    const notifications = await sql`
      ${query}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const unreadCount = await sql`
      SELECT COUNT(*) as count FROM notifications WHERE user_id = ${userId} AND read = false
    `;

    res.json({
      success: true,
      data: notifications,
      unread_count: parseInt(unreadCount[0].count)
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await sql`
      UPDATE notifications 
      SET read = true, read_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: result[0]
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    let preferences = await sql`
      SELECT * FROM notification_preferences WHERE user_id = ${userId}
    `;

    if (preferences.length === 0) {
      // Create default preferences
      await sql`
        INSERT INTO notification_preferences (user_id)
        VALUES (${userId})
      `;
      preferences = await sql`
        SELECT * FROM notification_preferences WHERE user_id = ${userId}
      `;
    }

    res.json({
      success: true,
      data: preferences[0]
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email_notifications, sms_notifications, push_notifications, order_updates, payment_updates, box_updates, system_updates } = req.body;

    const updateParts = [];
    if (email_notifications !== undefined) updateParts.push(sql`email_notifications = ${email_notifications}`);
    if (sms_notifications !== undefined) updateParts.push(sql`sms_notifications = ${sms_notifications}`);
    if (push_notifications !== undefined) updateParts.push(sql`push_notifications = ${push_notifications}`);
    if (order_updates !== undefined) updateParts.push(sql`order_updates = ${order_updates}`);
    if (payment_updates !== undefined) updateParts.push(sql`payment_updates = ${payment_updates}`);
    if (box_updates !== undefined) updateParts.push(sql`box_updates = ${box_updates}`);
    if (system_updates !== undefined) updateParts.push(sql`system_updates = ${system_updates}`);
    updateParts.push(sql`updated_at = NOW()`);

    if (updateParts.length === 1) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    const result = await sql`
      UPDATE notification_preferences 
      SET ${sql.join(updateParts, sql`, `)}
      WHERE user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      // Create if doesn't exist
      const newPrefs = await sql`
        INSERT INTO notification_preferences (
          user_id, email_notifications, sms_notifications, push_notifications,
          order_updates, payment_updates, box_updates, system_updates
        )
        VALUES (
          ${userId}, 
          ${email_notifications !== undefined ? email_notifications : true},
          ${sms_notifications !== undefined ? sms_notifications : false},
          ${push_notifications !== undefined ? push_notifications : true},
          ${order_updates !== undefined ? order_updates : true},
          ${payment_updates !== undefined ? payment_updates : true},
          ${box_updates !== undefined ? box_updates : true},
          ${system_updates !== undefined ? system_updates : true}
        )
        RETURNING *
      `;
      return res.json({
        success: true,
        message: 'Preferences updated',
        data: newPrefs[0]
      });
    }

    res.json({
      success: true,
      message: 'Preferences updated',
      data: result[0]
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  getPreferences,
  updatePreferences
};

