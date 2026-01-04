import { useState, useEffect } from 'react';

const AdminDashboard = ({ user }) => {
    const [view, setView] = useState('stats'); // 'stats', 'users', 'community', 'food'
    const [data, setData] = useState({ stats: {}, users: [], posts: [], foods: [] });

    // Ensure only specific emails can access (Simple Admin Check)
    const isAdmin = user?.email === 'admin@fitness.com'; // CHANGE THIS TO YOUR EMAIL TO TEST

    // --- FETCHING FUNCTIONS ---
    const fetchStats = async () => {
        const res = await fetch('http://localhost:5000/api/admin/stats');
        const d = await res.json();
        setData(prev => ({ ...prev, stats: d }));
    };

    const fetchUsers = async () => {
        const res = await fetch('http://localhost:5000/api/admin/users');
        const d = await res.json();
        setData(prev => ({ ...prev, users: d }));
    };

    const fetchPosts = async () => {
        // Reuse public social API for list, but we add delete buttons
        const res = await fetch('http://localhost:5000/api/social'); 
        const d = await res.json();
        setData(prev => ({ ...prev, posts: d }));
    };

    const fetchFoods = async () => {
        // Fetch all foods for admin to manage
        const res = await fetch(`http://localhost:5000/api/food?email=${user.email}`); // Currently fetches user's food, can update to fetch all
        const d = await res.json();
        setData(prev => ({ ...prev, foods: d }));
    };

    useEffect(() => {
        if (isAdmin) {
            if (view === 'stats') fetchStats();
            if (view === 'users') fetchUsers();
            if (view === 'community') fetchPosts();
            if (view === 'food') fetchFoods();
        }
    }, [view, isAdmin]);

    // --- ACTIONS ---
    const deleteItem = async (type, id) => {
        if (!window.confirm("Are you sure? This cannot be undone.")) return;
        
        let url = '';
        if (type === 'user') url = `http://localhost:5000/api/admin/users/${id}`;
        if (type === 'post') url = `http://localhost:5000/api/admin/posts/${id}`;
        if (type === 'food') url = `http://localhost:5000/api/admin/food/${id}`;

        await fetch(url, { method: 'DELETE' });
        
        // Refresh
        if (type === 'user') fetchUsers();
        if (type === 'post') fetchPosts();
        if (type === 'food') fetchFoods();
    };

    if (!isAdmin) return <div className="glass-panel" style={{textAlign:'center'}}><h2>⛔ Access Denied</h2><p>You must be an admin to view this page.</p></div>;

    return (
        <div className="glass-panel fade-in">
            <h2 style={{ color: '#ff4757' }}>🛡️ Admin Dashboard</h2>

            {/* NAVIGATION TABS */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {['stats', 'users', 'community', 'food'].map(tab => (
                    <button 
                        key={tab} 
                        onClick={() => setView(tab)}
                        style={{
                            padding: '10px 20px',
                            background: view === tab ? '#ff4757' : 'rgba(255,255,255,0.1)',
                            border: 'none', borderRadius: '5px', color: 'white',
                            cursor: 'pointer', textTransform: 'capitalize', fontWeight: 'bold'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* --- VIEW: STATISTICS --- */}
            {view === 'stats' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <StatBox title="Total Users" value={data.stats.users} icon="👥" />
                    <StatBox title="Total Posts" value={data.stats.posts} icon="💬" />
                    <StatBox title="Food Logs" value={data.stats.foods} icon="🍎" />
                    <StatBox title="Activities" value={data.stats.activities} icon="💪" />
                </div>
            )}

            {/* --- VIEW: USER MANAGEMENT --- */}
            {view === 'users' && (
                <div>
                    <h3>User Database</h3>
                    <div style={listContainerStyle}>
                        {data.users.map(u => (
                            <div key={u._id} style={listItemStyle}>
                                <div>
                                    <strong>{u.name}</strong><br/>
                                    <small style={{color:'#aaa'}}>{u.email}</small>
                                </div>
                                <button onClick={() => deleteItem('user', u._id)} className="danger-btn">Delete</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- VIEW: CONTENT MODERATION --- */}
            {view === 'community' && (
                <div>
                    <h3>Community Moderation</h3>
                    <div style={listContainerStyle}>
                        {data.posts.map(post => (
                            <div key={post._id} style={{ ...listItemStyle, borderLeft: '4px solid #a55eea' }}>
                                <div>
                                    <strong style={{color:'#a55eea'}}>{post.user_name}</strong>
                                    <p style={{margin:'5px 0'}}>{post.message}</p>
                                    <small style={{color:'#777'}}>{new Date(post.date).toLocaleDateString()}</small>
                                </div>
                                <button onClick={() => deleteItem('post', post._id)} className="danger-btn">Remove</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

             {/* --- VIEW: FOOD DB --- */}
             {view === 'food' && (
                <div>
                    <h3>Food Database</h3>
                    <div style={listContainerStyle}>
                        {data.foods.map(food => (
                            <div key={food._id} style={listItemStyle}>
                                <div>
                                    <strong>{food.foodName}</strong> ({food.calories} kcal)<br/>
                                    <small style={{color:'#aaa'}}>ID: {food._id}</small>
                                </div>
                                <button onClick={() => deleteItem('food', food._id)} className="danger-btn">Delete</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};

// Sub-components & Styles
const StatBox = ({ title, value, icon }) => (
    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '10px', textAlign:'center', borderTop:'3px solid #ff4757' }}>
        <div style={{ fontSize: '2rem' }}>{icon}</div>
        <div style={{ color: '#aaa', marginTop: '5px' }}>{title}</div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{value || 0}</div>
    </div>
);

const listContainerStyle = { display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px', overflowY: 'auto' };
const listItemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px' };

export default AdminDashboard;