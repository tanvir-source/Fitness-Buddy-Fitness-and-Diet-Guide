import { useState } from 'react'; 
import './App.css';

// NOTE: We will import Friend's components here later
// import Nutrition from './components/Nutrition';
// import Fitness from './components/Fitness';
// import SocialAdmin from './components/SocialAdmin';

function App() {
  // --- CORE STATES (Architect's Responsibility) ---
  const [user, setUser] = useState(null); 
  const [isLogin, setIsLogin] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [message, setMessage] = useState('');
  const [authData, setAuthData] = useState({ name: '', email: '', password: '' });

  // --- HANDLERS ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'http://localhost:5000/api/login' : 'http://localhost:5000/api/users';
    const payload = isLogin ? { email: authData.email, password: authData.password } : authData;
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) {
        if (isLogin) { 
            setUser(data.user); 
            setCurrentView(data.user.email === 'admin@fitness.com' ? 'admin' : 'dashboard'); 
        } else { 
            setIsLogin(true); setMessage('✅ Registered! Please Login.'); 
        }
      } else { setMessage(`❌ ${data.error}`); }
    } catch (err) { setMessage('❌ Connection Failed'); }
  };

  const handleLogout = () => { setUser(null); setIsLogin(true); setCurrentView('dashboard'); };

  // --- RENDER CONTENT ---
  const renderContent = () => {
    switch(currentView) {
      case 'dashboard':
        return (
            <div className="fade-in">
                <div className="glass-panel">
                    <h1>Welcome, {user.name}</h1>
                    <p>Select a feature from the menu to get started.</p>
                </div>
            </div>
        );
      case 'food':
        return <div className="glass-panel"><h2>🥗 Nutrition Component Loading...</h2><p>(Friend 2 will upload this part)</p></div>;
      case 'activity':
        return <div className="glass-panel"><h2>🔥 Fitness Component Loading...</h2><p>(Friend 3 will upload this part)</p></div>;
      case 'admin':
      case 'community':
        return <div className="glass-panel"><h2>🛡️ Admin & Social Loading...</h2><p>(Friend 4 will upload this part)</p></div>;
      default:
        return <div className="glass-panel"><h2>🚧 Feature Under Construction</h2></div>;
    }
  };

  // --- LOGIN SCREEN (Architect's Work) ---
  if (!user) return (
    <div className="app-background bg-login" style={{alignItems:'center', justifyContent:'center'}}>
        <div className="glass-panel" style={{ width: '350px', textAlign: 'center', padding: '40px' }}>
            <h2 style={{fontSize:'2rem', marginBottom: '10px', color:'#00f2ff'}}>Fitness Buddy</h2>
            <p style={{color:'#aaa', marginBottom:'30px'}}>{isLogin ? 'Welcome Back!' : 'Start your journey'}</p>
            {message && <p style={{color: '#ff4444', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius:'5px'}}>{message}</p>}
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {!isLogin && <input placeholder="Name" onChange={(e) => setAuthData({...authData, name: e.target.value})} />}
                <input placeholder="Email" onChange={(e) => setAuthData({...authData, email: e.target.value})} />
                <input type="password" placeholder="Password" onChange={(e) => setAuthData({...authData, password: e.target.value})} />
                <button type="submit" className="primary-btn">{isLogin ? 'Login' : 'Join Now'}</button>
            </form>
            <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: '#00f2ff', marginTop: '20px', cursor:'pointer' }}>
                {isLogin ? "Need an account? Register" : "Already have an account? Login"}
            </button>
        </div>
    </div>
  );

  // --- MAIN APP SHELL (Architect's Work) ---
  return (
    <div className="app-background bg-dashboard">
      <div style={{ position: 'fixed', right: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: 1000 }}>
        <div className="sidebar-glass">
            <NavIcon icon="🏠" label="Home" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
            <NavIcon icon="🥗" label="Food" active={currentView === 'food'} onClick={() => setCurrentView('food')} />
            <NavIcon icon="🔥" label="Activity" active={currentView === 'activity'} onClick={() => setCurrentView('activity')} />
            <NavIcon icon="🛡️" label="Admin/Social" active={currentView === 'community'} onClick={() => setCurrentView('community')} />
        </div>
      </div>
      <div style={{ flex: 1, padding: '30px', marginRight: '90px', overflowY: 'auto' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
            <h3 style={{margin:0, fontWeight: '800', letterSpacing:'1px', color: 'white'}}>FITNESS<span style={{color:'#00f2ff'}}>BUDDY</span></h3>
            <button onClick={handleLogout} style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid #555', color: '#ccc', padding: '8px 20px', cursor: 'pointer', borderRadius: '20px' }}>Logout</button>
        </nav>
        {renderContent()}
      </div>
    </div>
  );
}

const NavIcon = ({ icon, label, active, onClick }) => (<div onClick={onClick} className={`nav-icon ${active ? 'active' : ''}`} title={label}>{icon}</div>);

export default App;