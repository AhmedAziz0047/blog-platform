const { check, validationResult } = require('express-validator');

// Middleware validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Auth Validators
const registerValidation = [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
];

const loginValidation = [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
];

// Article Validators
const articleValidation = [
    check('title', 'Title is required').not().isEmpty(),
    check('content', 'Content is required').not().isEmpty()
];

// Comment Validators
const commentValidation = [
    check('content', 'Comment content is required').not().isEmpty()
];

module.exports = {
    validate,
    registerValidation,
    loginValidation,
    articleValidation,
    commentValidation
};
