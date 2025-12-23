import { useState, useEffect } from 'react';

const Weight = ({ user }) => {
    const [weights, setWeights] = useState([]);
    const [kg, setKg] = useState('');

    // --- 1. DEFINE FUNCTIONS FIRST ---
    
    const fetchWeights = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`http://localhost:5000/api/weight/${user.email}`);
            if (res.ok) {
                const data = await res.json();
                // We need date sorting for the line chart to look right (Oldest -> Newest)
                const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
                setWeights(sortedData); 
            }
        } catch (err) { console.error(err); }
    };

    const addWeight = async () => {
        if (!kg || !user?.email) return;
        try {
            await fetch('http://localhost:5000/api/weight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, weight: Number(kg), date: new Date().toISOString().split('T')[0] })
            });
            setKg('');
            fetchWeights();
        } catch (err) { console.error(err); }
    };

    // --- 2. CHART CALCULATION LOGIC ---
    
    // Get last 10 entries for the graph
    const dataPoints = weights.slice(-10);
    
    // Find min/max to scale the graph vertically
    const maxW = Math.max(...dataPoints.map(w => w.weight), 100);
    const minW = Math.min(...dataPoints.map(w => w.weight), 0);
    const range = maxW - minW || 1; // Avoid divide by zero

    // Generate SVG Points: "x,y x,y x,y"
    // Graph Dimensions: 100% width, 150px height
    const getSvgPoints = () => {
        if (dataPoints.length < 2) return "";
        return dataPoints.map((entry, index) => {
            const x = (index / (dataPoints.length - 1)) * 100; // X as Percentage (0 to 100)
            
            // Y Calculation: (Value - Min) / Range. Invert because SVG 0 is top.
            // We use 80% of height (10% padding top/bottom)
            const normalizedY = ((entry.weight - minW) / range);
            const y = 100 - (normalizedY * 80 + 10); // Scale to 0-100 coordinate space
            
            return `${x},${y}`;
        }).join(" ");
    };

    // --- 3. RUN EFFECTS LAST ---
    
    useEffect(() => {
        if (user?.email) fetchWeights();
    }, [user]);

    return (
        <div className="glass-panel fade-in">
            <h2 style={{ color: '#a55eea' }}>⚖️ Weight Trends</h2>
            
            {/* INPUT SECTION */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                <input 
                    type="number" 
                    placeholder="Today's Weight (kg)" 
                    value={kg} 
                    onChange={e => setKg(e.target.value)} 
                    style={{ padding: '15px', flex: 1, borderRadius: '10px', border: 'none' }} 
                />
                <button onClick={addWeight} className="primary-btn">Log Weight</button>
            </div>

            {/* 📈 LINE CHART SECTION */}
            <div style={{ 
                height: '200px', 
                background: 'rgba(0,0,0,0.2)', 
                borderRadius: '15px', 
                padding: '20px', 
                marginBottom: '20px', 
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {dataPoints.length > 1 ? (
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                        
                        {/* Grid Lines (Optional) */}
                        <line x1="0" y1="10" x2="100" y2="10" stroke="#444" strokeWidth="0.2" strokeDasharray="2" />
                        <line x1="0" y1="50" x2="100" y2="50" stroke="#444" strokeWidth="0.2" strokeDasharray="2" />
                        <line x1="0" y1="90" x2="100" y2="90" stroke="#444" strokeWidth="0.2" strokeDasharray="2" />

                        {/* The Line Diagram 

[Image of line graph]
 */}
                        <polyline 
                            fill="none" 
                            stroke="#a55eea" 
                            strokeWidth="2" 
                            points={getSvgPoints()} 
                            vectorEffect="non-scaling-stroke" // Keeps line thickness constant even if stretched
                        />

                        {/* Dots on the line */}
                        {dataPoints.map((entry, index) => {
                            const x = (index / (dataPoints.length - 1)) * 100;
                            const normalizedY = ((entry.weight - minW) / range);
                            const y = 100 - (normalizedY * 80 + 10);
                            return (
                                <g key={index}>
                                    <circle cx={x} cy={y} r="1.5" fill="#fff" stroke="#a55eea" strokeWidth="0.5" />
                                    {/* Tooltip text showing weight */}
                                    <text x={x} y={y - 5} fontSize="3" fill="#fff" textAnchor="middle">{entry.weight}</text>
                                </g>
                            )
                        })}
                    </svg>
                ) : (
                    <p style={{ color: '#888' }}>Add at least 2 logs to see the graph!</p>
                )}
            </div>

            {/* HISTORY LIST (Reversed to show newest first) */}
            <h3 style={{marginTop: '20px'}}>History</h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {[...weights].reverse().map((entry, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ color: '#aaa' }}>{entry.date}</span>
                        <strong style={{ color: '#a55eea' }}>{entry.weight} kg</strong>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Weight;