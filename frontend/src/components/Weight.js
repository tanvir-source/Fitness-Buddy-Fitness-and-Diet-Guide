import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const Weight = ({ user, onUpdate }) => {
    const [weights, setWeights] = useState([]);
    const [view, setView] = useState('weight'); // 'weight', 'measurements', 'goals'
    
    // Weight Entry Form
    const [weightInput, setWeightInput] = useState('');
    
    // Body Measurements
    const [measurements, setMeasurements] = useState({
        waist: '',
        chest: '',
        arms: '',
        thighs: ''
    });

    // Goals & Stats
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({
        currentWeight: '--',
        targetWeight: '--',
        weeklyRate: 0,
        totalChange: 0,
        daysToGoal: 0,
        expectedDate: '',
        milestones: [],
        achievedMilestones: [],
        badges: []
    });

    // Fetch Profile for Goals
    const fetchProfile = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`http://localhost:5000/api/profile/${user.email}`);
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
            }
        } catch (err) {
            console.error('Profile fetch error:', err);
        }
    };

    // Fetch Weight History
    const fetchWeights = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`http://localhost:5000/api/weight?email=${user.email}`);
            if (res.ok) {
                const data = await res.json();
                const formattedData = data.map(entry => ({
                    ...entry,
                    dateStr: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    dateObj: new Date(entry.date)
                }));
                formattedData.sort((a, b) => a.dateObj - b.dateObj);
                setWeights(formattedData);
                
                // Calculate stats
                calculateStats(formattedData);
            }
        } catch (err) { 
            console.error(err); 
        }
    };

    // Calculate Progress Stats
    const calculateStats = (weightData) => {
        if (weightData.length === 0 || !profile) return;

        const current = weightData[weightData.length - 1].weight;
        const target = profile.targetWeight || 0;
        
        if (target === 0) return;

        // Calculate weekly rate (if we have at least 2 entries)
        let weeklyRate = 0;
        if (weightData.length >= 2) {
            const first = weightData[0];
            const last = weightData[weightData.length - 1];
            const daysDiff = Math.max(1, (last.dateObj - first.dateObj) / (1000 * 60 * 60 * 24));
            const weightDiff = last.weight - first.weight;
            weeklyRate = (weightDiff / daysDiff) * 7; // per week
        }

        // Total change from start
        const totalChange = weightData.length > 0 
            ? current - weightData[0].weight 
            : 0;

        // Days to goal (based on weekly rate)
        const remaining = Math.abs(target - current);
        const daysToGoal = weeklyRate !== 0 
            ? Math.abs(remaining / (weeklyRate / 7))
            : 0;

        // Expected date
        const expectedDate = daysToGoal > 0 
            ? new Date(Date.now() + daysToGoal * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })
            : '';

        // Generate milestones
        const milestones = generateMilestones(
            weightData[0]?.weight || current,
            target,
            profile.healthGoal
        );

        // Check achieved milestones
        const achievedMilestones = milestones.filter(m => {
            if (profile.healthGoal === 'Weight Loss') {
                return current <= m.weight;
            } else {
                return current >= m.weight;
            }
        });

        // Award badges
        const badges = awardBadges(weightData, totalChange, achievedMilestones.length);

        setStats({
            currentWeight: current,
            targetWeight: target,
            weeklyRate,
            totalChange,
            daysToGoal: Math.round(daysToGoal),
            expectedDate,
            milestones,
            achievedMilestones,
            badges
        });
    };

    // Generate Milestones (every 5kg)
    const generateMilestones = (start, target, goal) => {
        const milestones = [];
        const isLoss = goal === 'Weight Loss';
        const step = 5;
        
        if (isLoss) {
            for (let w = Math.floor(start / step) * step; w >= target; w -= step) {
                if (w < start && w > target) {
                    milestones.push({
                        weight: w,
                        label: `${w} kg`,
                        progress: ((start - w) / (start - target)) * 100
                    });
                }
            }
        } else {
            for (let w = Math.ceil(start / step) * step; w <= target; w += step) {
                if (w > start && w < target) {
                    milestones.push({
                        weight: w,
                        label: `${w} kg`,
                        progress: ((w - start) / (target - start)) * 100
                    });
                }
            }
        }
        
        return milestones;
    };

    // Award Badges
    const awardBadges = (weightData, totalChange, milestonesAchieved) => {
        const badges = [];
        
        // Consistency badges
        if (weightData.length >= 7) badges.push({ icon: '📅', name: 'Week Warrior', desc: '7 days tracked' });
        if (weightData.length >= 30) badges.push({ icon: '🗓️', name: 'Month Master', desc: '30 days tracked' });
        if (weightData.length >= 90) badges.push({ icon: '📊', name: 'Quarter Champion', desc: '90 days tracked' });
        
        // Progress badges
        if (Math.abs(totalChange) >= 2) badges.push({ icon: '🌟', name: 'First Steps', desc: '2kg progress' });
        if (Math.abs(totalChange) >= 5) badges.push({ icon: '🔥', name: 'On Fire', desc: '5kg progress' });
        if (Math.abs(totalChange) >= 10) badges.push({ icon: '💪', name: 'Powerhouse', desc: '10kg progress' });
        if (Math.abs(totalChange) >= 20) badges.push({ icon: '🏆', name: 'Champion', desc: '20kg progress' });
        
        // Milestone badges
        if (milestonesAchieved >= 1) badges.push({ icon: '🎯', name: 'Milestone Hit', desc: 'First milestone' });
        if (milestonesAchieved >= 3) badges.push({ icon: '⭐', name: 'Triple Threat', desc: '3 milestones' });
        
        return badges;
    };

    // Add Weight Entry
    const handleAddWeight = async (e) => {
        e.preventDefault();
        if (!user?.email) return alert("Please log in first!");

        try {
            const res = await fetch('http://localhost:5000/api/weight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    user_email: user.email,
                    weight: Number(weightInput),
                    waist: measurements.waist ? Number(measurements.waist) : null,
                    chest: measurements.chest ? Number(measurements.chest) : null,
                    arms: measurements.arms ? Number(measurements.arms) : null,
                    thighs: measurements.thighs ? Number(measurements.thighs) : null,
                    date: new Date().toISOString()
                })
            });
            if (res.ok) {
                setWeightInput('');
                setMeasurements({ waist: '', chest: '', arms: '', thighs: '' });
                await fetchWeights();
                if (onUpdate) onUpdate();
            }
        } catch (err) { 
            console.error(err); 
        }
    };

    useEffect(() => { 
        fetchProfile();
        fetchWeights(); 
    }, [user]);

    useEffect(() => {
        if (weights.length > 0 && profile) {
            calculateStats(weights);
        }
    }, [weights, profile]);

    const inputStyle = {
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.2)',
        background: 'rgba(255,255,255,0.1)',
        color: 'white',
        fontSize: '0.9rem',
        boxSizing: 'border-box'
    };

    // Render Weight View
    const renderWeightView = () => (
        <div>
            {/* Current Weight Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                padding: '20px',
                background: 'rgba(165,94,234,0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(165,94,234,0.3)'
            }}>
                <div>
                    <h3 style={{color: '#aaa', margin: '0 0 5px 0', fontSize: '0.85rem'}}>Current Weight</h3>
                    <h1 style={{fontSize: '2.8rem', margin: 0, color: '#fff', fontWeight: 'bold'}}>
                        {weights.length > 0 ? weights[weights.length - 1].weight : '--'}{' '}
                        <span style={{fontSize: '1rem', color: '#777'}}>kg</span>
                    </h1>
                </div>
                {profile?.targetWeight && (
                    <div style={{textAlign: 'right'}}>
                        <h3 style={{color: '#aaa', margin: '0 0 5px 0', fontSize: '0.85rem'}}>Target</h3>
                        <h2 style={{fontSize: '1.8rem', margin: 0, color: '#a55eea'}}>
                            {profile.targetWeight} <span style={{fontSize: '0.8rem', color: '#777'}}>kg</span>
                        </h2>
                        {weights.length > 0 && (
                            <p style={{fontSize: '0.75rem', color: '#00ff88', margin: '5px 0 0 0'}}>
                                {Math.abs(weights[weights.length - 1].weight - profile.targetWeight).toFixed(1)} kg to go
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Add Weight Form */}
            <form onSubmit={handleAddWeight} style={{marginBottom: '20px'}}>
                <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px'}}>
                    <input 
                        type="number" 
                        step="0.1"
                        placeholder="Weight (kg)" 
                        value={weightInput} 
                        onChange={e => setWeightInput(e.target.value)} 
                        required 
                        style={{...inputStyle, width: '100%'}}
                    />
                    <button 
                        type="submit" 
                        className="primary-btn" 
                        style={{background: 'linear-gradient(45deg, #a55eea, #8854d0)', height: '44px'}}
                    >
                        📝 Log Weight
                    </button>
                </div>
            </form>

            {/* Weight Chart */}
            <div style={{width: '100%', height: 300, marginBottom: '20px'}}>
                {weights.length > 0 ? (
                    <ResponsiveContainer>
                        <AreaChart data={weights} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                            <defs>
                                <linearGradient id="colorKg" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a55eea" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#a55eea" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false}/>
                            <XAxis dataKey="dateStr" stroke="#777" tick={{fontSize: 12}} tickLine={false} axisLine={false}/>
                            <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#777" unit="kg" tickLine={false} axisLine={false}/>
                            <Tooltip 
                                contentStyle={{backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #555', borderRadius: '8px', color: '#fff'}} 
                                itemStyle={{color: '#a55eea'}}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="weight" 
                                stroke="#a55eea" 
                                strokeWidth={3} 
                                fillOpacity={1} 
                                fill="url(#colorKg)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <p style={{textAlign: 'center', color: '#777', paddingTop: '100px'}}>
                        No data yet. Start logging your weight!
                    </p>
                )}
            </div>
        </div>
    );

    // Render Measurements View
    const renderMeasurementsView = () => {
        // Get latest measurements
        const latestEntry = weights.length > 0 ? weights[weights.length - 1] : null;
        const hasMeasurements = latestEntry && (latestEntry.waist || latestEntry.chest || latestEntry.arms || latestEntry.thighs);

        // Prepare measurement chart data
        const measurementData = weights.filter(w => w.waist || w.chest || w.arms || w.thighs);

        // Handle measurements-only submit
        const handleMeasurementsSubmit = async (e) => {
            e.preventDefault();
            
            if (!user?.email) return alert("Please log in first!");
            
            // Check if there's at least one measurement
            if (!measurements.waist && !measurements.chest && !measurements.arms && !measurements.thighs) {
                return alert("Please enter at least one measurement!");
            }

            // Use latest weight if available, otherwise require weight first
            if (weights.length === 0) {
                return alert("Please log your weight first in the Weight tab!");
            }

            const latestWeight = weights[weights.length - 1].weight;

            try {
                const res = await fetch('http://localhost:5000/api/weight', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        user_email: user.email,
                        weight: latestWeight, // Use existing weight
                        waist: measurements.waist ? Number(measurements.waist) : null,
                        chest: measurements.chest ? Number(measurements.chest) : null,
                        arms: measurements.arms ? Number(measurements.arms) : null,
                        thighs: measurements.thighs ? Number(measurements.thighs) : null,
                        date: new Date().toISOString()
                    })
                });
                if (res.ok) {
                    setMeasurements({ waist: '', chest: '', arms: '', thighs: '' });
                    await fetchWeights();
                    if (onUpdate) onUpdate();
                }
            } catch (err) { 
                console.error(err); 
            }
        };

        return (
            <div>
                {/* Add Measurements Form */}
                <form onSubmit={handleMeasurementsSubmit} style={{marginBottom: '25px'}}>
                    <h3 style={{color: '#00f2ff', margin: '0 0 15px 0', fontSize: '1rem'}}>
                        📏 Log Body Measurements
                    </h3>

                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px'}}>
                        <input 
                            type="number" 
                            step="0.1"
                            placeholder="Waist (cm)" 
                            value={measurements.waist}
                            onChange={e => setMeasurements({...measurements, waist: e.target.value})}
                            style={inputStyle}
                        />
                        <input 
                            type="number" 
                            step="0.1"
                            placeholder="Chest (cm)" 
                            value={measurements.chest}
                            onChange={e => setMeasurements({...measurements, chest: e.target.value})}
                            style={inputStyle}
                        />
                        <input 
                            type="number" 
                            step="0.1"
                            placeholder="Arms (cm)" 
                            value={measurements.arms}
                            onChange={e => setMeasurements({...measurements, arms: e.target.value})}
                            style={inputStyle}
                        />
                        <input 
                            type="number" 
                            step="0.1"
                            placeholder="Thighs (cm)" 
                            value={measurements.thighs}
                            onChange={e => setMeasurements({...measurements, thighs: e.target.value})}
                            style={inputStyle}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="primary-btn" 
                        style={{background: 'linear-gradient(45deg, #00f2ff, #00aaff)', width: '100%', height: '44px'}}
                    >
                        📝 Log Measurements
                    </button>
                </form>

                {/* Current Measurements */}
                {hasMeasurements ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '15px',
                        marginBottom: '25px'
                    }}>
                        {latestEntry.waist && (
                            <div style={{
                                background: 'rgba(0,242,255,0.1)',
                                border: '1px solid rgba(0,242,255,0.3)',
                                padding: '15px',
                                borderRadius: '10px',
                                textAlign: 'center'
                            }}>
                                <div style={{fontSize: '0.75rem', color: '#aaa', marginBottom: '5px'}}>WAIST</div>
                                <div style={{fontSize: '1.8rem', color: '#00f2ff', fontWeight: 'bold'}}>
                                    {latestEntry.waist}<span style={{fontSize: '0.7rem'}}>cm</span>
                                </div>
                            </div>
                        )}
                        {latestEntry.chest && (
                            <div style={{
                                background: 'rgba(0,255,136,0.1)',
                                border: '1px solid rgba(0,255,136,0.3)',
                                padding: '15px',
                                borderRadius: '10px',
                                textAlign: 'center'
                            }}>
                                <div style={{fontSize: '0.75rem', color: '#aaa', marginBottom: '5px'}}>CHEST</div>
                                <div style={{fontSize: '1.8rem', color: '#00ff88', fontWeight: 'bold'}}>
                                    {latestEntry.chest}<span style={{fontSize: '0.7rem'}}>cm</span>
                                </div>
                            </div>
                        )}
                        {latestEntry.arms && (
                            <div style={{
                                background: 'rgba(255,145,0,0.1)',
                                border: '1px solid rgba(255,145,0,0.3)',
                                padding: '15px',
                                borderRadius: '10px',
                                textAlign: 'center'
                            }}>
                                <div style={{fontSize: '0.75rem', color: '#aaa', marginBottom: '5px'}}>ARMS</div>
                                <div style={{fontSize: '1.8rem', color: '#ff9100', fontWeight: 'bold'}}>
                                    {latestEntry.arms}<span style={{fontSize: '0.7rem'}}>cm</span>
                                </div>
                            </div>
                        )}
                        {latestEntry.thighs && (
                            <div style={{
                                background: 'rgba(165,94,234,0.1)',
                                border: '1px solid rgba(165,94,234,0.3)',
                                padding: '15px',
                                borderRadius: '10px',
                                textAlign: 'center'
                            }}>
                                <div style={{fontSize: '0.75rem', color: '#aaa', marginBottom: '5px'}}>THIGHS</div>
                                <div style={{fontSize: '1.8rem', color: '#a55eea', fontWeight: 'bold'}}>
                                    {latestEntry.thighs}<span style={{fontSize: '0.7rem'}}>cm</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '12px',
                        marginBottom: '25px'
                    }}>
                        <div style={{fontSize: '3rem', marginBottom: '15px'}}>📏</div>
                        <h3 style={{color: '#aaa', margin: '0 0 10px 0'}}>No Measurements Yet</h3>
                        <p style={{color: '#777', fontSize: '0.9rem', margin: 0}}>
                            Add body measurements using the form above
                        </p>
                    </div>
                )}

                {/* Measurement Trends Chart */}
                {measurementData.length > 0 && (
                    <div style={{width: '100%', height: 300}}>
                        <ResponsiveContainer>
                            <LineChart data={measurementData} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false}/>
                                <XAxis dataKey="dateStr" stroke="#777" tick={{fontSize: 12}}/>
                                <YAxis stroke="#777" unit="cm"/>
                                <Tooltip contentStyle={{backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #555', borderRadius: '8px'}}/>
                                {measurementData.some(d => d.waist) && <Line type="monotone" dataKey="waist" stroke="#00f2ff" strokeWidth={2} name="Waist"/>}
                                {measurementData.some(d => d.chest) && <Line type="monotone" dataKey="chest" stroke="#00ff88" strokeWidth={2} name="Chest"/>}
                                {measurementData.some(d => d.arms) && <Line type="monotone" dataKey="arms" stroke="#ff9100" strokeWidth={2} name="Arms"/>}
                                {measurementData.some(d => d.thighs) && <Line type="monotone" dataKey="thighs" stroke="#a55eea" strokeWidth={2} name="Thighs"/>}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        );
    };

    // Render Goals View
    const renderGoalsView = () => (
        <div>
            {/* Progress Stats */}
            {stats.targetWeight !== '--' ? (
                <>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px'}}>
                        <div style={{
                            background: 'rgba(0,242,255,0.1)',
                            border: '1px solid rgba(0,242,255,0.3)',
                            padding: '18px',
                            borderRadius: '10px',
                            textAlign: 'center'
                        }}>
                            <div style={{fontSize: '0.75rem', color: '#aaa', marginBottom: '8px'}}>WEEKLY RATE</div>
                            <div style={{fontSize: '1.8rem', color: '#00f2ff', fontWeight: 'bold'}}>
                                {stats.weeklyRate >= 0 ? '+' : ''}{stats.weeklyRate.toFixed(2)}
                                <span style={{fontSize: '0.7rem', color: '#777'}}> kg/week</span>
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(0,255,136,0.1)',
                            border: '1px solid rgba(0,255,136,0.3)',
                            padding: '18px',
                            borderRadius: '10px',
                            textAlign: 'center'
                        }}>
                            <div style={{fontSize: '0.75rem', color: '#aaa', marginBottom: '8px'}}>TOTAL CHANGE</div>
                            <div style={{fontSize: '1.8rem', color: '#00ff88', fontWeight: 'bold'}}>
                                {stats.totalChange >= 0 ? '+' : ''}{stats.totalChange.toFixed(1)}
                                <span style={{fontSize: '0.7rem', color: '#777'}}> kg</span>
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(165,94,234,0.1)',
                            border: '1px solid rgba(165,94,234,0.3)',
                            padding: '18px',
                            borderRadius: '10px',
                            textAlign: 'center'
                        }}>
                            <div style={{fontSize: '0.75rem', color: '#aaa', marginBottom: '8px'}}>DAYS TO GOAL</div>
                            <div style={{fontSize: '1.8rem', color: '#a55eea', fontWeight: 'bold'}}>
                                {stats.daysToGoal || '--'}
                                <span style={{fontSize: '0.7rem', color: '#777'}}> days</span>
                            </div>
                        </div>
                    </div>

                    {/* Expected Completion */}
                    {stats.expectedDate && (
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(0,242,255,0.1), rgba(165,94,234,0.1))',
                            border: '1px solid rgba(0,242,255,0.3)',
                            padding: '15px 20px',
                            borderRadius: '10px',
                            marginBottom: '25px',
                            textAlign: 'center'
                        }}>
                            <div style={{fontSize: '0.85rem', color: '#aaa', marginBottom: '5px'}}>
                                🎯 Expected Goal Completion
                            </div>
                            <div style={{fontSize: '1.3rem', color: '#00f2ff', fontWeight: 'bold'}}>
                                {stats.expectedDate}
                            </div>
                        </div>
                    )}

                    {/* Milestones */}
                    {stats.milestones.length > 0 && (
                        <div style={{marginBottom: '25px'}}>
                            <h3 style={{color: '#00f2ff', marginBottom: '15px', fontSize: '1rem'}}>
                                🎯 Mini-Milestones (Every 5kg)
                            </h3>
                            <div style={{display: 'grid', gap: '10px'}}>
                                {stats.milestones.map((milestone, idx) => {
                                    const achieved = stats.achievedMilestones.some(m => m.weight === milestone.weight);
                                    return (
                                        <div key={idx} style={{
                                            background: achieved ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.05)',
                                            border: `1px solid ${achieved ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.1)'}`,
                                            padding: '12px 15px',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>
                                            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                                <div style={{fontSize: '1.5rem'}}>
                                                    {achieved ? '✅' : '⭕'}
                                                </div>
                                                <div>
                                                    <div style={{color: '#fff', fontWeight: '600', fontSize: '0.95rem'}}>
                                                        {milestone.label}
                                                    </div>
                                                    <div style={{color: '#777', fontSize: '0.75rem'}}>
                                                        Milestone {idx + 1}
                                                    </div>
                                                </div>
                                            </div>
                                            {achieved && (
                                                <div style={{
                                                    padding: '4px 12px',
                                                    background: 'rgba(0,255,136,0.2)',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem',
                                                    color: '#00ff88',
                                                    fontWeight: 'bold'
                                                }}>
                                                    ACHIEVED
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Badges */}
                    {stats.badges.length > 0 && (
                        <div>
                            <h3 style={{color: '#00f2ff', marginBottom: '15px', fontSize: '1rem'}}>
                                🏆 Achievement Badges
                            </h3>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px'}}>
                                {stats.badges.map((badge, idx) => (
                                    <div key={idx} style={{
                                        background: 'rgba(255,145,0,0.1)',
                                        border: '1px solid rgba(255,145,0,0.3)',
                                        padding: '15px',
                                        borderRadius: '10px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{fontSize: '2rem', marginBottom: '8px'}}>{badge.icon}</div>
                                        <div style={{color: '#ff9100', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '4px'}}>
                                            {badge.name}
                                        </div>
                                        <div style={{color: '#aaa', fontSize: '0.75rem'}}>
                                            {badge.desc}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 40px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '15px'
                }}>
                    <div style={{fontSize: '4rem', marginBottom: '20px'}}>🎯</div>
                    <h3 style={{color: '#aaa', margin: '0 0 15px 0'}}>Set Your Target Weight</h3>
                    <p style={{color: '#777', fontSize: '0.9rem', margin: '0 0 20px 0'}}>
                        Go to Profile tab to set your target weight and health goals
                    </p>
                    <button
                        onClick={() => window.location.hash = '#profile'}
                        style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #00f2ff, #a55eea)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#000',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Go to Profile
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="glass-panel fade-in">
            {/* Header with Tabs */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h2 style={{color: '#a55eea', margin: 0}}>⚖️ Weight Tracker</h2>
                
                <div style={{display: 'flex', gap: '8px'}}>
                    <button
                        onClick={() => setView('weight')}
                        style={{
                            padding: '8px 16px',
                            background: view === 'weight' ? '#a55eea' : 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '6px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                        }}
                    >
                        📊 Weight
                    </button>
                    <button
                        onClick={() => setView('measurements')}
                        style={{
                            padding: '8px 16px',
                            background: view === 'measurements' ? '#a55eea' : 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '6px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                        }}
                    >
                        📏 Measurements
                    </button>
                    <button
                        onClick={() => setView('goals')}
                        style={{
                            padding: '8px 16px',
                            background: view === 'goals' ? '#a55eea' : 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '6px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                        }}
                    >
                        🎯 Goals
                    </button>
                </div>
            </div>

            {/* Render Content Based on View */}
            {view === 'weight' && renderWeightView()}
            {view === 'measurements' && renderMeasurementsView()}
            {view === 'goals' && renderGoalsView()}
        </div>
    );
};

export default Weight;