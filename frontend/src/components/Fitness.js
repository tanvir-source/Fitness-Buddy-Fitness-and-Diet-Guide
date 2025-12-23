import { useState, useEffect } from 'react';

// 💪 EXERCISE DATABASE (Calories burned per minute)
// 
const exerciseDatabase = [
    { type: "Running", calsPerMin: 10 },
    { type: "Cycling", calsPerMin: 8 },
    { type: "Walking", calsPerMin: 4 },
    { type: "Gym / Weightlifting", calsPerMin: 6 },
    { type: "Swimming", calsPerMin: 12 },
    { type: "Yoga", calsPerMin: 3 },
    { type: "HIIT Workout", calsPerMin: 14 },
    { type: "Basketball", calsPerMin: 9 },
];

const Fitness = ({ user }) => {
    const [activities, setActivities] = useState([]);
    const [form, setForm] = useState({ type: '', duration: '', calories: '' });
    const [burnRate, setBurnRate] = useState(0); // Stores cals/min for selected exercise

    // --- 1. FUNCTIONS ---

    const fetchActivities = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/activity?email=${user.email}`);
            
            if (res.ok) {
                const data = await res.json();
                setActivities(data);
            }
        } catch (err) { console.error(err); }
    };

    const handleSelectExercise = (e) => {
        const selected = exerciseDatabase.find(ex => ex.type === e.target.value);
        if (selected) {
            setForm({ ...form, type: selected.type });
            setBurnRate(selected.calsPerMin);
            // Auto calc if duration exists
            if (form.duration) {
                setForm(prev => ({ ...prev, type: selected.type, calories: prev.duration * selected.calsPerMin }));
            }
        } else {
            setBurnRate(0);
        }
    };

    const handleDurationChange = (e) => {
        const dur = e.target.value;
        setForm({ ...form, duration: dur });
        
        // AUTO-CALC LOGIC
        if (burnRate > 0 && dur) {
            setForm(prev => ({ ...prev, duration: dur, calories: dur * burnRate }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, user_email: user.email })
            });
            if (res.ok) {
                fetchActivities(); 
                setForm({ type: '', duration: '', calories: '' }); 
                setBurnRate(0);
            }
        } catch (err) { console.error(err); }
    };

    // --- 2. EFFECTS ---
    useEffect(() => {
        if(user) fetchActivities();
    }, [user]);

    return (
        <div className="glass-panel fade-in">
            <h2 style={{color: '#ff4444'}}>🔥 Smart Fitness Log</h2>
            
            {/* 1. Quick Select */}
            <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '0.9rem', color: '#aaa' }}>Select Activity (Auto-Calorie):</label>
                <select onChange={handleSelectExercise} style={{width: '100%', padding: '10px', borderRadius: '5px', marginTop:'5px'}}>
                    <option value="">-- Select Exercise --</option>
                    {exerciseDatabase.map((ex, i) => <option key={i} value={ex.type}>{ex.type} (~{ex.calsPerMin} cal/min)</option>)}
                </select>
            </div>

            {/* 2. Form */}
            <form onSubmit={handleSubmit} style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                <input 
                    placeholder="Activity Type" 
                    value={form.type} 
                    onChange={e => setForm({...form, type: e.target.value})} 
                    required 
                    style={{flex: 2, padding:'10px', borderRadius:'5px', border:'none'}} 
                />
                <input 
                    type="number" 
                    placeholder="Mins" 
                    value={form.duration} 
                    onChange={handleDurationChange} 
                    required 
                    style={{flex: 1, padding:'10px', borderRadius:'5px', border:'none'}} 
                />
                <input 
                    type="number" 
                    placeholder="Cals" 
                    value={form.calories} 
                    onChange={e => setForm({...form, calories: e.target.value})} 
                    required 
                    readOnly={burnRate > 0} // Make read-only if auto-calculated
                    style={{flex: 1, padding:'10px', borderRadius:'5px', border:'none', background: burnRate > 0 ? '#ddd' : '#fff'}} 
                />
                <button type="submit" className="primary-btn" style={{background: 'linear-gradient(45deg, #ff4444, #ff9100)'}}>Add</button>
            </form>

            {/* 3. List */}
            <div style={{maxHeight:'300px', overflowY:'auto'}}>
                {activities.length === 0 && <p style={{color:'#777', textAlign:'center'}}>No workouts yet. Get moving!</p>}
                
                {activities.map(item => (
                    <div key={item._id} style={{
                        background:'rgba(255,255,255,0.1)', 
                        padding:'12px', 
                        margin:'8px 0', 
                        borderRadius:'8px', 
                        display:'flex', 
                        justifyContent:'space-between', 
                        alignItems:'center',
                        borderLeft: '4px solid #ff4444'
                    }}>
                        <div>
                            <strong style={{fontSize:'1.1rem', color:'#fff'}}>{item.type}</strong>
                            <div style={{fontSize:'0.8rem', color:'#aaa'}}>{item.duration} mins</div>
                        </div>
                        <span style={{color:'#ff4444', fontWeight:'bold', fontSize:'1.2rem'}}>{item.calories} <small>kcal</small></span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Fitness;