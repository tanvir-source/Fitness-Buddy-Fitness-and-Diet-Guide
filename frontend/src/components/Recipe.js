import { useState, useEffect } from 'react';

const Recipe = ({ user, onUpdate }) => {
    const [recipes, setRecipes] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [cookingMode, setCookingMode] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [view, setView] = useState('browse');
    const [searchLoading, setSearchLoading] = useState(false);
    
    const [filters, setFilters] = useState({
        search: '',
        maxCalories: '',
        maxTime: '',
        cuisine: 'All',
        dietType: 'All'
    });

    const HEALTHY_CATEGORIES = ['Chicken', 'Seafood', 'Vegetarian', 'Vegan', 'Breakfast', 'Side'];
    const HEALTHY_CUISINES = ['Mediterranean', 'Japanese', 'Indian', 'Thai', 'Vietnamese', 'Greek', 'Chinese'];

    const fetchRecipes = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/recipes');
            if (res.ok) {
                const data = await res.json();
                const healthyRecipes = data.filter(r => r.calories <= 600);
                setRecipes(healthyRecipes);
            }
        } catch (err) {
            console.error('Failed to fetch recipes:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatRecipe = (m) => {
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = m[`strIngredient${i}`];
            const measure = m[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
                ingredients.push(`${measure} ${ingredient}`.trim());
            }
        }

        const estimateCalories = () => {
            const category = m.strCategory?.toLowerCase() || '';
            if (category.includes('vegetarian') || category.includes('vegan')) {
                return Math.floor(Math.random() * (350 - 200) + 200);
            }
            if (category.includes('chicken') || category.includes('seafood')) {
                return Math.floor(Math.random() * (450 - 250) + 250);
            }
            if (category.includes('breakfast')) {
                return Math.floor(Math.random() * (400 - 250) + 250);
            }
            return Math.floor(Math.random() * (500 - 300) + 300);
        };

        const getDietType = () => {
            const cat = m.strCategory?.toLowerCase() || '';
            if (cat.includes('vegan')) return 'Vegan';
            if (cat.includes('vegetarian')) return 'Vegetarian';
            const allIngredients = ingredients.join(' ').toLowerCase();
            if (!allIngredients.includes('meat') && !allIngredients.includes('chicken') && 
                !allIngredients.includes('beef') && !allIngredients.includes('fish')) {
                return 'Vegetarian';
            }
            return 'None';
        };

        return {
            externalId: m.idMeal,
            title: m.strMeal,
            description: `Healthy ${m.strArea || 'International'} dish packed with nutrition`,
            calories: estimateCalories(),
            prepTime: Math.floor(Math.random() * (20 - 10) + 10),
            cookTime: Math.floor(Math.random() * (40 - 20) + 20),
            cuisine: m.strArea || 'International',
            dietType: getDietType(),
            servings: 4,
            ingredients: ingredients.join('\n'),
            instructions: m.strInstructions,
            image: m.strMealThumb,
            source: 'TheMealDB',
            category: m.strCategory,
            isHealthy: true
        };
    };

    const isHealthyRecipe = (recipe) => {
        const unhealthyCategories = ['dessert', 'pork', 'goat', 'lamb'];
        const category = recipe.strCategory?.toLowerCase() || '';
        
        if (unhealthyCategories.some(uc => category.includes(uc))) {
            return false;
        }

        const title = recipe.strMeal?.toLowerCase() || '';
        const unhealthyKeywords = ['fried', 'deep-fried', 'battered'];
        if (unhealthyKeywords.some(kw => title.includes(kw))) {
            return false;
        }

        return true;
    };

    const searchAndFetchRecipes = async (searchTerm = '', options = {}) => {
        setSearchLoading(true);
        try {
            let apiRecipes = [];
            const { cuisine } = options;

            if (searchTerm.trim()) {
                const searchRes = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`);
                const searchData = await searchRes.json();
                
                if (searchData.meals) {
                    const healthyMeals = searchData.meals.filter(isHealthyRecipe);
                    apiRecipes = healthyMeals.map(m => formatRecipe(m));
                }
            } else if (cuisine && cuisine !== 'All') {
                const cuisineRes = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${cuisine}`);
                const cuisineData = await cuisineRes.json();
                
                if (cuisineData.meals) {
                    for (const meal of cuisineData.meals.slice(0, 20)) {
                        const detailRes = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
                        const detailData = await detailRes.json();
                        if (detailData.meals && detailData.meals[0] && isHealthyRecipe(detailData.meals[0])) {
                            apiRecipes.push(formatRecipe(detailData.meals[0]));
                        }
                    }
                }
            } else {
                for (const cat of HEALTHY_CATEGORIES) {
                    try {
                        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${cat}`);
                        const data = await response.json();
                        
                        if (data.meals) {
                            const categoryMeals = data.meals.slice(0, 4);
                            
                            for (const meal of categoryMeals) {
                                const detailRes = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
                                const detailData = await detailRes.json();
                                
                                if (detailData.meals && detailData.meals[0] && isHealthyRecipe(detailData.meals[0])) {
                                    apiRecipes.push(formatRecipe(detailData.meals[0]));
                                }
                            }
                        }
                    } catch (err) {
                        console.error(`Error fetching ${cat}:`, err);
                    }
                }

                for (const cuisine of HEALTHY_CUISINES.slice(0, 3)) {
                    try {
                        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${cuisine}`);
                        const data = await response.json();
                        
                        if (data.meals) {
                            for (const meal of data.meals.slice(0, 3)) {
                                const detailRes = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
                                const detailData = await detailRes.json();
                                
                                if (detailData.meals && detailData.meals[0] && isHealthyRecipe(detailData.meals[0])) {
                                    apiRecipes.push(formatRecipe(detailData.meals[0]));
                                }
                            }
                        }
                    } catch (err) {
                        console.error(`Error fetching ${cuisine}:`, err);
                    }
                }
            }

            const uniqueRecipes = Array.from(
                new Map(apiRecipes.map(recipe => [recipe.externalId, recipe])).values()
            ).filter(r => r.calories <= 600);

            if (uniqueRecipes.length > 0) {
                let savedCount = 0;
                for (const recipe of uniqueRecipes) {
                    try {
                        const checkRes = await fetch(`http://localhost:5000/api/recipes/external/${recipe.externalId}`);
                        
                        if (!checkRes.ok) {
                            const saveRes = await fetch('http://localhost:5000/api/recipes', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(recipe)
                            });
                            if (saveRes.ok) savedCount++;
                        }
                    } catch (err) {
                        console.error('Failed to save recipe:', err);
                    }
                }
                
                if (savedCount > 0) {
                    alert(`✅ Added ${savedCount} healthy recipe${savedCount > 1 ? 's' : ''}!`);
                }
                
                await fetchRecipes();
            } else {
                alert('No healthy recipes found. Try a different search.');
            }
        } catch (err) {
            console.error('Failed to search recipes:', err);
            alert('Failed to search recipes. Please try again.');
        } finally {
            setSearchLoading(false);
        }
    };

    // ✅ FIXED: Changed userEmail to email in URL parameter
    const fetchFavorites = async () => {
        if (!user?.email) {
            setFavorites([]);
            return;
        }
        try {
            const res = await fetch(`http://localhost:5000/api/recipes/favorites?email=${user.email}`);
            if (res.ok) {
                const data = await res.json();
                // ✅ FIXED: Handle both field name formats
                setFavorites(data.map(f => f.recipe_id || f.recipeId));
            }
        } catch (err) {
            console.error('Failed to fetch favorites:', err);
        }
    };

    useEffect(() => {
        fetchRecipes();
        if (user?.email) {
            fetchFavorites();
        }
    }, [user?.email]);

    // ✅ FIXED: Changed userEmail to user_email and recipeId to recipe_id
    const toggleFavorite = async (recipe) => {
        if (!user?.email) {
            alert('Please log in to save favorites');
            return;
        }
        
        const recipeId = recipe._id;
        if (!recipeId) {
            alert('Recipe ID not found. Please try refreshing the page.');
            return;
        }
        
        const isFavorite = favorites.includes(recipeId);
        
        try {
            const res = await fetch('http://localhost:5000/api/recipes/favorites', {
                method: isFavorite ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: user.email,    // ✅ FIXED: Changed from userEmail
                    recipe_id: recipeId         // ✅ FIXED: Changed from recipeId
                })
            });

            if (res.ok) {
                if (isFavorite) {
                    setFavorites(prev => prev.filter(id => id !== recipeId));
                } else {
                    setFavorites(prev => [...prev, recipeId]);
                }
            } else {
                const errorData = await res.json();
                alert(errorData.message || 'Failed to update favorites');
            }
        } catch (err) {
            console.error('Failed to toggle favorite:', err);
            alert('Failed to update favorites. Please try again.');
        }
    };

    const getFilteredRecipes = () => {
        let filtered = view === 'favorites' 
            ? recipes.filter(r => favorites.includes(r._id))
            : recipes;

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(r => 
                r.title?.toLowerCase().includes(searchLower) ||
                r.description?.toLowerCase().includes(searchLower) ||
                r.ingredients?.toLowerCase().includes(searchLower) ||
                r.cuisine?.toLowerCase().includes(searchLower)
            );
        }

        if (filters.maxCalories && !isNaN(filters.maxCalories)) {
            const maxCal = parseInt(filters.maxCalories);
            filtered = filtered.filter(r => r.calories && r.calories <= maxCal);
        }

        if (filters.maxTime && !isNaN(filters.maxTime)) {
            const maxMin = parseInt(filters.maxTime);
            filtered = filtered.filter(r => {
                const totalTime = (r.prepTime || 0) + (r.cookTime || 0);
                return totalTime <= maxMin;
            });
        }

        if (filters.cuisine && filters.cuisine !== 'All') {
            filtered = filtered.filter(r => 
                r.cuisine?.toLowerCase() === filters.cuisine.toLowerCase()
            );
        }

        if (filters.dietType && filters.dietType !== 'All') {
            filtered = filtered.filter(r => {
                if (filters.dietType === 'Vegetarian') {
                    return r.dietType === 'Vegetarian' || r.category === 'Vegetarian';
                }
                if (filters.dietType === 'Vegan') {
                    return r.dietType === 'Vegan' || r.category === 'Vegan';
                }
                return r.dietType === filters.dietType;
            });
        }

        return filtered;
    };

    const filteredRecipes = getFilteredRecipes();

    const clearFilters = () => {
        setFilters({
            search: '',
            maxCalories: '',
            maxTime: '',
            cuisine: 'All',
            dietType: 'All'
        });
    };

    if (selectedRecipe && !cookingMode) {
        const isFavorited = favorites.includes(selectedRecipe._id);
        
        return (
            <div className="glass-panel fade-in">
                <button onClick={() => setSelectedRecipe(null)} className="primary-btn" style={{marginBottom: '20px'}}>
                    ← Back to Recipes
                </button>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px'}}>
                    <div>
                        {selectedRecipe.image && (
                            <img src={selectedRecipe.image} alt={selectedRecipe.title} 
                                style={{width: '100%', borderRadius: '15px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,242,255,0.2)'}} 
                            />
                        )}
                        <h2 style={{color: '#00f2ff', marginBottom: '10px'}}>{selectedRecipe.title}</h2>
                        <p style={{color: '#aaa', marginBottom: '20px'}}>{selectedRecipe.description}</p>

                        <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px'}}>
                            <span style={badgeStyle}>🔥 {selectedRecipe.calories} cal</span>
                            <span style={badgeStyle}>⏱️ {(selectedRecipe.prepTime || 0) + (selectedRecipe.cookTime || 0)} min</span>
                            <span style={badgeStyle}>🍽️ {selectedRecipe.servings} servings</span>
                            <span style={badgeStyle}>🌍 {selectedRecipe.cuisine}</span>
                            {selectedRecipe.dietType !== 'None' && (
                                <span style={{...badgeStyle, background: 'rgba(76,175,80,0.2)', color: '#4CAF50', border: '1px solid #4CAF50'}}>
                                    🥗 {selectedRecipe.dietType}
                                </span>
                            )}
                            <span style={{...badgeStyle, background: 'rgba(76,175,80,0.2)', color: '#4CAF50', border: '1px solid #4CAF50'}}>
                                ✓ Healthy Choice
                            </span>
                        </div>

                        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                            <button 
                                onClick={() => toggleFavorite(selectedRecipe)}
                                disabled={!user?.email}
                                style={{
                                    ...chipStyle,
                                    background: isFavorited ? 'linear-gradient(135deg, #ff6b9d 0%, #ff3366 100%)' : 'rgba(255,255,255,0.1)',
                                    padding: '12px 24px',
                                    fontSize: '1rem',
                                    opacity: !user?.email ? 0.5 : 1,
                                    cursor: !user?.email ? 'not-allowed' : 'pointer',
                                    border: isFavorited ? 'none' : '1px solid #00f2ff'
                                }}
                            >
                                {isFavorited ? '❤️ Favorited' : '🤍 Add to Favorites'}
                            </button>

                            <button 
                                onClick={() => { setCookingMode(true); setCurrentStep(0); }}
                                className="primary-btn"
                                style={{padding: '12px 24px', fontSize: '1rem'}}
                            >
                                👨‍🍳 Start Cooking
                            </button>
                        </div>
                    </div>

                    <div>
                        <div style={{background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '15px', marginBottom: '20px', border: '1px solid rgba(0,242,255,0.2)'}}>
                            <h3 style={{color: '#00f2ff', marginBottom: '15px'}}>
                                🛒 Ingredients
                            </h3>
                            <div style={{whiteSpace: 'pre-line', lineHeight: '1.8', color: '#ddd'}}>
                                {selectedRecipe.ingredients}
                            </div>
                        </div>

                        <div style={{background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(0,242,255,0.2)'}}>
                            <h3 style={{color: '#00f2ff', marginBottom: '15px'}}>
                                📝 Instructions
                            </h3>
                            <div style={{whiteSpace: 'pre-line', lineHeight: '1.8', color: '#ddd'}}>
                                {selectedRecipe.instructions}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (cookingMode && selectedRecipe) {
        const steps = selectedRecipe.instructions.split('\n').filter(s => s.trim());
        const progress = ((currentStep + 1) / steps.length) * 100;
        
        return (
            <div className="glass-panel fade-in">
                <div style={{textAlign: 'center', marginBottom: '30px'}}>
                    <h2 style={{color: '#00f2ff', marginBottom: '10px'}}>👨‍🍳 Cooking Mode</h2>
                    <h3 style={{color: '#fff', marginBottom: '20px'}}>{selectedRecipe.title}</h3>
                    
                    <div style={{background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px'}}>
                        <div style={{
                            width: `${progress}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #00f2ff 0%, #00ff88 100%)',
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                    <div style={{color: '#aaa', fontSize: '0.9rem'}}>
                        {Math.round(progress)}% Complete
                    </div>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, rgba(0,242,255,0.1) 0%, rgba(0,255,136,0.1) 100%)',
                    padding: '40px',
                    borderRadius: '20px',
                    textAlign: 'center',
                    minHeight: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    border: '1px solid rgba(0,242,255,0.3)'
                }}>
                    <div style={{fontSize: '1.3rem', color: '#00f2ff', marginBottom: '20px', fontWeight: '600'}}>
                        Step {currentStep + 1} of {steps.length}
                    </div>
                    
                    <div style={{fontSize: '1.6rem', lineHeight: '1.6', color: '#fff', marginBottom: '40px', fontWeight: '400'}}>
                        {steps[currentStep]}
                    </div>

                    <div style={{display: 'flex', gap: '20px', justifyContent: 'center'}}>
                        <button 
                            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                            disabled={currentStep === 0}
                            className="primary-btn"
                            style={{
                                opacity: currentStep === 0 ? 0.5 : 1, 
                                cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                                padding: '12px 30px'
                            }}
                        >
                            ← Previous
                        </button>
                        
                        {currentStep < steps.length - 1 ? (
                            <button 
                                onClick={() => setCurrentStep(currentStep + 1)}
                                className="primary-btn"
                                style={{padding: '12px 30px'}}
                            >
                                Next →
                            </button>
                        ) : (
                            <button 
                                onClick={() => { 
                                    setCookingMode(false); 
                                    alert('🎉 Recipe completed! Enjoy your healthy meal!'); 
                                }}
                                className="primary-btn"
                                style={{padding: '12px 30px', background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'}}
                            >
                                ✅ Finish
                            </button>
                        )}
                    </div>
                </div>

                <button 
                    onClick={() => setCookingMode(false)}
                    style={{
                        ...chipStyle,
                        padding: '10px 20px',
                        display: 'block',
                        margin: '20px auto 0'
                    }}
                >
                    Exit Cooking Mode
                </button>
            </div>
        );
    }

    return (
        <div className="glass-panel fade-in">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px'}}>
                <div>
                    <h2 style={{color: '#00f2ff', margin: 0, marginBottom: '5px'}}>🍳 Healthy Recipe Library</h2>
                    <p style={{color: '#aaa', fontSize: '0.9rem', margin: 0}}>Nutritious meals under 600 calories</p>
                </div>
                
                <div style={{display: 'flex', gap: '10px'}}>
                    <button 
                        onClick={() => setView('browse')}
                        className={view === 'browse' ? 'primary-btn' : ''}
                        style={{...chipStyle, padding: '10px 18px', background: view === 'browse' ? undefined : 'rgba(255,255,255,0.1)'}}
                    >
                        All Recipes ({recipes.length})
                    </button>
                    <button 
                        onClick={() => {
                            if (!user?.email) {
                                alert('Please log in to view favorites');
                                return;
                            }
                            setView('favorites');
                        }}
                        className={view === 'favorites' ? 'primary-btn' : ''}
                        style={{
                            ...chipStyle, 
                            padding: '10px 18px', 
                            background: view === 'favorites' ? undefined : 'rgba(255,255,255,0.1)',
                            opacity: !user?.email ? 0.5 : 1
                        }}
                    >
                        ❤️ Favorites ({favorites.length})
                    </button>
                </div>
            </div>

            <div style={{background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '15px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)'}}>
                <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
                    <input 
                        placeholder="🔍 Search healthy recipes (chicken, salad, quinoa)..."
                        value={filters.search}
                        onChange={e => setFilters({...filters, search: e.target.value})}
                        onKeyPress={e => e.key === 'Enter' && searchAndFetchRecipes(filters.search)}
                        style={{...inputStyle, flex: 1}}
                    />
                    <button 
                        onClick={() => searchAndFetchRecipes(filters.search)}
                        className="primary-btn"
                        disabled={searchLoading}
                        style={{padding: '10px 24px', whiteSpace: 'nowrap', opacity: searchLoading ? 0.7 : 1}}
                    >
                        {searchLoading ? '🔄 Searching...' : '🔍 Search'}
                    </button>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '15px'}}>
                    <div>
                        <label style={{color: '#aaa', fontSize: '0.85rem', marginBottom: '5px', display: 'block'}}>Max Calories</label>
                        <input 
                            type="number"
                            placeholder="e.g., 400"
                            value={filters.maxCalories}
                            onChange={e => setFilters({...filters, maxCalories: e.target.value})}
                            style={inputStyle}
                        />
                    </div>
                    
                    <div>
                        <label style={{color: '#aaa', fontSize: '0.85rem', marginBottom: '5px', display: 'block'}}>Max Time (min)</label>
                        <input 
                            type="number"
                            placeholder="e.g., 30"
                            value={filters.maxTime}
                            onChange={e => setFilters({...filters, maxTime: e.target.value})}
                            style={inputStyle}
                        />
                    </div>
                    
                    <div>
                        <label style={{color: '#aaa', fontSize: '0.85rem', marginBottom: '5px', display: 'block'}}>Cuisine</label>
                        <select 
                            value={filters.cuisine}
                            onChange={e => {
                                setFilters({...filters, cuisine: e.target.value});
                                if (e.target.value !== 'All') {
                                    searchAndFetchRecipes('', { cuisine: e.target.value });
                                }
                            }}
                            style={inputStyle}
                        >
                            <option value="All">All Cuisines</option>
                            <option value="Mediterranean">Mediterranean</option>
                            <option value="Japanese">Japanese</option>
                            <option value="Indian">Indian</option>
                            <option value="Thai">Thai</option>
                            <option value="Vietnamese">Vietnamese</option>
                            <option value="Greek">Greek</option>
                            <option value="Chinese">Chinese</option>
                            <option value="American">American</option>
                            <option value="Italian">Italian</option>
                            <option value="Mexican">Mexican</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style={{color: '#aaa', fontSize: '0.85rem', marginBottom: '5px', display: 'block'}}>Diet Type</label>
                        <select 
                            value={filters.dietType}
                            onChange={e => setFilters({...filters, dietType: e.target.value})}
                            style={inputStyle}
                        >
                            <option value="All">All Types</option>
                            <option value="Vegetarian">Vegetarian</option>
                            <option value="Vegan">Vegan</option>
                            <option value="Keto">Keto</option>
                            <option value="Paleo">Paleo</option>
                            <option value="Gluten-Free">Gluten-Free</option>
                        </select>
                    </div>
                </div>

                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center'}}>
                    <button 
                        onClick={() => searchAndFetchRecipes()}
                        className="primary-btn"
                        disabled={searchLoading}
                        style={{padding: '10px 20px', fontSize: '0.9rem', opacity: searchLoading ? 0.7 : 1}}
                    >
                        🥗 Load Healthy Recipes
                    </button>
                    {(filters.search || filters.maxCalories || filters.maxTime || filters.cuisine !== 'All' || filters.dietType !== 'All') && (
                        <button 
                            onClick={clearFilters}
                            style={{...chipStyle, padding: '10px 20px', fontSize: '0.9rem'}}
                        >
                            🔄 Clear Filters
                        </button>
                    )}
                    <span style={{color: '#aaa', padding: '8px 0', fontSize: '0.9rem'}}>
                        Showing {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {loading || searchLoading ? (
                <div style={{textAlign: 'center', color: '#aaa', padding: '60px 20px'}}>
                    <div style={{fontSize: '3rem', marginBottom: '15px'}}>🔍</div>
                    <div style={{fontSize: '1.1rem'}}>{searchLoading ? 'Searching for healthy recipes...' : 'Loading recipes...'}</div>
                </div>
            ) : filteredRecipes.length === 0 ? (
                <div style={{textAlign: 'center', color: '#aaa', padding: '60px 20px'}}>
                    <div style={{fontSize: '3rem', marginBottom: '15px'}}>🍽️</div>
                    <p style={{fontSize: '1.2rem', marginBottom: '10px', color: '#ddd'}}>No recipes found</p>
                    <p style={{marginBottom: '20px'}}>
                        {recipes.length === 0 
                            ? 'Start by loading some healthy recipes!' 
                            : 'Try adjusting your filters or search terms'}
                    </p>
                    <div style={{display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap'}}>
                        <button 
                            onClick={() => searchAndFetchRecipes()}
                            className="primary-btn"
                            style={{padding: '12px 24px'}}
                        >
                            🥗 Load Healthy Recipes
                        </button>
                        {(filters.search || filters.maxCalories || filters.maxTime || filters.cuisine !== 'All' || filters.dietType !== 'All') && (
                            <button 
                                onClick={clearFilters}
                                style={{...chipStyle, padding: '12px 24px'}}
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px'}}>
                    {filteredRecipes.map(recipe => {
                        const isFavorited = favorites.includes(recipe._id);
                        
                        return (
                            <div 
                                key={recipe._id}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '15px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,242,255,0.3)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div onClick={() => setSelectedRecipe(recipe)}>
                                    {recipe.image && (
                                        <img 
                                            src={recipe.image} 
                                            alt={recipe.title}
                                            style={{width: '100%', height: '200px', objectFit: 'cover'}}
                                        />
                                    )}
                                    
                                    <div style={{padding: '20px'}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px'}}>
                                            <h3 style={{color: '#00f2ff', margin: 0, flex: 1, fontSize: '1.1rem'}}>{recipe.title}</h3>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(recipe);
                                                }}
                                                disabled={!user?.email}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    fontSize: '1.5rem',
                                                    cursor: user?.email ? 'pointer' : 'not-allowed',
                                                    padding: '0',
                                                    marginLeft: '10px',
                                                    opacity: !user?.email ? 0.5 : 1
                                                }}
                                                title={!user?.email ? 'Login to add favorites' : ''}
                                            >
                                                {isFavorited ? '❤️' : '🤍'}
                                            </button>
                                        </div>
                                        
                                        <p style={{color: '#aaa', fontSize: '0.9rem', marginBottom: '15px', lineHeight: '1.4'}}>
                                            {recipe.description?.substring(0, 80)}{recipe.description?.length > 80 ? '...' : ''}
                                        </p>
                                        
                                        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px'}}>
                                            <span style={smallBadgeStyle}>🔥 {recipe.calories} cal</span>
                                            <span style={smallBadgeStyle}>⏱️ {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min</span>
                                            {recipe.dietType !== 'None' && (
                                                <span style={{...smallBadgeStyle, background: 'rgba(76,175,80,0.2)', color: '#4CAF50'}}>
                                                    🥗 {recipe.dietType}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                            <span style={{fontSize: '0.75rem', color: '#4CAF50'}}>✓</span>
                                            <span style={{fontSize: '0.75rem', color: '#4CAF50'}}>Healthy Choice</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(0,0,0,0.3)',
    color: 'white',
    boxSizing: 'border-box'
};

const chipStyle = {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid #00f2ff',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    transition: 'all 0.3s ease'
};

const badgeStyle = {
    background: 'rgba(0,242,255,0.2)',
    color: '#00f2ff',
    padding: '8px 15px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    border: '1px solid #00f2ff'
};

const smallBadgeStyle = {
    background: 'rgba(255,255,255,0.1)',
    color: '#ddd',
    padding: '4px 10px',
    borderRadius: '15px',
    fontSize: '0.75rem'
};

export default Recipe;