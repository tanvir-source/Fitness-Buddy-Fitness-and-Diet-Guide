import { useState, useEffect } from 'react';

// 🍎 SIMPLE FOOD DATABASE (100g or per serving)


const foodDatabase = [
    { name: "Apple (1 medium)", cals: 95 },
    { name: "Banana (1 medium)", cals: 105 },
    { name: "Boiled Egg (1 large)", cals: 78 },
    { name: "Chicken Breast (100g)", cals: 165 },
    { name: "Rice (1 cup, cooked)", cals: 205 },
    { name: "Pizza (1 slice)", cals: 285 },
    { name: "Oats (1 cup, cooked)", cals: 150 },
    { name: "Salad (Mixed Greens)", cals: 35 },
    { name: "Burger (Fast Food)", cals: 550 },
    { name: "Cola (1 can)", cals: 140 },
];

const Nutrition = ({ user }) => {
    const [foods, setFoods] = useState([]);
    const [form, setForm] = useState({ foodName: '', calories: '' });

    // --- 1. DEFINE FUNCTIONS FIRST ---

    const fetchFood = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(http://localhost:5000/api/food?email=${user.email});
            if(res.ok) {
                const data = await res.json();
                // FIX: Show Newest First
                setFoods(data.reverse()); 
            }
        } catch (err) { console.error(err); }
    };

    const handleSelectFood = (e) => {
        const selected = foodDatabase.find(f => f.name === e.target.value);
        if (selected) {
            // AUTO-FILL LOGIC
            setForm({ foodName: selected.name, calories: selected.calories });
        } else {
            setForm({ foodName: '', calories: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetch('http://localhost:5000/api/food', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, user_email: user.email })
            });
            fetchFood();
            setForm({ foodName: '', calories: '' }); // Reset form
        } catch (err) { console.error(err); }
    };

    // --- 2. USE EFFECTS LAST ---
    useEffect(() => {
        if (user) fetchFood();
    }, [user]);

    return (
        <div className="glass-panel fade-in">
            <h2 style={{color: '#00f2ff'}}>🥗 Smart Nutrition</h2>
            
            {/* 1. Quick Select Dropdown */}
            <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '0.9rem', color: '#aaa' }}>Quick Add from Database:</label>
                <select onChange={handleSelectFood} style={{width: '100%', padding: '10px', borderRadius: '5px', marginTop:'5px'}}>
                    <option value="">-- Select Food --</option>
                    {foodDatabase.map((f, i) => <option key={i} value={f.name}>{f.name} ({f.cals} cal)</option>)}
                </select>
            </div>

            {/* 2. Input Form (Editable) */}
            <form onSubmit={handleSubmit} style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                <input 
                    placeholder="Food Name" 
                    value={form.foodName} 
                    onChange={e => setForm({...form, foodName: e.target.value})} 
                    required 
                    style={{flex: 2, padding:'10px', borderRadius:'5px', border:'none'}} 
                />
                <input 
                    type="number" 
                    placeholder="Cals" 
                    value={form.calories} 
                    onChange={e => setForm({...form, calories: e.target.value})} 
                    required 
                    style={{flex: 1, padding:'10px', borderRadius:'5px', border:'none'}} 
                />
                <button type="submit" className="primary-btn">Add</button>
            </form>

            {/* 3. History List (Newest First) */}
            <div style={{maxHeight:'300px', overflowY:'auto'}}>
                {foods.length === 0 && <p style={{color:'#777', textAlign:'center'}}>No meals logged today.</p>}
                
                {foods.map(item => (
                    <div key={item._id} style={{
                        background:'rgba(255,255,255,0.1)', 
                        padding:'12px', 
                        margin:'8px 0', 
                        borderRadius:'8px', 
                        display:'flex', 
                        justifyContent:'space-between',
                        borderLeft: '4px solid #00f2ff'
                    }}>
                        <span style={{color: '#fff'}}>{item.foodName}</span>
                        <strong style={{color:'#00f2ff'}}>{item.calories} cal</strong>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Nutrition;