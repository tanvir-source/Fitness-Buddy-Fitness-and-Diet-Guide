import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const Step = ({ user, onUpdate }) => {
    const [steps, setSteps] = useState([]);
    const [todaySteps, setTodaySteps] = useState(0);
    const [stepInput, setStepInput] = useState('');
    const [goal, setGoal] = useState(10000);
    const [editingGoal, setEditingGoal] = useState(false); 
    const [tempGoal, setTempGoal] = useState(10000);
    const [loading, setLoading] = useState(true);

    // Steps to calories conversion (approximate: 1 step ≈ 0.04 calories)
    const CALORIES_PER_STEP = 0.04;

    const fetchSteps = async () => {
        if (!user?.email) return;
        
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/steps?email=${user.email}`);
            if (res.ok) {
                const data = await res.json();
                setSteps(data);
                
                // Get today's steps
                const today = new Date().toISOString().split('T')[0];
                const todayData = data.find(s => s.date === today);
                setTodaySteps(todayData ? todayData.steps : 0);
                
                // Get goal from latest entry or use default
                if (data.length > 0 && data[0].goal) {
                    setGoal(data[0].goal);
                    setTempGoal(data[0].goal);
                }
            } else {
                console.error('Failed to fetch steps:', await res.text());
            }
        } catch (err) {
            console.error('Fetch steps error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSteps = async (e) => {
        e.preventDefault();
        if (!user?.email || !stepInput) {
            alert('Please enter steps');
            return;
        }

        const stepsToAdd = Number(stepInput);
        if (isNaN(stepsToAdd) || stepsToAdd <= 0) {
            alert('Please enter a valid number of steps');
            return;
        }

        try {
            console.log('Sending step data:', {
                user_email: user.email,
                steps: stepsToAdd,
                goal: goal,
                date: new Date().toISOString().split('T')[0]
            });

            const res = await fetch('http://localhost:5000/api/steps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: user.email,
                    steps: stepsToAdd,
                    goal: goal,
                    date: new Date().toISOString().split('T')[0]
                })
            });

            if (res.ok) {
                const result = await res.json();
                console.log('Steps added successfully:', result);
                setStepInput('');
                await fetchSteps();
                if (onUpdate) onUpdate();
            } else {
                const errorText = await res.text();
                console.error('Server error:', errorText);
                alert(`Failed to add steps: ${errorText}`);
            }
        } catch (err) {
            console.error('Add steps error:', err);
            alert(`Error adding steps: ${err.message}`);
        }
    };

    const handleUpdateGoal = async () => {
        if (!user?.email) return;

        const newGoal = Number(tempGoal);
        if (newGoal < 1000 || newGoal > 50000) {
            alert('Goal must be between 1,000 and 50,000 steps');
            return;
        }

        setGoal(newGoal);
        setEditingGoal(false);

        // Update goal in database
        try {
            const res = await fetch('http://localhost:5000/api/steps/goal', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: user.email,
                    goal: newGoal
                })
            });
            
            if (res.ok) {
                await fetchSteps();
            } else {
                console.error('Failed to update goal:', await res.text());
            }
        } catch (err) {
            console.error('Update goal error:', err);
        }
    };

    useEffect(() => {
        fetchSteps();
    }, [user]);

    // Calculate stats
    const todayCalories = Math.round(todaySteps * CALORIES_PER_STEP);
    const progressPercent = Math.min(Math.round((todaySteps / goal) * 100), 100);
    const remainingSteps = Math.max(goal - todaySteps, 0);

    // Get weekly data for chart (last 7 days)
    const getWeeklyData = () => {
        const last7Days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            const stepData = steps.find(s => s.date === dateStr);
            last7Days.push({
                date: dateStr,
                day: dayName,
                steps: stepData ? stepData.steps : 0,
                goal: goal
            });
        }
        
        return last7Days;
    };

    const weeklyData = getWeeklyData();
    const weeklyTotal = weeklyData.reduce((sum, day) => sum + day.steps, 0);
    const weeklyAverage = Math.round(weeklyTotal / 7);

    return (
        <div className="glass-panel fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ color: '#00f2ff', margin: 0 }}>👣 Step Counter</h2>
                
                {/* Goal Setting */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {editingGoal ? (
                        <>
                            <input
                                type="number"
                                value={tempGoal}
                                onChange={(e) => setTempGoal(e.target.value)}
                                style={{
                                    width: '100px',
                                    padding: '8px',
                                    borderRadius: '5px',
                                    border: '1px solid #00f2ff',
                                    background: 'rgba(0,0,0,0.3)',
                                    color: 'white',
                                    textAlign: 'center'
                                }}
                            />
                            <button onClick={handleUpdateGoal} className="primary-btn" style={{ padding: '8px 15px' }}>
                                ✓
                            </button>
                            <button 
                                onClick={() => {
                                    setEditingGoal(false);
                                    setTempGoal(goal);
                                }}
                                style={{
                                    padding: '8px 15px',
                                    background: '#ff4444',
                                    border: 'none',
                                    borderRadius: '5px',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                ✕
                            </button>
                        </>
                    ) : (
                        <>
                            <span style={{ color: '#aaa', fontSize: '0.9rem' }}>Daily Goal:</span>
                            <span style={{ color: '#00f2ff', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                {goal.toLocaleString()}
                            </span>
                            <button 
                                onClick={() => setEditingGoal(true)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #00f2ff',
                                    color: '#00f2ff',
                                    padding: '5px 10px',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem'
                                }}
                            >
                                Edit
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', marginBottom: '30px' }}>
                
                {/* LEFT: Today's Progress */}
                <div>
                    {/* Circular Progress */}
                    <div style={{
                        background: 'rgba(0,0,0,0.3)',
                        padding: '30px',
                        borderRadius: '20px',
                        textAlign: 'center',
                        borderTop: '4px solid #00f2ff',
                        marginBottom: '20px'
                    }}>
                        {/* Circle */}
                        <div style={{
                            width: '200px',
                            height: '200px',
                            margin: '0 auto 20px',
                            position: 'relative'
                        }}>
                            <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
                                {/* Background Circle */}
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="90"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="15"
                                />
                                {/* Progress Circle */}
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="90"
                                    fill="none"
                                    stroke="#00f2ff"
                                    strokeWidth="15"
                                    strokeDasharray={`${2 * Math.PI * 90}`}
                                    strokeDashoffset={`${2 * Math.PI * 90 * (1 - progressPercent / 100)}`}
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                                />
                            </svg>
                            
                            {/* Center Text */}
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#00f2ff' }}>
                                    {progressPercent}%
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#777' }}>of goal</div>
                            </div>
                        </div>

                        {/* Today's Steps */}
                        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fff', marginBottom: '10px' }}>
                            {todaySteps.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '1rem', color: '#aaa', marginBottom: '20px' }}>steps today</div>

                        {/* Stats Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px' }}>
                                <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '5px' }}>Remaining</div>
                                <div style={{ fontSize: '1.5rem', color: '#ff9100', fontWeight: 'bold' }}>
                                    {remainingSteps.toLocaleString()}
                                </div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px' }}>
                                <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '5px' }}>Calories</div>
                                <div style={{ fontSize: '1.5rem', color: '#00ff88', fontWeight: 'bold' }}>
                                    {todayCalories}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Manual Entry Form */}
                    <div style={{
                        background: 'rgba(0,0,0,0.3)',
                        padding: '20px',
                        borderRadius: '15px',
                        borderTop: '3px solid #00f2ff'
                    }}>
                        <h3 style={{ color: '#00f2ff', marginTop: 0, fontSize: '1rem' }}>Add Steps</h3>
                        <form onSubmit={handleAddSteps} style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="number"
                                placeholder="Enter steps"
                                value={stepInput}
                                onChange={(e) => setStepInput(e.target.value)}
                                required
                                min="1"
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'rgba(255,255,255,0.1)',
                                    color: 'white'
                                }}
                            />
                            <button type="submit" className="primary-btn">
                                Add
                            </button>
                        </form>
                        <p style={{ fontSize: '0.75rem', color: '#777', marginTop: '10px', marginBottom: 0 }}>
                            💡 Tip: Most fitness trackers can sync steps. Add manually if needed.
                        </p>
                    </div>
                </div>

                {/* RIGHT: Weekly Chart */}
                <div>
                    {/* Weekly Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                        <div style={{
                            background: 'rgba(0,0,0,0.3)',
                            padding: '20px',
                            borderRadius: '12px',
                            borderTop: '3px solid #00f2ff'
                        }}>
                            <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>WEEKLY TOTAL</div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#00f2ff' }}>
                                {weeklyTotal.toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#777' }}>steps this week</div>
                        </div>
                        <div style={{
                            background: 'rgba(0,0,0,0.3)',
                            padding: '20px',
                            borderRadius: '12px',
                            borderTop: '3px solid #ff9100'
                        }}>
                            <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>DAILY AVERAGE</div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#ff9100' }}>
                                {weeklyAverage.toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#777' }}>steps per day</div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div style={{
                        background: 'rgba(0,0,0,0.3)',
                        padding: '25px',
                        borderRadius: '15px',
                        borderTop: '3px solid #00f2ff'
                    }}>
                        <h3 style={{ color: '#00f2ff', marginTop: 0, marginBottom: '20px', fontSize: '1.1rem' }}>
                            Weekly Progress
                        </h3>
                        
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '60px', color: '#777' }}>
                                Loading chart...
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis 
                                        dataKey="day" 
                                        stroke="#777" 
                                        tick={{ fontSize: 12 }} 
                                        tickLine={false} 
                                        axisLine={false} 
                                    />
                                    <YAxis 
                                        stroke="#777" 
                                        tickLine={false} 
                                        axisLine={false}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip 
                                        contentStyle={{
                                            backgroundColor: 'rgba(0,0,0,0.9)',
                                            border: '1px solid #00f2ff',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                        itemStyle={{ color: '#00f2ff' }}
                                    />
                                    <ReferenceLine 
                                        y={goal} 
                                        stroke="#ff9100" 
                                        strokeDasharray="5 5"
                                        label={{ value: 'Goal', fill: '#ff9100', fontSize: 12 }}
                                    />
                                    <Bar 
                                        dataKey="steps" 
                                        fill="#00f2ff" 
                                        radius={[8, 8, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Streak & Achievements */}
                    <div style={{
                        marginTop: '20px',
                        background: 'rgba(0, 255, 136, 0.1)',
                        padding: '20px',
                        borderRadius: '12px',
                        borderLeft: '4px solid #00ff88'
                    }}>
                        <h4 style={{ color: '#00ff88', marginTop: 0, fontSize: '1rem' }}>🏆 Achievements</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem' }}>
                                    {weeklyData.filter(d => d.steps >= goal).length >= 7 ? '🔥' : 
                                     weeklyData.filter(d => d.steps >= goal).length >= 5 ? '⭐' :
                                     weeklyData.filter(d => d.steps >= goal).length >= 3 ? '👍' : '💪'}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#00ff88', fontWeight: 'bold' }}>
                                    {weeklyData.filter(d => d.steps >= goal).length}/7
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#777' }}>Goals Hit</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem' }}>
                                    {weeklyTotal >= goal * 7 ? '🎯' : '🎪'}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#00ff88', fontWeight: 'bold' }}>
                                    {Math.round((weeklyTotal / (goal * 7)) * 100)}%
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#777' }}>Weekly Goal</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem' }}>
                                    {Math.round(weeklyTotal * CALORIES_PER_STEP) >= 2000 ? '🔥' : '💧'}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#00ff88', fontWeight: 'bold' }}>
                                    {Math.round(weeklyTotal * CALORIES_PER_STEP)}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#777' }}>Cal Burned</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {!loading && steps.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: 'rgba(0, 242, 255, 0.05)',
                    borderRadius: '15px',
                    border: '2px dashed rgba(0, 242, 255, 0.3)'
                }}>
                    <div style={{ fontSize: '5rem', marginBottom: '20px' }}>👣</div>
                    <h3 style={{ color: '#00f2ff', marginBottom: '10px' }}>Start Tracking Your Steps!</h3>
                    <p style={{ color: '#777', marginBottom: '20px' }}>
                        Add your first step count to begin tracking your daily activity.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Step;