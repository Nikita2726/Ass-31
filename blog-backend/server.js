// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. CONNECT TO MONGODB ---
// Replace with your MongoDB URI if not running locally
mongoose.connect('mongodb://mongo:27017/relationship-demo-cont');

// --- 2. DEFINE SCHEMAS & RELATIONSHIPS ---

// Author Schema
const authorSchema = new mongoose.Schema({
  name: String,
  bio: String
});
const Author = mongoose.model('Author', authorSchema);

// Tag Schema
const tagSchema = new mongoose.Schema({
  name: String
});
const Tag = mongoose.model('Tag', tagSchema);

// Post Schema (This ties it all together)
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  // ONE-TO-MANY: A post has exactly one author. We reference the Author model.
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Author' 
  },
  // MANY-TO-MANY: A post has an array of tags. We reference the Tag model.
  tags: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tag' 
  }]
});
const Post = mongoose.model('Post', postSchema);

// --- 3. API ROUTES ---
// Add this below your other routes in server.js

// Route to CREATE a new post
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, author, tags } = req.body;
    
    // Create the post in MongoDB using the IDs sent from React
    const newPost = await Post.create({
      title,
      content,
      author, // Expecting a single string ID
      tags    // Expecting an array of string IDs
    });

    // Fetch the newly created post and POPULATE it before sending it back
    const populatedPost = await Post.findById(newPost._id)
      .populate('author')
      .populate('tags');

    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// Route to create a Post WITH a new Author and Tags simultaneously
app.post('/api/posts/smart-create', async (req, res) => {
  try {
    // The frontend is now sending normal strings/arrays of strings!
    const { title, content, authorName, tagNames } = req.body;

    // --- 1. HANDLE THE AUTHOR (One-to-Many) ---
    // Try to find the author first
    let author = await Author.findOne({ name: authorName });
    // If they don't exist, create a new one!
    if (!author) {
      author = await Author.create({ name: authorName, bio: 'New Author' });
    }

    // --- 2. HANDLE THE TAGS (Many-to-Many) ---
    let tagIds = [];
    // Loop through the array of tag names the frontend sent
    for (let tagName of tagNames) {
      // Clean up whitespace (e.g., " React " -> "React")
      const cleanName = tagName.trim();
      
      let tag = await Tag.findOne({ name: cleanName });
      if (!tag) {
        tag = await Tag.create({ name: cleanName });
      }
      // Push the MongoDB ObjectId into our array
      tagIds.push(tag._id);
    }

    // --- 3. CREATE THE POST ---
    // Now we have the actual ObjectIds to link them properly in MongoDB!
    const newPost = await Post.create({
      title,
      content,
      author: author._id, // Using the ID we just found/created
      tags: tagIds        // Using the array of IDs we just built
    });

    // Populate and send back to React
    const populatedPost = await Post.findById(newPost._id)
      .populate('author')
      .populate('tags');

    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// Route to seed some initial data so we have something to look at
app.post('/api/seed', async (req, res) => {
  try {
    // Clear existing data
    await Author.deleteMany({});
    await Tag.deleteMany({});
    await Post.deleteMany({});

    // Create an Author
    const author1 = await Author.create({ name: 'Sanjay', bio: 'Tech Enthusiast' });

    // Create Tags
    const tag1 = await Tag.create({ name: 'React' });
    const tag2 = await Tag.create({ name: 'MongoDB' });
    const tag3 = await Tag.create({ name: 'Backend' });

    // Create a Post and link the ObjectIds
    const post1 = await Post.create({
      title: 'Understanding Mongoose Refs',
      content: 'Here is how you link documents together.',
      author: author1._id, // Linking 1:N
      tags: [tag1._id, tag2._id] // Linking M:N
    });

    const post2 = await Post.create({
      title: 'Building REST APIs',
      content: 'Express makes routing simple.',
      author: author1._id, 
      tags: [tag3._id, tag2._id] 
    });

    res.json({ message: 'Database seeded!', post1, post2 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to fetch Posts with populated relationships
app.get('/api/posts', async (req, res) => {
  try {
    // .populate() tells Mongoose to replace the ObjectIds with the actual documents
    const posts = await Post.find()
      .populate('author') 
      .populate('tags');  
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));