const express = require('express');
const router = express.Router();
const {
    getArticles,
    getArticle,
    createArticle,
    updateArticle,
    deleteArticle
} = require('../controllers/articleController');
const { protect, authorize } = require('../middleware/auth');
const { articleLimiter } = require('../middleware/rateLimiters');
const { validate, articleValidation } = require('../middleware/validators');

router.route('/')
    .get(getArticles)
    .post(protect, authorize('admin', 'editor', 'writer'), articleLimiter, articleValidation, validate, createArticle);

router.route('/:id')
    .get(getArticle)
    .put(protect, authorize('admin', 'editor', 'writer'), articleValidation, validate, updateArticle)
    .delete(protect, authorize('admin', 'editor', 'writer'), deleteArticle);

module.exports = router;
