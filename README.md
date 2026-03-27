Nexus — Full Stack Web Application

A simple, production-ready full stack app built using React, Node.js, Express, and MongoDB, with authentication handled via Passport.js and session-based auth.

This project is structured to reflect real-world backend + frontend separation and follows clean architecture practices.

📁 Project Structure

Here’s how the project is organized:

project/
├── backend/
│ ├── config/ # DB connection & Passport setup
│ ├── controllers/ # Business logic (auth, dashboard, data)
│ ├── middleware/ # Auth guards & error handling
│ ├── models/ # Mongoose schemas
│ ├── routes/ # Route definitions
│ ├── views/ # EJS templates (server-rendered pages)
│ ├── server.js # Entry point
│ └── .env.example
│
└── frontend/
├── src/
│ ├── context/ # Global state (Auth)
│ ├── hooks/ # Custom hooks
│ ├── services/ # API layer (Axios)
│ ├── components/ # Reusable UI
│ ├── pages/ # Screens (Login, Dashboard, etc.)
│ └── App.jsx
└── .env.example

The idea is to keep things modular and easy to scale.

⚡ Getting Started
Prerequisites

Make sure you have:

Node.js (v18+ recommended)
MongoDB (local or Atlas)
npm or yarn

1. Install Dependencies
   cd project

# Backend

cd backend
npm install

# Frontend

cd ../frontend
npm install 2. Setup Environment Variables

Create .env files using the provided examples.

Backend (backend/.env)

PORT=5000
MONGO_URI=mongodb://localhost:27017/nexus_db
SESSION_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:3000

Frontend (frontend/.env)

REACT_APP_API_URL=http://localhost:5000

Tip: Never push .env files to GitHub.

3. Start MongoDB

If you're running locally:

mongod

Or just use MongoDB Atlas and paste your connection string.

4. Run the App

Backend

cd backend
npm run dev

Frontend

cd frontend
npm start
Backend → http://localhost:5000
Frontend → http://localhost:3000
🔐 Authentication Flow (Simple Explanation)

Here’s what’s happening behind the scenes:

Signup
User data is validated
Password is hashed using bcrypt
User is stored in MongoDB
Login
Passport verifies credentials
A session is created and stored in MongoDB
User is redirected to dashboard
Session Handling
React checks /api/auth/user on load
If valid → user stays logged in
If not → redirected to login
Logout
Session is destroyed
Cookie is cleared
🛣️ Routes Overview
Auth Routes
Method Route Description
GET /signup Signup page
POST /signup Register user
GET /login Login page
POST /login Authenticate
GET /logout Logout user
API Routes
Method Route Description
GET /api/auth/user Get logged-in user
GET /api/data Fetch items
POST /api/data Create item
PUT /api/data/:id Update item
DELETE /api/data/:id Delete item
📮 Testing the API

You can test using Postman or curl.

Example: Login

curl -c cookies.txt -X POST http://localhost:5000/login \
-H "Content-Type: application/json" \
-d '{"email":"jane@example.com","password":"secret123"}'

After login, reuse cookies to access protected routes.

🛡️ Security Features
Password hashing using bcrypt
Session storage in MongoDB
HTTP-only cookies
Route protection middleware
Input validation (frontend + backend)
CORS restricted to frontend
Centralized error handling
⚠️ Error Handling

All errors go through a global handler:

401 → Unauthorized / invalid login
404 → Not found
422 → Validation errors
500 → Server error (clean message in production)
🚀 Deployment Notes

For production:

NODE_ENV=production
SESSION_SECRET=<strong-secret>
MONGO_URI=<atlas-uri>

Build frontend:

cd frontend
npm run build

(Optional) Serve React from Express.

📦 Tech Stack
Backend
Express
MongoDB + Mongoose
Passport.js
express-session
connect-mongo
bcryptjs
Frontend
React
React Router
Axios
💡 Final Notes

This project is designed to be:

Easy to understand
Cleanly structured
Close to real-world production setups

If you're learning full stack development, this is a solid base to build on.
