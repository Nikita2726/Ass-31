import { useState, useEffect } from 'react';

function App() {
  const [posts, setPosts] = useState([]);
  
  // Standard text state!
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [tagsInput, setTagsInput] = useState(''); // E.g., "React, Backend, Node"

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const res = await fetch('http://localhost:5000/api/posts');
    const data = await res.json();
    setPosts(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Split the comma-separated string into an array: "React, Node" -> ["React", "Node"]
    const tagsArray = tagsInput.split(',').filter(tag => tag.trim() !== '');

    // Notice how clean this payload is! Just text!
    const payload = {
      title: title,
      content: content,
      authorName: authorName, 
      tagNames: tagsArray      
    };

    // Hit our new "smart" route
    const response = await fetch('http://localhost:5000/api/posts/smart-create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const createdPost = await response.json();
      setPosts([...posts, createdPost]);
      
      // Clear form
      setTitle('');
      setContent('');
      setAuthorName('');
      setTagsInput('');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Smart Create Post</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="text" placeholder="Post Title" 
          value={title} onChange={(e) => setTitle(e.target.value)} required 
        />
        <textarea 
          placeholder="Post Content" 
          value={content} onChange={(e) => setContent(e.target.value)} required 
        />
        
        {/* The user just types the name! */}
        <input 
          type="text" placeholder="Author Name (e.g., John Doe)" 
          value={authorName} onChange={(e) => setAuthorName(e.target.value)} required 
        />
        
        {/* The user just types comma-separated tags! */}
        <input 
          type="text" placeholder="Tags (comma separated, e.g., React, MongoDB)" 
          value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} 
        />

        <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
          Create Everything
        </button>
      </form>

      <hr style={{ margin: '40px 0' }}/>

      <h2>Your Feed</h2>
      {posts.map((post) => (
        <div key={post._id} style={{ border: '1px solid #ccc', padding: '15px', marginTop: '15px' }}>
          <h3>{post.title}</h3>
          <p style={{ color: 'gray' }}>Author: {post.author?.name}</p>
          <p>{post.content}</p>
          <div style={{ display: 'flex', gap: '5px' }}>
            {post.tags?.map(tag => (
              <span key={tag._id} style={{ background: '#eee', padding: '3px 8px', borderRadius: '10px', fontSize: '12px' }}>
                #{tag.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;