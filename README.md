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
    user_id        SERIAL PRIMARY KEY
    username       TEXT UNIQUE NOT NULL
    password_hash  TEXT NOT NULL
    
    books
    ─────────────────────────────
    book_id        SERIAL PRIMARY KEY
    title          TEXT NOT NULL
    author         TEXT NOT NULL
    year           INTEGER NOT NULL
    description    TEXT NOT NULL
    user_id        INTEGER REFERENCES users(user_id) ON DELETE CASCADE
    
    groups
    ─────────────────────────────
    group_id       SERIAL PRIMARY KEY
    group_name     TEXT NOT NULL
    description    TEXT NOT NULL
    max-capacity   INTEGER NOT NULL
    location       TEXT NOT NULL
    meet-time      TEXT NOT NULL
    
    comments
    ─────────────────────────────
    comment_id     SERIAL PRIMARY KEY
    content        TEXT NOT NULL
    date_time           DATETIME
    user_id        INTEGER REFERENCES users(user_id) ON DELETE CASCADE
    
    
    group_users
    ─────────────────────────────
    group_users_id SERIAL PRIMARY KEY
    group_id       INTEGER REFERENCES groups(group_id) ON DELETE CASCADE
    user_id        INTEGER REFERENCES users(user_id) ON DELETE CASCADE 
    
    
    
    group_books
    ─────────────────────────────
    group_books_id SERIAL PRIMARY KEY
    group_id       INTEGER REFERENCES groups(group_id) ON DELETE CASCADE
    book_id        INTEGER REFERENCES books(book_id) ON DELETE CASCADE
    
    book_comments
    ─────────────────────────────
    book_comment_id SERIAL PRIMARY KEY
    book_id         INTEGER REFERENCES books(book_id) ON DELETE CASCADE
    comment_id      INTEGER REFERENCES commentss(comment_id) ON DELETE CASCADE
    

A user has many todos. Deleting a user cascades to delete all of their todos.

API Contract
------------

### Auth endpoints

MethodEndpointRequest BodyResponsePOST`/api/auth/register{ username, password }{ user_id, username }`POST`/api/auth/login{ username, password }{ user_id, username }`DELETE`/api/auth/logout`—`{ message }`GET`/api/auth/me`—`{ user_id, username }` or `null`

### Todo endpoints (all require authentication)

MethodEndpointRequest BodyResponseGET`/api/todos`—`[{ todo_id, title, is_complete, user_id }]`POST`/api/todos{ title }{ todo_id, title, is_complete, user_id }`PATCH`/api/todos/:todo_id{ is_complete }{ todo_id, title, is_complete, user_id }`DELETE`/api/todos/:todo_id`—`{ todo_id, title, is_complete, user_id }`

Setup
-----

### 1\. Database

Create a local Postgres database:

    createdb todos_casestudy

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

UsernamePasswordalicepassword123bobpassword123

Application Structure
---------------------

    swe-casestudy-7-todo-app/
    ├── frontend/               # React app (Vite)
    │   ├── src/
    │   │   ├── App.jsx         # Root component: currentUser state, session rehydration, auth handlers
    │   │   ├── adapters/
    │   │   │   ├── auth-adapters.js  # Fetch adapters for /api/auth/* endpoints
    │   │   │   └── todo-adapters.js  # Fetch adapters for /api/todos/* endpoints
    │   │   └── components/
    │   │       ├── AuthPage.jsx    # Login + Register forms (shown when logged out)
    │   │       ├── TodoPage.jsx    # Main app container (shown when logged in)
    │   │       ├── AddTodoForm.jsx # Form to create a new todo
    │   │       ├── TodoList.jsx    # Renders a list of TodoItems
    │   │       └── TodoItem.jsx    # Single todo: checkbox, title, delete button
    │   └── vite.config.js      # Proxies /api requests to Express in development
    └── server/                 # Express + Postgres API
        ├── index.js            # App entry point, route definitions
        ├── controllers/
        │   ├── authControllers.js  # register, login, logout, getMe
        │   └── todoControllers.js  # list, create, update, delete todos
        ├── models/
        │   ├── userModel.js    # SQL queries for the users table
        │   └── todoModel.js    # SQL queries for the todos table
        ├── middleware/
        │   ├── checkAuthentication.js  # Blocks unauthenticated requests
        │   └── logRoutes.js            # Logs each incoming request
        └── db/
            ├── pool.js         # Postgres connection pool
            └── seed.js         # Creates tables and inserts sample data