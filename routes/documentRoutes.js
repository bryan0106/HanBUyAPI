const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadDocument, getDocuments, getDocumentById, deleteDocument } = require('../controllers/documentController');
const { requireAuth } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', requireAuth, upload.single('file'), uploadDocument);
router.get('/', requireAuth, getDocuments);
router.get('/:id', requireAuth, getDocumentById);
router.delete('/:id', requireAuth, deleteDocument);

module.exports = router;


