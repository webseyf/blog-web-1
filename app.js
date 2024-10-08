const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

// Express setup
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
const MONGO_DB = process.env.MONGO_DB
// MongoDB setup
mongoose.connect(MONGO_DB)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  }
});

const Blog = mongoose.model('Blog', blogSchema);

// Route to render homepage with posts from MongoDB
app.get('/', async (req, res) => {
  try {
    const foundPosts = await Blog.find({});
    res.render('home', { hello: foundPosts });
  } catch (err) {
    res.status(500).send('Error retrieving posts');
  }
});

// About, Contact, and Compose routes
app.get('/about', (req, res) => res.render('about'));
app.get('/contact', (req, res) => res.render('contact'));
app.get('/compose', (req, res) => res.render('compose'));

// Compose route to save new posts to MongoDB
app.post('/compose', async (req, res) => {
  if (req.body.titli && req.body.post) {
    const newPost = new Blog({
      title: req.body.titli,
      body: req.body.post   // Changed "desc" to "body" here
    });
    try {
      await newPost.save();
      res.redirect('/');
    } catch (err) {
      res.status(500).send('Error saving post');
    }
  } else {
    res.status(400).send('Title and body are required');
  }
});

// Route to fetch and display a specific post by its MongoDB ID
app.get('/posts/:postId', async (req, res) => {
  const requestedId = req.params.postId;
  try {
    const foundPost = await Blog.findById(requestedId);
    if (foundPost) {
      res.render('post', { title: foundPost.title, body: foundPost.body });  // Updated to "body"
    } else {
      res.status(404).send('Post not found');
    }
  } catch (err) {
    res.status(500).send('Error finding post');
  }
});

// Start the server
app.listen(3000, () => console.log('Server running on port 3000'));
