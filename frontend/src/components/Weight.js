import { useState, useEffect } from 'react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';

const Weight = ({ user }) => {
    const [weights, setWeights] = useState([]);
    const [weightInput, setWeightInput] = useState('');

    // --- 1. FETCH WEIGHT HISTORY ---
    const fetchWeights = async () => {
        if (!user?.email) return;
        try {
            // Fetch data from your backend
            const res = await fetch(`http://localhost:5000/api/weight?email=${user.email}`);
            if (res.ok) {
                const data = await res.json();
                
                // Format data for the Chart (needs clear Date and Weight)
                // Assuming backend returns { date: "2023-10-01", weight: 75 }
                const formattedData = data.map(entry => ({
                    ...entry,
                    // Format date to look nice on X-Axis (e.g., "10/24")
                    dateStr: new Date(entry.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }) 
                }));

                // Sort by date (Oldest -> Newest) so the chart draws left-to-right correctly
                formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));

                setWeights(formattedData);
            }
        } catch (err) { 
            console.error("Error fetching weights:", err); 
        }
    };

    // --- 2. ADD NEW WEIGHT ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!weightInput) return;

        try {
            const res = await fetch('http://localhost:5000/api/weight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: user.email, 
                    weight: weightInput,
                    date: new Date().toISOString() // Send current time
                })
            });

            if (res.ok) {
                setWeightInput(''); // Clear input
                fetchWeights();     // Refresh chart immediately
            }
        } catch (err) { 
            console.error(err); 
        }
    };

    // --- 3. LOAD ON STARTUP ---
    useEffect(() => {
        if (user) fetchWeights();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return (
        <div className="glass-panel fade-in">
            <h2 style={{color: '#a55eea'}}>⚖️ Weight Tracker</h2>

            {/* INPUT FORM */}
            <form onSubmit={handleSubmit} style={{display:'flex', gap:'10px', marginBottom:'20px', maxWidth:'400px'}}>
                <input 
                    type="number" 
                    step="0.1"
                    placeholder="Enter today's weight (kg)" 
                    value={weightInput} 
                    onChange={e => setWeightInput(e.target.value)} 
                    required 
                    style={{
                        flex: 1, 
                        padding:'12px', 
                        borderRadius:'5px', 
                        border:'none', 
                        background:'rgba(255,255,255,0.9)',
                        color: '#000'
                    }} 
                />
                <button 
                    type="submit" 
                    className="primary-btn"
                    style={{background:'#a55eea'}}
                >
                    Log Weight
                </button>
            </form>

            {/* CHART SECTION */}
            <div style={{ width: '100%', height: 350, marginTop: '30px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '10px' }}>
                {weights.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weights}>
                            <defs>
                                {/* Gradient for a cool look */}
                                <linearGradient id="colorKg" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a55eea" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#a55eea" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                            
                            <XAxis 
                                dataKey="dateStr" 
                                stroke="#aaa" 
                                tick={{fontSize: 12}}
                            />
                            
                            <YAxis 
                                domain={['dataMin - 2', 'dataMax + 2']} // Auto-scale Y axis
                                stroke="#aaa" 
                                unit="kg"
                            />
                            
                            <Tooltip 
                                contentStyle={{backgroundColor: '#222', border: '1px solid #444', borderRadius: '8px', color: '#fff'}}
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
                    <p style={{textAlign:'center', color:'#777', marginTop:'140px'}}>
                        No weight data yet. Log your first weight above!
                    </p>
                )}
            </div>
        </div>
    );
};

export default Weight;