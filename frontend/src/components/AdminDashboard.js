import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminDashboard = ({ user }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Announcement Form State
    const [announcementForm, setAnnouncementForm] = useState({
        title: '',
        message: '',
        type: 'info',
        expiresAt: ''
    });

    // Fetch System Stats
    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/stats`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    // Fetch All Users
    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    // Fetch Announcements
    const fetchAnnouncements = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/announcements`);
            if (res.ok) {
                const data = await res.json();
                setAnnouncements(data);
            }
        } catch (err) {
            console.error('Error fetching announcements:', err);
        }
    };

    // Fetch All Posts
    const fetchPosts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/posts`);
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (err) {
            console.error('Error fetching posts:', err);
        }
    };

    useEffect(() => {
        fetchStats();
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'announcements') fetchAnnouncements();
        if (activeTab === 'posts') fetchPosts();
    }, [activeTab]);

    // Toggle User Status
    const toggleUserStatus = async (userId) => {
        if (!window.confirm('Are you sure you want to change this user\'s status?')) return;
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/toggle-status`, {
                method: 'PUT'
            });
            if (res.ok) {
                alert('User status updated!');
                fetchUsers();
            }
        } catch (err) {
            console.error(err);
            alert('Error updating user status');
        }
    };

    // Delete User
    const deleteUser = async (userId) => {
        if (!window.confirm('⚠️ This will DELETE the user and ALL their data. Are you absolutely sure?')) return;
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                alert('User deleted successfully');
                fetchUsers();
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting user');
        }
    };

    // Create Announcement
    const createAnnouncement = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/announcements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...announcementForm,
                    admin_email: user.email,
                    admin_name: user.name
                })
            });
            
            if (res.ok) {
                alert('✅ Announcement created successfully!');
                setAnnouncementForm({ title: '', message: '', type: 'info', expiresAt: '' });
                fetchAnnouncements();
            }
        } catch (err) {
            console.error(err);
            alert('Error creating announcement');
        } finally {
            setLoading(false);
        }
    };

    // Delete Announcement
    const deleteAnnouncement = async (id) => {
        if (!window.confirm('Delete this announcement?')) return;
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/announcements/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                alert('Announcement deleted');
                fetchAnnouncements();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Toggle Pin Post
    const togglePin = async (postId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/posts/${postId}/pin`, {
                method: 'PUT'
            });
            if (res.ok) {
                fetchPosts();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Toggle Hide Post
    const toggleHide = async (postId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/posts/${postId}/hide`, {
                method: 'PUT'
            });
            if (res.ok) {
                fetchPosts();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Delete Post
    const deletePost = async (postId) => {
        if (!window.confirm('Delete this post permanently?')) return;
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/posts/${postId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                alert('Post deleted');
                fetchPosts();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Render Overview Tab
    const renderOverview = () => (
        <div>
            <h2 style={{ color: '#00f2ff', marginBottom: '30px' }}>📊 System Overview</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <StatCard title="Total Users" value={stats.totalUsers || 0} icon="👥" color="#00f2ff" />
                <StatCard title="Total Posts" value={stats.totalPosts || 0} icon="💬" color="#ff9100" />
                <StatCard title="Food Logs" value={stats.totalFoodLogs || 0} icon="🥗" color="#00ff88" />
                <StatCard title="Workouts" value={stats.totalWorkouts || 0} icon="💪" color="#ff4444" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <StatCard title="Today's Food Logs" value={stats.todayFoodLogs || 0} icon="📝" color="#a55eea" />
                <StatCard title="Today's Workouts" value={stats.todayWorkouts || 0} icon="🔥" color="#ffa502" />
                <StatCard title="Today's Posts" value={stats.todayPosts || 0} icon="💭" color="#26de81" />
                <StatCard title="Weight Entries" value={stats.totalWeightEntries || 0} icon="⚖️" color="#fc5c65" />
            </div>
        </div>
    );

    // Render Users Tab
    const renderUsers = () => (
        <div>
            <h2 style={{ color: '#00f2ff', marginBottom: '20px' }}>👥 User Management</h2>
            
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(0, 242, 255, 0.1)', borderBottom: '2px solid #00f2ff' }}>
                            <th style={thStyle}>Name</th>
                            <th style={thStyle}>Email</th>
                            <th style={thStyle}>Role</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Joined</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <td style={tdStyle}>{u.name}</td>
                                <td style={tdStyle}>{u.email}</td>
                                <td style={tdStyle}>
                                    <span style={{ 
                                        background: u.role === 'admin' ? '#ff4444' : '#00f2ff',
                                        color: '#000',
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td style={tdStyle}>
                                    <span style={{
                                        color: u.isActive ? '#00ff88' : '#ff4444',
                                        fontWeight: 'bold'
                                    }}>
                                        {u.isActive ? '✅ Active' : '❌ Inactive'}
                                    </span>
                                </td>
                                <td style={tdStyle}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                <td style={tdStyle}>
                                    {u.role !== 'admin' && (
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button 
                                                onClick={() => toggleUserStatus(u._id)}
                                                style={{...actionBtnStyle, background: '#ffa502'}}
                                            >
                                                {u.isActive ? '🚫 Deactivate' : '✅ Activate'}
                                            </button>
                                            <button 
                                                onClick={() => deleteUser(u._id)}
                                                className="danger-btn"
                                                style={{...actionBtnStyle, background: '#ff4444'}}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // Render Announcements Tab
    const renderAnnouncements = () => (
        <div>
            <h2 style={{ color: '#00f2ff', marginBottom: '20px' }}>📢 Announcements</h2>
            
            {/* Create Form */}
            <div className="glass-panel" style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '15px' }}>Create New Announcement</h3>
                <form onSubmit={createAnnouncement}>
                    <input 
                        type="text"
                        placeholder="Announcement Title"
                        value={announcementForm.title}
                        onChange={e => setAnnouncementForm({...announcementForm, title: e.target.value})}
                        required
                        style={{ width: '100%', marginBottom: '15px' }}
                    />
                    <textarea 
                        placeholder="Announcement Message"
                        value={announcementForm.message}
                        onChange={e => setAnnouncementForm({...announcementForm, message: e.target.value})}
                        required
                        rows={4}
                        style={{ width: '100%', marginBottom: '15px', resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                        <select 
                            value={announcementForm.type}
                            onChange={e => setAnnouncementForm({...announcementForm, type: e.target.value})}
                            style={{ flex: 1 }}
                        >
                            <option value="info">ℹ️ Info</option>
                            <option value="warning">⚠️ Warning</option>
                            <option value="success">✅ Success</option>
                            <option value="urgent">🚨 Urgent</option>
                        </select>
                        <input 
                            type="datetime-local"
                            placeholder="Expires At (optional)"
                            value={announcementForm.expiresAt}
                            onChange={e => setAnnouncementForm({...announcementForm, expiresAt: e.target.value})}
                            style={{ flex: 1 }}
                        />
                    </div>
                    <button type="submit" className="primary-btn" disabled={loading}>
                        {loading ? '⏳ Creating...' : '📢 Create Announcement'}
                    </button>
                </form>
            </div>

            {/* Announcements List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {announcements.map(ann => (
                    <div key={ann._id} className="glass-panel" style={{
                        borderLeft: `4px solid ${
                            ann.type === 'urgent' ? '#ff4444' :
                            ann.type === 'warning' ? '#ffa502' :
                            ann.type === 'success' ? '#00ff88' : '#00f2ff'
                        }`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>
                                    {ann.type === 'urgent' && '🚨 '}
                                    {ann.type === 'warning' && '⚠️ '}
                                    {ann.type === 'success' && '✅ '}
                                    {ann.type === 'info' && 'ℹ️ '}
                                    {ann.title}
                                </h4>
                                <p style={{ color: '#ccc', marginBottom: '10px' }}>{ann.message}</p>
                                <div style={{ fontSize: '0.8rem', color: '#888' }}>
                                    By: {ann.created_by_name} | {new Date(ann.createdAt).toLocaleString()}
                                    {ann.expiresAt && ` | Expires: ${new Date(ann.expiresAt).toLocaleString()}`}
                                </div>
                            </div>
                            <button 
                                onClick={() => deleteAnnouncement(ann._id)}
                                style={{...actionBtnStyle, background: '#ff4444', marginLeft: '15px'}}
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Render Posts Tab
    const renderPosts = () => (
        <div>
            <h2 style={{ color: '#00f2ff', marginBottom: '20px' }}>💬 Post Moderation</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {posts.map(post => (
                    <div key={post._id} className="glass-panel" style={{
                        borderLeft: `4px solid ${
                            post.isPinned ? '#ffa502' : 
                            post.isAdminPost ? '#ff4444' : '#00f2ff'
                        }`,
                        opacity: post.isHidden ? 0.5 : 1
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                    <strong style={{ color: post.isAdminPost ? '#ff4444' : '#00f2ff' }}>
                                        {post.user_name}
                                    </strong>
                                    {post.isPinned && <span style={{ background: '#ffa502', color: '#000', padding: '2px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 'bold' }}>📌 PINNED</span>}
                                    {post.isHidden && <span style={{ background: '#ff4444', color: '#fff', padding: '2px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 'bold' }}>👁️ HIDDEN</span>}
                                </div>
                                <p style={{ color: '#fff', marginBottom: '10px' }}>{post.message}</p>
                                <small style={{ color: '#888' }}>{new Date(post.date).toLocaleString()}</small>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginLeft: '15px' }}>
                                <button onClick={() => togglePin(post._id)} style={{...actionBtnStyle, background: '#ffa502'}}>
                                    {post.isPinned ? '📍 Unpin' : '📌 Pin'}
                                </button>
                                <button onClick={() => toggleHide(post._id)} style={{...actionBtnStyle, background: '#555'}}>
                                    {post.isHidden ? '👁️ Show' : '🙈 Hide'}
                                </button>
                                <button onClick={() => deletePost(post._id)} style={{...actionBtnStyle, background: '#ff4444'}}>
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: '#ff4444', margin: 0 }}>👑 Admin Dashboard</h1>
                <div style={{ color: '#ccc' }}>Logged in as: <strong>{user.name}</strong></div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                <TabButton label="📊 Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                <TabButton label="👥 Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                <TabButton label="📢 Announcements" active={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} />
                <TabButton label="💬 Posts" active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} />
            </div>

            {/* Content */}
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'announcements' && renderAnnouncements()}
            {activeTab === 'posts' && renderPosts()}
        </div>
    );
};

// Helper Components
const StatCard = ({ title, value, icon, color }) => (
    <div className="glass-panel" style={{ 
        textAlign: 'center', 
        borderTop: `4px solid ${color}`,
        padding: '20px'
    }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{icon}</div>
        <div style={{ color: '#aaa', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '5px' }}>{title}</div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: color }}>{value}</div>
    </div>
);

const TabButton = ({ label, active, onClick }) => (
    <button 
        onClick={onClick}
        style={{
            background: active ? 'linear-gradient(45deg, #00f2ff, #00aaff)' : 'transparent',
            color: active ? '#000' : '#aaa',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: active ? 'bold' : 'normal',
            transition: 'all 0.3s'
        }}
    >
        {label}
    </button>
);

// Styles
const thStyle = { padding: '15px', textAlign: 'left', color: '#00f2ff', fontWeight: 'bold' };
const tdStyle = { padding: '15px', color: '#fff' };
const actionBtnStyle = { 
    padding: '6px 12px', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: '0.85rem'
};

export default AdminDashboard;
