import { useState, useEffect } from 'react'; 
import './App.css';

// ✅ IMPORT ALL COMPONENTS
import Nutrition from './components/Nutrition';
import Fitness from './components/Fitness';
import SocialAdmin from './components/SocialAdmin';
import Weight from './components/Weight';
import Profile from './components/Profile'; // Your new feature

// --- NAVIGATION ICON COMPONENT ---
const NavIcon = ({ icon, label, active, onClick }) => (
    <div onClick={onClick} style={{
        cursor: 'pointer', 
        padding: '12px 15px', 
        borderRadius: '12px',
        background: active ? 'linear-gradient(45deg, #00f2ff, #00aaff)' : 'transparent',
        color: active ? '#000' : '#aaa', // Black text on active for contrast
        fontWeight: active ? 'bold' : 'normal',
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transition: 'all 0.3s'
    }}>
        <div style={{ fontSize: '1.4rem' }}>{icon}</div>
        <div style={{ fontSize: '0.9rem' }}>{label}</div>
    </div>
);

// --- SIMPLE DASHBOARD WIDGET ---
const DashboardCard = ({ title, value, icon, color }) => (
    <div className="glass-panel" style={{ flex: 1, minWidth: '200px', textAlign: 'center', borderTop: `4px solid ${color}` }}>
        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{icon}</div>
        <h3 style={{ margin: '5px 0', color: '#fff' }}>{title}</h3>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: color, margin: 0 }}>{value}</p>
    </div>
);

function App() {
  const [user, setUser] = useState(null); 
  const [isLogin, setIsLogin] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard'); // Default to Dashboard
  const [authData, setAuthData] = useState({ name: '', email: '', password: '' });

  // --- AUTH HANDLER ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'http://localhost:5000/api/users/login' : 'http://localhost:5000/api/users';
    const payload = isLogin ? { email: authData.email, password: authData.password } : authData;
    
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) {
        if (isLogin) { 
            setUser(data.user); 
        } else {
            alert('Account created! Please login.');
            setIsLogin(true);
        }
      } else {
        alert(data.message || 'Error');
      }
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => { setUser(null); setIsLogin(true); };

  // --- DASHBOARD VIEW (Restored) ---
  const Dashboard = () => (
      <div className="fade-in">
          <h2 style={{ marginBottom: '20px' }}>👋 Welcome back, <span style={{ color: '#00f2ff' }}>{user.name}</span></h2>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <DashboardCard title="Calories" value="-- / 2000" icon="🔥" color="#ff9100" />
              <DashboardCard title="Workouts" value="0 Mins" icon="💪" color="#ff4444" />
              <DashboardCard title="Weight" value="-- kg" icon="⚖️" color="#00ff88" />
          </div>
          <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px' }}>
              <h3>🚀 Quick Actions</h3>
              <p>Select a tab from the sidebar to start tracking your progress today.</p>
          </div>
      </div>
  );

  // --- RENDER CONTENT SWITCHER ---
  const renderContent = () => {
    switch(currentView) {
        case 'dashboard': return <Dashboard />;
        case 'profile': return <Profile user={user} />;
        case 'food': return <Nutrition user={user} />;
        case 'activity': return <Fitness user={user} />;
        case 'weight': return <Weight user={user} />;
        case 'community': return <SocialAdmin user={user} />;
        default: return <Dashboard />;
    }
  };

  // --- LOGIN SCREEN ---
  if (!user) {
    return (
      <div className="bg-login" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel fade-in" style={{ padding: '40px', width: '350px' }}>
            <h2 style={{ textAlign: 'center', color: '#fff' }}>{isLogin ? 'Fitness Buddy' : 'Join the Squad'}</h2>
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {!isLogin && <input placeholder="Full Name" onChange={e => setAuthData({...authData, name: e.target.value})} className="input-field" required />}
                <input placeholder="Email" type="email" onChange={e => setAuthData({...authData, email: e.target.value})} className="input-field" required />
                <input placeholder="Password" type="password" onChange={e => setAuthData({...authData, password: e.target.value})} className="input-field" required />
                <button type="submit" className="primary-btn">{isLogin ? 'Login' : 'Sign Up'}</button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '20px', cursor: 'pointer', color: '#00f2ff' }} onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "New here? Create Account" : "Already have an account?"}
            </p>
        </div>
      </div>
    );
  }

  // --- MAIN APP LAYOUT ---
  return (
    <div className="bg-dashboard" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      
      {/* SIDEBAR (Left Side) */}
      <div style={{ width: '200px', padding: '30px 20px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ color: '#fff', marginBottom: '40px', textAlign: 'center', letterSpacing: '2px' }}>FIT<span style={{color:'#00f2ff'}}>BUDDY</span></h3>
        
        <NavIcon icon="🏠" label="Home" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
        <NavIcon icon="👤" label="Profile" active={currentView === 'profile'} onClick={() => setCurrentView('profile')} />
        <NavIcon icon="⚖️" label="Weight" active={currentView === 'weight'} onClick={() => setCurrentView('weight')} />
        <NavIcon icon="🥗" label="Nutrition" active={currentView === 'food'} onClick={() => setCurrentView('food')} />
        <NavIcon icon="💪" label="Fitness" active={currentView === 'activity'} onClick={() => setCurrentView('activity')} />
        <NavIcon icon="💬" label="Community" active={currentView === 'community'} onClick={() => setCurrentView('community')} />

        <div style={{ marginTop: 'auto' }}>
            <button onClick={handleLogout} className="danger-btn" style={{ width: '100%' }}>Logout</button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {renderContent()}
      </div>
    </div>
  );
}

export default App;