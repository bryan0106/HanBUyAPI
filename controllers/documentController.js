const sql = require('../utils/database');

const uploadDocument = async (req, res) => {
  try {
    const { type, description } = req.body;
    const file = req.file; // From multer
    const userId = req.user.id;

    if (!file || !type) {
      return res.status(400).json({
        success: false,
        error: 'file and type are required'
      });
    }

    // In production, upload to S3/cloud storage
    const fileUrl = `/uploads/${file.filename}`;

    const document = await sql`
      INSERT INTO documents (
        user_id, filename, original_filename, file_url, file_type, 
        file_size, document_type, description
      )
      VALUES (
        ${userId}, ${file.filename}, ${file.originalname}, ${fileUrl}, 
        ${file.mimetype}, ${file.size}, ${type}, ${description || null}
      )
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      message: 'Document uploaded',
      data: document[0]
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getDocuments = async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    let query = sql`SELECT * FROM documents WHERE user_id = ${userId}`;

    if (type) {
      query = sql`SELECT * FROM documents WHERE user_id = ${userId} AND document_type = ${type}`;
    }

    const documents = await sql`
      ${query}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    res.json({
      success: true,
      data: documents,
      count: documents.length
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const documents = await sql`
      SELECT * FROM documents WHERE id = ${id} AND user_id = ${userId}
    `;

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: documents[0]
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await sql`
      DELETE FROM documents 
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    res.json({
      success: true,
      message: 'Document deleted'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument
};


