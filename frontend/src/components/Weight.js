import { useState, useEffect } from 'react';

const Weight = ({ user }) => {
    const [weights, setWeights] = useState([]);
    const [kg, setKg] = useState('');

    const fetchWeights = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`http://localhost:5000/api/weight/${user.email}`);
            if (res.ok) {
                const data = await res.json();
                // Sort Oldest -> Newest for the graph
                const sorted = data.sort((a, b) => new Date(a.date) - new Date(b.date));
                setWeights(sorted); 
            }
        } catch (err) { console.error(err); }
    };

    const addWeight = async () => {
        if (!kg || !user?.email) return;
        await fetch('http://localhost:5000/api/weight', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, weight: Number(kg), date: new Date().toISOString().split('T')[0] })
        });
        setKg('');
        fetchWeights();
    };

    useEffect(() => { if (user) fetchWeights(); }, [user]);

    // --- SMOOTH CHART LOGIC (Bezier Curves) ---
    // Takes the raw points and makes them "curvy"
    const getPath = (points, width, height) => {
        if (points.length < 2) return "";
        
        // 1. Normalize Data
        const maxW = Math.max(...points.map(p => p.weight), 100);
        const minW = Math.min(...points.map(p => p.weight), 0);
        const range = maxW - minW || 1;

        // 2. Convert to X,Y coordinates
        const coords = points.map((p, i) => {
            const x = (i / (points.length - 1)) * width;
            const y = height - ((p.weight - minW) / range) * (height * 0.8) - (height * 0.1); // 10% padding
            return { x, y, val: p.weight };
        });

        // 3. Generate Smooth Path (Catmull-Rom style logic simplified)
        let d = `M ${coords[0].x} ${coords[0].y}`;
        for (let i = 0; i < coords.length - 1; i++) {
            const p0 = coords[i];
            const p1 = coords[i + 1];
            // Control points for curvature
            const cp1x = p0.x + (p1.x - p0.x) * 0.5; 
            const cp1y = p0.y;
            const cp2x = p0.x + (p1.x - p0.x) * 0.5;
            const cp2y = p1.y;
            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
        }

        // 4. Create Fill Path (Close the loop at the bottom)
        const fillPath = `${d} L ${width} ${height} L 0 ${height} Z`;

        return { d, fillPath, coords };
    };

    const chartW = 500; // Internal SVG units
    const chartH = 200;
    const dataSlice = weights.slice(-7); // Show last 7 entries
    const { d, fillPath, coords } = getPath(dataSlice, chartW, chartH);

    return (
        <div className="glass-panel fade-in">
            <h2 style={{ color: '#a55eea' }}>⚖️ Weight Progress</h2>
            
            {/* INPUT */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                <input type="number" placeholder="Enter Weight (kg)" value={kg} onChange={e => setKg(e.target.value)} style={{ padding: '15px', flex: 1, borderRadius: '10px', border: 'none' }} />
                <button onClick={addWeight} className="primary-btn">Log Weight</button>
            </div>

            {/* SMOOTH SVG CHART  */}
            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '15px', padding: '20px', marginBottom: '20px', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
                {weights.length > 1 ? (
                    <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: '100%', overflow: 'visible' }}>
                        <defs>
                            <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#a55eea" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#a55eea" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* 1. Grid Lines */}
                        <line x1="0" y1={chartH*0.25} x2={chartW} y2={chartH*0.25} stroke="#333" strokeDasharray="4" />
                        <line x1="0" y1={chartH*0.50} x2={chartW} y2={chartH*0.50} stroke="#333" strokeDasharray="4" />
                        <line x1="0" y1={chartH*0.75} x2={chartW} y2={chartH*0.75} stroke="#333" strokeDasharray="4" />

                        {/* 2. The Gradient Fill */}
                        <path d={fillPath} fill="url(#grad)" />

                        {/* 3. The Smooth Line */}
                        <path d={d} fill="none" stroke="#a55eea" strokeWidth="4" strokeLinecap="round" />

                        {/* 4. Dots & Labels */}
                        {coords && coords.map((p, i) => (
                            <g key={i}>
                                <circle cx={p.x} cy={p.y} r="6" fill="#121212" stroke="#fff" strokeWidth="2" />
                                <text x={p.x} y={p.y - 15} fill="#fff" fontSize="14" textAnchor="middle" fontWeight="bold">{p.val}</text>
                            </g>
                        ))}
                    </svg>
                ) : (
                    <div style={{height:'150px', display:'flex', alignItems:'center', justifyContent:'center', color:'#777'}}>
                        Not enough data. Log at least 2 weights!
                    </div>
                )}
            </div>

            {/* HISTORY */}
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