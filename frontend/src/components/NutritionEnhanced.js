import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ✅ PREDEFINED FOODS DATABASE with full nutrition info
const QUICK_ADD_FOODS = [
    {
        name: '🍚 White Rice (1 cup)',
        calories: 206,
        protein: 4.3,
        carbs: 45,
        fat: 0.4,
        fiber: 0.6,
        sugar: 0.1,
        // Vitamins
        vitaminB1: 0.26,
        vitaminB3: 2.3,
        vitaminB6: 0.15,
        folate: 5,
        // Minerals
        magnesium: 19,
        phosphorus: 68,
        potassium: 55,
        sodium: 2,
        zinc: 0.8,
        selenium: 11.9
    },
    {
        name: '🍞 Whole Wheat Bread (2 slices)',
        calories: 160,
        protein: 8,
        carbs: 28,
        fat: 2,
        fiber: 4,
        sugar: 4,
        // Vitamins
        vitaminB1: 0.2,
        vitaminB2: 0.1,
        vitaminB3: 3.5,
        vitaminB6: 0.1,
        folate: 40,
        // Minerals
        calcium: 60,
        iron: 2.5,
        magnesium: 46,
        phosphorus: 134,
        potassium: 143,
        sodium: 280,
        zinc: 1.2,
        selenium: 18
    },
    {
        name: '🥚 Boiled Eggs (2 large)',
        calories: 155,
        protein: 13,
        carbs: 1.1,
        fat: 11,
        fiber: 0,
        sugar: 1.1,
        // Vitamins
        vitaminA: 149,
        vitaminD: 2,
        vitaminE: 1.05,
        vitaminB2: 0.51,
        vitaminB12: 1.1,
        folate: 44,
        // Minerals
        calcium: 50,
        iron: 1.2,
        phosphorus: 172,
        potassium: 126,
        sodium: 124,
        zinc: 1.05,
        selenium: 30.8
    },
    {
        name: '🍗 Chicken Breast (100g)',
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        fiber: 0,
        sugar: 0,
        // Vitamins
        vitaminB3: 13.7,
        vitaminB6: 0.6,
        vitaminB12: 0.3,
        // Minerals
        phosphorus: 228,
        potassium: 256,
        sodium: 74,
        zinc: 1,
        selenium: 27.6
    },
    {
        name: '🥛 Milk (1 cup)',
        calories: 149,
        protein: 8,
        carbs: 12,
        fat: 8,
        fiber: 0,
        sugar: 12,
        // Vitamins
        vitaminA: 112,
        vitaminD: 2.9,
        vitaminB2: 0.45,
        vitaminB12: 1.1,
        // Minerals
        calcium: 276,
        phosphorus: 222,
        potassium: 322,
        sodium: 105,
        zinc: 0.9,
        selenium: 9
    },
    {
        name: '🍌 Banana (1 medium)',
        calories: 105,
        protein: 1.3,
        carbs: 27,
        fat: 0.4,
        fiber: 3.1,
        sugar: 14,
        // Vitamins
        vitaminC: 10.3,
        vitaminB6: 0.4,
        folate: 24,
        // Minerals
        magnesium: 32,
        phosphorus: 26,
        potassium: 422,
        sodium: 1,
        selenium: 1.2
    },
    {
        name: '🥗 Green Salad (1 bowl)',
        calories: 50,
        protein: 2,
        carbs: 10,
        fat: 0.5,
        fiber: 3,
        sugar: 3,
        // Vitamins
        vitaminA: 740,
        vitaminC: 18,
        vitaminK: 120,
        folate: 80,
        // Minerals
        calcium: 70,
        iron: 1.5,
        magnesium: 20,
        potassium: 250,
        sodium: 15
    },
    {
        name: '🍎 Apple (1 medium)',
        calories: 95,
        protein: 0.5,
        carbs: 25,
        fat: 0.3,
        fiber: 4.4,
        sugar: 19,
        // Vitamins
        vitaminC: 8.4,
        vitaminK: 4,
        // Minerals
        calcium: 11,
        potassium: 195,
        phosphorus: 20
    },
    {
        name: '🥜 Almonds (1 oz / 23 nuts)',
        calories: 164,
        protein: 6,
        carbs: 6,
        fat: 14,
        fiber: 3.5,
        sugar: 1.2,
        // Vitamins
        vitaminE: 7.3,
        vitaminB2: 0.3,
        // Minerals
        calcium: 76,
        iron: 1.05,
        magnesium: 77,
        phosphorus: 136,
        potassium: 208,
        zinc: 0.9,
        selenium: 1.2
    },
    {
        name: '🍝 Pasta (1 cup cooked)',
        calories: 220,
        protein: 8,
        carbs: 43,
        fat: 1.3,
        fiber: 2.5,
        sugar: 0.8,
        // Vitamins
        vitaminB1: 0.4,
        vitaminB3: 3.5,
        folate: 98,
        // Minerals
        iron: 1.8,
        magnesium: 25,
        phosphorus: 76,
        potassium: 62,
        selenium: 26.4
    },
    {
        name: '🥔 Baked Potato (1 medium)',
        calories: 161,
        protein: 4.3,
        carbs: 37,
        fat: 0.2,
        fiber: 3.8,
        sugar: 1.9,
        // Vitamins
        vitaminC: 16.6,
        vitaminB6: 0.5,
        folate: 48,
        // Minerals
        magnesium: 48,
        phosphorus: 121,
        potassium: 926,
        sodium: 17
    },
    {
        name: '🐟 Salmon (100g)',
        calories: 208,
        protein: 20,
        carbs: 0,
        fat: 13,
        fiber: 0,
        sugar: 0,
        // Vitamins
        vitaminA: 12,
        vitaminD: 11,
        vitaminE: 1.1,
        vitaminB3: 8.5,
        vitaminB6: 0.6,
        vitaminB12: 3.2,
        // Minerals
        calcium: 13,
        iron: 0.8,
        magnesium: 29,
        phosphorus: 252,
        potassium: 363,
        sodium: 59,
        zinc: 0.6,
        selenium: 36.5
    },
    {
        name: '🥦 Broccoli (1 cup)',
        calories: 55,
        protein: 3.7,
        carbs: 11,
        fat: 0.6,
        fiber: 5.1,
        sugar: 2.2,
        // Vitamins
        vitaminA: 120,
        vitaminC: 135,
        vitaminK: 220,
        vitaminB6: 0.3,
        folate: 108,
        // Minerals
        calcium: 62,
        iron: 1,
        magnesium: 33,
        phosphorus: 104,
        potassium: 457,
        sodium: 46,
        zinc: 0.6,
        selenium: 3.9
    },
    {
        name: '🍊 Orange (1 medium)',
        calories: 62,
        protein: 1.2,
        carbs: 15,
        fat: 0.2,
        fiber: 3.1,
        sugar: 12,
        // Vitamins
        vitaminC: 70,
        vitaminA: 14,
        folate: 40,
        // Minerals
        calcium: 52,
        potassium: 237,
        magnesium: 13
    },
    {
        name: '🍕 Pizza Slice (1 regular)',
        calories: 285,
        protein: 12,
        carbs: 36,
        fat: 10,
        fiber: 2.5,
        sugar: 3.8,
        // Vitamins
        vitaminA: 75,
        vitaminC: 2,
        vitaminB1: 0.3,
        vitaminB3: 4,
        folate: 70,
        // Minerals
        calcium: 220,
        iron: 2.5,
        phosphorus: 230,
        potassium: 184,
        sodium: 640,
        zinc: 1.6
    }
];

const NutritionEnhanced = ({ user, onUpdate }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [foods, setFoods] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [showMicronutrients, setShowMicronutrients] = useState(false);
    const [microSummary, setMicroSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Custom amount modal
    const [selectedQuickFood, setSelectedQuickFood] = useState(null);
    const [customAmount, setCustomAmount] = useState(100);
    
    // Form state with micronutrients
    const [foodForm, setFoodForm] = useState({
        foodName: '',
        calories: '',
        mealType: 'Breakfast',
        protein: '', carbs: '', fat: '', fiber: '', sugar: '',
        vitaminA: '', vitaminC: '', vitaminD: '', vitaminE: '', vitaminK: '',
        vitaminB1: '', vitaminB2: '', vitaminB3: '', vitaminB6: '', vitaminB12: '',
        folate: '',
        calcium: '', iron: '', magnesium: '', phosphorus: '', potassium: '',
        sodium: '', zinc: '', copper: '', selenium: ''
    });

    useEffect(() => {
        fetchFoods();
        if (showMicronutrients) {
            fetchMicronutrientSummary();
        }
    }, [date, user, showMicronutrients]);

    const fetchFoods = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/food?email=${user.email}`);
            if (res.ok) {
                const data = await res.json();
                const filtered = data.filter(f => f.date === date);
                setFoods(filtered);
            }
        } catch (err) {
            console.error('Error fetching foods:', err);
        }
    };

    const fetchMicronutrientSummary = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/food/micronutrients?email=${user.email}&date=${date}`);
            if (res.ok) {
                const data = await res.json();
                setMicroSummary(data);
            }
        } catch (err) {
            console.error('Error fetching micronutrients:', err);
        }
    };

    // ✅ QUICK ADD FOOD with custom amount
    const handleQuickAddClick = (food) => {
        setSelectedQuickFood(food);
        setCustomAmount(100); // Default to 100%
    };

    const confirmQuickAdd = async () => {
        if (!selectedQuickFood) return;
        
        setLoading(true);
        const multiplier = customAmount / 100;
        
        try {
            const payload = {
                user_email: user.email,
                date,
                foodName: selectedQuickFood.name,
                calories: Math.round(selectedQuickFood.calories * multiplier),
                protein: Math.round(selectedQuickFood.protein * multiplier * 10) / 10,
                carbs: Math.round(selectedQuickFood.carbs * multiplier * 10) / 10,
                fat: Math.round(selectedQuickFood.fat * multiplier * 10) / 10,
                fiber: Math.round((selectedQuickFood.fiber || 0) * multiplier * 10) / 10,
                sugar: Math.round((selectedQuickFood.sugar || 0) * multiplier * 10) / 10,
                mealType: getCurrentMealType(),
                // Vitamins
                vitaminA: Math.round((selectedQuickFood.vitaminA || 0) * multiplier * 10) / 10,
                vitaminC: Math.round((selectedQuickFood.vitaminC || 0) * multiplier * 10) / 10,
                vitaminD: Math.round((selectedQuickFood.vitaminD || 0) * multiplier * 10) / 10,
                vitaminE: Math.round((selectedQuickFood.vitaminE || 0) * multiplier * 10) / 10,
                vitaminK: Math.round((selectedQuickFood.vitaminK || 0) * multiplier * 10) / 10,
                vitaminB1: Math.round((selectedQuickFood.vitaminB1 || 0) * multiplier * 100) / 100,
                vitaminB2: Math.round((selectedQuickFood.vitaminB2 || 0) * multiplier * 100) / 100,
                vitaminB3: Math.round((selectedQuickFood.vitaminB3 || 0) * multiplier * 10) / 10,
                vitaminB6: Math.round((selectedQuickFood.vitaminB6 || 0) * multiplier * 100) / 100,
                vitaminB12: Math.round((selectedQuickFood.vitaminB12 || 0) * multiplier * 10) / 10,
                folate: Math.round((selectedQuickFood.folate || 0) * multiplier * 10) / 10,
                // Minerals
                calcium: Math.round((selectedQuickFood.calcium || 0) * multiplier * 10) / 10,
                iron: Math.round((selectedQuickFood.iron || 0) * multiplier * 10) / 10,
                magnesium: Math.round((selectedQuickFood.magnesium || 0) * multiplier * 10) / 10,
                phosphorus: Math.round((selectedQuickFood.phosphorus || 0) * multiplier * 10) / 10,
                potassium: Math.round((selectedQuickFood.potassium || 0) * multiplier * 10) / 10,
                sodium: Math.round((selectedQuickFood.sodium || 0) * multiplier * 10) / 10,
                zinc: Math.round((selectedQuickFood.zinc || 0) * multiplier * 10) / 10,
                copper: Math.round((selectedQuickFood.copper || 0) * multiplier * 100) / 100,
                selenium: Math.round((selectedQuickFood.selenium || 0) * multiplier * 10) / 10
            };

            const res = await fetch(`${API_BASE_URL}/api/food`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('✅ Food added successfully!');
                setSelectedQuickFood(null);
                fetchFoods();
                if (showMicronutrients) fetchMicronutrientSummary();
                if (onUpdate) onUpdate();
            }
        } catch (err) {
            console.error(err);
            alert('Error adding food');
        } finally {
            setLoading(false);
        }
    };

    // Determine meal type based on current time
    const getCurrentMealType = () => {
        const hour = new Date().getHours();
        if (hour < 11) return 'Breakfast';
        if (hour < 16) return 'Lunch';
        if (hour < 21) return 'Dinner';
        return 'Snack';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = { user_email: user.email, date, ...foodForm };
            Object.keys(payload).forEach(key => {
                if (key !== 'user_email' && key !== 'date' && key !== 'foodName' && key !== 'mealType') {
                    payload[key] = payload[key] === '' ? 0 : parseFloat(payload[key]);
                }
            });

            const res = await fetch(`${API_BASE_URL}/api/food`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('✅ Food logged successfully!');
                setShowForm(false);
                resetForm();
                fetchFoods();
                if (showMicronutrients) fetchMicronutrientSummary();
                if (onUpdate) onUpdate();
            } else {
                const data = await res.json();
                alert(`Error: ${data.message || 'Failed to log food'}`);
            }
        } catch (err) {
            console.error(err);
            alert('Error logging food');
        } finally {
            setLoading(false);
        }
    };

    const deleteFood = async (id) => {
        if (!window.confirm('Delete this food entry?')) return;
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/food/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchFoods();
                if (showMicronutrients) fetchMicronutrientSummary();
                if (onUpdate) onUpdate();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const resetForm = () => {
        setFoodForm({
            foodName: '', calories: '', mealType: 'Breakfast',
            protein: '', carbs: '', fat: '', fiber: '', sugar: '',
            vitaminA: '', vitaminC: '', vitaminD: '', vitaminE: '', vitaminK: '',
            vitaminB1: '', vitaminB2: '', vitaminB3: '', vitaminB6: '', vitaminB12: '',
            folate: '', calcium: '', iron: '', magnesium: '', phosphorus: '', potassium: '',
            sodium: '', zinc: '', copper: '', selenium: ''
        });
    };

    const totals = foods.reduce((acc, food) => {
        acc.calories += food.calories || 0;
        acc.protein += food.protein || 0;
        acc.carbs += food.carbs || 0;
        acc.fat += food.fat || 0;
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#00f2ff', margin: 0 }}>🥗 Nutrition Tracker</h2>
                <input 
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    style={{ padding: '10px', borderRadius: '8px' }}
                />
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <SummaryCard title="Calories" value={Math.round(totals.calories)} unit="kcal" color="#00f2ff" />
                <SummaryCard title="Protein" value={Math.round(totals.protein)} unit="g" color="#ff4444" />
                <SummaryCard title="Carbs" value={Math.round(totals.carbs)} unit="g" color="#ffa502" />
                <SummaryCard title="Fat" value={Math.round(totals.fat)} unit="g" color="#a55eea" />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button 
                    onClick={() => { setShowQuickAdd(!showQuickAdd); setShowForm(false); }}
                    className="primary-btn"
                    style={{ background: showQuickAdd ? 'linear-gradient(45deg, #00ff88, #00cc6a)' : 'linear-gradient(45deg, #00f2ff, #00aaff)' }}
                >
                    {showQuickAdd ? '❌ Close Quick Add' : '⚡ Quick Add Food'}
                </button>
                <button 
                    onClick={() => { setShowForm(!showForm); setShowQuickAdd(false); }}
                    className="primary-btn"
                >
                    {showForm ? '❌ Cancel' : '➕ Add Custom Food'}
                </button>
                <button 
                    onClick={() => setShowMicronutrients(!showMicronutrients)}
                    className="primary-btn"
                    style={{ background: showMicronutrients ? 'linear-gradient(45deg, #a55eea, #8e44ad)' : 'linear-gradient(45deg, #00f2ff, #00aaff)' }}
                >
                    {showMicronutrients ? '📊 Hide Micronutrients' : '🔬 Show Micronutrients'}
                </button>
            </div>

            {/* ✅ QUICK ADD SECTION */}
            {showQuickAdd && (
                <div className="glass-panel" style={{ marginBottom: '20px' }}>
                    <h3 style={{ marginBottom: '20px', color: '#00ff88' }}>⚡ Quick Add - Common Foods</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                        {QUICK_ADD_FOODS.map((food, index) => (
                            <button
                                key={index}
                                onClick={() => handleQuickAddClick(food)}
                                style={{
                                    background: 'rgba(0, 255, 136, 0.1)',
                                    border: '2px solid rgba(0, 255, 136, 0.3)',
                                    borderRadius: '10px',
                                    padding: '15px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    textAlign: 'left'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(0, 255, 136, 0.2)';
                                    e.currentTarget.style.borderColor = '#00ff88';
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(0, 255, 136, 0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.3)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '5px', color: '#fff' }}>
                                    {food.name}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#aaa' }}>
                                    {food.calories} kcal | P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ✅ CUSTOM AMOUNT MODAL */}
            {selectedQuickFood && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ maxWidth: '400px', width: '90%' }}>
                        <h3 style={{ color: '#00ff88', marginBottom: '15px' }}>Adjust Amount</h3>
                        <p style={{ color: '#ccc', marginBottom: '20px' }}>
                            <strong>{selectedQuickFood.name}</strong>
                        </p>
                        
                        <label style={{ display: 'block', marginBottom: '10px', color: '#aaa' }}>
                            Amount (% of standard serving):
                        </label>
                        <input 
                            type="range"
                            min="25"
                            max="300"
                            step="25"
                            value={customAmount}
                            onChange={e => setCustomAmount(parseInt(e.target.value))}
                            style={{ width: '100%', marginBottom: '15px' }}
                        />
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00ff88' }}>
                                {customAmount}%
                            </span>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                            <div style={{ fontSize: '0.9rem', color: '#ccc' }}>
                                <div>Calories: <strong>{Math.round(selectedQuickFood.calories * customAmount / 100)}</strong> kcal</div>
                                <div>Protein: <strong>{Math.round(selectedQuickFood.protein * customAmount / 10) / 10}</strong>g</div>
                                <div>Carbs: <strong>{Math.round(selectedQuickFood.carbs * customAmount / 10) / 10}</strong>g</div>
                                <div>Fat: <strong>{Math.round(selectedQuickFood.fat * customAmount / 10) / 10}</strong>g</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={confirmQuickAdd}
                                className="primary-btn"
                                disabled={loading}
                                style={{ flex: 1, background: 'linear-gradient(45deg, #00ff88, #00cc6a)' }}
                            >
                                {loading ? '⏳ Adding...' : '✅ Add Food'}
                            </button>
                            <button 
                                onClick={() => setSelectedQuickFood(null)}
                                className="danger-btn"
                                style={{ flex: 1 }}
                            >
                                ❌ Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Add Food Form */}
            {showForm && (
                <div className="glass-panel" style={{ marginBottom: '20px' }}>
                    <h3 style={{ marginBottom: '20px', color: '#00f2ff' }}>Add Custom Food Entry</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                            <input 
                                type="text"
                                placeholder="Food Name *"
                                value={foodForm.foodName}
                                onChange={e => setFoodForm({...foodForm, foodName: e.target.value})}
                                required
                            />
                            <select 
                                value={foodForm.mealType}
                                onChange={e => setFoodForm({...foodForm, mealType: e.target.value})}
                            >
                                <option>Breakfast</option>
                                <option>Lunch</option>
                                <option>Dinner</option>
                                <option>Snack</option>
                            </select>
                        </div>

                        <h4 style={{ color: '#00f2ff', marginBottom: '10px' }}>📊 Macronutrients</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                            <NumericInput label="Calories (kcal) *" value={foodForm.calories} onChange={val => setFoodForm({...foodForm, calories: val})} required />
                            <NumericInput label="Protein (g)" value={foodForm.protein} onChange={val => setFoodForm({...foodForm, protein: val})} />
                            <NumericInput label="Carbs (g)" value={foodForm.carbs} onChange={val => setFoodForm({...foodForm, carbs: val})} />
                            <NumericInput label="Fat (g)" value={foodForm.fat} onChange={val => setFoodForm({...foodForm, fat: val})} />
                            <NumericInput label="Fiber (g)" value={foodForm.fiber} onChange={val => setFoodForm({...foodForm, fiber: val})} />
                            <NumericInput label="Sugar (g)" value={foodForm.sugar} onChange={val => setFoodForm({...foodForm, sugar: val})} />
                        </div>

                        <details style={{ marginBottom: '20px' }}>
                            <summary style={{ cursor: 'pointer', color: '#ffa502', fontWeight: 'bold', marginBottom: '10px' }}>
                                💊 Vitamins (Optional - Click to expand)
                            </summary>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', paddingTop: '10px' }}>
                                <NumericInput label="Vitamin A (mcg)" value={foodForm.vitaminA} onChange={val => setFoodForm({...foodForm, vitaminA: val})} />
                                <NumericInput label="Vitamin C (mg)" value={foodForm.vitaminC} onChange={val => setFoodForm({...foodForm, vitaminC: val})} />
                                <NumericInput label="Vitamin D (mcg)" value={foodForm.vitaminD} onChange={val => setFoodForm({...foodForm, vitaminD: val})} />
                                <NumericInput label="Vitamin E (mg)" value={foodForm.vitaminE} onChange={val => setFoodForm({...foodForm, vitaminE: val})} />
                                <NumericInput label="Vitamin K (mcg)" value={foodForm.vitaminK} onChange={val => setFoodForm({...foodForm, vitaminK: val})} />
                                <NumericInput label="Vitamin B1 (mg)" value={foodForm.vitaminB1} onChange={val => setFoodForm({...foodForm, vitaminB1: val})} />
                                <NumericInput label="Vitamin B2 (mg)" value={foodForm.vitaminB2} onChange={val => setFoodForm({...foodForm, vitaminB2: val})} />
                                <NumericInput label="Vitamin B3 (mg)" value={foodForm.vitaminB3} onChange={val => setFoodForm({...foodForm, vitaminB3: val})} />
                                <NumericInput label="Vitamin B6 (mg)" value={foodForm.vitaminB6} onChange={val => setFoodForm({...foodForm, vitaminB6: val})} />
                                <NumericInput label="Vitamin B12 (mcg)" value={foodForm.vitaminB12} onChange={val => setFoodForm({...foodForm, vitaminB12: val})} />
                                <NumericInput label="Folate (mcg)" value={foodForm.folate} onChange={val => setFoodForm({...foodForm, folate: val})} />
                            </div>
                        </details>

                        <details style={{ marginBottom: '20px' }}>
                            <summary style={{ cursor: 'pointer', color: '#a55eea', fontWeight: 'bold', marginBottom: '10px' }}>
                                ⚗️ Minerals (Optional - Click to expand)
                            </summary>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', paddingTop: '10px' }}>
                                <NumericInput label="Calcium (mg)" value={foodForm.calcium} onChange={val => setFoodForm({...foodForm, calcium: val})} />
                                <NumericInput label="Iron (mg)" value={foodForm.iron} onChange={val => setFoodForm({...foodForm, iron: val})} />
                                <NumericInput label="Magnesium (mg)" value={foodForm.magnesium} onChange={val => setFoodForm({...foodForm, magnesium: val})} />
                                <NumericInput label="Phosphorus (mg)" value={foodForm.phosphorus} onChange={val => setFoodForm({...foodForm, phosphorus: val})} />
                                <NumericInput label="Potassium (mg)" value={foodForm.potassium} onChange={val => setFoodForm({...foodForm, potassium: val})} />
                                <NumericInput label="Sodium (mg)" value={foodForm.sodium} onChange={val => setFoodForm({...foodForm, sodium: val})} />
                                <NumericInput label="Zinc (mg)" value={foodForm.zinc} onChange={val => setFoodForm({...foodForm, zinc: val})} />
                                <NumericInput label="Copper (mg)" value={foodForm.copper} onChange={val => setFoodForm({...foodForm, copper: val})} />
                                <NumericInput label="Selenium (mcg)" value={foodForm.selenium} onChange={val => setFoodForm({...foodForm, selenium: val})} />
                            </div>
                        </details>

                        <button type="submit" className="primary-btn" disabled={loading} style={{ width: '100%' }}>
                            {loading ? '⏳ Adding...' : '✅ Add Food'}
                        </button>
                    </form>
                </div>
            )}

            {/* Micronutrient Summary */}
            {showMicronutrients && microSummary && (
                <div className="glass-panel" style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: '#a55eea', marginBottom: '20px' }}>🔬 Micronutrient Analysis for {date}</h3>
                    
                    <h4 style={{ color: '#ffa502', marginBottom: '15px' }}>💊 Vitamins</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                        <MicroCard name="Vitamin A" value={microSummary.totals.vitaminA} dv={microSummary.dailyValues.vitaminA} percent={microSummary.percentages.vitaminA} unit="mcg" />
                        <MicroCard name="Vitamin C" value={microSummary.totals.vitaminC} dv={microSummary.dailyValues.vitaminC} percent={microSummary.percentages.vitaminC} unit="mg" />
                        <MicroCard name="Vitamin D" value={microSummary.totals.vitaminD} dv={microSummary.dailyValues.vitaminD} percent={microSummary.percentages.vitaminD} unit="mcg" />
                        <MicroCard name="Vitamin E" value={microSummary.totals.vitaminE} dv={microSummary.dailyValues.vitaminE} percent={microSummary.percentages.vitaminE} unit="mg" />
                        <MicroCard name="Vitamin K" value={microSummary.totals.vitaminK} dv={microSummary.dailyValues.vitaminK} percent={microSummary.percentages.vitaminK} unit="mcg" />
                        <MicroCard name="Vitamin B12" value={microSummary.totals.vitaminB12} dv={microSummary.dailyValues.vitaminB12} percent={microSummary.percentages.vitaminB12} unit="mcg" />
                    </div>

                    <h4 style={{ color: '#00f2ff', marginBottom: '15px' }}>⚗️ Minerals</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                        <MicroCard name="Calcium" value={microSummary.totals.calcium} dv={microSummary.dailyValues.calcium} percent={microSummary.percentages.calcium} unit="mg" />
                        <MicroCard name="Iron" value={microSummary.totals.iron} dv={microSummary.dailyValues.iron} percent={microSummary.percentages.iron} unit="mg" />
                        <MicroCard name="Magnesium" value={microSummary.totals.magnesium} dv={microSummary.dailyValues.magnesium} percent={microSummary.percentages.magnesium} unit="mg" />
                        <MicroCard name="Potassium" value={microSummary.totals.potassium} dv={microSummary.dailyValues.potassium} percent={microSummary.percentages.potassium} unit="mg" />
                        <MicroCard name="Sodium" value={microSummary.totals.sodium} dv={microSummary.dailyValues.sodium} percent={microSummary.percentages.sodium} unit="mg" />
                        <MicroCard name="Zinc" value={microSummary.totals.zinc} dv={microSummary.dailyValues.zinc} percent={microSummary.percentages.zinc} unit="mg" />
                    </div>
                </div>
            )}

            {/* Food List */}
            <div className="glass-panel">
                <h3 style={{ marginBottom: '15px' }}>Today's Food Log</h3>
                {foods.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>
                        No food logged for this date. Use Quick Add or add custom food!
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {foods.map(food => (
                            <div key={food._id} style={{
                                background: 'rgba(255,255,255,0.05)',
                                padding: '15px',
                                borderRadius: '10px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderLeft: `4px solid ${
                                    food.mealType === 'Breakfast' ? '#ffa502' :
                                    food.mealType === 'Lunch' ? '#00f2ff' :
                                    food.mealType === 'Dinner' ? '#a55eea' : '#00ff88'
                                }`
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                        <strong style={{ fontSize: '1.1rem' }}>{food.foodName}</strong>
                                        <span style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            padding: '2px 10px',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {food.mealType}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#aaa' }}>
                                        {food.calories} kcal • P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                                    </div>
                                </div>
                                <button 
                                    onClick={() => deleteFood(food._id)}
                                    className="danger-btn"
                                    style={{ padding: '8px 15px' }}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper Components
const SummaryCard = ({ title, value, unit, color }) => (
    <div className="glass-panel" style={{ textAlign: 'center', borderTop: `4px solid ${color}`, padding: '20px' }}>
        <div style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '5px', textTransform: 'uppercase' }}>{title}</div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: color }}>{value}</div>
        <div style={{ color: '#888', fontSize: '0.9rem' }}>{unit}</div>
    </div>
);

const NumericInput = ({ label, value, onChange, required = false }) => (
    <div>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '5px' }}>
            {label}
        </label>
        <input 
            type="number"
            step="0.1"
            value={value}
            onChange={e => onChange(e.target.value)}
            required={required}
            style={{ width: '100%' }}
        />
    </div>
);

const MicroCard = ({ name, value, dv, percent, unit }) => {
    const getColor = (pct) => {
        if (pct >= 100) return '#00ff88';
        if (pct >= 50) return '#ffa502';
        return '#ff4444';
    };

    return (
        <div style={{
            background: 'rgba(255,255,255,0.05)',
            padding: '15px',
            borderRadius: '10px',
            borderLeft: `4px solid ${getColor(percent)}`
        }}>
            <div style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '5px' }}>{name}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', marginBottom: '5px' }}>
                {value.toFixed(1)} <span style={{ fontSize: '0.9rem', color: '#888' }}>{unit}</span>
            </div>
            <div style={{ marginBottom: '10px' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                        width: `${Math.min(100, percent)}%`,
                        height: '100%',
                        background: getColor(percent),
                        transition: 'width 0.3s'
                    }} />
                </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#aaa' }}>
                {percent}% of {dv} {unit} DV
            </div>
        </div>
    );
};

export default NutritionEnhanced;