import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const foodDatabase = [
    { name: "Oats (1 cup)", cals: 150, p: 5, c: 27, f: 3 },
    { name: "Boiled Egg", cals: 78, p: 6, c: 0.6, f: 5 },
    { name: "Banana", cals: 105, p: 1.3, c: 27, f: 0.3 },
    { name: "Chicken Breast", cals: 165, p: 31, c: 0, f: 3.6 },
    { name: "Rice (1 cup)", cals: 205, p: 4, c: 45, f: 0.4 },
    { name: "Salmon", cals: 206, p: 22, c: 0, f: 13 },
    { name: "Broccoli", cals: 55, p: 4, c: 11, f: 0.6 },
    { name: "Almonds (1oz)", cals: 164, p: 6, c: 6, f: 14 },
];

const healthyAlternatives = {
    "Pizza": [
        { name: "Cauliflower Crust Pizza", cals: 180, savings: 105 },
        { name: "Whole Wheat Pita Pizza", cals: 220, savings: 65 }
    ],
    "Burger": [
        { name: "Turkey Burger", cals: 350, savings: 200 },
        { name: "Veggie Burger", cals: 280, savings: 270 }
    ],
    "Cola": [
        { name: "Sparkling Water", cals: 0, savings: 140 },
        { name: "Green Tea", cals: 2, savings: 138 }
    ],
    "Fries": [
        { name: "Baked Sweet Potato Fries", cals: 150, savings: 220 },
        { name: "Air Fryer Zucchini Fries", cals: 80, savings: 290 }
    ]
};

const snackSuggestions = {
    "50-100": [
        { name: "Apple", cals: 95, p: 0.5, c: 25, f: 0.3 },
        { name: "Carrot Sticks", cals: 50, p: 1, c: 12, f: 0.3 }
    ],
    "100-200": [
        { name: "Greek Yogurt", cals: 120, p: 17, c: 9, f: 0.4 },
        { name: "Almonds (1oz)", cals: 160, p: 6, c: 6, f: 14 },
        { name: "String Cheese", cals: 80, p: 7, c: 1, f: 6 }
    ],
    "200-300": [
        { name: "Protein Bar", cals: 250, p: 20, c: 30, f: 8 },
        { name: "Peanut Butter Toast", cals: 220, p: 9, c: 26, f: 10 }
    ]
};

const restaurantMeals = [
    { restaurant: "Khana's", meal: "Grilled Chicken with Brown Rice", cals: 380, p: 35, c: 42, f: 8, healthScore: 9 },
    { restaurant: "The Pizza Company", meal: "Veggie Thin Crust Pizza", cals: 420, p: 18, c: 52, f: 14, healthScore: 7 },
    { restaurant: "Gloria Jean's", meal: "Chicken Caesar Wrap", cals: 340, p: 28, c: 35, f: 10, healthScore: 8 },
    { restaurant: "Nando's", meal: "Quarter Chicken with Salad", cals: 310, p: 32, c: 12, f: 15, healthScore: 8 },
    { restaurant: "Sbarro", meal: "Grilled Chicken Pasta", cals: 450, p: 30, c: 48, f: 14, healthScore: 7 },
    { restaurant: "KFC", meal: "Grilled Chicken Twister", cals: 360, p: 26, c: 38, f: 12, healthScore: 6 },
    { restaurant: "Takeout", meal: "Tandoori Chicken with Roti", cals: 400, p: 40, c: 35, f: 10, healthScore: 9 }
];

const Nutrition = ({ user, onUpdate }) => {
    const [foods, setFoods] = useState([]);
    const [calorieGoal] = useState(2000);
    const [view, setView] = useState('today');
    const [form, setForm] = useState({ foodName: '', calories: '', protein: '', carbs: '', fat: '', mealType: 'Breakfast' });

    const fetchFood = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`http://localhost:5000/api/food?email=${user.email}`);
            if (res.ok) {
                const data = await res.json();
                setFoods(data);
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchFood(); }, [user]);

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
                if (onUpdate) onUpdate();
            }
        } catch (err) { console.error(err); }
    };

    const quickAdd = (item) => {
        setForm({ foodName: item.name, calories: item.cals, protein: item.p, carbs: item.c, fat: item.f, mealType: form.mealType });
    };

    const today = new Date().toISOString().split('T')[0];
    const todayFoods = foods.filter(f => f.date === today);
    const totalCals = todayFoods.reduce((acc, item) => acc + item.calories, 0);
    const totalProtein = todayFoods.reduce((acc, item) => acc + item.protein, 0);
    const totalCarbs = todayFoods.reduce((acc, item) => acc + item.carbs, 0);
    const totalFat = todayFoods.reduce((acc, item) => acc + item.fat, 0);
    const progress = Math.min((totalCals / calorieGoal) * 100, 100);
    const remainingCals = calorieGoal - totalCals;

    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayFoods = foods.filter(f => f.date === dateStr);
            days.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                calories: dayFoods.reduce((sum, f) => sum + f.calories, 0),
                protein: dayFoods.reduce((sum, f) => sum + f.protein, 0),
                carbs: dayFoods.reduce((sum, f) => sum + f.carbs, 0),
                fat: dayFoods.reduce((sum, f) => sum + f.fat, 0)
            });
        }
        return days;
    };

    const getMostConsumedFoods = () => {
        const foodCount = {};
        foods.forEach(food => {
            const name = food.foodName.toLowerCase();
            foodCount[name] = (foodCount[name] || 0) + 1;
        });
        return Object.entries(foodCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
    };

    const getMealPatternAnalysis = () => {
        const mealCounts = { Breakfast: 0, Lunch: 0, Dinner: 0, Snack: 0 };
        foods.forEach(f => { mealCounts[f.mealType] = (mealCounts[f.mealType] || 0) + 1; });
        return Object.entries(mealCounts).map(([meal, count]) => ({ meal, count }));
    };

    const getRecommendedMeals = () => {
        if (remainingCals <= 0) return [];
        return restaurantMeals.filter(meal => meal.cals <= remainingCals + 100).sort((a, b) => b.healthScore - a.healthScore).slice(0, 3);
    };

    const getSnackSuggestions = () => {
        if (remainingCals < 50) return [];
        if (remainingCals <= 100) return snackSuggestions["50-100"];
        if (remainingCals <= 200) return snackSuggestions["100-200"];
        return snackSuggestions["200-300"];
    };

    const getHealthyAlternatives = () => {
        const recentHighCalFoods = todayFoods.filter(f => f.calories > 250).map(f => f.foodName);
        const suggestions = [];
        recentHighCalFoods.forEach(food => {
            Object.keys(healthyAlternatives).forEach(key => {
                if (food.toLowerCase().includes(key.toLowerCase())) {
                    suggestions.push({ original: food, alternatives: healthyAlternatives[key] });
                }
            });
        });
        return suggestions;
    };

    // Group foods by date for history
    const foodsByDate = foods.reduce((acc, food) => {
        if (!acc[food.date]) acc[food.date] = [];
        acc[food.date].push(food);
        return acc;
    }, {});
    const sortedDates = Object.keys(foodsByDate).sort((a, b) => new Date(b) - new Date(a));

    const weeklyData = getLast7Days();
    const mostConsumed = getMostConsumedFoods();
    const mealPattern = getMealPatternAnalysis();
    const COLORS = ['#00f2ff', '#ff6b9d', '#ffd93d', '#6bcf7f'];

    const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', boxSizing: 'border-box' };
    const chipStyle = { background: 'rgba(255,255,255,0.1)', border: '1px solid #00f2ff', color: 'white', padding: '5px 10px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem' };

    const renderTodayView = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '15px', marginBottom: '20px' }}>
                    <h4 style={{ marginTop: 0, color: '#aaa' }}>Add Meal</h4>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '5px' }}>Meal Type</label>
                        <select value={form.mealType} onChange={e => setForm({...form, mealType: e.target.value})} style={inputStyle}>
                            <option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option>
                        </select>
                    </div>
                    <input placeholder="Food Name" value={form.foodName} onChange={e => setForm({...form, foodName: e.target.value})} style={{...inputStyle, marginBottom: '10px'}} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                        <input type="number" placeholder="Cals" value={form.calories} onChange={e => setForm({...form, calories: e.target.value})} style={inputStyle} />
                        <input type="number" placeholder="Protein" value={form.protein} onChange={e => setForm({...form, protein: e.target.value})} style={inputStyle} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <input type="number" placeholder="Carbs" value={form.carbs} onChange={e => setForm({...form, carbs: e.target.value})} style={inputStyle} />
                        <input type="number" placeholder="Fat" value={form.fat} onChange={e => setForm({...form, fat: e.target.value})} style={inputStyle} />
                    </div>
                    <button onClick={handleSubmit} className="primary-btn" style={{ width: '100%', marginTop: '10px' }}>Add Log</button>
                </div>
                <div>
                    <h4 style={{ color: '#aaa' }}>Quick Add</h4>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {foodDatabase.map((item, idx) => (
                            <button key={idx} onClick={() => quickAdd(item)} style={chipStyle}>{item.name}</button>
                        ))}
                    </div>
                </div>
            </div>
            <div>
                <h3 style={{ marginTop: 0 }}>Today's Nutrition</h3>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '15px', marginBottom: '20px' }}>
                    {[{ label: '🥩 Protein', value: totalProtein, max: 150, color: '#ff6b9d' }, { label: '🍞 Carbs', value: totalCarbs, max: 250, color: '#ffd93d' }, { label: '🥑 Fat', value: totalFat, max: 70, color: '#6bcf7f' }].map((m, i) => (
                        <div key={i} style={{ marginBottom: i < 2 ? '20px' : 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: m.color }}>{m.label}</span>
                                <span style={{ fontWeight: 'bold' }}>{m.value}g</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                                <div style={{ width: `${Math.min((m.value / m.max) * 100, 100)}%`, height: '100%', background: m.color, borderRadius: '4px', transition: 'width 0.5s' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
                <h3>Today's Meals</h3>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {todayFoods.length === 0 ? (
                        <p style={{ color: '#777' }}>No meals logged today.</p>
                    ) : (
                        todayFoods.map(item => (
                            <div key={item._id} style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                background: 'rgba(255,255,255,0.05)', 
                                padding: '12px 15px', 
                                marginBottom: '8px', 
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ 
                                        fontWeight: '500', 
                                        fontSize: '1rem',
                                        marginBottom: '3px',
                                        color: '#fff'
                                    }}>
                                        : {item.foodName}
                                    </div>
                                </div>
                                <div style={{ 
                                    fontWeight: 'bold', 
                                    color: '#00f2ff',
                                    fontSize: '1.1rem'
                                }}>
                                    {item.calories} cal
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    const renderHistoryView = () => (
        <div>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                📅 History
            </h3>
            <div style={{ maxHeight: '700px', overflowY: 'auto' }}>
                {sortedDates.map(date => {
                    const dayFoods = foodsByDate[date];
                    const dayCals = dayFoods.reduce((acc, f) => acc + f.calories, 0);
                    const dayProtein = dayFoods.reduce((acc, f) => acc + f.protein, 0);
                    const dayCarbs = dayFoods.reduce((acc, f) => acc + f.carbs, 0);
                    const dayFat = dayFoods.reduce((acc, f) => acc + f.fat, 0);

                    return (
                        <div key={date} style={{ 
                            background: date === today ? 'rgba(0,242,255,0.1)' : 'rgba(255,255,255,0.05)', 
                            padding: '20px', 
                            borderRadius: '15px',
                            marginBottom: '20px',
                            border: date === today ? '2px solid #00f2ff' : '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h4 style={{ margin: 0, color: '#00f2ff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {date === today && '🔵 '}
                                    {date === today ? 'Today' : new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </h4>
                                <span style={{ 
                                    fontWeight: 'bold', 
                                    fontSize: '1.3rem',
                                    color: dayCals > calorieGoal ? '#ff4444' : '#00f2ff' 
                                }}>
                                    {dayCals} kcal
                                </span>
                            </div>
                            
                            <div style={{ 
                                fontSize: '0.95rem', 
                                color: '#aaa', 
                                marginBottom: '15px',
                                paddingBottom: '12px',
                                borderBottom: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                P: {dayProtein}g | C: {dayCarbs}g | F: {dayFat}g
                            </div>

                            {dayFoods.map(food => (
                                <div key={food._id} style={{ 
                                    fontSize: '0.95rem',
                                    padding: '12px 15px',
                                    marginBottom: '8px',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ color: '#fff', fontWeight: '500' }}>: {food.foodName}</span>
                                    </div>
                                    <span style={{ color: '#00f2ff', fontWeight: 'bold', fontSize: '1.05rem' }}>
                                        {food.calories} cal
                                    </span>
                                </div>
                            ))}
                        </div>
                    );
                })}
                {sortedDates.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#777' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📅</div>
                        <p style={{ fontSize: '1.1rem' }}>No history available yet.</p>
                        <p>Start logging your meals to see your nutrition history!</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderAnalyticsView = () => (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '15px' }}>
                    <h3 style={{ color: '#00f2ff', marginTop: 0 }}>📊 Weekly Calorie Trend</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="date" stroke="#777" />
                            <YAxis stroke="#777" />
                            <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }} />
                            <Line type="monotone" dataKey="calories" stroke="#00f2ff" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '15px' }}>
                    <h3 style={{ color: '#00f2ff', marginTop: 0 }}>🍽️ Meal Pattern</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={mealPattern} dataKey="count" nameKey="meal" cx="50%" cy="50%" outerRadius={80} label>
                                {mealPattern.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '15px' }}>
                    <h3 style={{ color: '#00f2ff', marginTop: 0 }}>🔝 Most Consumed</h3>
                    {mostConsumed.length === 0 ? <p style={{ color: '#777' }}>No data yet</p> : mostConsumed.map((food, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.05)', marginBottom: '8px', borderRadius: '8px' }}>
                            <span style={{ textTransform: 'capitalize' }}>{food.name}</span>
                            <span style={{ color: '#00f2ff', fontWeight: 'bold' }}>{food.count}x</span>
                        </div>
                    ))}
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '15px' }}>
                    <h3 style={{ color: '#00f2ff', marginTop: 0 }}>📈 Weekly Macros</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="date" stroke="#777" />
                            <YAxis stroke="#777" />
                            <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }} />
                            <Legend />
                            <Bar dataKey="protein" fill="#ff6b9d" />
                            <Bar dataKey="carbs" fill="#ffd93d" />
                            <Bar dataKey="fat" fill="#6bcf7f" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    const renderRecommendationsView = () => {
        const meals = getRecommendedMeals();
        const snacks = getSnackSuggestions();
        const alternatives = getHealthyAlternatives();
        return (
            <div>
                <div style={{ background: 'rgba(0,242,255,0.1)', border: '1px solid #00f2ff', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#00f2ff' }}>💡 Today's Status</h3>
                    <p style={{ margin: 0, fontSize: '1.1rem' }}>
                        You have <strong style={{ color: '#00f2ff' }}>{Math.max(0, remainingCals)} calories</strong> remaining
                        {remainingCals < 0 && <span style={{ color: '#ff4444' }}> (Over by {Math.abs(remainingCals)})</span>}
                    </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '15px' }}>
                        <h3 style={{ color: '#00f2ff', marginTop: 0 }}>🍽️ Restaurant Picks</h3>
                        {meals.length === 0 ? <p style={{ color: '#777' }}>Goal reached!</p> : meals.map((m, idx) => (
                            <div key={idx} style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid #00ff88', padding: '15px', marginBottom: '10px', borderRadius: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <strong style={{ color: '#00ff88' }}>{m.restaurant}</strong>
                                    <span style={{ background: '#00ff88', color: '#000', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem' }}>❤️ {m.healthScore}/10</span>
                                </div>
                                <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{m.meal}</div>
                                <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: '#aaa' }}>
                                    <span>🔥 {m.cals}</span><span>🥩 {m.p}g</span><span>🍞 {m.c}g</span><span>🥑 {m.f}g</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '15px' }}>
                        <h3 style={{ color: '#00f2ff', marginTop: 0 }}>🍿 Smart Snacks</h3>
                        {snacks.length === 0 ? <p style={{ color: '#777' }}>Skip snacks!</p> : snacks.map((s, idx) => (
                            <div key={idx} style={{ background: 'rgba(255,145,0,0.1)', border: '1px solid #ff9100', padding: '12px', marginBottom: '10px', borderRadius: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <strong style={{ color: '#ff9100' }}>{s.name}</strong>
                                    <span style={{ color: '#ff9100', fontWeight: 'bold' }}>{s.cals} cal</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#aaa' }}>P: {s.p}g | C: {s.c}g | F: {s.f}g</div>
                            </div>
                        ))}
                    </div>
                </div>
                {alternatives.length > 0 && (
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '15px' }}>
                        <h3 style={{ color: '#00f2ff', marginTop: 0 }}>🔄 Healthier Swaps</h3>
                        <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '15px' }}>Based on today's choices:</p>
                        {alternatives.map((alt, idx) => (
                            <div key={idx} style={{ marginBottom: '15px' }}>
                                <div style={{ color: '#ff6b9d', fontWeight: 'bold', marginBottom: '8px' }}>Instead of {alt.original}:</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {alt.alternatives.map((opt, i) => (
                                        <div key={i} style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid #00ff88', padding: '10px', borderRadius: '8px' }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{opt.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#aaa' }}>
                                                {opt.cals} cal <span style={{ color: '#00ff88', marginLeft: '10px' }}>Save {opt.savings}!</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="glass-panel fade-in">
            <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h2 style={{ color: '#00f2ff', margin: 0 }}>🥗 Nutrition Tracker</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {['today', 'history', 'analytics', 'recommendations'].map(v => (
                            <button key={v} onClick={() => setView(v)} style={{ 
                                padding: '8px 16px', 
                                background: view === v ? '#00f2ff' : 'rgba(255,255,255,0.1)', 
                                border: 'none', 
                                borderRadius: '6px', 
                                color: view === v ? '#000' : 'white', 
                                cursor: 'pointer', 
                                fontSize: '0.9rem', 
                                fontWeight: 'bold', 
                                textTransform: 'capitalize' 
                            }}>
                                {v === 'today' ? '📝 Today' : v === 'history' ? '📅 History' : v === 'analytics' ? '📊 Analytics' : '💡 Tips'}
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontWeight: 'bold' }}>{totalCals} / {calorieGoal} kcal</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: totalCals > calorieGoal ? '#ff4444' : 'linear-gradient(90deg, #00f2ff, #00aaff)', borderRadius: '5px', transition: 'width 0.5s' }}></div>
                </div>
            </div>
            {view === 'today' && renderTodayView()}
            {view === 'history' && renderHistoryView()}
            {view === 'analytics' && renderAnalyticsView()}
            {view === 'recommendations' && renderRecommendationsView()}
        </div>
    );
};

export default Nutrition;