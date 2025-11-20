const Comment = require('../models/Comment');
const Article = require('../models/Article');

// @desc    recuperer les commentaires d'un article
// @route   GET /api/comments/:articleId
exports.getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ article: req.params.articleId })
            .populate('user', 'username')
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    ajouter un commentaire
// @route   POST /api/comments/:articleId
exports.addComment = async (req, res) => {
    const { content, parentComment } = req.body;
    const articleId = req.params.articleId;

    try {
        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        const comment = new Comment({
            content,
            article: articleId,
            user: req.user._id,
            parentComment: parentComment || null
        });

        const savedComment = await comment.save();
        const populatedComment = await savedComment.populate('user', 'username');

        const io = req.app.get('io');

        io.emit('new_comment', populatedComment);

        if (article.author.toString() !== req.user._id.toString()) {
            io.to(`user_${article.author}`).emit('notification', {
                message: `nouveau commentaire sur votre article "${article.title}"`,
                articleId: article._id,
                comment: populatedComment
            });
        }

        if (parentComment) {
            const parent = await Comment.findById(parentComment);
            if (parent && parent.user.toString() !== req.user._id.toString()) {
                io.to(`user_${parent.user}`).emit('notification', {
                    message: `nouvelle reponse a votre commentaire`,
                    articleId: article._id,
                    comment: populatedComment
                });
            }
        }

        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    supprimer commentaire
// @route   supprimer /api/comments/:id
// @access  Private (Admin, Editor, Writer)
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (
            req.user.role === 'admin' ||
            req.user.role === 'editor' ||
            (req.user.role === 'writer' && comment.user.toString() === req.user._id.toString())
        ) {
            await comment.deleteOne();

            const io = req.app.get('io');

            io.emit('delete_comment', comment._id);

            res.json({ message: 'Comment removed' });
        } else {
            res.status(403).json({ message: 'Not authorized to delete this comment' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
