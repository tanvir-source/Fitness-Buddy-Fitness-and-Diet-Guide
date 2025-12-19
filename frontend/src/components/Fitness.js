import { useState, useEffect } from 'react';

const Fitness = ({ user }) => {
    const [activities, setActivities] = useState([]);
    const [form, setForm] = useState({ type: '', duration: '', calories: '' });

    useEffect(() => {
        if(user && user.email) {
            fetchActivities();
        }
        // eslint-disable-next-line
    }, [user]);

    const fetchActivities = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/activity?email=${user.email}`);
            
            if (res.ok) {
                const data = await res.json();
                setActivities(data);
            }
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, user_email: user.email })
            });
            if (res.ok) {
                fetchActivities(); 
                setForm({ type: '', duration: '', calories: '' }); 
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div className="glass-panel fade-in">
            <h2 style={{color: '#ff6b6b'}}>🔥 Fitness Tracker</h2>
            
            <form onSubmit={handleSubmit} style={{display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap'}}>
                <input placeholder="Activity (e.g. Running)" value={form.type} onChange={e => setForm({...form, type: e.target.value})} required style={{flex:2, padding:'10px', borderRadius:'5px', border:'none'}} />
                <input type="number" placeholder="Mins" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} required style={{flex:1, padding:'10px', borderRadius:'5px', border:'none'}} />
                <input type="number" placeholder="Cals" value={form.calories} onChange={e => setForm({...form, calories: e.target.value})} required style={{flex:1, padding:'10px', borderRadius:'5px', border:'none'}} />
                <button type="submit" style={{padding:'10px 20px', background:'#ff6b6b', border:'none', borderRadius:'5px', color:'white', fontWeight:'bold', cursor:'pointer'}}>Add</button>
            </form>

            <div style={{maxHeight:'400px', overflowY:'auto'}}>
                {activities.length === 0 ? <p style={{color:'#ccc'}}>No activities yet.</p> : null}
                
                {activities.map(item => (
                    <div key={item._id} style={{background:'rgba(255,255,255,0.05)', padding:'10px', margin:'10px 0', borderRadius:'10px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <div>
                            <strong style={{fontSize:'1.1rem'}}>{item.type}</strong>
                            <div style={{fontSize:'0.9rem', color:'#aaa'}}>{item.duration} mins</div>
                        </div>
                        <span style={{color:'#ff6b6b', fontWeight:'bold'}}>{item.calories} kcal</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Fitness;