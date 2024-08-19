const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');
const regd_users = express.Router();

let users = []; // Array to store user credentials

// Utility function to check if a username exists in the users array
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Utility function to authenticate a user based on username and password
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Route for registered users to login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validate request body
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  // Authenticate user
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // Generate JWT token
  const token = jwt.sign({ username }, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VybmFtZSIsImlhdCI6MTcyNDA3Nzg2NSwiZXhwIjoxNzI0MDgxNDY1fQ.3TA8Y6Fp6uL7yi8dJkAEphnbmb1J6CsCVp99xILgJWE', { expiresIn: '1h' });
  return res.json({token});
});

// Middleware to authenticate requests using JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Access denied' });
  }

  jwt.verify(token, 'your-secret-keyeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VybmFtZSIsImlhdCI6MTcyNDA3Nzg2NSwiZXhwIjoxNzI0MDgxNDY1fQ.3TA8Y6Fp6uL7yi8dJkAEphnbmb1J6CsCVp99xILgJWE', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Route to add or modify a book review
regd_users.put("/auth/review/:isbn", authenticateJWT, (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const username = req.user.username;

  // Validate review
  if (!review) {
    return res.status(400).json({ message: 'Review is required' });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  // Modify or add review
  if (!book.reviews) {
    book.reviews = {};
  }

  const existingReviewKey = Object.keys(book.reviews).find(key => book.reviews[key].username === username);
  if (existingReviewKey) {
    book.reviews[existingReviewKey].review = review;
  } else {
    const reviewKey = `review${Object.keys(book.reviews).length + 1}`;
    book.reviews[reviewKey] = { username, review };
  }

  return res.json({ message: 'Review added or updated successfully', reviews: book.reviews });
});

// Route to delete a book review
regd_users.delete("/auth/review/:isbn", authenticateJWT, (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  if (!book.reviews) {
    return res.status(404).json({ message: 'No reviews found for this book' });
  }

  const reviewKey = Object.keys(book.reviews).find(key => book.reviews[key].username === username);
  if (reviewKey) {
    delete book.reviews[reviewKey];
    return res.json({ message: 'Review deleted successfully', reviews: book.reviews });
  } else {
    return res.status(404).json({ message: 'Review not found for this user' });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
