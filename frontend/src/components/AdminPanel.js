import { useState, useEffect } from 'react';

const AdminPanel = ({ user }) => {
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [announcement, setAnnouncement] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [activeTab, setActiveTab] = useState('users');
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [broadcasting, setBroadcasting] = useState(false);
 
    const API_BASE_URL = 'http://localhost:5000';
   
    // Check if user is admin
    const isAdmin = user?.email === 'admin@fitness.com' || user?.role === 'admin';

    // Fetch all data
    const fetchData = async () => {
        setLoading(true);
        try {
            console.log('🔄 Fetching admin data...');
           
            const [usersRes, postsRes, announcementsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/admin`),
                fetch(`${API_BASE_URL}/api/social`),
                fetch(`${API_BASE_URL}/api/admin/announcements`)
            ]);

            console.log('Users response:', usersRes.status);
            console.log('Posts response:', postsRes.status);
            console.log('Announcements response:', announcementsRes.status);

            if (usersRes.ok) {
                const userData = await usersRes.json();
                console.log('✅ Users loaded:', userData.length);
                setUsers(userData);
            } else {
                console.error('❌ Failed to load users:', await usersRes.text());
            }

            if (postsRes.ok) {
                const postData = await postsRes.json();
                console.log('✅ Posts loaded:', postData.length);
                console.log('Posts data:', postData);
                setPosts(postData);
            } else {
                console.error('❌ Failed to load posts:', await postsRes.text());
            }

            if (announcementsRes.ok) {
                const announcementData = await announcementsRes.json();
                console.log('✅ Announcements loaded:', announcementData.length);
                console.log('Announcements data:', announcementData);
                setAnnouncements(announcementData);
            } else {
                console.error('❌ Failed to load announcements:', await announcementsRes.text());
            }
        } catch (err) {
            console.error('❌ Failed to fetch data:', err);
            alert('Error loading data. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            console.log('👑 Admin logged in, fetching data...');
            fetchData();
        }
    }, [isAdmin]);

    // Broadcast announcement - FIXED VERSION
    const handleBroadcast = async () => {
        if (!announcement.trim()) {
            alert('⚠️ Please enter an announcement');
            return;
        }

        setBroadcasting(true);
        try {
            console.log('📢 Broadcasting announcement:', announcement);
            console.log('Admin email:', user.email);

            const res = await fetch(`${API_BASE_URL}/api/admin/broadcast`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: announcement,
                    adminEmail: user.email || 'admin@fitness.com'
                })
            });

            console.log('Broadcast response status:', res.status);
            const responseText = await res.text();
            console.log('Broadcast response:', responseText);

            if (res.ok) {
                alert('✅ Announcement broadcasted successfully!');
                setAnnouncement('');
                // Wait a moment for the database to update
                setTimeout(() => {
                    fetchData();
                }, 500);
            } else {
                try {
                    const error = JSON.parse(responseText);
                    alert('❌ Failed to send announcement: ' + (error.error || error.message || 'Unknown error'));
                } catch (e) {
                    alert('❌ Failed to send announcement: ' + responseText);
                }
            }
        } catch (err) {
            console.error('❌ Broadcast error:', err);
            alert('❌ Error sending announcement: ' + err.message);
        } finally {
            setBroadcasting(false);
        }
    };

    // Delete announcement
    const handleDeleteAnnouncement = async (announcementId) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;

        try {
            console.log('🗑️ Deleting announcement:', announcementId);
            const res = await fetch(`${API_BASE_URL}/api/admin/announcements/${announcementId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                alert('✅ Announcement deleted');
                fetchData();
            } else {
                const error = await res.text();
                console.error('Delete error:', error);
                alert('❌ Failed to delete announcement: ' + error);
            }
        } catch (err) {
            console.error('❌ Delete error:', err);
            alert('❌ Error deleting announcement: ' + err.message);
        }
    };

    // Toggle announcement active status
    const handleToggleAnnouncement = async (announcementId, currentStatus) => {
        try {
            console.log('🔄 Toggling announcement:', announcementId, 'Current status:', currentStatus);
           
            const endpoint = currentStatus
                ? `${API_BASE_URL}/api/admin/announcements/${announcementId}/deactivate`
                : `${API_BASE_URL}/api/admin/announcements/${announcementId}/activate`;
           
            const res = await fetch(endpoint, {
                method: 'PATCH'
            });

            if (res.ok) {
                alert(`✅ Announcement ${currentStatus ? 'deactivated' : 'activated'}`);
                fetchData();
            } else {
                const error = await res.text();
                console.error('Toggle error:', error);
                alert('❌ Failed to update announcement: ' + error);
            }
        } catch (err) {
            console.error('❌ Toggle error:', err);
            alert('❌ Error updating announcement: ' + err.message);
        }
    };

    // Edit announcement
    const handleEditAnnouncement = async (announcementId, newMessage) => {
        if (!newMessage.trim()) {
            alert('⚠️ Please enter a valid message');
            return;
        }

        try {
            console.log('✏️ Editing announcement:', announcementId);
            const res = await fetch(`${API_BASE_URL}/api/admin/announcements/${announcementId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: newMessage,
                    editedBy: user.email || 'admin@fitness.com',
                    editedAt: new Date().toISOString()
                })
            });

            if (res.ok) {
                alert('✅ Announcement updated successfully!');
                setEditingAnnouncement(null);
                fetchData();
            } else {
                const error = await res.json();
                alert('❌ Failed to update announcement: ' + (error.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('❌ Edit error:', err);
            alert('❌ Error updating announcement: ' + err.message);
        }
    };

    // View user details
    const handleViewUser = async (userEmail) => {
        try {
            const [statsRes, foodRes, activityRes, weightRes, profileRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/admin/${userEmail}/stats`),
                fetch(`${API_BASE_URL}/api/food?email=${userEmail}`),
                fetch(`${API_BASE_URL}/api/activity?email=${userEmail}`),
                fetch(`${API_BASE_URL}/api/weight?email=${userEmail}`),
                fetch(`${API_BASE_URL}/api/profile?email=${userEmail}`)
            ]);

            const stats = statsRes.ok ? await statsRes.json() : {};
            const foods = foodRes.ok ? await foodRes.json() : [];
            const activities = activityRes.ok ? await activityRes.json() : [];
            const weights = weightRes.ok ? await weightRes.json() : [];
            const profile = profileRes.ok ? await profileRes.json() : {};

            const userDetails = users.find(u => u.email === userEmail);

            setSelectedUser({
                ...userDetails,
                stats,
                foods,
                activities,
                weights,
                profile
            });
            setShowUserModal(true);
        } catch (err) {
            console.error('Error fetching user details:', err);
            alert('Failed to load user details');
        }
    };

    // Delete user
    const handleDeleteUser = async (userEmail) => {
        if (!window.confirm(`Are you sure you want to delete ${userEmail} and ALL their data?`)) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/${userEmail}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                alert('✅ User and all data deleted successfully');
                fetchData();
            } else {
                alert('Failed to delete user');
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('Error deleting user');
        }
    };

    // Delete post - FIXED VERSION
    const handleDeletePost = async (post) => {
        if (!window.confirm('Delete this post?')) return;

        const postId = post._id || post.id;
       
        console.log('🗑️ Attempting to delete post:', {
            postId,
            fullPost: post
        });

        if (!postId) {
            console.error('❌ No valid post ID found');
            alert('Error: Cannot delete post - no valid ID found');
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/social/${postId}`, {
                method: 'DELETE'
            });

            console.log('Delete response status:', res.status);

            if (res.ok) {
                alert('✅ Post deleted successfully');
                fetchData();
            } else {
                const errorText = await res.text();
                console.error('Delete failed:', errorText);
                alert(`Failed to delete post: ${errorText}`);
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('Error deleting post: ' + err.message);
        }
    };

    if (!isAdmin) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '100px 20px',
                background: 'rgba(255,0,0,0.1)',
                borderRadius: '20px',
                border: '2px solid #ff4444'
            }}>
                <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🚫</div>
                <h2 style={{ color: '#ff4444', marginBottom: '10px' }}>Access Denied</h2>
                <p style={{ color: '#aaa' }}>You do not have admin privileges</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', color: '#fff' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
            }}>
                <h1 style={{
                    fontSize: '2rem',
                    background: 'linear-gradient(90deg, #ff4444, #ff6b6b)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    🛡️ Admin Command Center
                </h1>
               
                <button
                    onClick={fetchData}
                    style={{
                        background: 'rgba(0,242,255,0.2)',
                        border: '2px solid #00f2ff',
                        color: '#00f2ff',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        transition: 'all 0.3s'
                    }}
                    onMouseEnter={e => {
                        e.target.style.background = '#00f2ff';
                        e.target.style.color = '#000';
                    }}
                    onMouseLeave={e => {
                        e.target.style.background = 'rgba(0,242,255,0.2)';
                        e.target.style.color = '#00f2ff';
                    }}
                >
                    🔄 Refresh Data
                </button>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
                marginBottom: '30px'
            }}>
                <div style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: '2px solid rgba(0,242,255,0.3)',
                    borderRadius: '15px',
                    padding: '30px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>👥</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px' }}>{users.length}</div>
                    <div style={{ color: '#aaa', fontSize: '1.1rem' }}>Total Users</div>
                </div>

                <div style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: '2px solid rgba(255,140,0,0.3)',
                    borderRadius: '15px',
                    padding: '30px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📢</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px' }}>{announcements.length}</div>
                    <div style={{ color: '#aaa', fontSize: '1.1rem' }}>Announcements</div>
                </div>

                <div style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: '2px solid rgba(76,175,80,0.3)',
                    borderRadius: '15px',
                    padding: '30px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>💬</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px' }}>{posts.length}</div>
                    <div style={{ color: '#aaa', fontSize: '1.1rem' }}>Community Posts</div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '30px',
                borderBottom: '2px solid rgba(255,255,255,0.1)',
                paddingBottom: '10px'
            }}>
                <TabButton
                    label="👥 Users"
                    active={activeTab === 'users'}
                    onClick={() => {
                        console.log('Switching to users tab');
                        setActiveTab('users');
                    }}
                />
                <TabButton
                    label="📢 Broadcasts"
                    active={activeTab === 'broadcasts'}
                    onClick={() => {
                        console.log('Switching to broadcasts tab');
                        setActiveTab('broadcasts');
                    }}
                />
                <TabButton
                    label="💬 Community"
                    active={activeTab === 'community'}
                    onClick={() => {
                        console.log('Switching to community tab');
                        setActiveTab('community');
                    }}
                />
            </div>

            {/* Tab Content */}
            {activeTab === 'users' && (
                <UsersTab
                    users={users}
                    loading={loading}
                    onViewUser={handleViewUser}
                    onDeleteUser={handleDeleteUser}
                />
            )}

            {activeTab === 'broadcasts' && (
                <BroadcastsTab
                    announcement={announcement}
                    setAnnouncement={setAnnouncement}
                    onBroadcast={handleBroadcast}
                    announcements={announcements}
                    onDelete={handleDeleteAnnouncement}
                    onToggle={handleToggleAnnouncement}
                    onEdit={handleEditAnnouncement}
                    editingAnnouncement={editingAnnouncement}
                    setEditingAnnouncement={setEditingAnnouncement}
                    broadcasting={broadcasting}
                />
            )}

            {activeTab === 'community' && (
                <CommunityTab
                    posts={posts}
                    loading={loading}
                    onDeletePost={handleDeletePost}
                    announcements={announcements}
                    onRefresh={fetchData}
                />
            )}

            {/* User Details Modal */}
            {showUserModal && selectedUser && (
                <UserModal
                    user={selectedUser}
                    onClose={() => setShowUserModal(false)}
                />
            )}
        </div>
    );
};

// Tab Button Component
const TabButton = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        style={{
            background: active ? 'linear-gradient(135deg, #00f2ff, #00aaff)' : 'transparent',
            color: active ? '#000' : '#aaa',
            border: active ? 'none' : '2px solid rgba(255,255,255,0.2)',
            padding: '12px 25px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            transition: 'all 0.3s'
        }}
        onMouseEnter={e => !active && (e.target.style.borderColor = 'rgba(255,255,255,0.5)')}
        onMouseLeave={e => !active && (e.target.style.borderColor = 'rgba(255,255,255,0.2)')}
    >
        {label}
    </button>
);

// Users Tab
const UsersTab = ({ users, loading, onViewUser, onDeleteUser }) => (
    <div style={{
        background: 'rgba(0,0,0,0.5)',
        borderRadius: '15px',
        padding: '25px'
    }}>
        <h3 style={{ color: '#fff', margin: '0 0 20px 0', fontSize: '1.3rem' }}>
            User Database ({users.length} users)
        </h3>

        {loading ? (
            <p style={{ textAlign: 'center', color: '#aaa', padding: '40px' }}>Loading...</p>
        ) : users.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#aaa', padding: '40px' }}>No users found</p>
        ) : (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {users.map((u, idx) => (
                    <div
                        key={idx}
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '15px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: '1px solid rgba(255,255,255,0.1)',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                            e.currentTarget.style.borderColor = 'rgba(0,242,255,0.3)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        }}
                    >
                        <div>
                            <div style={{
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                marginBottom: '5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                {u.name}
                                {u.role === 'admin' && (
                                    <span style={{
                                        background: '#ff4444',
                                        color: '#fff',
                                        padding: '3px 8px',
                                        borderRadius: '5px',
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold'
                                    }}>
                                        ADMIN
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#aaa' }}>{u.email}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                                Joined: {new Date(u.createdAt).toLocaleDateString()}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => onViewUser(u.email)}
                                style={{
                                    background: 'linear-gradient(135deg, #00f2ff, #00aaff)',
                                    border: 'none',
                                    color: '#000',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.3s'
                                }}
                                onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                                onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                            >
                                👁️ View
                            </button>

                            {u.role !== 'admin' && (
                                <button
                                    onClick={() => onDeleteUser(u.email)}
                                    style={{
                                        background: 'linear-gradient(135deg, #ff4444, #cc0000)',
                                        border: 'none',
                                        color: '#fff',
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                                >
                                    🗑️ Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

// Broadcasts Tab - UPDATED WITH EDIT FUNCTIONALITY AND BROADCASTING STATE
const BroadcastsTab = ({
    announcement,
    setAnnouncement,
    onBroadcast,
    announcements,
    onDelete,
    onToggle,
    onEdit,
    editingAnnouncement,
    setEditingAnnouncement,
    broadcasting
}) => (
    <div>
        {/* Broadcast Input */}
        <div style={{
            background: 'linear-gradient(135deg, rgba(255,140,0,0.1), rgba(255,100,0,0.05))',
            border: '2px solid rgba(255,140,0,0.5)',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '30px'
        }}>
            <h3 style={{
                color: '#ff8c00',
                margin: '0 0 15px 0',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                📢 Create New Broadcast
            </h3>
           
            <div style={{ display: 'flex', gap: '15px' }}>
                <textarea
                    placeholder="Type public announcement..."
                    value={announcement}
                    onChange={e => setAnnouncement(e.target.value)}
                    disabled={broadcasting}
                    style={{
                        flex: 1,
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '10px',
                        padding: '15px',
                        color: '#fff',
                        fontSize: '1rem',
                        minHeight: '80px',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        opacity: broadcasting ? 0.5 : 1
                    }}
                    onKeyPress={e => {
                        if (e.key === 'Enter' && e.ctrlKey && !broadcasting) {
                            onBroadcast();
                        }
                    }}
                />
               
                <button
                    onClick={onBroadcast}
                    disabled={broadcasting}
                    style={{
                        background: broadcasting
                            ? 'rgba(255,140,0,0.3)'
                            : 'linear-gradient(135deg, #ff8c00, #ff6b00)',
                        border: 'none',
                        color: broadcasting ? '#aaa' : '#fff',
                        padding: '15px 35px',
                        borderRadius: '10px',
                        cursor: broadcasting ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        transition: 'all 0.3s',
                        boxShadow: broadcasting ? 'none' : '0 4px 15px rgba(255,140,0,0.3)',
                        alignSelf: 'flex-start'
                    }}
                    onMouseEnter={e => !broadcasting && (e.target.style.transform = 'translateY(-2px)')}
                    onMouseLeave={e => !broadcasting && (e.target.style.transform = 'translateY(0)')}
                >
                    {broadcasting ? '⏳ Broadcasting...' : '📤 Broadcast'}
                </button>
            </div>
            <p style={{
                fontSize: '0.8rem',
                color: '#666',
                margin: '10px 0 0 0',
                fontStyle: 'italic'
            }}>
                💡 Tip: Press Ctrl+Enter to broadcast quickly
            </p>
        </div>

        {/* Broadcast History */}
        <div style={{
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '15px',
            padding: '25px'
        }}>
            <h3 style={{ color: '#fff', margin: '0 0 20px 0', fontSize: '1.3rem' }}>
                Broadcast History ({announcements.length} announcements)
            </h3>

            {announcements.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#aaa', padding: '40px' }}>
                    No announcements yet. Create your first broadcast above! 📢
                </p>
            ) : (
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {announcements.slice().reverse().map((ann, idx) => {
                        // Calculate edit count
                        const editCount = ann.editHistory ? ann.editHistory.length : 0;
                        const wasEdited = editCount > 0 || ann.editedAt;
                        const lastEditInfo = ann.editHistory && ann.editHistory.length > 0
                            ? ann.editHistory[ann.editHistory.length - 1]
                            : (ann.editedAt ? { editedBy: ann.editedBy, editedAt: ann.editedAt } : null);
                       
                        return (
                            <div
                                key={ann.id || idx}
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    marginBottom: '15px',
                                    border: `2px solid ${ann.isActive ? 'rgba(0,242,255,0.3)' : 'rgba(255,68,68,0.3)'}`,
                                    transition: 'all 0.3s'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '10px'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            marginBottom: '8px',
                                            flexWrap: 'wrap'
                                        }}>
                                            <span style={{
                                                background: ann.isActive ? '#00ff88' : '#ff4444',
                                                color: '#000',
                                                padding: '3px 10px',
                                                borderRadius: '5px',
                                                fontSize: '0.7rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {ann.isActive ? '🟢 ACTIVE' : '🔴 INACTIVE'}
                                            </span>
                                           
                                            {wasEdited && (
                                                <span style={{
                                                    background: 'rgba(255,165,0,0.3)',
                                                    color: '#ffa500',
                                                    padding: '3px 10px',
                                                    borderRadius: '5px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 'bold',
                                                    border: '1px solid rgba(255,165,0,0.5)'
                                                }}>
                                                    ✏️ EDITED {editCount > 0 ? `(${editCount}x)` : ''}
                                                </span>
                                            )}
                                           
                                            <span style={{ fontSize: '0.8rem', color: '#aaa' }}>
                                                Created: {new Date(ann.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                       
                                        {/* Show last edit info if edited */}
                                        {wasEdited && lastEditInfo && (
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: '#888',
                                                marginBottom: '8px',
                                                padding: '5px 10px',
                                                background: 'rgba(255,165,0,0.1)',
                                                borderRadius: '5px',
                                                borderLeft: '3px solid #ffa500'
                                            }}>
                                                Last edited: {new Date(lastEditInfo.editedAt).toLocaleString()} by {lastEditInfo.editedBy}
                                            </div>
                                        )}
                                       
                                        {/* Editable message */}
                                        {editingAnnouncement === ann.id ? (
                                            <div style={{ marginTop: '10px' }}>
                                                <textarea
                                                    defaultValue={ann.message}
                                                    id={`edit-${ann.id}`}
                                                    style={{
                                                        width: '100%',
                                                        background: 'rgba(0,0,0,0.5)',
                                                        border: '2px solid #00f2ff',
                                                        borderRadius: '8px',
                                                        padding: '10px',
                                                        color: '#fff',
                                                        fontSize: '1rem',
                                                        marginBottom: '10px',
                                                        minHeight: '80px',
                                                        resize: 'vertical',
                                                        fontFamily: 'inherit'
                                                    }}
                                                />
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button
                                                        onClick={() => {
                                                            const newMessage = document.getElementById(`edit-${ann.id}`).value;
                                                            onEdit(ann.id, newMessage);
                                                        }}
                                                        style={{
                                                            background: 'linear-gradient(135deg, #00ff88, #00cc66)',
                                                            border: 'none',
                                                            color: '#000',
                                                            padding: '8px 15px',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.85rem'
                                                        }}
                                                    >
                                                        ✅ Save Changes
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingAnnouncement(null)}
                                                        style={{
                                                            background: 'rgba(255,255,255,0.1)',
                                                            border: '2px solid rgba(255,255,255,0.3)',
                                                            color: '#fff',
                                                            padding: '8px 15px',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.85rem'
                                                        }}
                                                    >
                                                        ❌ Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p style={{
                                                margin: '10px 0',
                                                fontSize: '1.1rem',
                                                color: '#fff',
                                                lineHeight: '1.5',
                                                whiteSpace: 'pre-wrap'
                                            }}>
                                                {ann.message}
                                            </p>
                                        )}
                                       
                                        {/* Original author info */}
                                        <p style={{ fontSize: '0.85rem', color: '#666', margin: '5px 0 0 0' }}>
                                            Originally posted by: {ann.adminEmail}
                                        </p>
                                       
                                        {/* Edit History Dropdown */}
                                        {ann.editHistory && ann.editHistory.length > 0 && (
                                            <details style={{
                                                marginTop: '10px',
                                                padding: '10px',
                                                background: 'rgba(0,0,0,0.3)',
                                                borderRadius: '8px',
                                                cursor: 'pointer'
                                            }}>
                                                <summary style={{
                                                    fontSize: '0.85rem',
                                                    color: '#ffa500',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    userSelect: 'none'
                                                }}>
                                                    📜 View Edit History ({ann.editHistory.length} edits)
                                                </summary>
                                                <div style={{ marginTop: '10px' }}>
                                                    {ann.editHistory.slice().reverse().map((edit, editIdx) => (
                                                        <div
                                                            key={editIdx}
                                                            style={{
                                                                padding: '8px',
                                                                marginBottom: '8px',
                                                                background: 'rgba(255,165,0,0.1)',
                                                                borderRadius: '5px',
                                                                borderLeft: '3px solid #ffa500'
                                                            }}
                                                        >
                                                            <div style={{
                                                                fontSize: '0.75rem',
                                                                color: '#ffa500',
                                                                marginBottom: '5px',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                Edit #{ann.editHistory.length - editIdx} - {new Date(edit.editedAt).toLocaleString()}
                                                            </div>
                                                            <div style={{
                                                                fontSize: '0.8rem',
                                                                color: '#aaa',
                                                                marginBottom: '5px'
                                                            }}>
                                                                By: {edit.editedBy}
                                                            </div>
                                                            <div style={{
                                                                fontSize: '0.9rem',
                                                                color: '#fff',
                                                                whiteSpace: 'pre-wrap'
                                                            }}>
                                                                Previous message: "{edit.previousMessage}"
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </details>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', marginLeft: '15px', flexWrap: 'wrap' }}>
                                        {editingAnnouncement !== ann.id && (
                                            <button
                                                onClick={() => setEditingAnnouncement(ann.id)}
                                                style={{
                                                    background: 'rgba(0,242,255,0.2)',
                                                    border: '2px solid #00f2ff',
                                                    color: '#00f2ff',
                                                    padding: '8px 15px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.85rem',
                                                    transition: 'all 0.3s'
                                                }}
                                            >
                                                ✏️ Edit
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onToggle(ann.id, ann.isActive)}
                                            style={{
                                                background: ann.isActive ? 'rgba(255,68,68,0.2)' : 'rgba(0,255,136,0.2)',
                                                border: `2px solid ${ann.isActive ? '#ff4444' : '#00ff88'}`,
                                                color: ann.isActive ? '#ff4444' : '#00ff88',
                                                padding: '8px 15px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                fontSize: '0.85rem',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            {ann.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                                        </button>
                                        <button
                                            onClick={() => onDelete(ann.id)}
                                            style={{
                                                background: 'rgba(255,68,68,0.2)',
                                                border: '2px solid #ff4444',
                                                color: '#ff4444',
                                                padding: '8px 15px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                fontSize: '0.85rem',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
);

// Community Tab - FIXED DELETE FUNCTIONALITY + ADMIN CHAT + BROADCAST HISTORY
const CommunityTab = ({ posts, loading, onDeletePost, announcements, onRefresh }) => {
    const [newMessage, setNewMessage] = useState('');
    const [posting, setPosting] = useState(false);

    const handlePostMessage = async () => {
        if (!newMessage.trim()) {
            alert('Please enter a message');
            return;
        }

        setPosting(true);
        try {
            console.log('📤 Posting message as admin...');
            const res = await fetch('http://localhost:5000/api/social', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: 'admin@fitness.com',
                    user_name: 'Admin',
                    message: newMessage
                })
            });

            if (res.ok) {
                console.log('✅ Message posted successfully');
                setNewMessage('');
                alert('✅ Message posted successfully!');
                // Refresh data without reloading the page
                if (onRefresh) {
                    setTimeout(() => {
                        onRefresh();
                    }, 300);
                }
            } else {
                const error = await res.json();
                console.error('❌ Failed to post:', error);
                alert('Failed to post: ' + (error.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('❌ Post error:', err);
            alert('Error posting message: ' + err.message);
        } finally {
            setPosting(false);
        }
    };

    const activeAnnouncements = announcements ? announcements.filter(ann => ann.isActive) : [];

    return (
        <div>
            {/* Active Broadcast Announcements Banner */}
            {activeAnnouncements.length > 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(255,140,0,0.2), rgba(255,100,0,0.1))',
                    border: '2px solid rgba(255,140,0,0.6)',
                    borderRadius: '15px',
                    padding: '20px',
                    marginBottom: '25px',
                    boxShadow: '0 4px 20px rgba(255,140,0,0.2)'
                }}>
                    <h3 style={{
                        color: '#ff8c00',
                        margin: '0 0 15px 0',
                        fontSize: '1.3rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        📢 Active Announcements
                    </h3>
                    {activeAnnouncements.slice().reverse().map((ann, idx) => (
                        <div
                            key={ann.id || idx}
                            style={{
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '10px',
                                padding: '15px',
                                marginBottom: idx < activeAnnouncements.length - 1 ? '12px' : '0',
                                borderLeft: '4px solid #ff8c00'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '8px'
                            }}>
                                <span style={{
                                    background: '#00ff88',
                                    color: '#000',
                                    padding: '3px 10px',
                                    borderRadius: '5px',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold'
                                }}>
                                    🟢 ACTIVE
                                </span>
                                <span style={{ fontSize: '0.8rem', color: '#aaa' }}>
                                    {new Date(ann.timestamp).toLocaleString()}
                                </span>
                            </div>
                            <p style={{
                                margin: '0',
                                fontSize: '1.1rem',
                                color: '#fff',
                                lineHeight: '1.6',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {ann.message}
                            </p>
                            <p style={{
                                fontSize: '0.85rem',
                                color: '#666',
                                margin: '8px 0 0 0'
                            }}>
                                Posted by: {ann.adminEmail}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Broadcast History - All Announcements */}
            {announcements && announcements.length > 0 && (
                <div style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: '2px solid rgba(255,140,0,0.3)',
                    borderRadius: '15px',
                    padding: '25px',
                    marginBottom: '25px'
                }}>
                    <h3 style={{
                        color: '#ff8c00',
                        margin: '0 0 15px 0',
                        fontSize: '1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        📜 Broadcast History ({announcements.length} total)
                    </h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {announcements.slice().reverse().map((ann, idx) => (
                            <div
                                key={ann.id || idx}
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '10px',
                                    padding: '15px',
                                    marginBottom: '10px',
                                    borderLeft: `4px solid ${ann.isActive ? '#00ff88' : '#ff4444'}`,
                                    opacity: ann.isActive ? 1 : 0.6
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '8px'
                                }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <span style={{
                                            background: ann.isActive ? '#00ff88' : '#ff4444',
                                            color: '#000',
                                            padding: '3px 8px',
                                            borderRadius: '5px',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {ann.isActive ? '🟢 ACTIVE' : '🔴 INACTIVE'}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: '#888' }}>
                                        {new Date(ann.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <p style={{
                                    margin: '0 0 5px 0',
                                    fontSize: '1rem',
                                    color: '#fff',
                                    lineHeight: '1.5',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {ann.message}
                                </p>
                                <p style={{
                                    fontSize: '0.8rem',
                                    color: '#666',
                                    margin: 0
                                }}>
                                    By: {ann.adminEmail}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Admin Chat Input */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(0,242,255,0.1), rgba(0,170,255,0.05))',
                border: '2px solid rgba(0,242,255,0.5)',
                borderRadius: '15px',
                padding: '25px',
                marginBottom: '30px'
            }}>
                <h3 style={{
                    color: '#00f2ff',
                    margin: '0 0 15px 0',
                    fontSize: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    💬 Post as Admin
                </h3>
               
                <div style={{ display: 'flex', gap: '15px' }}>
                    <textarea
                        placeholder="Type your message to the community..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        style={{
                            flex: 1,
                            background: 'rgba(0,0,0,0.5)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '10px',
                            padding: '15px',
                            color: '#fff',
                            fontSize: '1rem',
                            minHeight: '80px',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                        }}
                        onKeyPress={e => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                                handlePostMessage();
                            }
                        }}
                    />
                   
                    <button
                        onClick={handlePostMessage}
                        disabled={posting}
                        style={{
                            background: posting
                                ? 'rgba(0,242,255,0.3)'
                                : 'linear-gradient(135deg, #00f2ff, #00aaff)',
                            border: 'none',
                            color: posting ? '#aaa' : '#000',
                            padding: '15px 35px',
                            borderRadius: '10px',
                            cursor: posting ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            transition: 'all 0.3s',
                            boxShadow: posting ? 'none' : '0 4px 15px rgba(0,242,255,0.3)',
                            alignSelf: 'flex-start'
                        }}
                        onMouseEnter={e => !posting && (e.target.style.transform = 'translateY(-2px)')}
                        onMouseLeave={e => !posting && (e.target.style.transform = 'translateY(0)')}
                    >
                        {posting ? '⏳ Posting...' : '📤 Post Message'}
                    </button>
                </div>
                <p style={{
                    fontSize: '0.8rem',
                    color: '#666',
                    margin: '10px 0 0 0',
                    fontStyle: 'italic'
                }}>
                    💡 Tip: Press Ctrl+Enter to post quickly
                </p>
            </div>

            {/* Community Posts */}
            <div style={{
                background: 'rgba(0,0,0,0.5)',
                borderRadius: '15px',
                padding: '25px'
            }}>
                <h3 style={{ color: '#fff', margin: '0 0 20px 0', fontSize: '1.3rem' }}>
                    💬 Community Wall ({posts.length} messages)
                </h3>
                <p style={{ color: '#aaa', marginBottom: '20px', fontSize: '0.9rem' }}>
                    Chat with other fitness buddies! Admin can moderate posts.
                </p>

            {loading ? (
                <p style={{ textAlign: 'center', color: '#aaa', padding: '40px' }}>Loading...</p>
            ) : posts.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#aaa', padding: '40px' }}>No posts yet</p>
            ) : (
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {posts.slice().reverse().map((post, idx) => {
                        const userName = post.user_name || post.userName || 'Anonymous';
                        const userEmail = post.user_email || post.userEmail || 'N/A';
                        const message = post.message || post.content || '';
                        const date = post.date || post.createdAt || new Date();
                        const likes = post.likes || [];
                        const comments = post.comments || [];
                        const postId = post._id || post.id;
                       
                        const isAdmin = userEmail === 'admin@fitness.com' || userEmail.includes('admin');
                       
                        return (
                            <div
                                key={postId || idx}
                                style={{
                                    background: isAdmin ? 'rgba(0,242,255,0.1)' : 'rgba(255,255,255,0.03)',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    marginBottom: '15px',
                                    borderLeft: isAdmin ? '4px solid #00f2ff' : '3px solid #a55eea',
                                    position: 'relative',
                                    transition: 'all 0.3s'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = isAdmin ? 'rgba(0,242,255,0.15)' : 'rgba(255,255,255,0.08)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = isAdmin ? 'rgba(0,242,255,0.1)' : 'rgba(255,255,255,0.03)';
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '12px'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}>
                                            <span style={{
                                                fontWeight: 'bold',
                                                color: isAdmin ? '#00f2ff' : '#a55eea',
                                                fontSize: '1.1rem'
                                            }}>
                                                {userName}
                                            </span>
                                            {isAdmin && (
                                                <span style={{
                                                    background: '#00f2ff',
                                                    color: '#000',
                                                    padding: '2px 8px',
                                                    borderRadius: '5px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    ADMIN
                                                </span>
                                            )}
                                        </div>
                                        {userEmail !== 'N/A' && (
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: '#666',
                                                marginTop: '3px'
                                            }}>
                                                {userEmail}
                                            </div>
                                        )}
                                    </div>
                                   
                                    <span style={{
                                        fontSize: '0.8rem',
                                        color: '#888',
                                        whiteSpace: 'nowrap',
                                        marginLeft: '15px'
                                    }}>
                                        {new Date(date).toLocaleDateString('en-US', {
                                            month: 'numeric',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>

                                <p style={{
                                    margin: '0 0 12px 0',
                                    fontSize: '1rem',
                                    color: '#fff',
                                    lineHeight: '1.6',
                                    wordWrap: 'break-word',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {message}
                                </p>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingTop: '10px',
                                    borderTop: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        gap: '15px',
                                        fontSize: '0.85rem',
                                        color: '#aaa'
                                    }}>
                                        {likes.length > 0 && (
                                            <span>❤️ {likes.length} likes</span>
                                        )}
                                        {comments.length > 0 && (
                                            <span>💬 {comments.length} comments</span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => onDeletePost(post)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#ff4444',
                                            padding: '5px 12px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            fontSize: '0.85rem',
                                            transition: 'all 0.3s',
                                            whiteSpace: 'nowrap'
                                        }}
                                        onMouseEnter={e => {
                                            e.target.style.background = 'rgba(255,68,68,0.2)';
                                            e.target.style.transform = 'scale(1.05)';
                                        }}
                                        onMouseLeave={e => {
                                            e.target.style.background = 'transparent';
                                            e.target.style.transform = 'scale(1)';
                                        }}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
    );
};

// User Modal
const UserModal = ({ user, onClose }) => (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
    }}>
        <div style={{
            background: 'linear-gradient(135deg, #1a1a1a, #0a0a0a)',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '2px solid rgba(0,242,255,0.3)',
            boxShadow: '0 20px 60px rgba(0,242,255,0.2)'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                paddingBottom: '20px',
                borderBottom: '2px solid rgba(0,242,255,0.2)'
            }}>
                <h2 style={{
                    margin: 0,
                    color: '#00f2ff',
                    fontSize: '1.8rem'
                }}>
                    👤 {user.name}
                </h2>
               
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: '#fff',
                        fontSize: '1.5rem',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                    onMouseEnter={e => e.target.style.background = '#ff4444'}
                    onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
                >
                    ✕
                </button>
            </div>

            <div style={{
                background: 'rgba(0,242,255,0.1)',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '20px',
                border: '1px solid rgba(0,242,255,0.2)'
            }}>
                <h3 style={{ color: '#00f2ff', marginTop: 0 }}>Basic Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <InfoItem label="Email" value={user.email} />
                    <InfoItem label="Role" value={user.role || 'user'} />
                    <InfoItem label="Age" value={user.profile?.age || 'N/A'} />
                    <InfoItem label="Gender" value={user.profile?.gender || 'N/A'} />
                    <InfoItem label="Height" value={user.profile?.height ? `${user.profile.height} cm` : 'N/A'} />
                    <InfoItem label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
                </div>
            </div>

            {user.stats && (
                <div style={{
                    background: 'rgba(255,140,0,0.1)',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    border: '1px solid rgba(255,140,0,0.2)'
                }}>
                    <h3 style={{ color: '#ff8c00', marginTop: 0 }}>Activity Summary</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                        <InfoItem label="Food Logs" value={user.stats.foodLogs || 0} />
                        <InfoItem label="Activities" value={user.stats.activityLogs || 0} />
                        <InfoItem label="Weight Logs" value={user.stats.weightLogs || 0} />
                        <InfoItem label="Total Calories Eaten" value={user.stats.totalCaloriesEaten || 0} />
                        <InfoItem label="Total Calories Burned" value={user.stats.totalCaloriesBurned || 0} />
                        <InfoItem label="Workout Time" value={`${user.stats.totalWorkoutTime || 0} min`} />
                    </div>
                </div>
            )}

            {user.foods && user.foods.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: '#4CAF50' }}>🥗 Recent Foods (Last 5)</h3>
                    <div style={{
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '12px',
                        padding: '15px'
                    }}>
                        {user.foods.slice(-5).reverse().map((food, idx) => (
                            <div key={idx} style={{
                                padding: '10px',
                                borderBottom: idx < 4 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{food.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#aaa' }}>
                                        {new Date(food.date).toLocaleDateString()}
                                    </div>
                                </div>
                                <div style={{ color: '#00f2ff', fontWeight: 'bold' }}>
                                    {food.calories} cal
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={onClose}
                style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #00f2ff, #00aaff)',
                    border: 'none',
                    color: '#000',
                    padding: '15px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    marginTop: '20px',
                    transition: 'all 0.3s'
                }}
                onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
            >
                Close
            </button>
        </div>
    </div>
);

const InfoItem = ({ label, value }) => (
    <div>
        <div style={{
            color: '#aaa',
            fontSize: '0.8rem',
            marginBottom: '5px',
            textTransform: 'uppercase'
        }}>
            {label}
        </div>
        <div style={{
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1.1rem'
        }}>
            {value}
        </div>
    </div>
);

export default AdminPanel;