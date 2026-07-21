Book Club App
=============

A full-stack Book Club app built with React, Express, and Postgres. Demonstrates session-based authentication, session rehydration, auth-dependent data fetching, and conditional rendering.

User Stories
------------

**Auth**

*   A user can register for an account with a username and password
    
*   A user can log in to an existing account
    
*   A user can log out
    
*   A returning user who has an active session is automatically logged in when they revisit the app
    

**Groups**

*   A logged-in user can see all of the groups they're a part of
    
*   A logged-in user can create a new group by entering a title
    
*   A logged-in user can mark a todo as complete or incomplete
    
*   A logged-in user can delete a todo
    

Schema
------

    users
    ─────────────────────────────
    user_id         SERIAL PRIMARY KEY
    username        TEXT UNIQUE NOT NULL
    password_hash   TEXT NOT NULL
    
    books
    ─────────────────────────────
    book_id         SERIAL PRIMARY KEY
    title           TEXT NOT NULL
    author          TEXT NOT NULL
    year            INTEGER NOT NULL
    description     TEXT NOT NULL
    user_id         INTEGER REFERENCES users(user_id) ON DELETE CASCADE
    
    groups
    ─────────────────────────────
    group_id        SERIAL PRIMARY KEY
    group_name      TEXT NOT NULL
    description     TEXT NOT NULL
    max-capacity    INTEGER NOT NULL
    location        TEXT NOT NULL
    meet-time       TEXT NOT NULL
    
    comments
    ─────────────────────────────
    comment_id      SERIAL PRIMARY KEY
    content         TEXT NOT NULL
    date_time       DATETIME
    user_id         INTEGER REFERENCES users(user_id) ON DELETE CASCADE
    
    
    group_users
    ─────────────────────────────
    group_users_id  SERIAL PRIMARY KEY
    group_id        INTEGER REFERENCES groups(group_id) ON DELETE CASCADE
    user_id         INTEGER REFERENCES users(user_id) ON DELETE CASCADE 
    
    group_books
    ─────────────────────────────
    group_books_id  SERIAL PRIMARY KEY
    group_id        INTEGER REFERENCES groups(group_id) ON DELETE CASCADE
    book_id         INTEGER REFERENCES books(book_id) ON DELETE CASCADE
    
    book_comments
    ─────────────────────────────
    book_comment_id SERIAL PRIMARY KEY
    book_id         INTEGER REFERENCES books(book_id) ON DELETE CASCADE
    comment_id      INTEGER REFERENCES commentss(comment_id) ON DELETE CASCADE
    

A user has many todos. Deleting a user cascades to delete all of their todos.

API Contract
------------

**API Contract**
----------------

METHOD | ENDPOINT | PURPOSE | REQUEST BODY (JSON) | RESPONSE (JSON)

\---------|---------------------------------------------|----------------------------------------------|-------------------------------------------------------------------------------------|----------------------------------------------------------------------------------

POST | /users | Register a new user | { "username": "string", "password": "string" } | 201 Created { "user\_id": integer, "username": "string" }

GET | /users/{user\_id} | Get user by ID | — | 200 OK { "user\_id": integer, "username": "string" }

POST | /books | Add a new book (by a user) | { "title": "string", "author": "string", "year": integer, "description": "string", "user\_id": integer } | 201 Created { "book\_id": integer, "title": "string", "author": "string", "year": integer, "description": "string", "user\_id": integer }

GET | /books | List all books | — | 200 OK \[ { "book\_id": integer, "title": "string", "author": "string", "year": integer, "description": "string", "user\_id": integer }, ... \]

GET | /books/{book\_id} | Get details of a single book | — | 200 OK { "book\_id": integer, "title": "string", "author": "string", "year": integer, "description": "string", "user\_id": integer }

POST | /groups | Create a new book club group | { "group\_name": "string", "description": "string", "max\_capacity": integer, "location": "string", "meet\_time": "string" } | 201 Created { "group\_id": integer, "group\_name": "string", "description": "string", "max\_capacity": integer, "location": "string", "meet\_time": "string" }

GET | /groups | List all groups | — | 200 OK \[ { "group\_id": integer, "group\_name": "string", "description": "string", "max\_capacity": integer, "location": "string", "meet\_time": "string" }, ... \]

GET | /groups/{group\_id} | Get group by ID | — | 200 OK { "group\_id": integer, "group\_name": "string", "description": "string", "max\_capacity": integer, "location": "string", "meet\_time": "string" }

POST | /groups/{group\_id}/users/{user\_id} | Add a user to a group | — | 201 Created { "message": "User added to group", "group\_users\_id": integer }

DELETE | /groups/{group\_id}/users/{user\_id} | Remove a user from a group | — | 200 OK { "message": "User removed from group" }

POST | /groups/{group\_id}/books/{book\_id} | Assign a book to a group | — | 201 Created { "message": "Book assigned to group", "group\_books\_id": integer }

DELETE | /groups/{group\_id}/books/{book\_id} | Remove a book from a group | — | 200 OK { "message": "Book removed from group" }

POST | /comments | Create a comment (not yet linked to a book) | { "content": "string", "date\_time": "2025-04-08T14:30:00Z", "user\_id": integer } | 201 Created { "comment\_id": integer, "content": "string", "date\_time": "string", "user\_id": integer }

POST | /books/{book\_id}/comments/{comment\_id} | Link an existing comment to a book | — | 201 Created { "message": "Comment linked to book", "book\_comment\_id": integer }

GET | /books/{book\_id}/comments | Get all comments for a specific book | — | 200 OK \[ { "comment\_id": integer, "content": "string", "date\_time": "string", "user\_id": integer }, ... \]

DELETE | /comments/{comment\_id} | Delete a comment | — | 200 OK { "message": "Comment deleted" }

Setup
-----

### 1\. Database

Create a local Postgres database:

    createdb book_club_db

### 2\. Server

    cd server
    npm install
    cp .env.template .env

Open `.env` and fill in your Postgres credentials and a session secret. Then seed the database:

    npm run db:seed

Start the server:

    npm run dev

The server runs on `http://localhost:8080`.

### 3\. Frontend

In a second terminal:

    cd frontend
    npm install
    npm run dev

The frontend runs on `http://localhost:5173`. The Vite dev proxy forwards all `/api` requests to the Express server so session cookies work correctly.

Seed Users
----------

After running `npm run db:seed`, these accounts are available:

Username Password
alice    password123
bob      password123

