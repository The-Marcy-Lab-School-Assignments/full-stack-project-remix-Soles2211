const bcrypt = require("bcrypt");
const pool = require("./pool");

const SALT_ROUNDS = 8;

const seed = async () => {
  // Drop tables in reverse dependency order 
  await pool.query("DROP TABLE IF EXISTS book_comments");
  await pool.query("DROP TABLE IF EXISTS group_books");
  await pool.query("DROP TABLE IF EXISTS group_users");
  await pool.query("DROP TABLE IF EXISTS comments");
  await pool.query("DROP TABLE IF EXISTS books");
  await pool.query("DROP TABLE IF EXISTS groups");
  await pool.query("DROP TABLE IF EXISTS users");

  await pool.query(`
    CREATE TABLE users (
      user_id       SERIAL PRIMARY KEY,
      username      TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE groups (
      group_id       SERIAL PRIMARY KEY,
      group_name     TEXT NOT NULL,
      description    TEXT NOT NULL,
      max_capacity   INTEGER NOT NULL,
      location       TEXT NOT NULL,
      meet_time      TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE books (
      book_id        SERIAL PRIMARY KEY,
      title          TEXT NOT NULL,
      author         TEXT NOT NULL,
      year           INTEGER NOT NULL,
      description    TEXT NOT NULL,
      user_id        INTEGER REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE comments (
      comment_id     SERIAL PRIMARY KEY,
      content        TEXT NOT NULL,
      date_time      TIMESTAMP,
      user_id        INTEGER REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE group_users (
      group_user_id  SERIAL PRIMARY KEY,
      group_id       INTEGER REFERENCES groups(group_id) ON DELETE CASCADE,
      user_id        INTEGER REFERENCES users(user_id) ON DELETE CASCADE 
    )
  `);

  await pool.query(`
    CREATE TABLE group_books (
      group_book_id  SERIAL PRIMARY KEY,
      group_id       INTEGER REFERENCES groups(group_id) ON DELETE CASCADE,
      book_id        INTEGER REFERENCES books(book_id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE book_comments(
      book_comment_id SERIAL PRIMARY KEY,
      book_id         INTEGER REFERENCES books(book_id) ON DELETE CASCADE,
      comment_id      INTEGER REFERENCES comments(comment_id) ON DELETE CASCADE
    )
  `);

  // Hash passwords in parallel — bcrypt is slow by design (CPU-bound hashing)
  const [aliceHash, bobHash, carolHash] = await Promise.all([
    bcrypt.hash("password123", SALT_ROUNDS),
    bcrypt.hash("password123", SALT_ROUNDS),
    bcrypt.hash("password123", SALT_ROUNDS),
  ]);

  // RETURNING captures inserted user_ids so we don't hardcode them
   const { rows: users } = await pool.query(`
        INSERT INTO users (username, password_hash) VALUES 
            ('alice', $1),
            ('bob', $2),
            ('carol', $3)
        RETURNING user_id, username
    `, [aliceHash, bobHash, carolHash]);

    const [alice, bob, carol] = users;

    // Insert books
    const { rows: books } = await pool.query(`
        INSERT INTO books (title, author, year, description, user_id) VALUES
            (
                'The Midnight Library',
                'Matt Haig',
                2020,
                'Between life and death lies a library full of books with infinite parallel lives.',
                $1
            ),
            (
                'Project Hail Mary',
                'Andy Weir',
                2021,
                'A lone astronaut wakes up with amnesia and must save humanity with an unlikely alien ally.',
                $2
            ),
            (
                'Tomorrow, and Tomorrow, and Tomorrow',
                'Gabrielle Zevin',
                2022,
                'A decades-spanning story of friendship, creativity, and the making of video games.',
                $3
            )
        RETURNING book_id, title
    `, [alice.user_id, bob.user_id, carol.user_id]);

    const [midnightLibrary, projectHailMary, tomorrow] = books;

    // Insert groups
    const { rows: groups } = await pool.query(`
        INSERT INTO groups (group_name, description, max_capacity, location, meet_time) VALUES
            (
                'Sci-Fi Bookworms',
                'Exploring the best of science fiction, old and new.',
                12,
                'Starbucks Downtown',
                'Wednesdays at 7:00 PM'
            ),
            (
                'Literary Fiction Lovers',
                'Deep dives into character-driven literary fiction.',
                8,
                'Public Library Room A',
                'Sundays at 3:00 PM'
            ),
            (
                'Fantasy & Adventure',
                'From epic quests to magical realms. All fantasy welcome.',
                15,
                'Cozy Cat Cafe',
                'Tuesdays at 6:30 PM'
            )
        RETURNING group_id, group_name
    `);

    const [sciFiGroup, literaryGroup, fantasyGroup] = groups;

    // Insert comments
    const { rows: comments } = await pool.query(`
        INSERT INTO comments (content, date_time, user_id) VALUES
            (
                'This book made me rethink my entire life. The concept of parallel universes is so beautifully handled.',
                '2025-04-01 14:23:00',
                $1
            ),
            (
                'Rocky the alien is my new favorite character in all of sci-fi. So much heart in this book.',
                '2025-04-02 09:47:00',
                $2
            ),
            (
                'The way this novel explores friendship through game design is unlike anything I''ve read before.',
                '2025-04-03 18:12:00',
                $3
            )
        RETURNING comment_id, content
    `, [alice.user_id, bob.user_id, carol.user_id]);

    const [aliceComment, bobComment, carolComment] = comments;

    // Insert group_users (which users are in which groups)
    await pool.query(`
        INSERT INTO group_users (group_id, user_id) VALUES 
            ($1, $4),  
            ($2, $4),  
            ($1, $5),
            ($2, $6),  
            ($3, $6)  
    `, [sciFiGroup.group_id, literaryGroup.group_id, fantasyGroup.group_id, 
        alice.user_id, bob.user_id, carol.user_id]);

    // Insert group_books (which books are assigned to which groups)
    await pool.query(`
        INSERT INTO group_books (group_id, book_id) VALUES 
            ($1, $4),  -- Sci-Fi reads Project Hail Mary
            ($2, $5),  -- Literary reads The Midnight Library
            ($3, $6)   -- Fantasy reads Tomorrow
    `, [sciFiGroup.group_id, literaryGroup.group_id, fantasyGroup.group_id,
        projectHailMary.book_id, midnightLibrary.book_id, tomorrow.book_id]);

    // Insert book_comments (which comments belong to which books)
    await pool.query(`
        INSERT INTO book_comments (book_id, comment_id) VALUES 
            ($1, $4),  -- The Midnight Library gets alice's comment
            ($2, $5),  -- Project Hail Mary gets bob's comment
            ($3, $6)   -- Tomorrow gets carol's comment
    `, [midnightLibrary.book_id, projectHailMary.book_id, tomorrow.book_id,
        aliceComment.comment_id, bobComment.comment_id, carolComment.comment_id]);

    console.log('Book club database seeded successfully.');
    return { users, books, groups, comments };
}

// Run the seed function
seed()
    .then(({ users, books, groups, comments }) => {
        console.log('\n=== Seed Results ===');
        console.log(`Users (${users.length}): ${users.map(u => u.username).join(', ')}`);
        console.log(`Books (${books.length}): ${books.map(b => b.title).join(', ')}`);
        console.log(`Groups (${groups.length}): ${groups.map(g => g.group_name).join(', ')}`);
        console.log(`Comments (${comments.length}): ${comments.map(c => c.content.substring(0, 30) + '...').join(', ')}`);
  })
  .catch((err) => {
    console.error("Error seeding database:", err);
    process.exit(1);
  })
  .finally(() => pool.end());
