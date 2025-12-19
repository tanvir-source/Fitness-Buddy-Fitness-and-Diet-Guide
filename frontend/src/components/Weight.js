import { useState, useEffect } from 'react';

const Weight = ({ user }) => {
    const [weights, setWeights] = useState([]);
    const [kg, setKg] = useState('');

    useEffect(() => {
        if(user) fetchWeights();
        // eslint-disable-next-line
    }, [user]);

    const fetchWeights = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/weight/${user.email}`);
            const data = await res.json();
            if (res.ok) setWeights(data);
        } catch (err) { console.error(err); }
    };

    const addWeight = async () => {
        if (!kg) return;
        try {
            const res = await fetch('http://localhost:5000/api/weight/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, weight: kg, date: new Date().toISOString().split('T')[0] })
            });
            if (res.ok) {
                setKg('');
                fetchWeights();
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div className="glass-panel fade-in" style={{marginTop:'20px'}}>
            <h2 style={{color: '#a55eea'}}>⚖️ Weight Tracker</h2>
            
            <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                <input 
                    type="number" 
                    placeholder="Current Weight (kg)" 
                    value={kg} 
                    onChange={(e) => setKg(e.target.value)}
                    style={{padding:'10px', borderRadius:'5px', border:'none', width:'100%'}}
                />
                <button onClick={addWeight} className="primary-btn" style={{background:'#a55eea'}}>Log</button>
            </div>

            <div style={{maxHeight:'200px', overflowY:'auto'}}>
                {weights.map((entry, index) => (
                    <div key={index} style={{
                        display:'flex', justifyContent:'space-between', 
                        padding:'10px', background:'rgba(255,255,255,0.05)', 
                        marginBottom:'5px', borderRadius:'5px'
                    }}>
                        <span>{entry.date}</span>
                        <span style={{fontWeight:'bold', color:'#a55eea'}}>{entry.weight} kg</span>
                    </div>
                ))}
                {weights.length === 0 && <p style={{color:'#777', fontStyle:'italic'}}>No logs yet. Start tracking!</p>}
            </div>
        </div>
    );
};

export default Weight;