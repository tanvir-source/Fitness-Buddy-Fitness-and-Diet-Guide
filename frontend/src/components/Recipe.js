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

    // Fetch recipes from backend database
    const fetchRecipes = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/recipes');
            if (res.ok) {
                const data = await res.json();
                setRecipes(data);
            }
        } catch (err) {
            console.error('Failed to fetch recipes:', err);
        } finally {
            setLoading(false);
        }
    };

    // Format recipe from TheMealDB API
    const formatRecipe = (m) => {
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = m[`strIngredient${i}`];
            const measure = m[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
                ingredients.push(`${measure} ${ingredient}`.trim());
            }
        }

        return {
            externalId: m.idMeal,
            title: m.strMeal,
            description: m.strMeal,
            calories: Math.floor(Math.random() * (600 - 200) + 200),
            prepTime: 15,
            cookTime: 30,
            cuisine: m.strArea || 'International',
            dietType: m.strCategory === 'Vegetarian' ? 'Vegetarian' : 'None',
            servings: 4,
            ingredients: ingredients.join('\n'),
            instructions: m.strInstructions,
            image: m.strMealThumb,
            source: 'TheMealDB'
        };
    };

    // Search recipes from TheMealDB and save to database
    const searchAndFetchRecipes = async (searchTerm = '') => {
        setSearchLoading(true);
        try {
            let apiRecipes = [];

            if (searchTerm.trim()) {
                const searchRes = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`);
                const searchData = await searchRes.json();
                
                if (searchData.meals) {
                    apiRecipes = searchData.meals.map(m => formatRecipe(m));
                }
            } else {
                const categories = ['Chicken', 'Beef', 'Seafood', 'Vegetarian', 'Pasta', 'Dessert'];
                
                for (const category of categories) {
                    try {
                        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
                        const data = await response.json();
                        
                        if (data.meals) {
                            const categoryMeals = data.meals.slice(0, 3);
                            
                            for (const meal of categoryMeals) {
                                const detailRes = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
                                const detailData = await detailRes.json();
                                
                                if (detailData.meals && detailData.meals[0]) {
                                    apiRecipes.push(formatRecipe(detailData.meals[0]));
                                }
                            }
                        }
                    } catch (err) {
                        console.error(`Error fetching ${category}:`, err);
                    }
                }
            }

            if (apiRecipes.length > 0) {
                for (const recipe of apiRecipes) {
                    try {
                        const checkRes = await fetch(`http://localhost:5000/api/recipes/external/${recipe.externalId}`);
                        
                        if (!checkRes.ok) {
                            await fetch('http://localhost:5000/api/recipes', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(recipe)
                            });
                        }
                    } catch (err) {
                        console.error('Failed to save recipe:', err);
                    }
                }
                
                await fetchRecipes();
            }

            if (searchTerm.trim() && apiRecipes.length === 0) {
                alert('No recipes found. Try a different search term.');
            }
        } catch (err) {
            console.error('Failed to search recipes:', err);
            alert('Failed to search recipes. Please try again.');
        } finally {
            setSearchLoading(false);
        }
    };

    // Fetch user's favorites
    const fetchFavorites = async () => {
        if (!user?.email) {
            setFavorites([]);
            return;
        }
        try {
            const res = await fetch(`http://localhost:5000/api/recipes/favorites?userEmail=${user.email}`);
            if (res.ok) {
                const data = await res.json();
                setFavorites(data.map(f => f.recipeId));
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

    // Toggle favorite
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
                    userEmail: user.email,
                    recipeId: recipeId
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

    // Filter recipes
    const getFilteredRecipes = () => {
        let filtered = view === 'favorites' 
            ? recipes.filter(r => favorites.includes(r._id))
            : recipes;

        if (filters.search) {
            filtered = filtered.filter(r => 
                r.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                r.description?.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        if (filters.maxCalories) {
            filtered = filtered.filter(r => r.calories <= parseInt(filters.maxCalories));
        }

        if (filters.maxTime) {
            const totalTime = (r) => (r.prepTime || 0) + (r.cookTime || 0);
            filtered = filtered.filter(r => totalTime(r) <= parseInt(filters.maxTime));
        }

        if (filters.cuisine !== 'All') {
            filtered = filtered.filter(r => r.cuisine === filters.cuisine);
        }

        if (filters.dietType !== 'All') {
            filtered = filtered.filter(r => r.dietType === filters.dietType);
        }

        return filtered;
    };

    const filteredRecipes = getFilteredRecipes();

    // Recipe Detail View
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
                                style={{width: '100%', borderRadius: '15px', marginBottom: '20px'}} 
                            />
                        )}
                        <h2 style={{color: '#00f2ff', marginBottom: '10px'}}>{selectedRecipe.title}</h2>
                        <p style={{color: '#aaa', marginBottom: '20px'}}>{selectedRecipe.description}</p>

                        <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px'}}>
                            <span style={badgeStyle}>🔥 {selectedRecipe.calories} cal</span>
                            <span style={badgeStyle}>⏱️ {(selectedRecipe.prepTime || 0) + (selectedRecipe.cookTime || 0)} min</span>
                            <span style={badgeStyle}>🍽️ {selectedRecipe.servings} servings</span>
                            <span style={badgeStyle}>🌍 {selectedRecipe.cuisine}</span>
                            {selectedRecipe.dietType !== 'None' && (
                                <span style={badgeStyle}>🥗 {selectedRecipe.dietType}</span>
                            )}
                        </div>

                        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                            <button 
                                onClick={() => toggleFavorite(selectedRecipe)}
                                disabled={!user?.email}
                                style={{
                                    ...chipStyle,
                                    background: isFavorited ? '#ff6b9d' : 'rgba(255,255,255,0.1)',
                                    padding: '10px 20px',
                                    fontSize: '1rem',
                                    opacity: !user?.email ? 0.5 : 1,
                                    cursor: !user?.email ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isFavorited ? '❤️ Favorited' : '🤍 Add to Favorites'}
                            </button>

                            <button 
                                onClick={() => { setCookingMode(true); setCurrentStep(0); }}
                                className="primary-btn"
                                style={{padding: '10px 20px'}}
                            >
                                👨‍🍳 Start Cooking Mode
                            </button>
                        </div>
                    </div>

                    <div>
                        <div style={{background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '15px', marginBottom: '20px'}}>
                            <h3 style={{color: '#00f2ff', marginBottom: '15px'}}>Ingredients</h3>
                            <div style={{whiteSpace: 'pre-line', lineHeight: '1.8', color: '#ddd'}}>
                                {selectedRecipe.ingredients}
                            </div>
                        </div>

                        <div style={{background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '15px'}}>
                            <h3 style={{color: '#00f2ff', marginBottom: '15px'}}>Instructions</h3>
                            <div style={{whiteSpace: 'pre-line', lineHeight: '1.8', color: '#ddd'}}>
                                {selectedRecipe.instructions}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Cooking Mode
    if (cookingMode && selectedRecipe) {
        const steps = selectedRecipe.instructions.split('\n').filter(s => s.trim());
        
        return (
            <div className="glass-panel fade-in">
                <div style={{textAlign: 'center', marginBottom: '30px'}}>
                    <h2 style={{color: '#00f2ff', marginBottom: '10px'}}>👨‍🍳 Cooking Mode</h2>
                    <h3 style={{color: '#fff'}}>{selectedRecipe.title}</h3>
                </div>

                <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: '40px',
                    borderRadius: '20px',
                    textAlign: 'center',
                    minHeight: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <div style={{fontSize: '1.5rem', color: '#00f2ff', marginBottom: '20px'}}>
                        Step {currentStep + 1} of {steps.length}
                    </div>
                    
                    <div style={{fontSize: '1.8rem', lineHeight: '1.6', color: '#fff', marginBottom: '40px'}}>
                        {steps[currentStep]}
                    </div>

                    <div style={{display: 'flex', gap: '20px', justifyContent: 'center'}}>
                        <button 
                            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                            disabled={currentStep === 0}
                            className="primary-btn"
                            style={{opacity: currentStep === 0 ? 0.5 : 1, cursor: currentStep === 0 ? 'not-allowed' : 'pointer'}}
                        >
                            ← Previous
                        </button>
                        
                        {currentStep < steps.length - 1 ? (
                            <button 
                                onClick={() => setCurrentStep(currentStep + 1)}
                                className="primary-btn"
                            >
                                Next →
                            </button>
                        ) : (
                            <button 
                                onClick={() => { 
                                    setCookingMode(false); 
                                    alert('🎉 Recipe completed! Great job!'); 
                                }}
                                className="primary-btn"
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

    // Main Recipe Browser
    return (
        <div className="glass-panel fade-in">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px'}}>
                <h2 style={{color: '#00f2ff', margin: 0}}>🍳 Recipe Library</h2>
                
                <div style={{display: 'flex', gap: '10px'}}>
                    <button 
                        onClick={() => setView('browse')}
                        className={view === 'browse' ? 'primary-btn' : ''}
                        style={{...chipStyle, padding: '8px 16px', background: view === 'browse' ? undefined : 'rgba(255,255,255,0.1)'}}
                    >
                        All Recipes
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
                            padding: '8px 16px', 
                            background: view === 'favorites' ? undefined : 'rgba(255,255,255,0.1)',
                            opacity: !user?.email ? 0.5 : 1
                        }}
                    >
                        ❤️ Favorites
                    </button>
                </div>
            </div>

            {/* Search Box */}
            <div style={{background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '15px', marginBottom: '20px'}}>
                <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
                    <input 
                        placeholder="🔍 Search recipes online (e.g., 'chicken curry', 'pasta')"
                        value={filters.search}
                        onChange={e => setFilters({...filters, search: e.target.value})}
                        onKeyPress={e => e.key === 'Enter' && searchAndFetchRecipes(filters.search)}
                        style={{...inputStyle, flex: 1}}
                    />
                    <button 
                        onClick={() => searchAndFetchRecipes(filters.search)}
                        className="primary-btn"
                        disabled={searchLoading}
                        style={{padding: '10px 20px', whiteSpace: 'nowrap', opacity: searchLoading ? 0.7 : 1}}
                    >
                        {searchLoading ? '🔄 Searching...' : '🔍 Search Online'}
                    </button>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '15px'}}>
                    <input 
                        type="number"
                        placeholder="Max Calories"
                        value={filters.maxCalories}
                        onChange={e => setFilters({...filters, maxCalories: e.target.value})}
                        style={inputStyle}
                    />
                    
                    <input 
                        type="number"
                        placeholder="Max Time (min)"
                        value={filters.maxTime}
                        onChange={e => setFilters({...filters, maxTime: e.target.value})}
                        style={inputStyle}
                    />
                    
                    <select 
                        value={filters.cuisine}
                        onChange={e => setFilters({...filters, cuisine: e.target.value})}
                        style={inputStyle}
                    >
                        <option>All</option>
                        <option>American</option>
                        <option>British</option>
                        <option>Italian</option>
                        <option>Mexican</option>
                        <option>Chinese</option>
                        <option>Indian</option>
                        <option>French</option>
                        <option>Thai</option>
                        <option>Japanese</option>
                    </select>
                    
                    <select 
                        value={filters.dietType}
                        onChange={e => setFilters({...filters, dietType: e.target.value})}
                        style={inputStyle}
                    >
                        <option>All</option>
                        <option>Vegetarian</option>
                        <option>Vegan</option>
                        <option>Keto</option>
                        <option>Paleo</option>
                        <option>Gluten-Free</option>
                    </select>
                </div>

                <button 
                    onClick={() => searchAndFetchRecipes()}
                    className="primary-btn"
                    disabled={searchLoading}
                    style={{padding: '8px 16px', fontSize: '0.9rem', opacity: searchLoading ? 0.7 : 1}}
                >
                    🍽️ Load Popular Recipes
                </button>
            </div>

            {/* Recipe Grid */}
            {loading || searchLoading ? (
                <div style={{textAlign: 'center', color: '#aaa', padding: '40px'}}>
                    {searchLoading ? '🔍 Searching recipes online...' : 'Loading recipes...'}
                </div>
            ) : filteredRecipes.length === 0 ? (
                <div style={{textAlign: 'center', color: '#aaa', padding: '40px'}}>
                    <p style={{fontSize: '1.2rem', marginBottom: '20px'}}>No recipes found.</p>
                    <p style={{marginBottom: '20px'}}>Try searching for recipes online or adjust your filters.</p>
                    <button 
                        onClick={() => searchAndFetchRecipes()}
                        className="primary-btn"
                    >
                        🍽️ Load Popular Recipes
                    </button>
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
                                            <h3 style={{color: '#00f2ff', margin: 0, flex: 1}}>{recipe.title}</h3>
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
                                            {recipe.description?.substring(0, 100)}{recipe.description?.length > 100 ? '...' : ''}
                                        </p>
                                        
                                        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                                            <span style={smallBadgeStyle}>🔥 {recipe.calories} cal</span>
                                            <span style={smallBadgeStyle}>⏱️ {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min</span>
                                            {recipe.dietType !== 'None' && (
                                                <span style={smallBadgeStyle}>🥗 {recipe.dietType}</span>
                                            )}
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

// Styles
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