import { useState, useEffect } from 'react';

const Nutrition = ({ user }) => {
    const [foods, setFoods] = useState([]);
    const [form, setForm] = useState({ foodName: '', calories: '', protein: '', carbs: '', fat: '' });

    useEffect(() => {
        fetchFood();
        // eslint-disable-next-line
    }, []);

    const fetchFood = async () => {
        try {
// Add the backtick ` at the start and end of the URL
            const res = await fetch(`http://localhost:5000/api/food?email=${user.email}`);
            if(res.ok) {
                const data = await res.json();
                setFoods(data);
            }
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/food', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, user_email: user.email })
            });
            if(res.ok) {
                fetchFood(); // Refresh list
                setForm({ foodName: '', calories: '', protein: '', carbs: '', fat: '' }); // Clear form
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div className="glass-panel fade-in">
            <h2>🥗 Nutrition Tracker</h2>
            
            {/* Input Form */}
            <form onSubmit={handleSubmit} style={{display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'20px'}}>
                <input placeholder="Food Name" value={form.foodName} onChange={e => setForm({...form, foodName: e.target.value})} required style={{padding:'8px', borderRadius:'5px', border:'none'}} />
                <input type="number" placeholder="Cals" value={form.calories} onChange={e => setForm({...form, calories: e.target.value})} required style={{width:'80px', padding:'8px', borderRadius:'5px', border:'none'}} />
                <button type="submit" style={{padding:'8px 15px', background:'#00f2ff', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>Add</button>
            </form>

            {/* List */}
            <div style={{maxHeight:'300px', overflowY:'auto'}}>
                {foods.length === 0 ? <p style={{opacity:0.6}}>No meals added today.</p> : null}
                {foods.map(item => (
                    <div key={item._id} style={{background:'rgba(255,255,255,0.1)', padding:'10px', margin:'5px 0', borderRadius:'5px', display:'flex', justifyContent:'space-between'}}>
                        <span>{item.foodName}</span>
                        <span style={{color:'#00f2ff'}}>{item.calories} kcal</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Nutrition;