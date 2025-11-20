const rateLimit = require('express-rate-limit');

// Login/Register Limiter: 5 tentatives par 5 minutes
const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message: {
        message: 'Trop de tentatives de connexion/inscription depuis cette adresse IP, veuillez réessayer après 5 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// comment Limiter: 20 tentatives par heure
const commentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 20,
    message: {
        message: 'Vous avez dépassé le nombre maximum de commentaires par heure'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// article Limiter: 10 tentatives par jour
const articleLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 heures
    max: 10,
    message: {
        message: 'Vous avez dépassé le nombre maximum d\'articles par jour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    authLimiter,
    commentLimiter,
    articleLimiter
};
