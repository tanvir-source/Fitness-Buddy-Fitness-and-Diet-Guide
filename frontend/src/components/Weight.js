import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Weight = ({ user }) => {
    const [weights, setWeights] = useState([]);
    const [weightInput, setWeightInput] = useState('');

    const fetchWeights = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`http://localhost:5000/api/weight?email=${user.email}`);
            if (res.ok) {
                const data = await res.json();
                const formattedData = data.map(entry => ({
                    ...entry,
                    dateStr: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
                }));
                formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));
                setWeights(formattedData);
            }
        } catch (err) { console.error(err); }
    };

    const handleAddWeight = async (e) => {
        e.preventDefault();
        if (!user?.email) return alert("Please log in first!");

        try {
            const res = await fetch('http://localhost:5000/api/weight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    user_email: user.email,  // ✅ Matches new Model
                    weight: Number(weightInput), 
                    date: new Date().toISOString().split('T')[0] 
                })
            });
            if (res.ok) {
                setWeightInput('');
                fetchWeights();
            } else {
                const err = await res.json();
                alert("Error: " + (err.error || err.message));
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchWeights(); }, [user]);

    return (
        <div className="glass-panel fade-in">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <h2 style={{color: '#a55eea'}}>⚖️ Weight Tracker</h2>
                <h1 style={{fontSize:'2.5rem', margin:0, color:'#fff'}}>
                    {weights.length > 0 ? weights[weights.length - 1].weight : '--'} <span style={{fontSize:'1rem', color:'#777'}}>kg</span>
                </h1>
            </div>

            <form onSubmit={handleAddWeight} style={{display:'flex', gap:'10px', marginBottom:'30px'}}>
                <input 
                    type="number" 
                    placeholder="Current Weight (kg)" 
                    value={weightInput} 
                    onChange={e => setWeightInput(e.target.value)} 
                    required 
                    style={{flex: 1, padding:'12px', borderRadius:'10px', border:'none', background:'rgba(255,255,255,0.1)', color:'white'}} 
                />
                <button type="submit" className="primary-btn" style={{background: 'linear-gradient(45deg, #a55eea, #8854d0)'}}>Log</button>
            </form>

            <div style={{ width: '100%', height: 300 }}>
                {weights.length > 0 ? (
                    <ResponsiveContainer>
                        <AreaChart data={weights} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorKg" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a55eea" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#a55eea" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="dateStr" stroke="#777" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                            <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#777" unit="kg" tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #555', borderRadius: '8px', color: '#fff'}} itemStyle={{color: '#a55eea'}} />
                            <Area type="monotone" dataKey="weight" stroke="#a55eea" strokeWidth={3} fillOpacity={1} fill="url(#colorKg)" style={{ filter: 'drop-shadow(0px 0px 8px rgba(165, 94, 234, 0.6))' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <p style={{textAlign:'center', color:'#777', marginTop:'100px'}}>No data yet. Start logging!</p>
                )}
            </div>
        </div>
    );
};

export default Weight;