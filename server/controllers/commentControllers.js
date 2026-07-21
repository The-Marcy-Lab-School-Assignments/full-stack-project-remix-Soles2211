const commentModel = require('../models/commentModel');
const bookModel = require('../models/bookModel');

module.exports.createComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const user_id = req.session.user_id;
    const date_time = new Date();
    
    if (!content) return res.status(400).send({ error: 'Comment content is required.' });
    if (!user_id) return res.status(401).send({ error: 'You must be logged in to comment.' });
    
    const comment = await commentModel.create(content, date_time, user_id);
    res.status(201).send(comment);
  } catch (err) {
    next(err);
  }
};

module.exports.getComment = async (req, res, next) => {
  try {
    const { comment_id } = req.params;
    
    if (!comment_id) return res.status(400).send({ error: 'Comment ID is required.' });
    
    const comment = await commentModel.find(parseInt(comment_id));
    if (!comment) return res.status(404).send({ error: 'Comment not found.' });
    
    res.send(comment);
  } catch (err) {
    next(err);
  }
};

module.exports.getAllComments = async (req, res, next) => {
  try {
    const comments = await commentModel.findAll();
    res.send(comments);
  } catch (err) {
    next(err);
  }
};

module.exports.getUserComments = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    
    if (!user_id) return res.status(400).send({ error: 'User ID is required.' });
    
    const comments = await commentModel.findByUser(parseInt(user_id));
    res.send(comments);
  } catch (err) {
    next(err);
  }
};

module.exports.getBookComments = async (req, res, next) => {
  try {
    const { book_id } = req.params;
    
    if (!book_id) return res.status(400).send({ error: 'Book ID is required.' });
    
    const comments = await commentModel.findByBook(parseInt(book_id));
    res.send(comments);
  } catch (err) {
    next(err);
  }
};

module.exports.updateComment = async (req, res, next) => {
  try {
    const { comment_id } = req.params;
    const { content } = req.body;
    const user_id = req.session.user_id;
    
    if (!content) return res.status(400).send({ error: 'Comment content is required.' });
    
    const comment = await commentModel.find(parseInt(comment_id));
    if (!comment) return res.status(404).send({ error: 'Comment not found.' });
    
    // Check if user owns this comment
    if (comment.user_id !== user_id) {
      return res.status(403).send({ error: 'You can only edit your own comments.' });
    }
    
    const updatedComment = await commentModel.update(parseInt(comment_id), content);
    res.send(updatedComment);
  } catch (err) {
    next(err);
  }
};

module.exports.deleteComment = async (req, res, next) => {
  try {
    const { comment_id } = req.params;
    const user_id = req.session.user_id;
    
    const comment = await commentModel.find(parseInt(comment_id));
    if (!comment) return res.status(404).send({ error: 'Comment not found.' });
    
    // Check if user owns this comment
    if (comment.user_id !== user_id) {
      return res.status(403).send({ error: 'You can only delete your own comments.' });
    }
    
    await commentModel.delete(parseInt(comment_id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

//book_comments

module.exports.linkCommentToBook = async (req, res, next) => {
  try {
    const { book_id, comment_id } = req.params;
    const user_id = req.session.user_id;
    
    if (!book_id) return res.status(400).send({ error: 'Book ID is required.' });
    if (!comment_id) return res.status(400).send({ error: 'Comment ID is required.' });
    if (!user_id) return res.status(401).send({ error: 'You must be logged in to link comments to books.' });
    
    // Check if book exists
    const book = await bookModel.find(parseInt(book_id));
    if (!book) return res.status(404).send({ error: 'Book not found.' });
    
    // Check if comment exists and belongs to user
    const comment = await commentModel.find(parseInt(comment_id));
    if (!comment) return res.status(404).send({ error: 'Comment not found.' });
    if (comment.user_id !== user_id) {
      return res.status(403).send({ error: 'You can only link your own comments to books.' });
    }
    
    const link = await commentModel.linkCommentToBook(parseInt(book_id), parseInt(comment_id));
    if (!link) return res.status(409).send({ error: 'Comment is already linked to this book.' });
    
    res.status(201).send(link);
  } catch (err) {
    next(err);
  }
};

module.exports.unlinkCommentFromBook = async (req, res, next) => {
  try {
    const { book_id, comment_id } = req.params;
    const user_id = req.session.user_id;
    
    if (!book_id) return res.status(400).send({ error: 'Book ID is required.' });
    if (!comment_id) return res.status(400).send({ error: 'Comment ID is required.' });
    
    // Check if comment exists and belongs to user
    const comment = await commentModel.find(parseInt(comment_id));
    if (!comment) return res.status(404).send({ error: 'Comment not found.' });
    if (comment.user_id !== user_id) {
      return res.status(403).send({ error: 'You can only unlink your own comments.' });
    }
    
    const link = await commentModel.unlinkCommentFromBook(parseInt(book_id), parseInt(comment_id));
    if (!link) return res.status(404).send({ error: 'Comment is not linked to this book.' });
    
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
