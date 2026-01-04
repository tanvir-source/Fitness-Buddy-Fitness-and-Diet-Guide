import { useState, useEffect } from 'react';

const AdminPanel = ({ user }) => {
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [announcement, setAnnouncement] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
  
    // Check if user is admin
    const isAdmin = user?.email === 'admin@fitness.com' || user?.role === 'admin';

    // Fetch all data
    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, postsRes] = await Promise.all([
                fetch('http://localhost:5000/api/users'),
                fetch('http://localhost:5000/api/community')
            ]);

            if (usersRes.ok) {
                const userData = await usersRes.json();
                setUsers(userData);
            }

            if (postsRes.ok) {
                const postData = await postsRes.json();
                setPosts(postData);
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchData();
        }
    }, [isAdmin]);

    // Broadcast announcement
    const handleBroadcast = async () => {
        if (!announcement.trim()) {
            alert('Please enter an announcement');
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/admin/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: announcement,
                    adminEmail: user.email
                })
            });

            if (res.ok) {
                alert('📢 Announcement broadcasted successfully!');
                setAnnouncement('');
            } else {
                alert('Failed to send announcement');
            }
        } catch (err) {
            console.error('Broadcast error:', err);
            alert('Error sending announcement');
        }
    };

    // View user details
    const handleViewUser = async (userEmail) => {
        try {
            const [foodRes, activityRes, weightRes, profileRes] = await Promise.all([
                fetch(`http://localhost:5000/api/food?email=${userEmail}`),
                fetch(`http://localhost:5000/api/activity?email=${userEmail}`),
                fetch(`http://localhost:5000/api/weight?email=${userEmail}`),
                fetch(`http://localhost:5000/api/profile?email=${userEmail}`)
            ]);

            const foods = foodRes.ok ? await foodRes.json() : [];
            const activities = activityRes.ok ? await activityRes.json() : [];
            const weights = weightRes.ok ? await weightRes.json() : [];
            const profile = profileRes.ok ? await profileRes.json() : {};

            const userDetails = users.find(u => u.email === userEmail);

            setSelectedUser({
                ...userDetails,
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
        if (!window.confirm(`Are you sure you want to delete ${userEmail}?`)) return;

        try {
            const res = await fetch(`http://localhost:5000/api/users/${userEmail}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                alert('User deleted successfully');
                fetchData(); // Refresh
            } else {
                alert('Failed to delete user');
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('Error deleting user');
        }
    };

    // Delete post
    const handleDeletePost = async (postId) => {
        if (!window.confirm('Delete this post?')) return;

        try {
            const res = await fetch(`http://localhost:5000/api/community/${postId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                alert('Post deleted');
                fetchData();
            } else {
                alert('Failed to delete post');
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('Error deleting post');
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
        <div style={{
            minHeight: '100vh',
            padding: '20px',
            color: '#fff'
        }}>
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
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '30px'
            }}>
                <div style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: '2px solid rgba(0,242,255,0.3)',
                    borderRadius: '15px',
                    padding: '30px',
                    textAlign: 'center',
                    transition: 'all 0.3s'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{users.length}</div>
                    <div style={{ color: '#aaa', fontSize: '1.1rem' }}>Users</div>
                </div>

                <div style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: '2px solid rgba(0,242,255,0.3)',
                    borderRadius: '15px',
                    padding: '30px',
                    textAlign: 'center',
                    transition: 'all 0.3s'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{posts.length}</div>
                    <div style={{ color: '#aaa', fontSize: '1.1rem' }}>Posts</div>
                </div>
            </div>

            {/* Broadcast System */}
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
                    📢 Broadcast System
                </h3>
               
                <div style={{ display: 'flex', gap: '15px' }}>
                    <input
                        type="text"
                        placeholder="Type public announcement..."
                        value={announcement}
                        onChange={e => setAnnouncement(e.target.value)}
                        style={{
                            flex: 1,
                            background: 'rgba(0,0,0,0.5)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '10px',
                            padding: '15px',
                            color: '#fff',
                            fontSize: '1rem'
                        }}
                        onKeyPress={e => e.key === 'Enter' && handleBroadcast()}
                    />
                   
                    <button
                        onClick={handleBroadcast}
                        style={{
                            background: 'linear-gradient(135deg, #ff8c00, #ff6b00)',
                            border: 'none',
                            color: '#fff',
                            padding: '15px 35px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 15px rgba(255,140,0,0.3)'
                        }}
                        onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                    >
                        Broadcast
                    </button>
                </div>
            </div>

            {/* User Database */}
            <div style={{
                background: 'rgba(0,0,0,0.5)',
                borderRadius: '15px',
                padding: '25px',
                marginBottom: '20px'
            }}>
                <h3 style={{
                    color: '#fff',
                    margin: '0 0 20px 0',
                    fontSize: '1.3rem'
                }}>
                    User Database
                </h3>

                {loading ? (
                    <p style={{ textAlign: 'center', color: '#aaa', padding: '40px' }}>Loading...</p>
                ) : users.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#aaa', padding: '40px' }}>No users found</p>
                ) : (
                    <div style={{
                        maxHeight: '500px',
                        overflowY: 'auto'
                    }}>
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
                                        marginBottom: '5px'
                                    }}>
                                        {u.name}
                                    </div>
                                    <div style={{
                                        fontSize: '0.9rem',
                                        color: '#aaa'
                                    }}>
                                        {u.email}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => handleViewUser(u.email)}
                                        style={{
                                            background: 'linear-gradient(135deg, #00f2ff, #00aaff)',
                                            border: 'none',
                                            color: '#000',
                                            padding: '10px 20px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            fontSize: '0.9rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            transition: 'all 0.3s'
                                        }}
                                        onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                                        onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                                    >
                                        👁️ View
                                    </button>

                                    <button
                                        onClick={() => handleDeleteUser(u.email)}
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
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            {showUserModal && selectedUser && (
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
                        {/* Modal Header */}
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
                                👤 {selectedUser.name}
                            </h2>
                           
                            <button
                                onClick={() => setShowUserModal(false)}
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

                        {/* User Info */}
                        <div style={{
                            background: 'rgba(0,242,255,0.1)',
                            padding: '20px',
                            borderRadius: '12px',
                            marginBottom: '20px',
                            border: '1px solid rgba(0,242,255,0.2)'
                        }}>
                            <h3 style={{ color: '#00f2ff', marginTop: 0 }}>Basic Information</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <InfoItem label="Email" value={selectedUser.email} />
                                <InfoItem label="Age" value={selectedUser.profile?.age || 'N/A'} />
                                <InfoItem label="Gender" value={selectedUser.profile?.gender || 'N/A'} />
                                <InfoItem label="Height" value={selectedUser.profile?.height ? `${selectedUser.profile.height} cm` : 'N/A'} />
                            </div>
                        </div>

                        {/* Activity Stats */}
                        <div style={{
                            background: 'rgba(255,140,0,0.1)',
                            padding: '20px',
                            borderRadius: '12px',
                            marginBottom: '20px',
                            border: '1px solid rgba(255,140,0,0.2)'
                        }}>
                            <h3 style={{ color: '#ff8c00', marginTop: 0 }}>Activity Summary</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                                <InfoItem
                                    label="Food Logs"
                                    value={selectedUser.foods?.length || 0}
                                />
                                <InfoItem
                                    label="Activities"
                                    value={selectedUser.activities?.length || 0}
                                />
                                <InfoItem
                                    label="Weight Logs"
                                    value={selectedUser.weights?.length || 0}
                                />
                            </div>
                        </div>

                        {/* Recent Activity */}
                        {selectedUser.foods && selectedUser.foods.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ color: '#4CAF50' }}>🥗 Recent Foods (Last 5)</h3>
                                <div style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '12px',
                                    padding: '15px'
                                }}>
                                    {selectedUser.foods.slice(-5).reverse().map((food, idx) => (
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

                        {/* Close Button */}
                        <button
                            onClick={() => setShowUserModal(false)}
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
            )}
        </div>
    );
};

// Info Item Component
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