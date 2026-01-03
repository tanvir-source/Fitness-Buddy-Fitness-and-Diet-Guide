import { useState, useEffect } from 'react';

// 💪 EXERCISE DATABASE (Calories burned per minute)
const exerciseDatabase = [
    { type: "Running (Moderate)", calsPerMin: 10 },
    { type: "Cycling", calsPerMin: 8 },
    { type: "Walking", calsPerMin: 4 },
    { type: "Gym / Weightlifting", calsPerMin: 6 },
    { type: "Swimming", calsPerMin: 12 },
    { type: "Yoga", calsPerMin: 3 },
    { type: "HIIT Workout", calsPerMin: 14 },
    { type: "Basketball", calsPerMin: 9 },
];

// 💪 EXERCISE DATABASE WITH REAL YOUTUBE VIDEOS
const exerciseVideos = {
    "Jumping Jacks": "https://www.youtube.com/embed/UpH7rm0cYbM",
    "Burpees": "https://www.youtube.com/embed/TU8QYVW0gDU",
    "High Knees": "https://www.youtube.com/embed/8opcQdC-V-U",
    "Mountain Climbers": "https://www.youtube.com/embed/nmwgirgXLYM",
    "Push-ups": "https://www.youtube.com/embed/IODxDxX7oi4",
    "Squats": "https://www.youtube.com/embed/aclHkVaku9U",
    "Plank": "https://www.youtube.com/embed/ASdvN_XEl_c",
    "Lunges": "https://www.youtube.com/embed/QOVaHwm-Q6U",
    "Dumbbell Bicep Curls": "https://www.youtube.com/embed/ykJmrZ5v0Oo",
    "Dumbbell Shoulder Press": "https://www.youtube.com/embed/qEwKCR5JCog",
    "Goblet Squats": "https://www.youtube.com/embed/MeIiIdhvXT4",
    "Bench Press": "https://www.youtube.com/embed/rT7DgCr-3pg",
    "Deadlifts": "https://www.youtube.com/embed/op9kVnSso6Q",
    "Barbell Squats": "https://www.youtube.com/embed/ultWZbUMPL8",
    "Pull-ups": "https://www.youtube.com/embed/eGo4IYlbE5g",
    "Jump Squats": "https://www.youtube.com/embed/A-cFYWvaHr0",
    "Box Jumps": "https://www.youtube.com/embed/NBY9-kTuHEk",
    "Dumbbell Rows": "https://www.youtube.com/embed/roCP6wCXPqo",
    "Shoulder Press": "https://www.youtube.com/embed/qEwKCR5JCog",
    "Barbell Rows": "https://www.youtube.com/embed/FWJR5Ve8bnQ"
};

// WORKOUT ROUTINE GENERATOR
const generateRoutine = (goal, equipment, level, duration) => {
    const routines = {
        weightLoss: {
            beginner: [
                { exercise: "Jumping Jacks", sets: 3, reps: "30 sec", rest: "30 sec" },
                { exercise: "Squats", sets: 3, reps: 12, rest: "45 sec" },
                { exercise: "Push-ups", sets: 3, reps: 8, rest: "45 sec" },
                { exercise: "Plank", sets: 3, reps: "30 sec", rest: "30 sec" }
            ],
            intermediate: [
                { exercise: "Burpees", sets: 4, reps: 12, rest: "30 sec" },
                { exercise: "Mountain Climbers", sets: 4, reps: "45 sec", rest: "30 sec" },
                { exercise: "Jump Squats", sets: 4, reps: 15, rest: "45 sec" },
                { exercise: "High Knees", sets: 4, reps: "60 sec", rest: "30 sec" }
            ],
            advanced: [
                { exercise: "Burpees", sets: 5, reps: "60 sec", rest: "20 sec" },
                { exercise: "Box Jumps", sets: 4, reps: 15, rest: "30 sec" },
                { exercise: "Mountain Climbers", sets: 5, reps: "60 sec", rest: "20 sec" },
                { exercise: "High Knees", sets: 5, reps: "90 sec", rest: "20 sec" }
            ]
        },
        muscleGain: {
            beginner: [
                { exercise: "Push-ups", sets: 4, reps: 10, rest: "60 sec" },
                { exercise: "Squats", sets: 4, reps: 12, rest: "60 sec" },
                { exercise: "Dumbbell Rows", sets: 3, reps: 10, rest: "60 sec" },
                { exercise: "Plank", sets: 3, reps: "45 sec", rest: "45 sec" }
            ],
            intermediate: [
                { exercise: "Bench Press", sets: 4, reps: 8, rest: "90 sec" },
                { exercise: "Barbell Squats", sets: 4, reps: 10, rest: "90 sec" },
                { exercise: "Pull-ups", sets: 4, reps: 8, rest: "90 sec" },
                { exercise: "Shoulder Press", sets: 3, reps: 10, rest: "60 sec" }
            ],
            advanced: [
                { exercise: "Deadlifts", sets: 5, reps: 5, rest: "120 sec" },
                { exercise: "Bench Press", sets: 5, reps: 6, rest: "120 sec" },
                { exercise: "Pull-ups", sets: 4, reps: 6, rest: "90 sec" },
                { exercise: "Barbell Rows", sets: 4, reps: 8, rest: "90 sec" }
            ]
        },
        endurance: {
            beginner: [
                { exercise: "Walking", sets: 1, reps: "15 min", rest: "2 min" },
                { exercise: "Cycling", sets: 1, reps: "15 min", rest: "2 min" },
                { exercise: "Jumping Jacks", sets: 3, reps: "10 min", rest: "2 min" }
            ],
            intermediate: [
                { exercise: "Running (Moderate)", sets: 1, reps: "25 min", rest: "3 min" },
                { exercise: "Cycling", sets: 1, reps: "20 min", rest: "2 min" },
                { exercise: "Burpees", sets: 4, reps: "12 min", rest: "2 min" }
            ],
            advanced: [
                { exercise: "Running (Moderate)", sets: 1, reps: "45 min", rest: "5 min" },
                { exercise: "HIIT Workout", sets: 10, reps: "200m", rest: "60 sec" },
                { exercise: "Swimming", sets: 1, reps: "30 min", rest: "5 min" }
            ]
        }
    };

    return routines[goal]?.[level] || [];
};

const Fitness = ({ user, onUpdate }) => {
    const [activities, setActivities] = useState([]);
    const [form, setForm] = useState({ type: '', duration: '', calories: '', intensity: 'moderate' });
    const [burnRate, setBurnRate] = useState(0);
    const [view, setView] = useState('log'); // 'log', 'routines', 'progress'
    
    // Workout Preferences
    const [preferences, setPreferences] = useState({
        goal: 'weightLoss',
        equipment: 'noEquipment',
        level: 'beginner',
        duration: 30
    });

    const [selectedExercise, setSelectedExercise] = useState(null);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [currentRoutine, setCurrentRoutine] = useState([]);

    // Fetch Activities
    const fetchActivities = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`http://localhost:5000/api/activity?email=${user.email}`);
            if (res.ok) {
                const data = await res.json();
                setActivities(data);
            }
        } catch (err) { 
            console.error(err); 
        }
    };

    const handleSelectExercise = (e) => {
        const selected = exerciseDatabase.find(ex => ex.type === e.target.value);
        if (selected) {
            setForm({ ...form, type: selected.type });
            setBurnRate(selected.calsPerMin);
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
                body: JSON.stringify({ 
                    ...form, 
                    user_email: user.email,
                    date: new Date().toISOString()
                })
            });
            if (res.ok) {
                fetchActivities(); 
                setForm({ type: '', duration: '', calories: '', intensity: 'moderate' }); 
                setBurnRate(0);
                if (onUpdate) onUpdate();
            }
        } catch (err) { 
            console.error(err); 
        }
    };

    // Generate Custom Routine
    const handleGenerateRoutine = () => {
        const routine = generateRoutine(
            preferences.goal,
            preferences.equipment,
            preferences.level,
            preferences.duration
        );
        setCurrentRoutine(routine);
    };

    // Progressive Overload Suggestion
    const suggestProgression = (exercise) => {
        const lastPerformance = activities
            .filter(a => a.type === exercise)
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        if (!lastPerformance) return "Start with recommended sets/reps";

        return `Last time: ${lastPerformance.duration} mins. Try ${Math.round(lastPerformance.duration * 1.1)} mins or add 1 rep!`;
    };

    useEffect(() => {
        if (user) fetchActivities();
    }, [user]);

    useEffect(() => {
        if (preferences) handleGenerateRoutine();
    }, [preferences]);

    const inputStyle = {
        width: '100%',
        padding: '14px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.2)',
        background: 'rgba(255,255,255,0.1)',
        color: 'white',
        fontSize: '1rem',
        height: '50px',
        boxSizing: 'border-box'
    };

    // RENDER VIEWS
    const renderActivityLog = () => (
        <div>
            {/* 1. Quick Select */}
            <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '6px', display: 'block' }}>Select Activity (Auto-Calorie):</label>
                <select onChange={handleSelectExercise} style={{
                    width: '100%', 
                    padding: '10px 12px', 
                    borderRadius: '8px', 
                    height: '44px',
                    background: 'rgba(255,255,255,0.1)', 
                    color: 'white', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                }}>
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
                    style={{
                        flex: 2, 
                        padding:'10px 12px', 
                        borderRadius: '8px', 
                        border:'1px solid rgba(255,255,255,0.2)', 
                        background: 'rgba(255,255,255,0.1)', 
                        color: 'white', 
                        height: '44px',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                    }} 
                />
                <input 
                    type="number" 
                    placeholder="Mins" 
                    value={form.duration} 
                    onChange={handleDurationChange} 
                    required 
                    style={{
                        flex: 1, 
                        padding:'10px 12px', 
                        borderRadius: '8px', 
                        border:'1px solid rgba(255,255,255,0.2)', 
                        background: 'rgba(255,255,255,0.1)', 
                        color: 'white', 
                        height: '44px',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                    }} 
                />
                <input 
                    type="number" 
                    placeholder="Cals" 
                    value={form.calories} 
                    onChange={e => setForm({...form, calories: e.target.value})} 
                    required 
                    readOnly={burnRate > 0}
                    style={{
                        flex: 1, 
                        padding:'10px 12px', 
                        borderRadius: '8px', 
                        border:'1px solid rgba(255,255,255,0.2)', 
                        background: burnRate > 0 ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.1)', 
                        color: 'white', 
                        height: '44px',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                    }} 
                />
                <button type="submit" className="primary-btn" style={{
                    background: 'linear-gradient(45deg, #ff4444, #ff9100)', 
                    height: '44px', 
                    padding: '0 20px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                }}>Add</button>
            </form>

            {/* 3. List */}
            <div style={{maxHeight:'400px', overflowY:'auto'}}>
                {activities.length === 0 && <p style={{color:'#777', textAlign:'center', padding: '40px'}}>No workouts yet. Get moving!</p>}
                
                {activities.map(item => (
                    <div key={item._id} style={{
                        background:'rgba(255,255,255,0.05)', 
                        padding:'15px', 
                        margin:'10px 0', 
                        borderRadius:'10px', 
                        display:'flex', 
                        justifyContent:'space-between', 
                        alignItems:'center',
                        borderLeft: '4px solid #ff4444'
                    }}>
                        <div>
                            <strong style={{fontSize:'1.1rem', color:'#fff'}}>{item.type}</strong>
                            <div style={{fontSize:'0.85rem', color:'#aaa', marginTop: '5px'}}>
                                ⏱️ {item.duration} mins | 📅 {new Date(item.date).toLocaleDateString()}
                            </div>
                        </div>
                        <span style={{color:'#ff4444', fontWeight:'bold', fontSize:'1.3rem'}}>
                            {item.calories} <small style={{fontSize: '0.7rem'}}>cal</small>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderWorkoutRoutines = () => (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <div>
                    <h3 style={{color: '#00f2ff', margin: '0 0 4px 0', fontSize: '1.3rem'}}>🎯 Workout Generator</h3>
                    <p style={{color: '#888', margin: 0, fontSize: '0.8rem'}}>Personalized routines designed just for you</p>
                </div>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(0,242,255,0.2), rgba(0,170,255,0.2))',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,242,255,0.3)'
                }}>
                    <div style={{fontSize: '0.7rem', color: '#aaa', marginBottom: '2px'}}>ESTIMATED TIME</div>
                    <div style={{fontSize: '1.2rem', fontWeight: 'bold', color: '#00f2ff'}}>{preferences.duration} min</div>
                </div>
            </div>
            
            {/* Preference Selection - Improved Design */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.4), rgba(20,20,20,0.4))',
                padding: '20px',
                borderRadius: '16px',
                marginBottom: '20px',
                border: '1px solid rgba(0,242,255,0.2)',
                boxShadow: '0 6px 24px rgba(0,0,0,0.25)'
            }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px'}}>
                    <div style={{
                        width: '3px',
                        height: '20px',
                        background: 'linear-gradient(180deg, #00f2ff, #00aaff)',
                        borderRadius: '2px'
                    }}></div>
                    <h4 style={{color: '#00f2ff', margin: 0, fontSize: '1rem'}}>Customize Your Workout</h4>
                </div>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                    <div>
                        <label style={{
                            display: 'block', 
                            color: '#bbb', 
                            marginBottom: '8px', 
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            🎯 Fitness Goal
                        </label>
                        <select
                            value={preferences.goal}
                            onChange={e => setPreferences({...preferences, goal: e.target.value})}
                            style={{
                                ...inputStyle,
                                background: 'rgba(0,0,0,0.3)',
                                border: '2px solid rgba(0,242,255,0.3)',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                height: '45px',
                                fontSize: '0.9rem'
                            }}
                        >
                            <option value="weightLoss">🔥 Weight Loss & Fat Burn</option>
                            <option value="muscleGain">💪 Muscle Gain & Strength</option>
                            <option value="endurance">⚡ Endurance & Stamina</option>
                        </select>
                    </div>

                    <div>
                        <label style={{
                            display: 'block', 
                            color: '#bbb', 
                            marginBottom: '8px', 
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            🏋️ Available Equipment
                        </label>
                        <select
                            value={preferences.equipment}
                            onChange={e => setPreferences({...preferences, equipment: e.target.value})}
                            style={{
                                ...inputStyle,
                                background: 'rgba(0,0,0,0.3)',
                                border: '2px solid rgba(0,242,255,0.3)',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                height: '45px',
                                fontSize: '0.9rem'
                            }}
                        >
                            <option value="noEquipment">🏠 No Equipment (Bodyweight)</option>
                            <option value="home">🔧 Home Gym (Dumbbells, Bands)</option>
                            <option value="gym">🏢 Full Gym Access</option>
                        </select>
                    </div>

                    <div>
                        <label style={{
                            display: 'block', 
                            color: '#bbb', 
                            marginBottom: '8px', 
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            📊 Experience Level
                        </label>
                        <select
                            value={preferences.level}
                            onChange={e => setPreferences({...preferences, level: e.target.value})}
                            style={{
                                ...inputStyle,
                                background: 'rgba(0,0,0,0.3)',
                                border: '2px solid rgba(0,242,255,0.3)',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                height: '45px',
                                fontSize: '0.9rem'
                            }}
                        >
                            <option value="beginner">🌱 Beginner - Just Starting</option>
                            <option value="intermediate">📈 Intermediate - Regular Training</option>
                            <option value="advanced">🏆 Advanced - Expert Level</option>
                        </select>
                    </div>

                    <div>
                        <label style={{
                            display: 'block', 
                            color: '#bbb', 
                            marginBottom: '8px', 
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            ⏱️ Workout Duration
                        </label>
                        <select
                            value={preferences.duration}
                            onChange={e => setPreferences({...preferences, duration: parseInt(e.target.value)})}
                            style={{
                                ...inputStyle,
                                background: 'rgba(0,0,0,0.3)',
                                border: '2px solid rgba(0,242,255,0.3)',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                height: '45px',
                                fontSize: '0.9rem'
                            }}
                        >
                            <option value={15}>⚡ Quick - 15 minutes</option>
                            <option value={30}>🎯 Standard - 30 minutes</option>
                            <option value={45}>💪 Intense - 45 minutes</option>
                            <option value={60}>🔥 Maximum - 60 minutes</option>
                        </select>
                    </div>
                </div>

                <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: 'rgba(0,242,255,0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,242,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <div style={{fontSize: '1.2rem'}}>💡</div>
                    <div style={{fontSize: '0.8rem', color: '#00f2ff', lineHeight: '1.4'}}>
                        <strong>Pro Tip:</strong> Your routine updates automatically when you change any preference. 
                        Start with beginner level if you're new!
                    </div>
                </div>
            </div>

            {/* Generated Routine - Enhanced Design */}
            {currentRoutine.length > 0 ? (
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                        padding: '15px 20px',
                        background: 'linear-gradient(90deg, rgba(0,255,136,0.15), transparent)',
                        borderRadius: '12px',
                        borderLeft: '4px solid #00ff88'
                    }}>
                        <div>
                            <h4 style={{color: '#00ff88', margin: '0 0 5px 0', fontSize: '1.2rem'}}>
                                ✨ Your Personalized Workout Plan
                            </h4>
                            <p style={{color: '#888', margin: 0, fontSize: '0.85rem'}}>
                                {currentRoutine.length} exercises • {preferences.duration} minutes • {preferences.level} level
                            </p>
                        </div>
                        <div style={{
                            background: 'rgba(0,255,136,0.2)',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            color: '#00ff88',
                            fontWeight: 'bold'
                        }}>
                            {currentRoutine.reduce((sum, ex) => sum + ex.sets, 0)} TOTAL SETS
                        </div>
                    </div>
                    
                    <div style={{display: 'grid', gap: '12px'}}>
                        {currentRoutine.map((exercise, idx) => (
                            <div key={idx} style={{
                                background: 'linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,170,255,0.08))',
                                border: '1px solid rgba(0,255,136,0.25)',
                                padding: '16px 18px',
                                borderRadius: '12px',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,255,136,0.15)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}>
                                
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px'}}>
                                    {/* Exercise Number Badge - Fixed inside */}
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        minWidth: '36px',
                                        background: 'linear-gradient(135deg, #00ff88, #00aaff)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.95rem',
                                        fontWeight: 'bold',
                                        color: '#000',
                                        boxShadow: '0 3px 10px rgba(0,255,136,0.3)'
                                    }}>
                                        {idx + 1}
                                    </div>

                                    <div style={{flex: 1}}>
                                        <h3 style={{
                                            fontSize: '1.05rem', 
                                            color: '#00ff88',
                                            margin: '0 0 8px 0',
                                            fontWeight: '600'
                                        }}>
                                            {exercise.exercise}
                                        </h3>
                                        
                                        <div style={{display: 'flex', gap: '12px', marginBottom: '8px', flexWrap: 'wrap'}}>
                                            <div style={{
                                                background: 'rgba(0,0,0,0.3)',
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '0.8rem'
                                            }}>
                                                <span style={{color: '#888'}}>Sets:</span>{' '}
                                                <span style={{color: '#fff', fontWeight: '600'}}>{exercise.sets}</span>
                                            </div>
                                            <div style={{
                                                background: 'rgba(0,0,0,0.3)',
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '0.8rem'
                                            }}>
                                                <span style={{color: '#888'}}>Reps:</span>{' '}
                                                <span style={{color: '#fff', fontWeight: '600'}}>{exercise.reps}</span>
                                            </div>
                                            <div style={{
                                                background: 'rgba(0,0,0,0.3)',
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '0.8rem'
                                            }}>
                                                <span style={{color: '#888'}}>Rest:</span>{' '}
                                                <span style={{color: '#00f2ff', fontWeight: '600'}}>{exercise.rest}</span>
                                            </div>
                                        </div>
                                        
                                        <div style={{
                                            background: 'rgba(255,145,0,0.1)',
                                            padding: '6px 10px',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            color: '#ff9100',
                                            borderLeft: '2px solid #ff9100',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            <span style={{fontSize: '0.95rem'}}>💡</span>
                                            <span>{suggestProgression(exercise.exercise)}</span>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={() => {
                                            setSelectedExercise(exercise.exercise);
                                            setShowVideoModal(true);
                                        }}
                                        style={{
                                            padding: '10px 16px',
                                            background: 'linear-gradient(135deg, #ff4444, #ff6666)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            boxShadow: '0 3px 10px rgba(255,68,68,0.25)',
                                            transition: 'all 0.3s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            whiteSpace: 'nowrap'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                            e.currentTarget.style.boxShadow = '0 4px 14px rgba(255,68,68,0.35)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.boxShadow = '0 3px 10px rgba(255,68,68,0.25)';
                                        }}
                                    >
                                        <span style={{fontSize: '1rem'}}>📹</span>
                                        Demo
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Workout Summary Card */}
                    <div style={{
                        marginTop: '20px',
                        padding: '16px',
                        background: 'linear-gradient(135deg, rgba(0,242,255,0.1), rgba(165,94,234,0.1))',
                        borderRadius: '12px',
                        border: '1px solid rgba(0,242,255,0.3)'
                    }}>
                        <h4 style={{color: '#00f2ff', marginTop: 0, marginBottom: '12px', fontSize: '0.95rem'}}>📋 Workout Summary</h4>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px'}}>
                            <div style={{textAlign: 'center'}}>
                                <div style={{fontSize: '0.7rem', color: '#888', marginBottom: '4px'}}>EXERCISES</div>
                                <div style={{fontSize: '1.6rem', fontWeight: 'bold', color: '#00f2ff'}}>
                                    {currentRoutine.length}
                                </div>
                            </div>
                            <div style={{textAlign: 'center'}}>
                                <div style={{fontSize: '0.7rem', color: '#888', marginBottom: '4px'}}>TOTAL SETS</div>
                                <div style={{fontSize: '1.6rem', fontWeight: 'bold', color: '#00ff88'}}>
                                    {currentRoutine.reduce((sum, ex) => sum + ex.sets, 0)}
                                </div>
                            </div>
                            <div style={{textAlign: 'center'}}>
                                <div style={{fontSize: '0.7rem', color: '#888', marginBottom: '4px'}}>DURATION</div>
                                <div style={{fontSize: '1.6rem', fontWeight: 'bold', color: '#ff9100'}}>
                                    {preferences.duration}m
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{
                    textAlign: 'center', 
                    padding: '60px 40px', 
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '20px',
                    border: '2px dashed rgba(255,255,255,0.1)'
                }}>
                    <div style={{fontSize: '4rem', marginBottom: '20px', opacity: 0.5}}>🏋️‍♂️</div>
                    <h3 style={{color: '#999', margin: '0 0 10px 0'}}>Ready to Start?</h3>
                    <p style={{color: '#666', margin: 0, fontSize: '0.9rem'}}>
                        Your personalized workout routine will appear here.<br/>
                        Adjust your preferences above to get started!
                    </p>
                </div>
            )}
        </div>
    );

    const renderProgress = () => (
        <div>
            <h3 style={{color: '#00f2ff', marginBottom: '20px'}}>📈 Your Progress</h3>
            
            {/* Stats Overview */}
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px'}}>
                <div style={{
                    background: 'rgba(255,68,68,0.1)',
                    padding: '20px',
                    borderRadius: '12px',
                    borderTop: '3px solid #ff4444',
                    textAlign: 'center'
                }}>
                    <div style={{fontSize: '0.85rem', color: '#aaa', marginBottom: '5px'}}>TOTAL WORKOUTS</div>
                    <div style={{fontSize: '2.5rem', fontWeight: 'bold', color: '#ff4444'}}>
                        {activities.length}
                    </div>
                </div>

                <div style={{
                    background: 'rgba(255,145,0,0.1)',
                    padding: '20px',
                    borderRadius: '12px',
                    borderTop: '3px solid #ff9100',
                    textAlign: 'center'
                }}>
                    <div style={{fontSize: '0.85rem', color: '#aaa', marginBottom: '5px'}}>TOTAL CALORIES</div>
                    <div style={{fontSize: '2.5rem', fontWeight: 'bold', color: '#ff9100'}}>
                        {activities.reduce((sum, a) => sum + (a.calories || 0), 0)}
                    </div>
                </div>

                <div style={{
                    background: 'rgba(0,255,136,0.1)',
                    padding: '20px',
                    borderRadius: '12px',
                    borderTop: '3px solid #00ff88',
                    textAlign: 'center'
                }}>
                    <div style={{fontSize: '0.85rem', color: '#aaa', marginBottom: '5px'}}>TOTAL MINUTES</div>
                    <div style={{fontSize: '2.5rem', fontWeight: 'bold', color: '#00ff88'}}>
                        {activities.reduce((sum, a) => sum + (a.duration || 0), 0)}
                    </div>
                </div>
            </div>

            {/* Activity Breakdown */}
            <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '20px',
                borderRadius: '15px'
            }}>
                <h4 style={{color: '#00f2ff', marginTop: 0}}>Activity Breakdown</h4>
                {activities.length === 0 ? (
                    <p style={{color: '#777', textAlign: 'center'}}>Start logging activities to see your progress!</p>
                ) : (
                    <div>
                        {Array.from(new Set(activities.map(a => a.type))).map(type => {
                            const typeActivities = activities.filter(a => a.type === type);
                            const totalCals = typeActivities.reduce((sum, a) => sum + a.calories, 0);
                            const totalMins = typeActivities.reduce((sum, a) => sum + a.duration, 0);
                            
                            return (
                                <div key={type} style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '12px',
                                    marginBottom: '8px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <strong style={{color: '#fff'}}>{type}</strong>
                                        <div style={{fontSize: '0.8rem', color: '#aaa'}}>
                                            {typeActivities.length} sessions
                                        </div>
                                    </div>
                                    <div style={{textAlign: 'right'}}>
                                        <div style={{color: '#ff4444', fontWeight: 'bold'}}>{totalCals} cal</div>
                                        <div style={{fontSize: '0.8rem', color: '#aaa'}}>{totalMins} mins</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="glass-panel fade-in">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h2 style={{color: '#ff4444', margin: 0}}>🔥 Smart Fitness Log</h2>
                
                {/* View Tabs */}
                <div style={{display: 'flex', gap: '10px'}}>
                    <button
                        onClick={() => setView('log')}
                        style={{
                            padding: '8px 16px',
                            background: view === 'log' ? '#ff4444' : 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '6px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        📝 Log
                    </button>
                    <button
                        onClick={() => setView('routines')}
                        style={{
                            padding: '8px 16px',
                            background: view === 'routines' ? '#ff4444' : 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '6px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        🎯 Routines
                    </button>
                    <button
                        onClick={() => setView('progress')}
                        style={{
                            padding: '8px 16px',
                            background: view === 'progress' ? '#ff4444' : 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '6px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        📈 Progress
                    </button>
                </div>
            </div>

            {view === 'log' && renderActivityLog()}
            {view === 'routines' && renderWorkoutRoutines()}
            {view === 'progress' && renderProgress()}

            {/* Video Modal */}
            {showVideoModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }} onClick={() => setShowVideoModal(false)}>
                    <div style={{
                        background: '#1a1a1a',
                        padding: '20px',
                        borderRadius: '15px',
                        maxWidth: '800px',
                        width: '90%'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
                            <h3 style={{color: '#00f2ff', margin: 0}}>{selectedExercise}</h3>
                            <button
                                onClick={() => setShowVideoModal(false)}
                                style={{
                                    background: '#ff4444',
                                    border: 'none',
                                    color: 'white',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                Close
                            </button>
                        </div>
                        <div style={{
                            position: 'relative',
                            paddingBottom: '56.25%',
                            height: 0,
                            overflow: 'hidden'
                        }}>
                            <iframe
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '10px'
                                }}
                                src={exerciseVideos[selectedExercise] || "https://www.youtube.com/embed/IODxDxX7oi4"}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title={selectedExercise}
                            />
                        </div>
                        <p style={{color: '#aaa', marginTop: '15px', fontSize: '0.9rem'}}>
                            💡 Watch the video for proper form and technique. Start slow and focus on quality over quantity!
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Fitness;