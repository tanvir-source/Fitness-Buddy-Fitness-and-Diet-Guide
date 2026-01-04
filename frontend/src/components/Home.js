import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const Home = ({ user }) => {
    const [viewMode, setViewMode] = useState('daily');
    const [stats, setStats] = useState({
        eaten: 0,
        burned: 0,
        workoutTime: 0,
        weight: '--',
        steps: 0,
        stepsGoal: 10000,
        waterConsumed: 0,
        waterGoal: 2000
    });
    const [progressData, setProgressData] = useState([]);
    const [weightProgress, setWeightProgress] = useState([]);
    const [showDetails, setShowDetails] = useState(false);
    const [healthScore, setHealthScore] = useState(0);

    // Fetch Today's Stats (Resets Daily)
    const fetchTodayStats = async () => {
        if (!user?.email) return;
       
        try {
            const today = new Date().toISOString().split('T')[0];
           
            // Fetch all data in parallel
            const [foodRes, activityRes, weightRes, waterRes] = await Promise.all([
                fetch(`http://localhost:5000/api/food?email=${user.email}`),
                fetch(`http://localhost:5000/api/activity?email=${user.email}`),
                fetch(`http://localhost:5000/api/weight?email=${user.email}`),
                fetch(`http://localhost:5000/api/water/total/${today}?email=${user.email}`)
            ]);

            const foods = foodRes.ok ? await foodRes.json() : [];
            const activities = activityRes.ok ? await activityRes.json() : [];
            const weights = weightRes.ok ? await weightRes.json() : [];
            const waterData = waterRes.ok ? await waterRes.json() : { total: 0 };

            // TODAY'S DATA ONLY (Daily Reset)
            const todayFoods = foods.filter(f => f.date === today);
            const todayActivities = activities.filter(a => a.date === today);

            // Calculate today's stats
            const eaten = todayFoods.reduce((sum, f) => sum + (f.calories || 0), 0);
            const burned = todayActivities.reduce((sum, a) => sum + (a.calories || 0), 0);
            const workoutTime = todayActivities.reduce((sum, a) => sum + (a.duration || 0), 0);
           
            // Get latest weight
            const latestWeight = weights.length > 0
                ? weights.sort((a, b) => new Date(b.date) - new Date(a.date))[0].weight
                : '--';

            // Water consumed today
            const waterConsumed = waterData.total || 0;

            setStats({
                eaten,
                burned,
                workoutTime,
                weight: latestWeight,
                steps: 0, // TODO: Connect to step tracker
                stepsGoal: 10000,
                waterConsumed,
                waterGoal: 2000
            });

            // Calculate health score
            calculateHealthScore(eaten, burned, workoutTime, waterConsumed);

        } catch (err) {
            console.error('❌ Failed to fetch stats:', err);
        }
    };

    // Calculate Health Score (0-100)
    const calculateHealthScore = (eaten, burned, workout, water) => {
        let score = 0;
       
        // Calorie balance (30 points)
        const net = eaten - burned;
        if (net < 0) score += 30; // Deficit is good for weight loss
        else if (net < 500) score += 20; // Small surplus ok
        else score += 10; // Large surplus
       
        // Workout time (30 points)
        if (workout >= 60) score += 30;
        else if (workout >= 30) score += 20;
        else if (workout >= 15) score += 10;
       
        // Hydration (25 points)
        const waterPercent = (water / 2000) * 100;
        if (waterPercent >= 100) score += 25;
        else if (waterPercent >= 75) score += 20;
        else if (waterPercent >= 50) score += 15;
        else if (waterPercent >= 25) score += 10;
       
        // Calorie intake (15 points)
        if (eaten >= 1200 && eaten <= 2000) score += 15; // Healthy range
        else if (eaten >= 1000 && eaten <= 2500) score += 10;
        else score += 5;
       
        setHealthScore(Math.min(100, score));
    };

    // Fetch Progress Data (Daily, Monthly, Yearly)
    const fetchProgressData = async () => {
        if (!user?.email) return;
        try {
            const [foodRes, activityRes, waterRes] = await Promise.all([
                fetch(`http://localhost:5000/api/food?email=${user.email}`),
                fetch(`http://localhost:5000/api/activity?email=${user.email}`),
                fetch(`http://localhost:5000/api/water?email=${user.email}`)
            ]);
           
            const foods = foodRes.ok ? await foodRes.json() : [];
            const activities = activityRes.ok ? await activityRes.json() : [];
           
            let data = [];
           
            if (viewMode === 'daily') {
                // Last 7 days
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                   
                    const dayFoods = foods.filter(f => f.date === dateStr);
                    const dayActivities = activities.filter(a => a.date === dateStr);
                   
                    // Fetch water for this day
                    const waterRes = await fetch(`http://localhost:5000/api/water/total/${dateStr}?email=${user.email}`);
                    const waterData = waterRes.ok ? await waterRes.json() : { total: 0 };
                   
                    data.push({
                        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        eaten: dayFoods.reduce((sum, f) => sum + (f.calories || 0), 0),
                        burned: dayActivities.reduce((sum, a) => sum + (a.calories || 0), 0),
                        workout: dayActivities.reduce((sum, a) => sum + (a.duration || 0), 0),
                        water: waterData.total || 0
                    });
                }
            } else if (viewMode === 'monthly') {
                // Last 12 months
                for (let i = 11; i >= 0; i--) {
                    const date = new Date();
                    date.setMonth(date.getMonth() - i);
                    const month = date.getMonth();
                    const year = date.getFullYear();
                   
                    const monthFoods = foods.filter(f => {
                        const fDate = new Date(f.date);
                        return fDate.getMonth() === month && fDate.getFullYear() === year;
                    });
                   
                    const monthActivities = activities.filter(a => {
                        const aDate = new Date(a.date);
                        return aDate.getMonth() === month && aDate.getFullYear() === year;
                    });
                   
                    data.push({
                        date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                        eaten: monthFoods.reduce((sum, f) => sum + (f.calories || 0), 0),
                        burned: monthActivities.reduce((sum, a) => sum + (a.calories || 0), 0),
                        workout: monthActivities.reduce((sum, a) => sum + (a.duration || 0), 0),
                        water: 0 // Aggregate if needed
                    });
                }
            } else {
                // Last 5 years
                for (let i = 4; i >= 0; i--) {
                    const targetYear = new Date().getFullYear() - i;
                   
                    const yearFoods = foods.filter(f => new Date(f.date).getFullYear() === targetYear);
                    const yearActivities = activities.filter(a => new Date(a.date).getFullYear() === targetYear);
                   
                    data.push({
                        date: targetYear.toString(),
                        eaten: yearFoods.reduce((sum, f) => sum + (f.calories || 0), 0),
                        burned: yearActivities.reduce((sum, a) => sum + (a.calories || 0), 0),
                        workout: yearActivities.reduce((sum, a) => sum + (a.duration || 0), 0),
                        water: 0
                    });
                }
            }
           
            setProgressData(data);
        } catch (err) {
            console.error('Failed to fetch progress data:', err);
        }
    };

    // Fetch Weight Progress
    const fetchWeightProgress = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`http://localhost:5000/api/weight?email=${user.email}`);
            if (res.ok) {
                const weights = await res.json();
                const sorted = weights.sort((a, b) => new Date(a.date) - new Date(b.date));
               
                let data = [];
                if (viewMode === 'daily') {
                    // Last 30 days
                    data = sorted.slice(-30).map(w => ({
                        date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        weight: w.weight
                    }));
                } else if (viewMode === 'monthly') {
                    // Last 12 months - one entry per month
                    const monthlyData = {};
                    sorted.forEach(w => {
                        const date = new Date(w.date);
                        const key = `${date.getFullYear()}-${date.getMonth()}`;
                        if (!monthlyData[key] || new Date(w.date) > new Date(monthlyData[key].date)) {
                            monthlyData[key] = w;
                        }
                    });
                    data = Object.values(monthlyData).slice(-12).map(w => ({
                        date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                        weight: w.weight
                    }));
                } else {
                    // Last 5 years - one entry per year
                    const yearlyData = {};
                    sorted.forEach(w => {
                        const year = new Date(w.date).getFullYear();
                        if (!yearlyData[year] || new Date(w.date) > new Date(yearlyData[year].date)) {
                            yearlyData[year] = w;
                        }
                    });
                    data = Object.values(yearlyData).slice(-5).map(w => ({
                        date: new Date(w.date).getFullYear().toString(),
                        weight: w.weight
                    }));
                }
               
                setWeightProgress(data);
            }
        } catch (err) {
            console.error('Failed to fetch weight progress:', err);
        }
    };

    useEffect(() => {
        fetchTodayStats();
        fetchProgressData();
        fetchWeightProgress();
    }, [user, viewMode]);

    const getTimeLabel = () => {
        if (viewMode === 'daily') return "Today's";
        if (viewMode === 'monthly') return "This Month's";
        return "This Year's";
    };

    const getNetCalories = () => stats.eaten - stats.burned;
    const isCalorieDeficit = getNetCalories() < 0;

    // Get health score color
    const getHealthScoreColor = () => {
        if (healthScore >= 80) return '#4CAF50';
        if (healthScore >= 60) return '#00f2ff';
        if (healthScore >= 40) return '#ffa502';
        return '#ff4757';
    };

    // Get radar chart data
    const getRadarData = () => [
        { metric: 'Calories', value: Math.min(100, (stats.eaten / 2000) * 100), fullMark: 100 },
        { metric: 'Exercise', value: Math.min(100, (stats.workoutTime / 60) * 100), fullMark: 100 },
        { metric: 'Hydration', value: Math.min(100, (stats.waterConsumed / stats.waterGoal) * 100), fullMark: 100 },
        { metric: 'Burn', value: Math.min(100, (stats.burned / 500) * 100), fullMark: 100 },
        { metric: 'Balance', value: isCalorieDeficit ? 100 : Math.max(0, 100 - Math.abs(getNetCalories()) / 10), fullMark: 100 }
    ];

    return (
        <div className="glass-panel fade-in">
            {/* Header */}
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'25px', flexWrap: 'wrap', gap: '15px'}}>
                <div>
                    <h2 style={{ margin: 0, marginBottom: '5px' }}>
                        👋 Welcome back, <span style={{color:'#00f2ff'}}>{user?.name || 'User'}</span>
                    </h2>
                    <p style={{ color: '#aaa', margin: 0, fontSize: '0.9rem' }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>
               
                {/* Range Selector */}
                <div style={{background: 'rgba(255,255,255,0.1)', borderRadius:'20px', padding:'5px', display: 'flex'}}>
                    {['daily', 'monthly', 'yearly'].map(mode => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            style={{
                                background: viewMode === mode ? 'linear-gradient(135deg, #00f2ff, #00aaff)' : 'transparent',
                                color: viewMode === mode ? '#000' : '#fff',
                                border: 'none',
                                padding: '8px 20px',
                                borderRadius: '15px',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                fontWeight: viewMode === mode ? 'bold' : '600',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            {/* Health Score Banner */}
            <div style={{
                background: `linear-gradient(135deg, ${getHealthScoreColor()}15, ${getHealthScoreColor()}05)`,
                border: `2px solid ${getHealthScoreColor()}40`,
                borderRadius: '15px',
                padding: '20px',
                marginBottom: '25px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px'
            }}>
                <div>
                    <h3 style={{color: getHealthScoreColor(), margin: '0 0 8px 0', fontSize: '1rem'}}>
                        🎯 Daily Health Score
                    </h3>
                    <p style={{color: '#aaa', margin: 0, fontSize: '0.85rem'}}>
                        Based on calories, activity, and hydration
                    </p>
                </div>
                <div style={{textAlign: 'center'}}>
                    <div style={{
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        color: getHealthScoreColor(),
                        lineHeight: 1
                    }}>
                        {healthScore}
                    </div>
                    <div style={{fontSize: '0.85rem', color: '#aaa', marginTop: '5px'}}>
                        / 100
                    </div>
                </div>
                <div style={{
                    width: '200px',
                    height: '10px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '5px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${healthScore}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${getHealthScoreColor()}, ${getHealthScoreColor()}dd)`,
                        borderRadius: '5px',
                        transition: 'width 0.5s ease'
                    }}/>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '25px'}}>
                <StatCard
                    title="Calories Eaten"
                    value={stats.eaten.toLocaleString()}
                    subtitle="Resets Daily"
                    icon="🍽️"
                    color="#00f2ff"
                    viewMode={viewMode}
                />
                <StatCard
                    title="Calories Burned"
                    value={stats.burned.toLocaleString()}
                    subtitle="Resets Daily"
                    icon="🔥"
                    color="#ff4757"
                    viewMode={viewMode}
                />
                <StatCard
                    title="Workout Time"
                    value={`${stats.workoutTime} m`}
                    subtitle="Resets Daily"
                    icon="💪"
                    color="#ffa502"
                    viewMode={viewMode}
                />
                <StatCard
                    title="Water Consumed"
                    value={`${stats.waterConsumed} ml`}
                    subtitle={`${stats.waterGoal} ml goal`}
                    icon="💧"
                    color="#00aaff"
                    viewMode={viewMode}
                    progress={(stats.waterConsumed / stats.waterGoal) * 100}
                />
                <StatCard
                    title="Current Weight"
                    value={`${stats.weight} kg`}
                    subtitle="Latest"
                    icon="⚖️"
                    color="#a55eea"
                    viewMode={viewMode}
                />
            </div>

            {/* Net Calories Summary */}
            <div style={{
                background: isCalorieDeficit
                    ? 'linear-gradient(135deg, rgba(76,175,80,0.1), rgba(76,175,80,0.05))'
                    : 'linear-gradient(135deg, rgba(255,71,87,0.1), rgba(255,71,87,0.05))',
                border: `1px solid ${isCalorieDeficit ? 'rgba(76,175,80,0.3)' : 'rgba(255,71,87,0.3)'}`,
                padding: '20px',
                borderRadius: '15px',
                marginBottom: '25px'
            }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px'}}>
                    <div>
                        <h3 style={{
                            color: isCalorieDeficit ? '#4CAF50' : '#ff4757',
                            margin: '0 0 5px 0',
                            fontSize: '1.1rem'
                        }}>
                            💡 {getTimeLabel()} Net Calories
                        </h3>
                        <p style={{color: '#aaa', margin: 0, fontSize: '0.9rem'}}>
                            You consumed <span style={{color: '#00f2ff', fontWeight: 'bold'}}>{stats.eaten}</span> cal and burned{' '}
                            <span style={{color: '#ff4757', fontWeight: 'bold'}}>{stats.burned}</span> cal
                        </p>
                    </div>
                    <div style={{textAlign: 'right'}}>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            color: isCalorieDeficit ? '#4CAF50' : '#ff4757'
                        }}>
                            {isCalorieDeficit ? '-' : '+'}{Math.abs(getNetCalories())}
                        </div>
                        <div style={{fontSize: '0.85rem', color: '#aaa', marginTop: '5px'}}>
                            {isCalorieDeficit ? '✅ Calorie Deficit' : '⚠️ Calorie Surplus'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px'}}>
                {/* Calorie Trends */}
                <ChartCard title="📊 Calorie Trends">
                    {progressData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={progressData}>
                                <defs>
                                    <linearGradient id="eatenGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="burnedGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ff4757" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#ff4757" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="date" stroke="#777" tick={{fontSize: 11}} />
                                <YAxis stroke="#777" />
                                <Tooltip contentStyle={{background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px'}}/>
                                <Legend />
                                <Area type="monotone" dataKey="eaten" stroke="#00f2ff" strokeWidth={2} fillOpacity={1} fill="url(#eatenGrad)" name="Eaten" />
                                <Area type="monotone" dataKey="burned" stroke="#ff4757" strokeWidth={2} fillOpacity={1} fill="url(#burnedGrad)" name="Burned" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : <EmptyState icon="📊" text="No calorie data yet" />}
                </ChartCard>

                {/* Activity & Hydration */}
                <ChartCard title="💪 Activity & Hydration">
                    {progressData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={progressData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="date" stroke="#777" tick={{fontSize: 11}} />
                                <YAxis stroke="#777" />
                                <Tooltip contentStyle={{background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px'}}/>
                                <Legend />
                                <Bar dataKey="workout" fill="#ffa502" name="Workout (min)" />
                                <Bar dataKey="water" fill="#00aaff" name="Water (ml)" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <EmptyState icon="💪" text="No activity data yet" />}
                </ChartCard>

                {/* Weight Progress */}
                <ChartCard title="⚖️ Weight Progress">
                    {weightProgress.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={weightProgress}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="date" stroke="#777" tick={{fontSize: 11}} />
                                <YAxis stroke="#777" domain={['dataMin - 2', 'dataMax + 2']} />
                                <Tooltip contentStyle={{background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px'}}/>
                                <Line type="monotone" dataKey="weight" stroke="#a55eea" strokeWidth={3} dot={{r: 4}} name="Weight (kg)" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : <EmptyState icon="⚖️" text="No weight data yet" />}
                </ChartCard>

                {/* Health Metrics Radar */}
                <ChartCard title="🎯 Health Metrics">
                    <ResponsiveContainer width="100%" height={250}>
                        <RadarChart data={getRadarData()}>
                            <PolarGrid stroke="#333" />
                            <PolarAngleAxis dataKey="metric" stroke="#777" tick={{fontSize: 11}} />
                            <PolarRadiusAxis stroke="#555" />
                            <Radar name="Today" dataKey="value" stroke="#00f2ff" fill="#00f2ff" fillOpacity={0.6} />
                        </RadarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Progress Details */}
            <div style={{background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                    <h3 style={{color: '#00f2ff', margin: 0}}>
                        📈 Detailed Progress ({viewMode.charAt(0).toUpperCase() + viewMode.slice(1)})
                    </h3>
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="primary-btn"
                        style={{padding: '8px 16px', fontSize: '0.9rem'}}
                    >
                        {showDetails ? '▲ Hide' : '▼ Show'} Details
                    </button>
                </div>

                {showDetails && progressData.length > 0 && (
                    <div style={{maxHeight: '400px', overflowY: 'auto', marginTop: '15px'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse'}}>
                            <thead style={{position: 'sticky', top: 0, background: '#1a1a1a', zIndex: 1}}>
                                <tr style={{borderBottom: '2px solid #333'}}>
                                    <th style={{padding: '12px', textAlign: 'left', color: '#00f2ff'}}>Date</th>
                                    <th style={{padding: '12px', textAlign: 'right', color: '#00f2ff'}}>Eaten</th>
                                    <th style={{padding: '12px', textAlign: 'right', color: '#ff4757'}}>Burned</th>
                                    <th style={{padding: '12px', textAlign: 'right', color: '#ffa502'}}>Workout</th>
                                    <th style={{padding: '12px', textAlign: 'right', color: '#00aaff'}}>Water</th>
                                    <th style={{padding: '12px', textAlign: 'right', color: '#a55eea'}}>Net Cal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {progressData.slice().reverse().map((day, idx) => {
                                    const net = day.eaten - day.burned;
                                    return (
                                        <tr key={idx} style={{
                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{padding: '12px', fontWeight: '500'}}>{day.date}</td>
                                            <td style={{padding: '12px', textAlign: 'right', color: '#00f2ff'}}>{day.eaten}</td>
                                            <td style={{padding: '12px', textAlign: 'right', color: '#ff4757'}}>{day.burned}</td>
                                            <td style={{padding: '12px', textAlign: 'right', color: '#ffa502'}}>{day.workout}m</td>
                                            <td style={{padding: '12px', textAlign: 'right', color: '#00aaff'}}>{day.water}ml</td>
                                            <td style={{
                                                padding: '12px',
                                                textAlign: 'right',
                                                fontWeight: 'bold',
                                                color: net < 0 ? '#4CAF50' : '#ff4757'
                                            }}>
                                                {net > 0 ? '+' : ''}{net}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard = ({ title, value, subtitle, icon, color, viewMode, progress }) => (
    <div style={{
        background: 'rgba(0,0,0,0.3)',
        padding: '18px',
        borderRadius: '12px',
        textAlign: 'center',
        borderTop: `3px solid ${color}`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.05)'
    }}
    onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 8px 25px ${color}30`;
    }}
    onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
    }}
    >
        <div style={{fontSize: '2rem', marginBottom: '8px'}}>{icon}</div>
        <h4 style={{color: '#aaa', fontSize: '0.75rem', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
            {title}
        </h4>
        <h2 style={{fontSize: '1.8rem', margin: '0 0 5px 0', color: '#fff', fontWeight: 'bold'}}>{value}</h2>
        <small style={{color: color, fontSize: '0.75rem'}}>{subtitle}</small>
       
        {progress !== undefined && (
            <div style={{marginTop: '10px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden'}}>
                <div style={{
                    width: `${Math.min(progress, 100)}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                    borderRadius: '3px',
                    transition: 'width 0.5s ease'
                }}/>
            </div>
        )}
    </div>
);

// Chart Card Component
const ChartCard = ({ title, children }) => (
    <div style={{background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)'}}>
        <h3 style={{color: '#00f2ff', marginTop: 0, marginBottom: '15px', fontSize: '1rem'}}>{title}</h3>
        {children}
    </div>
);

// Empty State Component
const EmptyState = ({ icon, text }) => (
    <div style={{
        height: '250px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#777'
    }}>
        <div style={{fontSize: '3rem', marginBottom: '10px'}}>{icon}</div>
        <p style={{margin: 0, fontSize: '0.9rem'}}>{text}</p>
    </div>
);

export default Home;
