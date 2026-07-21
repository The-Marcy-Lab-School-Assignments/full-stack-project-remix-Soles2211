const bookModel = require('../models/bookModel');
const groupModel = require('../models/groupModel');

module.exports.createBook = async (req, res, next) => {
  try {
    const { title, author, year, description } = req.body;
    const user_id = req.session.user_id;
    
    if (!title) return res.status(400).send({ error: 'Title is required.' });
    if (!author) return res.status(400).send({ error: 'Author is required.' });
    if (!year) return res.status(400).send({ error: 'Year is required.' });
    if (!description) return res.status(400).send({ error: 'Description is required.' });
    if (!user_id) return res.status(401).send({ error: 'You must be logged in to add a book.' });
    
    const book = await bookModel.create(title, author, year, description, user_id);
    res.status(201).send(book);
  } catch (err) {
    next(err);
  }
};

module.exports.getBook = async (req, res, next) => {
  try {
    const { book_id } = req.params;
    
    if (!book_id) return res.status(400).send({ error: 'Book ID is required.' });
    
    const book = await bookModel.find(parseInt(book_id));
    if (!book) return res.status(404).send({ error: 'Book not found.' });
    
    res.send(book);
  } catch (err) {
    next(err);
  }
};

module.exports.getAllBooks = async (req, res, next) => {
  try {
    const books = await bookModel.findAll();
    res.send(books);
  } catch (err) {
    next(err);
  }
};

module.exports.getUserBooks = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    
    if (!user_id) return res.status(400).send({ error: 'User ID is required.' });
    
    const books = await bookModel.findByUser(parseInt(user_id));
    res.send(books);
  } catch (err) {
    next(err);
  }
};

module.exports.updateBook = async (req, res, next) => {
  try {
    const { book_id } = req.params;
    const { title, author, year, description } = req.body;
    const user_id = req.session.user_id;
    
    const book = await bookModel.find(parseInt(book_id));
    if (!book) return res.status(404).send({ error: 'Book not found.' });
    
    // Check if user owns this book
    if (book.user_id !== user_id) {
      return res.status(403).send({ error: 'You can only edit books you added.' });
    }
    
    const updatedBook = await bookModel.update(parseInt(book_id), title, author, year, description);
    res.send(updatedBook);
  } catch (err) {
    next(err);
  }
};

module.exports.deleteBook = async (req, res, next) => {
  try {
    const { book_id } = req.params;
    const user_id = req.session.user_id;
    
    const book = await bookModel.find(parseInt(book_id));
    if (!book) return res.status(404).send({ error: 'Book not found.' });
    
    // Check if user owns this book
    if (book.user_id !== user_id) {
      return res.status(403).send({ error: 'You can only delete books you added.' });
    }
    
    await bookModel.delete(parseInt(book_id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

//group_books

module.exports.addBookToGroup = async (req, res, next) => {
  try {
    const { group_id, book_id } = req.params;
    const user_id = req.session.user_id;
    
    if (!group_id) return res.status(400).send({ error: 'Group ID is required.' });
    if (!book_id) return res.status(400).send({ error: 'Book ID is required.' });
    if (!user_id) return res.status(401).send({ error: 'You must be logged in to add books to groups.' });
    
    // Check if group exists
    const group = await groupModel.find(parseInt(group_id));
    if (!group) return res.status(404).send({ error: 'Group not found.' });
    
    // Check if book exists
    const book = await bookModel.find(parseInt(book_id));
    if (!book) return res.status(404).send({ error: 'Book not found.' });
    
    const assignment = await bookModel.addBookToGroup(parseInt(group_id), parseInt(book_id));
    if (!assignment) return res.status(409).send({ error: 'Book is already assigned to this group.' });
    
    res.status(201).send(assignment);
  } catch (err) {
    next(err);
  }
};

module.exports.removeBookFromGroup = async (req, res, next) => {
  try {
    const { group_id, book_id } = req.params;
    const user_id = req.session.user_id;
    
    if (!group_id) return res.status(400).send({ error: 'Group ID is required.' });
    if (!book_id) return res.status(400).send({ error: 'Book ID is required.' });
    
    // Check if group exists
    const group = await groupModel.find(parseInt(group_id));
    if (!group) return res.status(404).send({ error: 'Group not found.' });
    
    const assignment = await bookModel.removeBookFromGroup(parseInt(group_id), parseInt(book_id));
    if (!assignment) return res.status(404).send({ error: 'Book is not assigned to this group.' });
    
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports.getGroupBooks = async (req, res, next) => {
  try {
    const { group_id } = req.params;
    
    if (!group_id) return res.status(400).send({ error: 'Group ID is required.' });
    
    const books = await groupModel.getBooks(parseInt(group_id));
    res.send(books);
  } catch (err) {
    next(err);
  }
};

module.exports.getBookGroups = async (req, res, next) => {
  try {
    const { book_id } = req.params;
    
    if (!book_id) return res.status(400).send({ error: 'Book ID is required.' });
    
    const groups = await bookModel.getGroupsForBook(parseInt(book_id));
    res.send(groups);
  } catch (err) {
    next(err);
  }
};

module.exports.checkBookInGroup = async (req, res, next) => {
  try {
    const { group_id, book_id } = req.params;
    
    if (!group_id) return res.status(400).send({ error: 'Group ID is required.' });
    if (!book_id) return res.status(400).send({ error: 'Book ID is required.' });
    
    const isAssigned = await bookModel.isBookInGroup(parseInt(group_id), parseInt(book_id));
    res.send({ isAssigned });
  } catch (err) {
    next(err);
  }
};