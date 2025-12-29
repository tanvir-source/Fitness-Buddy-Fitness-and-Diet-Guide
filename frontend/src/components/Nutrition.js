import { useState, useEffect } from 'react';

// Food Database
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

const Nutrition = ({ user, onUpdate }) => {
    const [foods, setFoods] = useState([]);
    const [calorieGoal] = useState(2000);
    
    const [form, setForm] = useState({
        foodName: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        mealType: 'Breakfast'
    });

    // Fetch Food History
    const fetchFood = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`http://localhost:5000/api/food?email=${user.email}`);
            if (res.ok) {
                const data = await res.json();
                setFoods(data);
            }
        } catch (err) { console.error("Fetch error:", err); }
    };

    useEffect(() => { fetchFood(); }, [user]);

    // Handle Submit
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
                    protein: Number(form.protein) || 0,
                    carbs: Number(form.carbs) || 0,
                    fat: Number(form.fat) || 0,
                    mealType: form.mealType,
                    date: new Date().toISOString().split('T')[0]
                })
            });

            if (res.ok) {
                setForm({ foodName: '', calories: '', protein: '', carbs: '', fat: '', mealType: 'Breakfast' });
                fetchFood();
                if (onUpdate) onUpdate(); // Refresh dashboard
            } else {
                alert("Failed to add meal");
            }
        } catch (err) { console.error("Submit error:", err); }
    };

    // Quick Add Helper
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

    // Calculations
    const totalCals = foods.reduce((acc, item) => acc + item.calories, 0);
    const progress = Math.min((totalCals / calorieGoal) * 100, 100);

    return (
        <div className="glass-panel fade-in">
            {/* Progress Bar Header */}
            <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h2 style={{ color: '#00f2ff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        🥗 Nutrition Tracker
                    </h2>
                    <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {totalCals} / {calorieGoal} kcal
                    </span>
                </div>
                <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ 
                        width: `${progress}%`, 
                        height: '100%', 
                        background: totalCals > calorieGoal ? '#ff4444' : 'linear-gradient(90deg, #00f2ff, #00aaff)', 
                        borderRadius: '10px',
                        transition: 'width 0.5s ease',
                        boxShadow: totalCals > calorieGoal ? '0 0 10px #ff4444' : '0 0 10px #00f2ff'
                    }}></div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' }}>
                
                {/* LEFT: ADD MEAL FORM */}
                <div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '25px', borderRadius: '15px', marginBottom: '20px' }}>
                        <h3 style={{ marginTop: 0, color: '#aaa', fontSize: '1rem', marginBottom: '20px' }}>Add Meal</h3>
                        
                        <form onSubmit={handleSubmit}>
                            {/* Meal Type */}
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '5px' }}>Meal Type</label>
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

                            {/* Food Name */}
                            <input 
                                placeholder="Food Name" 
                                value={form.foodName} 
                                onChange={e => setForm({...form, foodName: e.target.value})} 
                                style={inputStyle} 
                                required 
                            />
                            
                            {/* Calories and Protein */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <input 
                                    type="number" 
                                    placeholder="Cals" 
                                    value={form.calories} 
                                    onChange={e => setForm({...form, calories: e.target.value})} 
                                    style={inputStyle} 
                                    required 
                                />
                                <input 
                                    type="number" 
                                    placeholder="Prot (g)" 
                                    value={form.protein} 
                                    onChange={e => setForm({...form, protein: e.target.value})} 
                                    style={inputStyle} 
                                />
                            </div>

                            {/* Carbs and Fat */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <input 
                                    type="number" 
                                    placeholder="Carb (g)" 
                                    value={form.carbs} 
                                    onChange={e => setForm({...form, carbs: e.target.value})} 
                                    style={inputStyle} 
                                />
                                <input 
                                    type="number" 
                                    placeholder="Fat (g)" 
                                    value={form.fat} 
                                    onChange={e => setForm({...form, fat: e.target.value})} 
                                    style={inputStyle} 
                                />
                            </div>

                            <button type="submit" className="primary-btn" style={{ width: '100%', marginTop: '15px' }}>
                                Add Log
                            </button>
                        </form>
                    </div>

                    {/* Quick Add */}
                    <div>
                        <h4 style={{ color: '#aaa', marginBottom: '10px' }}>Quick Add</h4>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {foodDatabase.map((item, idx) => (
                                <button 
                                    key={idx} 
                                    type="button" 
                                    onClick={() => quickAdd(item)} 
                                    style={chipStyle}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: TODAY'S DIARY */}
                <div>
                    <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.3rem' }}>Today's Diary</h3>
                    <div style={{ maxHeight: '550px', overflowY: 'auto', paddingRight: '10px' }}>
                        {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(type => {
                            const mealItems = foods.filter(f => f.mealType === type);
                            if (mealItems.length === 0) return null;

                            return (
                                <div key={type} style={{ marginBottom: '25px' }}>
                                    <h5 style={{ 
                                        color: '#00f2ff', 
                                        borderBottom: '2px solid #333', 
                                        paddingBottom: '8px', 
                                        margin: '0 0 15px 0',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        fontSize: '0.9rem'
                                    }}>
                                        {type}
                                    </h5>
                                    {mealItems.map(item => (
                                        <div key={item._id} style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            background: 'rgba(255,255,255,0.05)', 
                                            padding: '15px', 
                                            marginBottom: '8px', 
                                            borderRadius: '10px',
                                            borderLeft: '3px solid #00f2ff',
                                            transition: 'all 0.3s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '5px' }}>
                                                    {item.foodName}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: '#aaa' }}>
                                                    P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g
                                                </div>
                                            </div>
                                            <div style={{ 
                                                fontWeight: 'bold', 
                                                color: '#00f2ff', 
                                                fontSize: '1.3rem',
                                                minWidth: '60px',
                                                textAlign: 'right'
                                            }}>
                                                {item.calories}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                        {foods.length === 0 && (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '60px 20px',
                                color: '#777',
                                fontSize: '1.1rem'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🍽️</div>
                                No meals logged today.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Styles
const inputStyle = {
    width: '100%', 
    padding: '12px', 
    marginBottom: '12px',
    borderRadius: '8px', 
    border: '1px solid rgba(255,255,255,0.2)', 
    background: 'rgba(0,0,0,0.3)', 
    color: 'white',
    fontSize: '0.95rem'
};

const chipStyle = {
    background: 'rgba(255,255,255,0.1)', 
    border: '1px solid #00f2ff',
    color: 'white', 
    padding: '8px 15px', 
    borderRadius: '20px',
    cursor: 'pointer', 
    fontSize: '0.85rem',
    transition: 'all 0.3s',
    fontWeight: '500'
};

export default Nutrition;