import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  
  // Data States
  const [weights, setWeights] = useState([]);
  const [activities, setActivities] = useState([]);
  const [steps, setSteps] = useState([]); // NEW: Step Data

  // Form States
  const [authData, setAuthData] = useState({ name: '', email: '', password: '' });
  const [weightForm, setWeightForm] = useState({ weight: '', waist: '' });
  const [activityForm, setActivityForm] = useState({ type: 'Running', duration: '', intensity: 'Moderate' });
  const [stepForm, setStepForm] = useState({ steps: '' }); // NEW: Step Form
  
  const [message, setMessage] = useState('');

  // --- HELPERS ---
  const calculateTotalBurn = () => {
    const today = new Date().toDateString();
    
    // 1. Calories from Activities
    const activityBurn = activities
      .filter(act => new Date(act.date).toDateString() === today)
      .reduce((total, act) => total + act.caloriesBurned, 0);

    // 2. Calories from Steps (Today)
    const stepBurn = steps
      .filter(s => new Date(s.date).toDateString() === today)
      .reduce((total, s) => total + (s.calories_burned || 0), 0);

    return (activityBurn + stepBurn).toFixed(0);
  };

  const getTodaySteps = () => {
    const today = new Date().toDateString();
    const entry = steps.find(s => new Date(s.date).toDateString() === today);
    return entry ? entry.steps : 0;
  };

  // --- API CALLS ---
  const fetchUserData = async (email) => {
    const wRes = await fetch(`http://localhost:5000/api/weight?email=${email}`);
    const aRes = await fetch(`http://localhost:5000/api/activity?email=${email}`);
    const sRes = await fetch(`http://localhost:5000/api/steps?email=${email}`); // NEW

    setWeights(await wRes.json());
    setActivities(await aRes.json());
    setSteps(await sRes.json());
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'http://localhost:5000/api/login' : 'http://localhost:5000/api/users';
    const payload = isLogin ? { email: authData.email, password: authData.password } : authData;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        if (isLogin) {
          setUser(data.user);
          fetchUserData(data.user.email);
        } else {
          setIsLogin(true); setMessage('✅ Registered! Please Login.');
        }
      } else { setMessage(`❌ ${data.error}`); }
    } catch (err) { setMessage('❌ Connection Failed'); }
  };

  // ... (Existing Weight/Activity Handlers would go here, kept short for clarity) ...
  const handleAddWeight = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/weight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...weightForm, user_email: user.email }),
    });
    fetchUserData(user.email);
    setWeightForm({ weight: '', waist: '' });
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_email: user.email, activityType: activityForm.type, duration: activityForm.duration, intensity: activityForm.intensity }),
    });
    fetchUserData(user.email);
  };

  // NEW: Handle Steps
  const handleAddSteps = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/steps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_email: user.email, steps: stepForm.steps }),
    });
    fetchUserData(user.email);
    setStepForm({ steps: '' });
  };

  // --- RENDER ---
  if (!user) return (
    <div className="App-header">
      <div style={{ background: '#333', padding: '2rem', borderRadius: '10px' }}>
        <h2>{isLogin ? 'Fitness Buddy Login' : 'Join Fitness Buddy'}</h2>
        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {!isLogin && <input placeholder="Name" onChange={(e) => setAuthData({...authData, name: e.target.value})} />}
          <input placeholder="Email" onChange={(e) => setAuthData({...authData, email: e.target.value})} />
          <input type="password" placeholder="Password" onChange={(e) => setAuthData({...authData, password: e.target.value})} />
          <button type="submit">{isLogin ? 'Login' : 'Join'}</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: '#00d8ff', marginTop: '10px', cursor:'pointer' }}>
          {isLogin ? "Need account?" : "Have account?"}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', color: 'white', padding: '20px' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1>Fitness Buddy</h1>
        <button onClick={() => setUser(null)} style={{ background: '#ff4444', border: 'none', color: 'white', padding: '5px 15px', cursor: 'pointer' }}>Logout</button>
      </nav>

      {/* SUMMARY STATS */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div className="stat-card" style={{ flex: 1, background: '#2c2c2c', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '1px solid #444' }}>
           <h4 style={{margin: 0, color: '#888'}}>🔥 Total Burn</h4>
           <h2 style={{fontSize: '2rem', margin: '5px 0', color: '#ff9100'}}>{calculateTotalBurn()}</h2>
           <span style={{fontSize: '0.8rem'}}>kcal (Activities + Steps)</span>
        </div>
        <div className="stat-card" style={{ flex: 1, background: '#2c2c2c', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '1px solid #444' }}>
           <h4 style={{margin: 0, color: '#888'}}>👟 Steps Today</h4>
           <h2 style={{fontSize: '2rem', margin: '5px 0', color: '#00d8ff'}}>{getTodaySteps()}</h2>
           <span style={{fontSize: '0.8rem'}}>Goal: 10,000</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        
        {/* CARD 1: STEP TRACKER (NEW) */}
        <div style={{ background: '#2c2c2c', padding: '20px', borderRadius: '15px' }}>
          <h3>👟 Step Tracker</h3>
          <form onSubmit={handleAddSteps} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input type="number" placeholder="Enter steps (e.g. 5000)" value={stepForm.steps} onChange={(e) => setStepForm({steps: e.target.value})} style={{flex: 1, padding: '10px'}} required />
            <button type="submit" style={{ background: '#00d8ff', padding: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Add</button>
          </form>
          
          <div style={{ height: '200px' }}>
            <ResponsiveContainer>
              <BarChart data={steps}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).getDate()} stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{backgroundColor: '#333'}} />
                <ReferenceLine y={10000} stroke="red" strokeDasharray="3 3" />
                <Bar dataKey="steps" fill="#00d8ff" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p style={{fontSize: '0.8rem', textAlign: 'center', color: '#666'}}>Red line = 10k Goal</p>
        </div>

        {/* CARD 2: ACTIVITY LOG (Existing) */}
        <div style={{ background: '#2c2c2c', padding: '20px', borderRadius: '15px' }}>
          <h3>🔥 Log Activity</h3>
          <form onSubmit={handleAddActivity} style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <div style={{display: 'flex', gap: '10px'}}>
              <select onChange={(e) => setActivityForm({...activityForm, type: e.target.value})} style={{flex: 1, padding: '10px'}}>
                <option>Running</option><option>Cycling</option><option>Gym</option>
              </select>
              <input type="number" placeholder="Mins" onChange={(e) => setActivityForm({...activityForm, duration: e.target.value})} style={{width: '80px', padding: '10px'}} />
            </div>
            <button type="submit" style={{ background: '#ff9100', padding: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Add Activity</button>
          </form>
          <div style={{ marginTop: '15px', maxHeight: '150px', overflowY: 'auto' }}>
            {activities.slice(0, 3).map(act => (
              <div key={act._id} style={{ padding: '5px 0', borderBottom: '1px solid #444' }}>
                {act.activityType} - {act.caloriesBurned} kcal
              </div>
            ))}
          </div>
        </div>

        {/* CARD 3: WEIGHT GRAPH (Existing) */}
        <div style={{ background: '#2c2c2c', padding: '20px', borderRadius: '15px' }}>
          <h3>⚖️ Weight Trend</h3>
          <form onSubmit={handleAddWeight} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input type="number" placeholder="kg" value={weightForm.weight} onChange={(e) => setWeightForm({...weightForm, weight: e.target.value})} style={{flex: 1, padding: '10px'}} />
            <button type="submit" style={{ background: '#00d8ff', padding: '10px', border: 'none', cursor: 'pointer' }}>Save</button>
          </form>
          <div style={{ height: '200px' }}>
             <ResponsiveContainer>
              <LineChart data={weights}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" tick={false} stroke="#888" />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#888" />
                <Tooltip contentStyle={{backgroundColor: '#333'}} />
                <Line type="monotone" dataKey="weight" stroke="#00d8ff" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;