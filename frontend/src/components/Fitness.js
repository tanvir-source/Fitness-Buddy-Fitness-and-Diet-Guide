import { useState, useEffect } from 'react';

// 🏃‍♂️ PRE-DEFINED EXERCISES & CALORIES PER MINUTE
const exerciseOptions = [
    { name: "Running (Fast)", calsPerMin: 12 },
    { name: "Running (Moderate)", calsPerMin: 10 },
    { name: "Walking", calsPerMin: 4 },
    { name: "Cycling", calsPerMin: 8 },
    { name: "Weight Lifting", calsPerMin: 6 },
    { name: "Yoga", calsPerMin: 3 },
    { name: "Swimming", calsPerMin: 11 },
    { name: "HIIT Workout", calsPerMin: 13 },
];

const Fitness = ({ user }) => {
    const [activities, setActivities] = useState([]);
    const [form, setForm] = useState({ activity: '', minutes: '', calories: '' });

    // --- 1. FETCH & SHOW NEWEST FIRST ---
    const fetchFitness = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`http://localhost:5000/api/activity?email=${user.email}`);
            
            if (res.ok) {
                const data = await res.json();
                setActivities(data);
            }
        } catch (err) { console.error(err); }
    };

    // --- 2. HANDLE FORM INPUTS & AUTO-CALC ---
    
    // When user selects an activity from dropdown
    const handleSelectActivity = (e) => {
        const selectedName = e.target.value;
        const selectedExercise = exerciseOptions.find(ex => ex.name === selectedName);
        
        let calculatedCals = form.calories;
        
        // Auto-calculate if minutes are already typed
        if (selectedExercise && form.minutes) {
            calculatedCals = selectedExercise.calsPerMin * form.minutes;
        }

        setForm({ ...form, activity: selectedName, calories: calculatedCals });
    };

    // When user types minutes
    const handleMinutesChange = (e) => {
        const mins = e.target.value;
        const selectedExercise = exerciseOptions.find(ex => ex.name === form.activity);
        
        let calculatedCals = form.calories;

        // Auto-calculate if an activity is already selected
        if (selectedExercise && mins) {
            calculatedCals = selectedExercise.calsPerMin * mins;
        }

        setForm({ ...form, minutes: mins, calories: calculatedCals });
    };

    // --- 3. SUBMIT (ADD TO TOP) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.activity || !form.minutes) return;

        const newWorkout = { 
            ...form, 
            user_email: user.email,
            date: new Date().toISOString() // Ensure we have a date
        };

        try {
            const res = await fetch('http://localhost:5000/api/fitness', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newWorkout)
            });

            if (res.ok) {
                // 🟢 OPTION A: Refresh from DB (Safe)
                fetchFitness(); 
                
                // OR 🟢 OPTION B: Instant UI Update (Fast)
                // setActivities([newWorkout, ...activities]); 

                setForm({ activity: '', minutes: '', calories: '' }); // Reset form
            }
        } catch (err) { console.error(err); }
    };

    // --- 4. LOAD DATA ON LOGIN ---
    useEffect(() => {
        if (user) fetchFitness();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return (
        <div className="glass-panel fade-in">
            <h2 style={{color: '#ffa502'}}>🔥 Smart Fitness Log</h2>
            
            {/* INPUT FORM */}
            <form onSubmit={handleSubmit} style={{marginBottom:'25px'}}>
                <label style={{color:'#aaa', fontSize:'0.9rem'}}>Select Activity (Auto-Calorie):</label>
                
                {/* Dropdown */}
                <select 
                    value={form.activity} 
                    onChange={handleSelectActivity}
                    style={{width: '100%', padding: '12px', borderRadius: '8px', marginBottom:'10px', background:'#222', color:'white', border:'1px solid #444'}}
                >
                    <option value="">-- Select Exercise --</option>
                    {exerciseOptions.map((ex, i) => (
                        <option key={i} value={ex.name}>{ex.name}</option>
                    ))}
                    <option value="Other">Other (Manual Entry)</option>
                </select>

                <div style={{display:'flex', gap:'10px'}}>
                    <input 
                        type="text" 
                        placeholder="Activity Type" 
                        value={form.activity} 
                        onChange={(e) => setForm({...form, activity: e.target.value})} 
                        required 
                        style={{flex: 2, padding:'12px', borderRadius:'8px', border:'none', background:'#222', color:'white'}} 
                    />
                    <input 
                        type="number" 
                        placeholder="Mins" 
                        value={form.minutes} 
                        onChange={handleMinutesChange} 
                        required 
                        style={{flex: 1, padding:'12px', borderRadius:'8px', border:'none', background:'#222', color:'white'}} 
                    />
                    <input 
                        type="number" 
                        placeholder="Cals" 
                        value={form.calories} 
                        onChange={(e) => setForm({...form, calories: e.target.value})} 
                        required 
                        style={{flex: 1, padding:'12px', borderRadius:'8px', border:'none', background:'#222', color:'white'}} 
                    />
                    <button type="submit" className="primary-btn" style={{background:'#ffa502', color:'#000', fontWeight:'bold'}}>Add</button>
                </div>
            </form>

            {/* WORKOUT HISTORY LIST */}
            <div style={{maxHeight:'400px', overflowY:'auto', paddingRight:'5px'}}>
                {activities.length === 0 && <p style={{textAlign:'center', color:'#777', marginTop:'20px'}}>No workouts logged yet.</p>}

                {activities.map((item, index) => (
                    <div key={item._id || index} style={{
                        background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                        padding: '15px',
                        marginBottom: '10px',
                        borderRadius: '10px',
                        borderLeft: '4px solid #ffa502',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h4 style={{margin:0, color:'#fff'}}>{item.activity}</h4>
                            <small style={{color:'#aaa'}}>{item.minutes} mins</small>
                        </div>
                        <div style={{textAlign:'right'}}>
                            <strong style={{color:'#ffa502', fontSize:'1.2rem'}}>{item.calories} kcal</strong>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Fitness;