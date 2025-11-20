const Article = require('../models/Article');

// @desc    Get all articles
// @route   GET /api/articles
exports.getArticles = async (req, res) => {
    try {
        const articles = await Article.aggregate([
            {
                $lookup: {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'article',
                    as: 'comments'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            {
                $unwind: '$author'
            },
            {
                $project: {
                    title: 1,
                    content: 1,
                    image: 1,
                    tags: 1,
                    createdAt: 1,
                    'author.username': 1,
                    'author._id': 1,
                    comments: {
                        $map: {
                            input: '$comments',
                            as: 'comment',
                            in: {
                                _id: '$$comment._id',
                                content: '$$comment.content',
                                user: '$$comment.user',
                                createdAt: '$$comment.createdAt'
                            }
                        }
                    }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        const articlesWithComments = await Article.aggregate([
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            { $unwind: '$author' },
            {
                $lookup: {
                    from: 'comments',
                    let: { articleId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$article', '$$articleId'] } } },
                        { $sort: { createdAt: 1 } },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'user',
                                foreignField: '_id',
                                as: 'user'
                            }
                        },
                        { $unwind: '$user' }
                    ],
                    as: 'comments'
                }
            },
            {
                $project: {
                    title: 1,
                    content: 1,
                    image: 1,
                    tags: 1,
                    createdAt: 1,
                    'author._id': 1,
                    'author.username': 1,
                    comments: {
                        _id: 1,
                        content: 1,
                        createdAt: 1,
                        'user._id': 1,
                        'user.username': 1,
                        parentComment: 1
                    }
                }
            }
        ]);

        res.json(articlesWithComments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    recuperer un article
// @route   GET /api/articles/:id
exports.getArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id).populate('author', 'username');
        if (article) {
            res.json(article);
        } else {
            res.status(404).json({ message: 'Article not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    creer article
// @route   creer /api/articles
exports.createArticle = async (req, res) => {
    const { title, content, image, tags } = req.body;

    try {
        const article = new Article({
            title,
            content,
            image,
            tags,
            author: req.user._id
        });

        const createdArticle = await article.save();

        // emit socket event
        const io = req.app.get('io');
        io.emit('new_article', await createdArticle.populate('author', 'username'));

        res.status(201).json(createdArticle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    modifier article
// @route   modifier /api/articles/:id
exports.updateArticle = async (req, res) => {
    const { title, content, image, tags } = req.body;

    try {
        const article = await Article.findById(req.params.id);

        if (article) {
            if (
                req.user.role === 'admin' ||
                req.user.role === 'editor' ||
                (req.user.role === 'writer' && article.author.toString() === req.user._id.toString())
            ) {
                article.title = title || article.title;
                article.content = content || article.content;
                article.image = image || article.image;
                article.tags = tags || article.tags;

                const updatedArticle = await article.save();

                // emit socket event
                const io = req.app.get('io');
                io.emit('update_article', await updatedArticle.populate('author', 'username'));

                res.json(updatedArticle);
            } else {
                res.status(403).json({ message: 'Not authorized to update this article' });
            }
        } else {
            res.status(404).json({ message: 'Article not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    supprimer article
// @route   supprimer /api/articles/:id
exports.deleteArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        if (
            req.user.role === 'admin' ||
            req.user.role === 'editor' ||
            (req.user.role === 'writer' && article.author.toString() === req.user._id.toString())
        ) {
            await article.deleteOne();

            // emit socket event for real-time update
            const io = req.app.get('io');
            io.emit('delete_article', article._id);

            res.json({ message: 'Article removed' });
        } else {
            res.status(403).json({ message: 'Not authorized to delete this article' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
