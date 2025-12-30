import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

const Home = ({ user }) => {
    // 1. State for Time Range
    const [viewMode, setViewMode] = useState('daily'); // 'daily', 'monthly', 'yearly'
    const [stats, setStats] = useState({ eaten: 0, burned: 0, workoutTime: 0, weight: 0 });
    const [hydration, setHydration] = useState({ total: 0, goal: 2000, percent: 0, completed: false });

    const fetchHydration = async () => {
        if (!user?.email) return;
        try {
            const today = new Date().toISOString().slice(0,10);
            const [totalRes, goalRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/water/total/${today}?email=${user.email}`),
                fetch(`${API_BASE_URL}/api/water/goal?email=${user.email}`)
            ]);
            const totalData = await totalRes.json();
            const goalData = await goalRes.json();
            const total = totalData.total || 0;
            const goal = goalData.recommended_ml || 2000;
            const percent = Math.min(100, Math.round((total/goal)*100));
            setHydration({ total, goal, percent, completed: total >= goal });
        } catch (err) { console.error(err); }
    };


    const fetchStats = async () => {
        if (!user?.email) return;
        try {
            // Pass the viewMode to the backend API
            const res = await fetch(`http://localhost:5000/api/stats?email=${user.email}&range=${viewMode}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchStats();
        fetchHydration();
    }, [user, viewMode]); // Re-fetch when viewMode changes

    return (
        <div className="glass-panel fade-in">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <h2>👋 Welcome back, <span style={{color:'#00f2ff'}}>{user?.name || 'User'}</span></h2>
                
                {/* 2. Range Selector Buttons */}
                <div style={{background: 'rgba(255,255,255,0.1)', borderRadius:'20px', padding:'5px'}}>
                    {['daily', 'monthly', 'yearly'].map(mode => (
                        <button 
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            style={{
                                background: viewMode === mode ? '#00f2ff' : 'transparent',
                                color: viewMode === mode ? '#000' : '#fff',
                                border: 'none',
                                padding: '5px 15px',
                                borderRadius: '15px',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                fontWeight: 'bold'
                            }}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                <StatCard title="Calories Eaten" value={stats.eaten} target="/ 2000 Target" icon="🥗" color="#00f2ff" />
                <StatCard title="Calories Burned" value={stats.burned} target="Great Job!" icon="🔥" color="#ff4757" />
                <StatCard title="Workout Time" value={`${stats.workoutTime} m`} target="Minutes Active" icon="⏱️" color="#ffa502" />
                <StatCard title="Current Weight" value={`${stats.weight} kg`} target="Latest Log" icon="⚖️" color="#a55eea" />
                <HydrationCard hydration={hydration} />
            </div>

            {/* Motivation Box */}
            <div className="glass-panel" style={{ marginTop: '20px', borderLeft: '4px solid #00f2ff' }}>
                <h3>🚀 {viewMode === 'daily' ? "Today's Focus" : viewMode === 'monthly' ? "This Month's Progress" : "Yearly Overview"}</h3>
                <p style={{color:'#ccc'}}>
                    You have consumed <b>{stats.eaten}</b> calories and burned <b>{stats.burned}</b> {viewMode}.
                </p>
            </div>
        </div>
    );
};

// Simple reusable card component
const StatCard = ({ title, value, target, icon, color }) => (
    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '15px', textAlign: 'center', borderTop: `4px solid ${color}` }}>
        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{icon}</div>
        <h4 style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '5px' }}>{title.toUpperCase()}</h4>
        <h2 style={{ fontSize: '2rem', margin: '0' }}>{value}</h2>
        <small style={{ color: color }}>{target}</small>
    </div>
);

const HydrationCard = ({ hydration }) => (
    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '15px', textAlign: 'center', borderTop: '4px solid #00f2ff' }}>
        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💧</div>
        <h4 style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '5px' }}>HYDRATION</h4>
        <h2 style={{ fontSize: '2rem', margin: '0' }}>{hydration.total} ml</h2>
        <small style={{ color: '#00f2ff' }}>{hydration.goal} ml target</small>
        <div style={{height:'8px', background:'rgba(255,255,255,0.05)', borderRadius:'8px', marginTop:'10px'}}>
            <div style={{width:`${hydration.percent || 0}%`, height:'100%', background:'linear-gradient(90deg,#00f2ff,#00aaff)', borderRadius:'8px'}} />
        </div>
        {hydration.completed && <div style={{marginTop:'8px', color:'#7df7a6'}}>🎉 Goal reached</div>}
    </div>
);

export default Home;