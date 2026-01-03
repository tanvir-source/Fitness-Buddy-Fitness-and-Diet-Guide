import { useState, useEffect } from 'react';

const MealPlanner = ({ user }) => {
  const [view, setView] = useState('generator'); // 'generator' or 'plan'
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);

  // Form state for meal plan generation
  const [formData, setFormData] = useState({
    planType: '7-day',
    calorieTarget: 2000,
    dietaryPreference: 'Vegetarian',
    cuisinePreference: 'Mixed',
    cookingTime: 'Any'
  });

  // Fetch active meal plan on component mount
  useEffect(() => {
    fetchActivePlan();
  }, [user]);

  const fetchActivePlan = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`http://localhost:5000/api/mealplan/active?email=${user.email}`);
      if (res.ok) {
        const data = await res.json();
        setActivePlan(data);
        setView('plan');
      } else {
        setActivePlan(null);
        setView('generator');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Generate meal plan
  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('http://localhost:5000/api/mealplan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: user.email,
          ...formData
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActivePlan(data.mealPlan);
        setView('plan');
        alert('Meal plan generated successfully! 🎉');
      } else {
        const errorData = await res.json();
        console.error('Error response:', errorData);
        alert('Failed to generate meal plan: ' + (errorData.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Network error:', err);
      alert('Error generating meal plan. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Swap a meal
  const handleSwapMeal = async (day, mealType) => {
    if (!activePlan) return;
    
    try {
      const res = await fetch('http://localhost:5000/api/mealplan/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: activePlan._id,
          day,
          mealType
        })
      });

      if (res.ok) {
        fetchActivePlan(); // Refresh the plan
        alert(`${mealType} swapped successfully! 🔄`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete meal plan
  const handleDeletePlan = async () => {
    if (!activePlan || !window.confirm('Delete this meal plan?')) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/mealplan/${activePlan._id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setActivePlan(null);
        setView('generator');
        alert('Meal plan deleted');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // GENERATOR VIEW
  if (view === 'generator') {
    return (
      <div className="glass-panel fade-in">
        <h2 style={{ color: '#00f2ff', marginBottom: '20px' }}>🍽️ Meal Plan Generator</h2>
        <p style={{ color: '#aaa', marginBottom: '30px' }}>Create a personalized meal plan based on your goals and preferences</p>

        <form onSubmit={handleGenerate} style={{ maxWidth: '600px' }}>
          
          {/* Plan Duration */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '0.9rem' }}>Plan Duration</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, planType: '7-day' })}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: formData.planType === '7-day' ? 'linear-gradient(45deg, #00f2ff, #00aaff)' : 'rgba(255,255,255,0.1)',
                  color: formData.planType === '7-day' ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, planType: '30-day' })}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: formData.planType === '30-day' ? 'linear-gradient(45deg, #00f2ff, #00aaff)' : 'rgba(255,255,255,0.1)',
                  color: formData.planType === '30-day' ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                30 Days
              </button>
            </div>
          </div>

          {/* Calorie Target */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '0.9rem' }}>
              Daily Calorie Target: <span style={{ color: '#00f2ff', fontWeight: 'bold' }}>{formData.calorieTarget} kcal</span>
            </label>
            <input
              type="range"
              min="1200"
              max="4000"
              step="100"
              value={formData.calorieTarget}
              onChange={(e) => setFormData({ ...formData, calorieTarget: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: '#00f2ff' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#777', marginTop: '5px' }}>
              <span>1200</span>
              <span>4000</span>
            </div>
          </div>

          {/* Dietary Preference */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '0.9rem' }}>Dietary Preference</label>
            <select
              value={formData.dietaryPreference}
              onChange={(e) => setFormData({ ...formData, dietaryPreference: e.target.value })}
              style={inputStyle}
            >
              <option>Vegetarian</option>
              <option>Non-Vegetarian</option>
              <option>Vegan</option>
              <option>Keto</option>
              <option>Paleo</option>
            </select>
          </div>

          {/* Cuisine Preference */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '0.9rem' }}>Cuisine Preference</label>
            <select
              value={formData.cuisinePreference}
              onChange={(e) => setFormData({ ...formData, cuisinePreference: e.target.value })}
              style={inputStyle}
            >
              <option>Mixed</option>
              <option>Indian</option>
              <option>Continental</option>
              <option>Asian</option>
              <option>Mediterranean</option>
            </select>
          </div>



          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="primary-btn"
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '1.1rem',
              background: loading ? '#555' : 'linear-gradient(45deg, #00f2ff, #00aaff)',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Generating...' : '✨ Generate My Meal Plan'}
          </button>
        </form>

        {/* Info Box */}
        <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(0,242,255,0.1)', borderRadius: '10px', borderLeft: '4px solid #00f2ff' }}>
          <h4 style={{ color: '#00f2ff', marginTop: 0 }}>📋 How It Works</h4>
          <ul style={{ color: '#aaa', lineHeight: '1.8' }}>
            <li>Analyzes your calorie target and preferences</li>
            <li>Generates balanced meals with proper macro distribution</li>
            <li>Each meal includes ingredients and cooking instructions</li>
            <li>You can swap any meal you don't like</li>
          </ul>
        </div>
      </div>
    );
  }

  // MEAL PLAN VIEW
  if (view === 'plan' && activePlan) {
    const currentDayMeals = activePlan.meals.find(m => m.day === selectedDay);
    const totalDays = activePlan.planType === '7-day' ? 7 : 30;

    return (
      <div className="glass-panel fade-in">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h2 style={{ color: '#00f2ff', margin: 0 }}>🍽️ Your {activePlan.planType} Meal Plan</h2>
            <p style={{ color: '#aaa', margin: '5px 0' }}>
              {activePlan.calorieTarget} kcal/day • {activePlan.dietaryPreference} • {activePlan.cuisinePreference}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setView('generator')}
              style={{
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: '1px solid #00f2ff',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              🔄 New Plan
            </button>
            <button
              onClick={handleDeletePlan}
              style={{
                padding: '10px 20px',
                background: 'rgba(255,68,68,0.2)',
                color: '#ff4444',
                border: '1px solid #ff4444',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              🗑️ Delete
            </button>
          </div>
        </div>

        {/* Day Selector */}
        <div style={{ marginBottom: '30px', overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '10px' }}>
          {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                padding: '10px 20px',
                margin: '0 5px',
                background: selectedDay === day ? 'linear-gradient(45deg, #00f2ff, #00aaff)' : 'rgba(255,255,255,0.1)',
                color: selectedDay === day ? '#000' : '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: selectedDay === day ? 'bold' : 'normal'
              }}
            >
              Day {day}
            </button>
          ))}
        </div>

        {/* Meals Grid */}
        {currentDayMeals && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            
            {/* Breakfast Card */}
            <MealCard
              title="🌅 Breakfast"
              meal={currentDayMeals.breakfast}
              color="#ffa502"
              onSwap={() => handleSwapMeal(selectedDay, 'breakfast')}
            />

            {/* Lunch Card */}
            <MealCard
              title="🌞 Lunch"
              meal={currentDayMeals.lunch}
              color="#00f2ff"
              onSwap={() => handleSwapMeal(selectedDay, 'lunch')}
            />

            {/* Dinner Card */}
            <MealCard
              title="🌙 Dinner"
              meal={currentDayMeals.dinner}
              color="#a55eea"
              onSwap={() => handleSwapMeal(selectedDay, 'dinner')}
            />

            {/* Snack Card */}
            <MealCard
              title="🎁 Snack"
              meal={currentDayMeals.snack}
              color="#ff4757"
              onSwap={() => handleSwapMeal(selectedDay, 'snack')}
            />
          </div>
        )}

        {/* Daily Summary */}
        {currentDayMeals && (
          <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '15px' }}>
            <h3 style={{ color: '#00f2ff', marginTop: 0 }}>📊 Day {selectedDay} Nutrition Summary</h3>
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ color: '#aaa' }}>Total Calories: </span>
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {(currentDayMeals.breakfast.calories + currentDayMeals.lunch.calories + currentDayMeals.dinner.calories + currentDayMeals.snack.calories)} kcal
                </span>
              </div>
              <div>
                <span style={{ color: '#aaa' }}>Protein: </span>
                <span style={{ color: '#00f2ff', fontWeight: 'bold' }}>
                  {(currentDayMeals.breakfast.protein + currentDayMeals.lunch.protein + currentDayMeals.dinner.protein + currentDayMeals.snack.protein)}g
                </span>
              </div>
              <div>
                <span style={{ color: '#aaa' }}>Carbs: </span>
                <span style={{ color: '#ffa502', fontWeight: 'bold' }}>
                  {(currentDayMeals.breakfast.carbs + currentDayMeals.lunch.carbs + currentDayMeals.dinner.carbs + currentDayMeals.snack.carbs)}g
                </span>
              </div>
              <div>
                <span style={{ color: '#aaa' }}>Fat: </span>
                <span style={{ color: '#a55eea', fontWeight: 'bold' }}>
                  {(currentDayMeals.breakfast.fat + currentDayMeals.lunch.fat + currentDayMeals.dinner.fat + currentDayMeals.snack.fat)}g
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <div className="glass-panel">Loading...</div>;
};

// Meal Card Component
const MealCard = ({ title, meal, color, onSwap }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div style={{
      background: 'rgba(0,0,0,0.3)',
      borderRadius: '15px',
      padding: '20px',
      borderTop: `4px solid ${color}`,
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ color: color, margin: 0 }}>{title}</h3>
        <button
          onClick={onSwap}
          style={{
            padding: '5px 10px',
            background: 'rgba(255,255,255,0.1)',
            border: `1px solid ${color}`,
            borderRadius: '5px',
            color: color,
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
        >
          🔄 Swap
        </button>
      </div>

      {/* Meal Name */}
      <h4 style={{ color: '#fff', margin: '10px 0', fontSize: '1.1rem' }}>{meal.name}</h4>

      {/* Macros */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '0.9rem' }}>
        <div>
          <div style={{ color: '#aaa' }}>Calories</div>
          <div style={{ color: '#fff', fontWeight: 'bold' }}>{meal.calories}</div>
        </div>
        <div>
          <div style={{ color: '#aaa' }}>Protein</div>
          <div style={{ color: '#00f2ff', fontWeight: 'bold' }}>{meal.protein}g</div>
        </div>
        <div>
          <div style={{ color: '#aaa' }}>Carbs</div>
          <div style={{ color: '#ffa502', fontWeight: 'bold' }}>{meal.carbs}g</div>
        </div>
        <div>
          <div style={{ color: '#aaa' }}>Fat</div>
          <div style={{ color: '#a55eea', fontWeight: 'bold' }}>{meal.fat}g</div>
        </div>
      </div>

      {/* Cooking Time */}
      <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '10px' }}>
        ⏱️ {meal.cookingTime} minutes
      </div>

      {/* Toggle Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        style={{
          width: '100%',
          padding: '8px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '5px',
          color: '#fff',
          cursor: 'pointer',
          marginBottom: showDetails ? '15px' : '0'
        }}
      >
        {showDetails ? '▲ Hide Details' : '▼ Show Recipe'}
      </button>

      {/* Details Section */}
      {showDetails && (
        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {/* Ingredients */}
          <div style={{ marginBottom: '15px' }}>
            <h5 style={{ color: color, fontSize: '0.9rem', marginBottom: '8px' }}>🛒 Ingredients</h5>
            {meal.ingredients && meal.ingredients.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#ccc', fontSize: '0.85rem' }}>
                {meal.ingredients.map((ing, idx) => (
                  <li key={idx} style={{ marginBottom: '5px' }}>{ing}</li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#999', fontSize: '0.85rem', fontStyle: 'italic' }}>No ingredients listed</p>
            )}
          </div>

          {/* Instructions */}
          <div>
            <h5 style={{ color: color, fontSize: '0.9rem', marginBottom: '8px' }}>👨‍🍳 Instructions</h5>
            {meal.instructions ? (
              <p style={{ color: '#ccc', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
                {meal.instructions}
              </p>
            ) : (
              <p style={{ color: '#999', fontSize: '0.85rem', fontStyle: 'italic' }}>No instructions provided</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: 'none',
  background: 'rgba(0,0,0,0.3)',
  color: 'white',
  fontSize: '1rem'
};

export default MealPlanner;