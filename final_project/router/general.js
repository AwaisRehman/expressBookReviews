const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register a New User 
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  if (users.find(user => user.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  users.push({ username, password });
  res.status(201).json({ message: 'User registered successfully' });
});

//Task 1: 
// Task 10: Get the Book List Available in the Shop using Async-Await with Axios
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('https://awaisurrehm1-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving books list', error: error.message });
  }
});

//Task 2: 
// Task 11: Get Book Details Based on ISBN using Promises with Axios
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  axios.get(`https://awaisurrehm1-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/isbn/${isbn}`)
    .then(response => {
      res.json(response.data);
    })
    .catch(error => {
      res.status(500).json({ message: 'Error retrieving book details', error: error.message });
    });
});

//Task 3: 
// Task 12: Get Book Details Based on Author using Async-Await with Axios
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const response = await axios.get(`https://awaisurrehm1-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/author/${author}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving book details by author', error: error.message });
  }
});

//Task 4: 
// Task 13: Get Book Details Based on Title using Promises with Axios
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  axios.get(`https://awaisurrehm1-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/title/${title}`)
    .then(response => {
      res.json(response.data);
    })
    .catch(error => {
      res.status(500).json({ message: 'Error retrieving book details by title', error: error.message });
    });
});

// Task 5: Get Book Review 
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.json(book.reviews);
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
});

module.exports.general = public_users;
