const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
require('dotenv').config();

const connectDB = require('./config/db');

// routes
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:4200", // mon port angular
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(mongoSanitize()); // protection NoSQL injection
app.use(xss()); // protection XSS attacks
app.use(morgan('dev'));

// models
const User = require('./models/User');
const Article = require('./models/Article');
const Comment = require('./models/Comment');

// connection base de données
connectDB().then(async () => {
    try {
        await User.createCollection();
        await Article.createCollection();
        await Comment.createCollection();
        console.log('Collections created (if they didn\'t exist)');
    } catch (error) {
        console.error('Error creating collections:', error);
    }
});

// socket.io
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_article', (articleId) => {
        socket.join(`article_${articleId}`);
        console.log(`User ${socket.id} joined article_${articleId}`);
    });

    socket.on('join_user', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${socket.id} joined user_${userId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// ajouter io au routes
app.set('io', io);

// routes middleware
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/comments', commentRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
