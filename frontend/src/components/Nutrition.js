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

    // 1. Fetch Food History
    const fetchFood = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch('http://localhost:5000/api/food?email=${user.email}');
            if (res.ok) {
                const data = await res.json();
                setFoods(data);
            }
        } catch (err) { console.error(err); }
    };

    // 2. Add New Food
    const handleAddFood = async (e) => {
        e.preventDefault();
        if (!user?.email) return alert("Please log in first!");

        try {
            const res = await fetch('http://localhost:5000/api/food', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: user.email, // ✅ Sending email explicitly
                    foodName: form.foodName,
                    calories: Number(form.calories) // ✅ Ensure number format
                })
            });

            if (res.ok) {
                setForm({ foodName: '', calories: '' }); // Clear form
                fetchFood(); // Refresh list
            } else {
                const err = await res.json();
                alert("Error: " + err.error);
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchFood(); }, [user]);

    return (
        <div className="glass-panel fade-in">
            <h2 style={{color: '#00f2ff'}}>🥗 Nutrition Tracker</h2>
            <p style={{color:'#ccc'}}>Log your daily meals below.</p>

            {/* QUICK ADD BUTTONS */}
            <div style={{display:'flex', gap:'10px', overflowX:'auto', paddingBottom:'10px', marginBottom:'20px'}}>
                {foodDatabase.map((item, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => setForm({ foodName: item.name, calories: item.cals })}
                        style={{
                            background:'rgba(255,255,255,0.1)', border:'1px solid #333', color:'#aaa', 
                            padding:'5px 10px', borderRadius:'15px', whiteSpace:'nowrap', cursor:'pointer'
                        }}
                    >
                        {item.name}
                    </button>
                ))}
            </div>

            {/* INPUT FORM */}
            <form onSubmit={handleAddFood} style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                <input 
                    placeholder="Food Name" 
                    value={form.foodName} 
                    onChange={e => setForm({...form, foodName: e.target.value})} 
                    required 
                    style={{flex: 2, padding:'12px', borderRadius:'10px', border:'none', background:'rgba(255,255,255,0.1)', color:'white'}} 
                />
                <input 
                    type="number" 
                    placeholder="Cals" 
                    value={form.calories} 
                    onChange={e => setForm({...form, calories: e.target.value})} 
                    required 
                    style={{flex: 1, padding:'12px', borderRadius:'10px', border:'none', background:'rgba(255,255,255,0.1)', color:'white'}} 
                />
                <button type="submit" className="primary-btn">Add</button>
            </form>

            {/* LIST */}
            <div style={{maxHeight:'300px', overflowY:'auto'}}>
                {foods.length === 0 && <p style={{color:'#777', textAlign:'center'}}>No meals logged today.</p>}
                
                {foods.map(item => (
                    <div key={item._id} style={{
                        background:'rgba(255,255,255,0.05)', 
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