import { useState, useEffect } from 'react';

const SocialAdmin = ({ user }) => {
    const [posts, setPosts] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/social');
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/social', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    user_email: user.email, 
                    user_name: user.name || user.email.split('@')[0], 
                    message: message 
                })
            });
            if (res.ok) {
                fetchPosts(); // Refresh list
                setMessage(''); // Clear input
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div className="glass-panel fade-in">
            <h2 style={{color: '#a55eea'}}>💬 Community Wall</h2>
            <p style={{color:'#ccc'}}>Chat with other fitness buddies!</p>
            
            <form onSubmit={handleSubmit} style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                <input 
                    placeholder="Type a message..." 
                    value={message} 
                    onChange={e => setMessage(e.target.value)} 
                    required 
                    style={{flex:1, padding:'10px', borderRadius:'5px', border:'none'}} 
                />
                <button type="submit" style={{padding:'10px 20px', background:'#a55eea', border:'none', borderRadius:'5px', color:'white', fontWeight:'bold', cursor:'pointer'}}>Post</button>
            </form>

            <div style={{maxHeight:'400px', overflowY:'auto'}}>
                {posts.map(post => (
                    <div key={post._id} style={{background:'rgba(255,255,255,0.05)', padding:'10px', margin:'10px 0', borderRadius:'10px', borderLeft:'3px solid #a55eea'}}>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                            <strong style={{color:'#a55eea'}}>{post.user_name}</strong>
                            <small style={{color:'#888', fontSize:'0.8rem'}}>{new Date(post.date).toLocaleDateString()}</small>
                        </div>
                        <p style={{margin:'5px 0', color:'white'}}>{post.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SocialAdmin;