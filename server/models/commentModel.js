const pool = require('../db/pool');

module.exports.create = async (content, date_time, user_id) => {
    const query = `
        INSERT INTO comments (content, date_time, user_id) 
        VALUES ($1, $2, $3) 
        RETURNING comment_id, content, date_time, user_id
    `;
    const { rows } = await pool.query(query, [content, date_time, user_id]);
    return rows[0];
};

module.exports.find = async (comment_id) => {
    const query = `
        SELECT comments.comment_id, comments.content, comments.date_time, comments.user_id, users.username
        FROM comments 
        JOIN users ON comments.user_id = users.user_id
        WHERE comments.comment_id = $1
    `;
    const { rows } = await pool.query(query, [comment_id]);
    return rows[0] || null;
};

module.exports.findAll = async () => {
    const query = `
        SELECT comments.comment_id, comments.content, comments.date_time, comments.user_id, users.username
        FROM comments 
        JOIN users ON comments.user_id = users.user_id
        ORDER BY comments.date_time DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
};

module.exports.findByUser = async (user_id) => {
    const query = `
        SELECT comment_id, content, date_time, user_id
        FROM comments 
        WHERE user_id = $1
        ORDER BY date_time DESC
    `;
    const { rows } = await pool.query(query, [user_id]);
    return rows;
};

module.exports.findByBook = async (book_id) => {
    const query = `
        SELECT comments.comment_id, comments.content, comments.date_time, comments.user_id, users.username
        FROM book_comments
        JOIN comments ON book_comments.comment_id = comments.comment_id
        JOIN users ON comments.user_id = users.user_id
        WHERE book_comments.book_id = $1
        ORDER BY comments.date_time DESC
    `;
    const { rows } = await pool.query(query, [book_id]);
    return rows;
};

module.exports.update = async (comment_id, content) => {
    const query = `
        UPDATE comments 
        SET content = $1 
        WHERE comment_id = $2 
        RETURNING comment_id, content, date_time, user_id
    `;
    const { rows } = await pool.query(query, [content, comment_id]);
    return rows[0] || null;
};

module.exports.delete = async (comment_id) => {
    const query = 'DELETE FROM comments WHERE comment_id = $1 RETURNING comment_id';
    const { rows } = await pool.query(query, [comment_id]);
    return rows[0] || null;
};

module.exports.linkCommentToBook = async (book_id, comment_id) => {
    const query = `
        INSERT INTO book_comments (book_id, comment_id) 
        VALUES ($1, $2) 
        ON CONFLICT DO NOTHING
        RETURNING book_comment_id, book_id, comment_id
    `;
    const { rows } = await pool.query(query, [book_id, comment_id]);
    return rows[0] || null;
};

module.exports.unlinkCommentFromBook = async (book_id, comment_id) => {
    const query = 'DELETE FROM book_comments WHERE book_id = $1 AND comment_id = $2 RETURNING book_comment_id';
    const { rows } = await pool.query(query, [book_id, comment_id]);
    return rows[0] || null;
};

module.exports.getBooksForComment = async (comment_id) => {
    const query = `
        SELECT books.book_id, books.title, books.author
        FROM book_comments
        JOIN books ON book_comments.book_id = books.book_id
        WHERE book_comments.comment_id = $1
        ORDER BY books.title
    `;
    const { rows } = await pool.query(query, [comment_id]);
    return rows;
};