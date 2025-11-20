const express = require('express');
const router = express.Router();
const { getComments, addComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const { commentLimiter } = require('../middleware/rateLimiters');
const { validate, commentValidation } = require('../middleware/validators');

router.get('/:articleId', getComments);
router.post('/:articleId', protect, commentLimiter, commentValidation, validate, addComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;
