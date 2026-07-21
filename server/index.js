const path = require('path');
const express = require('express');
const cookieSession = require('cookie-session');
require('dotenv').config();

const logRoutes = require('./middleware/logRoutes');
const checkAuthentication = require('./middleware/checkAuthentication');
const authControllers = require('./controllers/authControllers');
const bookControllers = require('./controllers/bookControllers');
const groupControllers = require('./controllers/groupControllers');
const commentControllers = require('./controllers/commentControllers');
const userControllers = require('./controllers/userController');

const app = express();
const PORT = process.env.PORT || 8080;

// ====================================
// Middleware
// ====================================

app.use(logRoutes);
app.use(cookieSession({ name: 'session', secret: process.env.SESSION_SECRET }));
app.use(express.json());

// In production, serve the built React app from frontend/dist.
// In development, Vite's dev server handles the frontend on a separate port
// and proxies /api requests to this server.
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// ====================================
// Auth routes
// ====================================

app.post('/api/auth/register', authControllers.register);
app.post('/api/auth/login', authControllers.login);
app.get('/api/auth/me', authControllers.getMe);
app.delete('/api/auth/logout', authControllers.logout);

// ====================================
// User routes
// ====================================

app.get('/api/users', userControllers.getAllUsers);
app.get('/api/users/:user_id', userControllers.getUser);
app.patch('/api/users/:user_id', userControllers.updateUsername);
app.delete('/api/users/:user_id', userControllers.deleteUser);

// ====================================
// Book routes (all require authentication)
// ====================================

app.post('/api/books', checkAuthentication, bookControllers.createBook);
app.get('/api/books', checkAuthentication, bookControllers.getAllBooks);
app.get('/api/books/:book_id', checkAuthentication, bookControllers.getBook);
app.patch('/api/books/:book_id', checkAuthentication, bookControllers.updateBook);
app.delete('/api/books/:book_id', checkAuthentication, bookControllers.deleteBook);

// Nested: Get books by user
app.get('/api/users/:user_id/books', checkAuthentication, bookControllers.getUserBooks);

app.post('/api/groups/:group_id/books/:book_id', checkAuthentication, bookControllers.addBookToGroup);
app.delete('/api/groups/:group_id/books/:book_id', checkAuthentication, bookControllers.removeBookFromGroup);
app.get('/api/groups/:group_id/books/:book_id', checkAuthentication, bookControllers.checkBookInGroup);

// Get all groups reading a specific book
app.get('/api/books/:book_id/groups', checkAuthentication, bookControllers.getBookGroups);

// ====================================
// Group routes (all require authentication)
// ====================================
app.post('/api/groups', checkAuthentication, groupControllers.createGroup);
app.get('/api/groups', checkAuthentication, groupControllers.getAllGroups);
app.get('/api/groups/:group_id', checkAuthentication, groupControllers.getGroup);
app.patch('/api/groups/:group_id', checkAuthentication, groupControllers.updateGroup);
app.delete('/api/groups/:group_id', checkAuthentication, groupControllers.deleteGroup);

// Nested: Get group members and books
app.get('/api/groups/:group_id/members', checkAuthentication, groupControllers.getGroupMembers);
app.get('/api/groups/:group_id/books', checkAuthentication, groupControllers.getGroupBooks);

app.post('/api/groups/:group_id/users/:user_id', checkAuthentication, groupControllers.addUserToGroup);
app.delete('/api/groups/:group_id/users/:user_id', checkAuthentication, groupControllers.removeUserFromGroup);
app.get('/api/groups/:group_id/users/:user_id', checkAuthentication, groupControllers.checkUserInGroup);

// Get all groups a user belongs to
app.get('/api/users/:user_id/groups', checkAuthentication, groupControllers.getUserGroups);

// ====================================
// Comment routes (all require authentication)
// ====================================

app.post('/api/comments', checkAuthentication, commentControllers.createComment);
app.get('/api/comments', checkAuthentication, commentControllers.getAllComments);
app.get('/api/comments/:comment_id', checkAuthentication, commentControllers.getComment);
app.put('/api/comments/:comment_id', checkAuthentication, commentControllers.updateComment);
app.delete('/api/comments/:comment_id', checkAuthentication, commentControllers.deleteComment);

// Nested: Get comments by user or book
app.get('/api/users/:user_id/comments', checkAuthentication, commentControllers.getUserComments);
app.get('/api/books/:book_id/comments', checkAuthentication, commentControllers.getBookComments);

// Link comment to book
app.post('/api/books/:book_id/comments/:comment_id/link', checkAuthentication, commentControllers.linkCommentToBook);
app.delete('/api/books/:book_id/comments/:comment_id/unlink', checkAuthentication, commentControllers.unlinkCommentFromBook);

// ====================================
// Global Error Handler
// ====================================

const handleError = (err, req, res, next) => {
  console.error(err);
  res.status(500).send({ message: 'Internal Server Error' });
};
app.use(handleError);

// ====================================
// Listen
// ====================================
// Add this to app.js before app.listen()
app._router.stack.forEach(function(r){
    if (r.route && r.route.path){
        console.log(r.route.methods, r.route.path)
    }
});
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
