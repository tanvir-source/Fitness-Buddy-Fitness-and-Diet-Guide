import { useState, useEffect, useCallback } from 'react'; 
import './App.css';

// Components
import Nutrition from './components/Nutrition';
import Fitness from './components/Fitness';
import SocialAdmin from './components/SocialAdmin';
import Weight from './components/Weight';
import Profile from './components/Profile';
import Recipe from './components/Recipe';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Navigation Icon Component
const NavIcon = ({ icon, label, active, onClick }) => (
    <div onClick={onClick} style={{
        cursor: 'pointer', 
        padding: '12px 15px', 
        borderRadius: '12px',
        background: active ? 'linear-gradient(45deg, #00f2ff, #00aaff)' : 'transparent',
        color: active ? '#000' : '#aaa', 
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

// Dashboard Card Component
const DashboardCard = ({ title, value, subtext, icon, color }) => (
    <div className="glass-panel" style={{ 
        flex: 1, 
        minWidth: '200px', 
        textAlign: 'center', 
        borderTop: `4px solid ${color}`, 
        position: 'relative', 
        overflow: 'hidden'
    }}>
        <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '5rem', opacity: 0.1, color: color }}>{icon}</div>
        <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{icon}</div>
        <h3 style={{ margin: '5px 0', color: '#ccc', fontSize: '0.9rem', textTransform: 'uppercase' }}>{title}</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>{value}</p>
        <p style={{ fontSize: '0.8rem', color: color, margin: 0 }}>{subtext}</p>
    </div>
);

function App() {
  const [user, setUser] = useState(null); 
  const [isLogin, setIsLogin] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard'); 
  const [authData, setAuthData] = useState({ name: '', email: '', password: '' });
  
  // ✅ ADD REFRESH TRIGGER
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // ✅ FUNCTION TO TRIGGER REFRESH
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('fitnessUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('fitnessUser');
      }
    }
  }, []);

  // Save user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('fitnessUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('fitnessUser');
    }
  }, [user]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? `${API_BASE_URL}/api/users/login` : `${API_BASE_URL}/api/users`;
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

  const handleLogout = () => { 
    setUser(null); 
    setIsLogin(true);
    localStorage.removeItem('fitnessUser');
  };

  // Dashboard Component
  const Dashboard = () => {
      const [viewMode, setViewMode] = useState('daily');
      const [stats, setStats] = useState({ 
          calsEaten: 0, 
          calsBurned: 0, 
          workoutMins: 0, 
          weight: '--' 
      });
      const [loading, setLoading] = useState(true);

      const fetchData = useCallback(async () => {
          if (!user?.email) return;
          setLoading(true);
          try {
              const [foodRes, actRes, weightRes] = await Promise.all([
                  fetch(`${API_BASE_URL}/api/food?email=${user.email}`),
                  fetch(`${API_BASE_URL}/api/activity?email=${user.email}`),
                  fetch(`${API_BASE_URL}/api/weight?email=${user.email}`)
              ]);

              const [foodData, actData, weightData] = await Promise.all([
                  foodRes.json(),
                  actRes.json(),
                  weightRes.json()
              ]);

              const totalFood = Array.isArray(foodData) ? foodData.reduce((acc, item) => acc + (Number(item.calories) || 0), 0) : 0;
              const totalMins = Array.isArray(actData) ? actData.reduce((acc, item) => acc + (Number(item.duration) || 0), 0) : 0;
              const totalBurn = Array.isArray(actData) ? actData.reduce((acc, item) => acc + (Number(item.calories) || 0), 0) : 0;
              const latestWeight = (Array.isArray(weightData) && weightData.length > 0) ? weightData[weightData.length - 1].weight : '--';

              setStats({ calsEaten: totalFood, calsBurned: totalBurn, workoutMins: totalMins, weight: latestWeight });
          } catch (err) { 
              console.error("Error:", err);
          } finally {
              setLoading(false);
          }
      }, [user?.email, refreshTrigger, viewMode]);

      useEffect(() => {
          fetchData();
      }, [fetchData]);

      if (loading) {
          return <div className="fade-in"><p style={{textAlign:'center',padding:'40px'}}>Loading...</p></div>;
      }

      return (
          <div className="fade-in">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                  <h2 style={{ margin: 0 }}>👋 Welcome back, <span style={{ color: '#00f2ff' }}>{user.name}</span></h2>
                  
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
              
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <DashboardCard title="Calories Eaten" value={stats.calsEaten} subtext="/ 2000 Target" icon="🥗" color="#00f2ff" />
                  <DashboardCard title="Calories Burned" value={stats.calsBurned} subtext="Great job!" icon="🔥" color="#ff4444" />
                  <DashboardCard title="Workout Time" value={`${stats.workoutMins} m`} subtext="Minutes Active" icon="⏱️" color="#ff9100" />
                  <DashboardCard title="Current Weight" value={`${stats.weight} kg`} subtext="Latest Log" icon="⚖️" color="#a55eea" />
              </div>

              <div style={{ marginTop: '30px', padding: '30px', background: 'linear-gradient(to right, rgba(0, 242, 255, 0.1), transparent)', borderRadius: '15px', borderLeft: '5px solid #00f2ff' }}>
                  <h3>🚀 {viewMode === 'daily' ? "Today's Focus" : viewMode === 'monthly' ? "This Month's Progress" : "Yearly Overview"}</h3>
                  <p style={{ color: '#aaa' }}>
                      You have consumed <strong style={{color:'#fff'}}>{stats.calsEaten}</strong> calories and burned <strong style={{color:'#fff'}}>{stats.calsBurned}</strong> {viewMode}. 
                      {stats.calsEaten > stats.calsBurned ? " You are in a surplus." : " You are in a deficit."}
                  </p>
              </div>
          </div>
      );
  };

  // Render Content with triggerRefresh prop
  const renderContent = () => {
    switch(currentView) {
        case 'dashboard': return <Dashboard />;
        case 'profile': return <Profile user={user} onUpdate={triggerRefresh} />;
        case 'food': return <Nutrition user={user} onUpdate={triggerRefresh} />;
        case 'activity': return <Fitness user={user} onUpdate={triggerRefresh} />;
        case 'weight': return <Weight user={user} onUpdate={triggerRefresh} />;
        case 'recipe': return <Recipe user={user} onUpdate={triggerRefresh} />;
        case 'community': return <SocialAdmin user={user} />;
        default: return <Dashboard />;
    }
  };

  // Login Screen
  if (!user) {
    return (
      <div className="bg-login" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel fade-in" style={{ padding: '40px', width: '350px' }}>
            <h2 style={{ textAlign: 'center', color: '#fff' }}>{isLogin ? 'Fitness Buddy' : 'Join the Squad'}</h2>
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {!isLogin && <input placeholder="Full Name" onChange={e => setAuthData({...authData, name: e.target.value})} required />}
                <input placeholder="Email" type="email" onChange={e => setAuthData({...authData, email: e.target.value})} required />
                <input placeholder="Password" type="password" onChange={e => setAuthData({...authData, password: e.target.value})} required />
                <button type="submit" className="primary-btn">{isLogin ? 'Login' : 'Sign Up'}</button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '20px', cursor: 'pointer', color: '#00f2ff' }} onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "New here? Create Account" : "Already have an account?"}
            </p>
        </div>
      </div>
    );
  }

  // Main Layout
  return (
    <div className="bg-dashboard" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      
      {/* Sidebar */}
      <div style={{ width: '200px', padding: '30px 20px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ color: '#fff', marginBottom: '40px', textAlign: 'center', letterSpacing: '2px' }}>FIT<span style={{color:'#00f2ff'}}>BUDDY</span></h3>
        
        <NavIcon icon="🏠" label="Home" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
        <NavIcon icon="👤" label="Profile" active={currentView === 'profile'} onClick={() => setCurrentView('profile')} />
        <NavIcon icon="⚖️" label="Weight" active={currentView === 'weight'} onClick={() => setCurrentView('weight')} />
        <NavIcon icon="🥗" label="Nutrition" active={currentView === 'food'} onClick={() => setCurrentView('food')} />
        <NavIcon icon="💪" label="Fitness" active={currentView === 'activity'} onClick={() => setCurrentView('activity')} />
        <NavIcon icon="🍳" label="Recipe" active={currentView === 'recipe'} onClick={() => setCurrentView('recipe')} />
        <NavIcon icon="💬" label="Community" active={currentView === 'community'} onClick={() => setCurrentView('community')} />

        <div style={{ marginTop: 'auto' }}>
            <button onClick={handleLogout} className="danger-btn" style={{ width: '100%' }}>Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {renderContent()}
      </div>
    </div>
  );
}

export default App;