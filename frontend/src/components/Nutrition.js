import { useState, useEffect } from 'react';

const Nutrition = ({ user }) => {
    const [foods, setFoods] = useState([]);
    
    // Form State
    const [form, setForm] = useState({
        foodName: '',
        calories: ''
    });

    // 1. Fetch Food History
    const fetchFood = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch('http://localhost:5000/api/food?email=${user.email}');
            if (res.ok) {
                const data = await res.json();
                setFoods(data);
            }
        } catch (err) { console.error("Fetch error:", err); }
    };

    useEffect(() => {
        fetchFood();
    }, [user]);

    // 2. Handle Input Changes (Typing)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // 3. Handle Submit (Clicking Add)
    const handleSubmit = async (e) => {
        e.preventDefault(); // Stop page reload

        if (!form.foodName || !form.calories) return;

        try {
            const res = await fetch('http://localhost:5000/api/food', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: user.email, // Sending correct field name
                    foodName: form.foodName,
                    calories: Number(form.calories) // Ensure it's a number
                })
            });

            if (res.ok) {
                // Clear form and refresh list
                setForm({ foodName: '', calories: '' });
                fetchFood();
            } else {
                const err = await res.json();
                alert("Error adding food: " + err.error);
            }
        } catch (err) { console.error("Submit error:", err); }
    };

    // 4. Quick Add from Database
    const quickAdd = (name, cals) => {
        setForm({ foodName: name, calories: cals });
    };

    // Simple Food Database for quick selection
    const foodDatabase = [
        { name: "Apple", cals: 95 },
        { name: "Banana", cals: 105 },
        { name: "Chicken Breast", cals: 165 },
        { name: "Rice (1 cup)", cals: 205 },
        { name: "Pizza Slice", cals: 285 },
        { name: "Cola", cals: 140 },
    ];

    return (
        <div className="glass-panel fade-in">
            <h2 style={{color: '#00f2ff'}}>🥗 Nutrition Tracker</h2>
            
            <div style={{display:'flex', gap:'20px', flexWrap:'wrap'}}>
                
                {/* LEFT: ADD FOOD FORM */}
                <div style={{flex: 1, minWidth:'300px'}}>
                    <form onSubmit={handleSubmit} style={{background:'rgba(255,255,255,0.05)', padding:'20px', borderRadius:'15px'}}>
                        <div style={{marginBottom:'15px'}}>
                            <label style={{color:'#aaa', display:'block', marginBottom:'5px'}}>Food Name</label>
                            <input 
                                name="foodName"
                                value={form.foodName}
                                onChange={handleInputChange}
                                placeholder="e.g. Burger"
                                style={{width:'100%', padding:'10px', borderRadius:'8px', border:'none', background:'rgba(0,0,0,0.3)', color:'white'}}
                            />
                        </div>

                        <div style={{marginBottom:'15px'}}>
                            <label style={{color:'#aaa', display:'block', marginBottom:'5px'}}>Calories</label>
                            <input 
                                type="number"
                                name="calories"
                                value={form.calories}
                                onChange={handleInputChange}
                                placeholder="e.g. 500"
                                style={{width:'100%', padding:'10px', borderRadius:'8px', border:'none', background:'rgba(0,0,0,0.3)', color:'white'}}
                            />
                        </div>

                        <button type="submit" className="primary-btn" style={{width:'100%'}}>Add Meal</button>
                    </form>

                    {/* Quick Add Buttons */}
                    <div style={{marginTop:'20px'}}>
                        <h4 style={{color:'#aaa', marginTop:0}}>Quick Add</h4>
                        <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                            {foodDatabase.map((item, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => quickAdd(item.name, item.cals)}
                                    style={{
                                        background:'rgba(255,255,255,0.1)', 
                                        border:'1px solid #00f2ff', 
                                        color:'white', 
                                        padding:'5px 10px', 
                                        borderRadius:'20px', 
                                        cursor:'pointer',
                                        fontSize:'0.8rem'
                                    }}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: HISTORY */}
                <div style={{flex: 1, minWidth:'300px'}}>
                    <h3 style={{marginTop:0}}>Today's Meals</h3>
                    <div style={{maxHeight:'400px', overflowY:'auto'}}>
                        {foods.length === 0 ? (
                            <p style={{color:'#777'}}>No meals added yet.</p>
                        ) : (
                            foods.map((item) => (
                                <div key={item._id} style={{
                                    display:'flex', 
                                    justifyContent:'space-between', 
                                    alignItems:'center',
                                    background:'rgba(0,0,0,0.3)', 
                                    padding:'15px', 
                                    marginBottom:'10px', 
                                    borderRadius:'10px',
                                    borderLeft:'4px solid #00f2ff'
                                }}>
                                    <div>
                                        <div style={{fontWeight:'bold', fontSize:'1.1rem'}}>{item.foodName}</div>
                                        <div style={{color:'#aaa', fontSize:'0.8rem'}}>{item.date}</div>
                                    </div>
                                    <div style={{color:'#00f2ff', fontWeight:'bold', fontSize:'1.2rem'}}>
                                        {item.calories} <small style={{fontSize:'0.8rem', color:'#aaa'}}>kcal</small>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Nutrition;