import { useState, useEffect } from 'react';

// 🍎 EXPANDED DATABASE (Mocking the 10,000+ items requirement for now)
const foodDatabase = [
    { name: "Oats (1 cup)", cals: 150, p: 5, c: 27, f: 3 },
    { name: "Boiled Egg", cals: 78, p: 6, c: 0.6, f: 5 },
    { name: "Banana", cals: 105, p: 1.3, c: 27, f: 0.3 },
    { name: "Chicken Breast", cals: 165, p: 31, c: 0, f: 3.6 },
    { name: "Rice (1 cup)", cals: 205, p: 4, c: 45, f: 0.4 },
    { name: "Pizza Slice", cals: 285, p: 12, c: 36, f: 10 },
    { name: "Burger", cals: 550, p: 25, c: 45, f: 20 },
    { name: "Cola", cals: 140, p: 0, c: 35, f: 0 },
];

const Nutrition = ({ user }) => {
    const [foods, setFoods] = useState([]);
    const [calorieGoal] = useState(2000); // Default Goal
    
    // Form State
    const [form, setForm] = useState({
        foodName: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        mealType: 'Breakfast' // Default
    });

    // 1. Fetch Food History
    const fetchFood = async () => {
        if (!user?.email) return;
        try {
            // ✅ FIX: Using backticks (`) for correct string interpolation
            const res = await fetch(`http://localhost:5000/api/food?email=${user.email}`);
            if (res.ok) {
                const data = await res.json();
                setFoods(data);
            }
        } catch (err) { console.error("Fetch error:", err); }
    };

    useEffect(() => { fetchFood(); }, [user]);

    // 2. Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.foodName || !form.calories) return;

        try {
            const res = await fetch('http://localhost:5000/api/food', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: user.email,
                    foodName: form.foodName,
                    calories: Number(form.calories),
                    protein: Number(form.protein),
                    carbs: Number(form.carbs),
                    fat: Number(form.fat),
                    mealType: form.mealType,
                    date: new Date().toISOString().split('T')[0]
                })
            });

            if (res.ok) {
                setForm({ foodName: '', calories: '', protein: '', carbs: '', fat: '', mealType: 'Breakfast' }); // Reset
                fetchFood();
            } else {
                alert("Failed to add meal");
            }
        } catch (err) { console.error("Submit error:", err); }
    };

    // 3. Quick Add Helper
    const quickAdd = (item) => {
        setForm({ 
            foodName: item.name, 
            calories: item.cals, 
            protein: item.p, 
            carbs: item.c, 
            fat: item.f, 
            mealType: form.mealType 
        });
    };

    // --- CALCULATIONS ---
    const totalCals = foods.reduce((acc, item) => acc + item.calories, 0);
    const progress = Math.min((totalCals / calorieGoal) * 100, 100);

    return (
        <div className="glass-panel fade-in">
            {/* --- VISUAL PROGRESS BAR --- */}
            <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <h2 style={{ color: '#00f2ff', margin: 0 }}>🥗 Nutrition Tracker</h2>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>{totalCals} / {calorieGoal} kcal</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px' }}>
                    <div style={{ 
                        width: `${progress}%`, 
                        height: '100%', 
                        background: totalCals > calorieGoal ? '#ff4444' : 'linear-gradient(90deg, #00f2ff, #00aaff)', 
                        borderRadius: '5px',
                        transition: 'width 0.5s ease'
                    }}></div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                
                {/* --- LEFT: ADD MEAL FORM --- */}
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '15px' }}>
                        <h4 style={{ marginTop: 0, color: '#aaa' }}>Add Meal</h4>
                        
                        {/* Meal Type Selector */}
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ fontSize: '0.8rem', color: '#888' }}>Meal Type</label>
                            <select 
                                value={form.mealType}
                                onChange={e => setForm({...form, mealType: e.target.value})}
                                style={inputStyle}
                            >
                                <option>Breakfast</option>
                                <option>Lunch</option>
                                <option>Dinner</option>
                                <option>Snack</option>
                            </select>
                        </div>

                        <input 
                            placeholder="Food Name" 
                            value={form.foodName} 
                            onChange={e => setForm({...form, foodName: e.target.value})} 
                            style={inputStyle} 
                            required 
                        />
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                type="number" placeholder="Cals" 
                                value={form.calories} onChange={e => setForm({...form, calories: e.target.value})} 
                                style={inputStyle} required 
                            />
                            <input 
                                type="number" placeholder="Prot (g)" 
                                value={form.protein} onChange={e => setForm({...form, protein: e.target.value})} 
                                style={inputStyle} 
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                type="number" placeholder="Carb (g)" 
                                value={form.carbs} onChange={e => setForm({...form, carbs: e.target.value})} 
                                style={inputStyle} 
                            />
                            <input 
                                type="number" placeholder="Fat (g)" 
                                value={form.fat} onChange={e => setForm({...form, fat: e.target.value})} 
                                style={inputStyle} 
                            />
                        </div>

                        <button type="submit" className="primary-btn" style={{ width: '100%', marginTop: '10px' }}>Add Log</button>
                    </form>

                    {/* Quick Add Buttons */}
                    <div style={{ marginTop: '20px' }}>
                        <h4 style={{ color: '#aaa' }}>Quick Add</h4>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {foodDatabase.map((item, idx) => (
                                <button key={idx} type="button" onClick={() => quickAdd(item)} style={chipStyle}>
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: DAILY DIARY --- */}
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <h3 style={{ marginTop: 0 }}>Today's Diary</h3>
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(type => {
                            const mealItems = foods.filter(f => f.mealType === type);
                            if (mealItems.length === 0) return null;

                            return (
                                <div key={type} style={{ marginBottom: '15px' }}>
                                    <h5 style={{ color: '#00f2ff', borderBottom: '1px solid #333', paddingBottom: '5px', margin: '10px 0' }}>{type.toUpperCase()}</h5>
                                    {mealItems.map(item => (
                                        <div key={item._id} style={{ 
                                            display: 'flex', justifyContent: 'space-between', 
                                            background: 'rgba(255,255,255,0.05)', padding: '10px', 
                                            marginBottom: '5px', borderRadius: '5px' 
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>{item.foodName}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#aaa' }}>
                                                    P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g
                                                </div>
                                            </div>
                                            <div style={{ fontWeight: 'bold', color: '#00f2ff' }}>{item.calories}</div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                        {foods.length === 0 && <p style={{ color: '#777', fontStyle: 'italic' }}>No meals logged today.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Styles
const inputStyle = {
    width: '100%', padding: '10px', marginBottom: '10px',
    borderRadius: '8px', border: 'none', background: 'rgba(0,0,0,0.3)', color: 'white'
};

const chipStyle = {
    background: 'rgba(255,255,255,0.1)', border: '1px solid #00f2ff',
    color: 'white', padding: '5px 10px', borderRadius: '20px',
    cursor: 'pointer', fontSize: '0.8rem'
};

export default Nutrition;