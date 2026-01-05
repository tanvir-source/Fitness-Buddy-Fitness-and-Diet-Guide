import { useState, useEffect, useCallback } from 'react';
import './App.css';

// Components
import Nutrition from './components/Nutrition';
import Fitness from './components/Fitness';
import SocialAdmin from './components/SocialAdmin';
import Weight from './components/Weight';
import Profile from './components/Profile';
import Recipe from './components/Recipe';
import WaterLog from './components/WaterLog';
import BmiBmr from './components/BmiBmr';
import Step from './components/Step';
import MealPlanner from './components/MealPlanner';
import Report from './components/Report';
import ForgotPassword from './components/ForgotPassword';
import AdminPanel from './components/AdminPanel';

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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [authData, setAuthData] = useState({ name: '', email: '', password: '' });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Load user from localStorage with proper validation
  useEffect(() => {
    const savedUser = localStorage.getItem('fitnessUser');
    
    if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.email) {
          setUser(parsedUser);
          // Set default view based on role
          if (parsedUser.role === 'admin') {
            setCurrentView('admin');
          }
        } else {
          localStorage.removeItem('fitnessUser');
          setUser(null);
        }
      } catch (err) {
        console.error('Error parsing user from localStorage:', err);
        localStorage.removeItem('fitnessUser');
        setUser(null);
      }
    } else {
      localStorage.removeItem('fitnessUser');
      setUser(null);
    }
  }, []);

  // Save user to localStorage
  useEffect(() => {
    if (user && user.email) {
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
          // Set initial view based on role
          if (data.user.role === 'admin') {
            setCurrentView('admin');
          } else {
            setCurrentView('dashboard');
          }
        } else {
          alert('✅ Account created! Please login.');
          setIsLogin(true);
        }
      } else {
        alert(data.error || data.message || 'Error');
      }
    } catch (err) { 
      console.error(err);
      alert('Connection error. Please check if backend is running.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsLogin(true);
    setCurrentView('dashboard');
    localStorage.removeItem('fitnessUser');
  };

  // User Dashboard Component (for regular users)
  const Dashboard = () => {
    const [viewMode, setViewMode] = useState('daily');
    const [stats, setStats] = useState({
      calsEaten: 0,
      calsBurned: 0,
      workoutMins: 0,
      weight: '--',
      waterML: 0
    });
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState([]);

    const fetchData = useCallback(async () => {
      if (!user?.email) return;
      setLoading(true);
      try {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const today = `${yyyy}-${mm}-${dd}`;
        
        const [foodRes, actRes, weightRes, waterRes, annRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/food?email=${user.email}`),
          fetch(`${API_BASE_URL}/api/activity?email=${user.email}`),
          fetch(`${API_BASE_URL}/api/weight?email=${user.email}`),
          fetch(`${API_BASE_URL}/api/water/total/${today}?email=${user.email}`),
          fetch(`${API_BASE_URL}/api/admin/announcements/active?email=${user.email}`)
        ]);

        const [foodData, actData, weightData, waterData, annData] = await Promise.all([
          foodRes.json(),
          actRes.json(),
          weightRes.json(),
          waterRes.json(),
          annRes.ok ? annRes.json() : []
        ]);

        const totalFood = Array.isArray(foodData) ? foodData.reduce((acc, item) => acc + (Number(item.calories) || 0), 0) : 0;
        const totalMins = Array.isArray(actData) ? actData.reduce((acc, item) => acc + (Number(item.duration) || 0), 0) : 0;
        const totalBurn = Array.isArray(actData) ? actData.reduce((acc, item) => acc + (Number(item.calories) || 0), 0) : 0;
        const latestWeight = (Array.isArray(weightData) && weightData.length > 0) ? weightData[weightData.length - 1].weight : '--';
        const waterTotal = waterData.total || 0;

        setStats({ calsEaten: totalFood, calsBurned: totalBurn, workoutMins: totalMins, weight: latestWeight, waterML: waterTotal });
        setAnnouncements(annData);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }, [user?.email, refreshTrigger, viewMode]);

    useEffect(() => {
      fetchData();
    }, [fetchData]);

const handleDismissAnnouncement = async (announcementId) => {
    console.log('🔍 Dismiss clicked for announcement:', announcementId);
    console.log('🔍 User email:', user.email);
    console.log('🔍 API URL:', `${API_BASE_URL}/api/admin/announcements/${announcementId}/dismiss`);
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/announcements/${announcementId}/dismiss`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email })
        });

        console.log('🔍 Response status:', res.status);
        const data = await res.json();
        console.log('🔍 Response data:', data);

        if (res.ok) {
            console.log('✅ Dismiss successful, filtering announcements');
            setAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
        } else {
            console.error('❌ Dismiss failed:', data);
            alert('Failed to dismiss announcement: ' + (data.error || 'Unknown error'));
        }
    } catch (err) {
        console.error('❌ Dismiss error:', err);
        alert('Error dismissing announcement: ' + err.message);
    }
};

    const getAnnouncementColor = (type) => {
      switch(type) {
        case 'urgent': return '#ff4444';
        case 'warning': return '#ffa502';
        case 'success': return '#00ff88';
        default: return '#00f2ff';
      }
    };

    if (loading) {
      return <div className="fade-in"><p style={{ textAlign: 'center', padding: '40px' }}>Loading...</p></div>;
    }

    return (
      <div className="fade-in">
        {/* Announcements Section */}
        {announcements.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            {announcements.map(ann => (
              <div key={ann.id} style={{
                background: `rgba(${
                  ann.type === 'urgent' ? '255, 68, 68' :
                  ann.type === 'warning' ? '255, 165, 2' :
                  ann.type === 'success' ? '0, 255, 136' : '0, 242, 255'
                }, 0.1)`,
                border: `1px solid ${getAnnouncementColor(ann.type)}`,
                borderLeft: `4px solid ${getAnnouncementColor(ann.type)}`,
                padding: '15px',
                borderRadius: '10px',
                marginBottom: '15px',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 5px 0', color: getAnnouncementColor(ann.type) }}>
                      {ann.type === 'urgent' && '🚨 '}
                      {ann.type === 'warning' && '⚠️ '}
                      {ann.type === 'success' && '✅ '}
                      {ann.type === 'info' && 'ℹ️ '}
                      {ann.title}
                    </h4>
                    <p style={{ margin: 0, color: '#fff', lineHeight: '1.6' }}>{ann.message}</p>
                    <p style={{ 
                      margin: '8px 0 0 0', 
                      fontSize: '0.75rem', 
                      color: '#777' 
                    }}>
                      {new Date(ann.timestamp || ann.createdAt).toLocaleString()}
                    </p>
                  </div>
                  
                  {/* Dismiss Button */}
                  <button
                    onClick={() => handleDismissAnnouncement(ann.id)}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      marginLeft: '15px',
                      transition: 'all 0.3s',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={e => {
                      e.target.style.background = 'rgba(255,255,255,0.2)';
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={e => {
                      e.target.style.background = 'rgba(255,255,255,0.1)';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    ✕ Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>👋 Welcome back, <span style={{ color: '#00f2ff' }}>{user.name}</span></h2>

          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '5px' }}>
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
          <DashboardCard title="Calories Eaten" value={stats.calsEaten} subtext="Calories Taken" icon="🥗" color="#00f2ff" />
          <DashboardCard title="Calories Burned" value={stats.calsBurned} icon="🔥" subtext="Calories Burned!" color="#ff4444" />
          <DashboardCard title="Workout Time" value={`${stats.workoutMins} m`} subtext="Minutes Active" icon="⏱️" color="#ff9100" />
          <DashboardCard title="Current Weight" value={`${stats.weight} kg`} subtext="Latest Log" icon="⚖️" color="#a55eea" />
          <DashboardCard title="Water Consumed" value={`${stats.waterML} ml`} subtext="Hydration" icon="💧" color="#00aaff" />
        </div>

        <div style={{ marginTop: '30px', padding: '30px', background: 'linear-gradient(to right, rgba(0, 242, 255, 0.1), transparent)', borderRadius: '15px', borderLeft: '5px solid #00f2ff' }}>
          <h3>🚀 {viewMode === 'daily' ? "Today's Focus" : viewMode === 'monthly' ? "This Month's Progress" : "Yearly Overview"}</h3>
          <p style={{ color: '#aaa' }}>
            You have consumed <strong style={{ color: '#fff' }}>{stats.calsEaten}</strong> calories and burned <strong style={{ color: '#fff' }}>{stats.calsBurned}</strong> {viewMode}.
            {stats.calsEaten > stats.calsBurned ? " You are in a surplus." : " You are in a deficit."}
          </p>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    // Admin users only see admin dashboard
    if (user?.role === 'admin') {
      return <AdminPanel user={user} />;
    }

    // Regular users see all features EXCEPT admin
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'profile': return <Profile user={user} onUpdate={triggerRefresh} />;
      case 'food': return <Nutrition user={user} onUpdate={triggerRefresh} />;
      case 'mealplan': return <MealPlanner user={user} />;
      case 'activity': return <Fitness user={user} onUpdate={triggerRefresh} />;
      case 'steps': return <Step user={user} onUpdate={triggerRefresh} />;
      case 'weight': return <Weight user={user} onUpdate={triggerRefresh} />;
      case 'bmibmr': return <BmiBmr user={user} />;
      case 'recipe': return <Recipe user={user} onUpdate={triggerRefresh} />;
      case 'water': return <WaterLog user={user} onUpdate={triggerRefresh} />;
      case 'report': return <Report user={user} />;
      case 'community': return <SocialAdmin user={user} />;
      case 'admin': 
        // Prevent non-admins from accessing admin panel
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
      default: return <Dashboard />;
    }
  };

  // Login/Signup Screen
  if (!user) {
    if (showForgotPassword) {
      return (
        <div className="bg-login" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ForgotPassword onBack={() => setShowForgotPassword(false)} />
        </div>
      );
    }

    return (
      <div className="bg-login" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel fade-in" style={{ padding: '40px', width: '350px' }}>
          <h2 style={{ textAlign: 'center', color: '#fff' }}>{isLogin ? 'Fitness Buddy' : 'Join the Squad'}</h2>
          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {!isLogin && <input placeholder="Full Name" onChange={e => setAuthData({ ...authData, name: e.target.value })} required />}
            <input placeholder="Email" type="email" onChange={e => setAuthData({ ...authData, email: e.target.value })} required />
            <input placeholder="Password" type="password" onChange={e => setAuthData({ ...authData, password: e.target.value })} required />
            <button type="submit" className="primary-btn">{isLogin ? 'Login' : 'Sign Up'}</button>
          </form>
          
          {isLogin && (
            <p style={{ textAlign: 'center', marginTop: '15px' }}>
              <button 
                onClick={() => setShowForgotPassword(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffa502',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '0.9rem'
                }}
              >
                Forgot Password?
              </button>
            </p>
          )}
          
          <p style={{ textAlign: 'center', marginTop: '20px', cursor: 'pointer', color: '#00f2ff' }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "New here? Create Account" : "Already have an account?"}
          </p>
        </div>
      </div>
    );
  }

  // Admin Layout (simplified - only admin dashboard)
  if (user.role === 'admin') {
    return (
      <div className="bg-admin" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {/* Simple Admin Sidebar */}
        <div style={{ 
          width: '200px', 
          background: 'rgba(139, 0, 0, 0.3)', 
          backdropFilter: 'blur(10px)', 
          display: 'flex', 
          flexDirection: 'column',
          height: '100vh'
        }}>
          <div style={{ padding: '30px 20px' }}>
            <h3 style={{ color: '#ff4444', textAlign: 'center', letterSpacing: '2px' }}>
              👑 ADMIN
            </h3>
          </div>
          
          <div style={{ flex: 1, padding: '0 20px' }}>
            <NavIcon icon="🏠" label="Dashboard" active={true} onClick={() => {}} />
          </div>

          <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={handleLogout} className="danger-btn" style={{ width: '100%' }}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Admin Content */}
        <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          {renderContent()}
        </div>
      </div>
    );
  }

  // Regular User Layout (full feature set)
  return (
    <div className="bg-dashboard" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ 
        width: '200px', 
        background: 'rgba(0,0,0,0.6)', 
        backdropFilter: 'blur(10px)', 
        display: 'flex', 
        flexDirection: 'column',
        height: '100vh'
      }}>
        <div style={{ padding: '30px 20px 20px' }}>
          <h3 style={{ color: '#fff', marginBottom: '0', textAlign: 'center', letterSpacing: '2px' }}>
            FIT<span style={{ color: '#00f2ff' }}>BUDDY</span>
          </h3>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px', paddingBottom: '20px' }}>
            <NavIcon icon="🏠" label="Home" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
            <NavIcon icon="👤" label="Profile" active={currentView === 'profile'} onClick={() => setCurrentView('profile')} />
            <NavIcon icon="⚖️" label="Weight" active={currentView === 'weight'} onClick={() => setCurrentView('weight')} />
            <NavIcon icon="📊" label="BMI/BMR" active={currentView === 'bmibmr'} onClick={() => setCurrentView('bmibmr')} />
            <NavIcon icon="🥗" label="Nutrition" active={currentView === 'food'} onClick={() => setCurrentView('food')} />
            <NavIcon icon="🍽️" label="Meal Plans" active={currentView === 'mealplan'} onClick={() => setCurrentView('mealplan')} />
            <NavIcon icon="🍳" label="Recipe" active={currentView === 'recipe'} onClick={() => setCurrentView('recipe')} />
            <NavIcon icon="💧" label="Water" active={currentView === 'water'} onClick={() => setCurrentView('water')} />
            <NavIcon icon="💪" label="Fitness" active={currentView === 'activity'} onClick={() => setCurrentView('activity')} />
            <NavIcon icon="👣" label="Steps" active={currentView === 'steps'} onClick={() => setCurrentView('steps')} />
            <NavIcon icon="📈" label="Reports" active={currentView === 'report'} onClick={() => setCurrentView('report')} />
            <NavIcon icon="💬" label="Community" active={currentView === 'community'} onClick={() => setCurrentView('community')} />
  
  {/* Only show Admin option if user is admin */}
  {user?.role === 'admin' && (
    <NavIcon icon="👑" label="Admin" active={currentView === 'admin'} onClick={() => setCurrentView('admin')} />
  )}
</div>

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} className="danger-btn" style={{ width: '100%' }}>
            🚪 Logout
          </button>
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