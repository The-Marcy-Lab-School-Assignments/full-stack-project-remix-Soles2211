const pool = require('../db/pool');

module.exports.create = async (title, author, year, description, user_id) => {
    const query = `
        INSERT INTO books (title, author, year, description, user_id) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING book_id, title, author, year, description, user_id
    `;
    const { rows } = await pool.query(query, [title, author, year, description, user_id]);
    return rows[0];
};

module.exports.find = async (book_id) => {
    const query = `
        SELECT books.book_id, books.title, books.author, books.year, books.description, books.user_id, users.username
        FROM books 
        JOIN users ON books.user_id = users.user_id
        WHERE books.book_id = $1
    `;
    const { rows } = await pool.query(query, [book_id]);
    return rows[0] || null;
};

module.exports.findAll = async () => {
    const query = `
        SELECT books.book_id, books.title, books.author, books.year, books.description, books.user_id, users.username
        FROM books 
        JOIN users ON books.user_id = users.user_id
        ORDER BY books.book_id
    `;
    const { rows } = await pool.query(query);
    return rows;
};

module.exports.findByUser = async (user_id) => {
    const query = `
        SELECT book_id, title, author, year, description, user_id
        FROM books 
        WHERE user_id = $1
        ORDER BY book_id
    `;
    const { rows } = await pool.query(query, [user_id]);
    return rows;
};

module.exports.update = async (book_id, title, author, year, description) => {
    const query = `
        UPDATE books 
        SET title = $1, author = $2, year = $3, description = $4 
        WHERE book_id = $5 
        RETURNING book_id, title, author, year, description, user_id
    `;
    const { rows } = await pool.query(query, [title, author, year, description, book_id]);
    return rows[0] || null;
};

module.exports.delete = async (book_id) => {
    const query = 'DELETE FROM books WHERE book_id = $1 RETURNING book_id';
    const { rows } = await pool.query(query, [book_id]);
    return rows[0] || null;
};

module.exports.addBookToGroup = async (group_id, book_id) => {
    const query = `
        INSERT INTO group_books (group_id, book_id) 
        VALUES ($1, $2) 
        ON CONFLICT DO NOTHING
        RETURNING group_books_id, group_id, book_id
    `;
    const { rows } = await pool.query(query, [group_id, book_id]);
    return rows[0] || null;
};

module.exports.removeBookFromGroup = async (group_id, book_id) => {
    const query = 'DELETE FROM group_books WHERE group_id = $1 AND book_id = $2 RETURNING group_books_id';
    const { rows } = await pool.query(query, [group_id, book_id]);
    return rows[0] || null;
};

module.exports.isBookInGroup = async (group_id, book_id) => {
    const query = 'SELECT group_books_id FROM group_books WHERE group_id = $1 AND book_id = $2';
    const { rows } = await pool.query(query, [group_id, book_id]);
    return rows.length > 0;
};

module.exports.getGroupsForBook = async (book_id) => {
    const query = `
        SELECT groups.group_id, groups.group_name, groups.location
        FROM group_books
        JOIN groups ON group_books.group_id = groups.group_id
        WHERE group_books.book_id = $1
        ORDER BY groups.group_name
    `;
    const { rows } = await pool.query(query, [book_id]);
    return rows;
};
