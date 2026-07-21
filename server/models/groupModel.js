const pool = require('../db/pool');

module.exports.create = async (group_name, description, max_capacity, location, meet_time) => {
    const query = `
        INSERT INTO groups (group_name, description, max_capacity, location, meet_time) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING group_id, group_name, description, max_capacity, location, meet_time
    `;
    const { rows } = await pool.query(query, [group_name, description, max_capacity, location, meet_time]);
    return rows[0];
};

module.exports.find = async (group_id) => {
    const query = 'SELECT group_id, group_name, description, max_capacity, location, meet_time FROM groups WHERE group_id = $1';
    const { rows } = await pool.query(query, [group_id]);
    return rows[0] || null;
};

module.exports.findAll = async () => {
    const query = 'SELECT group_id, group_name, description, max_capacity, location, meet_time FROM groups ORDER BY group_id';
    const { rows } = await pool.query(query);
    return rows;
};

module.exports.update = async (group_id, group_name, description, max_capacity, location, meet_time) => {
    const query = `
        UPDATE groups 
        SET group_name = $1, description = $2, max_capacity = $3, location = $4, meet_time = $5 
        WHERE group_id = $6 
        RETURNING group_id, group_name, description, max_capacity, location, meet_time
    `;
    const { rows } = await pool.query(query, [group_name, description, max_capacity, location, meet_time, group_id]);
    return rows[0] || null;
};

module.exports.delete = async (group_id) => {
    const query = 'DELETE FROM groups WHERE group_id = $1 RETURNING group_id';
    const { rows } = await pool.query(query, [group_id]);
    return rows[0] || null;
};

module.exports.getMembers = async (group_id) => {
    const query = `
        SELECT users.user_id, users.username
        FROM group_users
        JOIN users ON group_users.user_id = users.user_id
        WHERE group_users.group_id = $1
        ORDER BY users.username
    `;
    const { rows } = await pool.query(query, [group_id]);
    return rows;
};

module.exports.getBooks = async (group_id) => {
    const query = `
        SELECT books.book_id, books.title, books.author, books.year
        FROM group_books
        JOIN books ON group_books.book_id = books.book_id
        WHERE group_books.group_id = $1
        ORDER BY books.title
    `;
    const { rows } = await pool.query(query, [group_id]);
    return rows;
};

//group_members

module.exports.addUserToGroup = async (group_id, user_id) => {
    const query = `
        INSERT INTO group_users (group_id, user_id) 
        VALUES ($1, $2) 
        ON CONFLICT DO NOTHING
        RETURNING group_users_id, group_id, user_id
    `;
    const { rows } = await pool.query(query, [group_id, user_id]);
    return rows[0] || null;
};

module.exports.removeUserFromGroup = async (group_id, user_id) => {
    const query = 'DELETE FROM group_users WHERE group_id = $1 AND user_id = $2 RETURNING group_users_id';
    const { rows } = await pool.query(query, [group_id, user_id]);
    return rows[0] || null;
};

module.exports.isUserInGroup = async (group_id, user_id) => {
    const query = 'SELECT group_users_id FROM group_users WHERE group_id = $1 AND user_id = $2';
    const { rows } = await pool.query(query, [group_id, user_id]);
    return rows.length > 0;
};

module.exports.getGroupsForUser = async (user_id) => {
    const query = `
        SELECT groups.group_id, groups.group_name, groups.location, groups.meet_time
        FROM group_users
        JOIN groups ON group_users.group_id = groups.group_id
        WHERE group_users.user_id = $1
        ORDER BY groups.group_name
    `;
    const { rows } = await pool.query(query, [user_id]);
    return rows;
};