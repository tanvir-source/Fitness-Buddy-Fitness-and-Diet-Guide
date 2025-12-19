import { useState, useEffect } from 'react';

const Weight = ({ user }) => {
    const [weights, setWeights] = useState([]);
    const [kg, setKg] = useState('');
    const [message, setMessage] = useState('');

    // 1. Fetch weights when the component loads or user changes
    useEffect(() => {
        if (user) {
            fetchWeights();
        }
        // eslint-disable-next-line
    }, [user]);

    // 2. Function to get data from Backend
    const fetchWeights = async () => {
        try {
            // Matches Backend Route: router.get('/:email', ...)
            const res = await fetch(`http://localhost:5000/api/weight/${user.email}`);
            const data = await res.json();
            
            if (res.ok) {
                setWeights(data);
            } else {
                console.error("Failed to fetch weights");
            }
        } catch (err) {
            console.error("Connection Error:", err);
        }
    };

    // 3. Function to send data to Backend
    const addWeight = async () => {
        if (!kg) return; // Don't submit empty
        
        const payload = {
            email: user.email,
            weight: kg,
            date: new Date().toISOString().split('T')[0] // Formats today as "2025-12-19"
        };

        try {
            // Matches Backend Route: router.post('/add', ...)
            const res = await fetch('http://localhost:5000/api/weight/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setMessage('✅ Saved!');
                setKg('');         // Clear input
                fetchWeights();    // Refresh list immediately
                setTimeout(() => setMessage(''), 3000); // Hide message after 3s
            } else {
                setMessage('❌ Error saving');
            }
        } catch (err) {
            setMessage('❌ Server Error');
            console.error(err);
        }
    };

    return (
        <div className="glass-panel fade-in" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#a55eea', margin: 0 }}>⚖️ Weight Tracker</h2>
                {message && <span style={{ fontSize: '0.8rem', color: message.includes('✅') ? '#0f0' : '#f00' }}>{message}</span>}
            </div>

            <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '15px' }}>
                Keep tracking to reach your goal!
            </p>
            
            {/* Input Section */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input 
                    type="number" 
                    placeholder="kg" 
                    value={kg} 
                    onChange={(e) => setKg(e.target.value)}
                    style={{ 
                        padding: '10px', 
                        borderRadius: '10px', 
                        border: 'none', 
                        width: '80px',
                        textAlign: 'center',
                        fontWeight: 'bold'
                    }}
                />
                <button 
                    onClick={addWeight} 
                    className="primary-btn" 
                    style={{ background: '#a55eea', flex: 1 }}
                >
                    Add Log
                </button>
            </div>

            {/* List Section */}
            <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }}>
                {weights.length > 0 ? (
                    weights.map((entry, index) => (
                        <div key={index} style={{
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            padding: '12px', 
                            background: 'rgba(255,255,255,0.05)', 
                            marginBottom: '8px', 
                            borderRadius: '8px',
                            borderLeft: '4px solid #a55eea'
                        }}>
                            <span style={{ color: '#ddd' }}>{entry.date}</span>
                            <span style={{ fontWeight: 'bold', color: '#fff' }}>{entry.weight} kg</span>
                        </div>
                    ))
                ) : (
                    <p style={{ color: '#777', fontStyle: 'italic', textAlign: 'center' }}>
                        No logs yet. Add your weight above!
                    </p>
                )}
            </div>
        </div>
    );
};

export default Weight;