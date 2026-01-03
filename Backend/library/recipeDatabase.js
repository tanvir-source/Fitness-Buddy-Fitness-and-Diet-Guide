// Comprehensive Recipe Database for Meal Plan Generator

const recipeDatabase = {
  // BREAKFAST RECIPES
  breakfast: {
    vegetarian: [
      {
        name: "Oatmeal with Berries",
        calories: 300,
        protein: 10,
        carbs: 50,
        fat: 8,
        cuisine: "Continental",
        cookingTime: 10,
        ingredients: ["1 cup oats", "1/2 cup mixed berries", "1 tbsp honey", "1/4 cup almonds", "200ml milk"],
        instructions: "1. Boil milk. 2. Add oats and cook for 5 mins. 3. Top with berries, honey, and almonds."
      },
      {
        name: "Vegetable Poha",
        calories: 250,
        protein: 6,
        carbs: 45,
        fat: 5,
        cuisine: "Indian",
        cookingTime: 15,
        ingredients: ["1 cup flattened rice", "1/2 cup mixed vegetables", "1 tsp mustard seeds", "Curry leaves", "1 tsp turmeric"],
        instructions: "1. Rinse poha. 2. Sauté mustard seeds and curry leaves. 3. Add vegetables and turmeric. 4. Mix in poha and cook for 5 mins."
      },
      {
        name: "Avocado Toast",
        calories: 350,
        protein: 12,
        carbs: 35,
        fat: 18,
        cuisine: "Continental",
        cookingTime: 10,
        ingredients: ["2 slices whole wheat bread", "1 avocado", "1 boiled egg", "Salt & pepper", "Cherry tomatoes"],
        instructions: "1. Toast bread. 2. Mash avocado with salt and pepper. 3. Spread on toast. 4. Top with sliced egg and tomatoes."
      },
      {
        name: "Greek Yogurt Parfait",
        calories: 280,
        protein: 15,
        carbs: 40,
        fat: 8,
        cuisine: "Mediterranean",
        cookingTime: 5,
        ingredients: ["1 cup Greek yogurt", "1/4 cup granola", "1/2 cup mixed fruits", "1 tbsp honey", "Chia seeds"],
        instructions: "1. Layer yogurt in a glass. 2. Add fruits and granola. 3. Drizzle with honey. 4. Sprinkle chia seeds."
      },
      {
        name: "Masala Dosa",
        calories: 320,
        protein: 8,
        carbs: 55,
        fat: 10,
        cuisine: "Indian",
        cookingTime: 30,
        ingredients: ["Dosa batter", "2 potatoes", "Onions", "Curry leaves", "Mustard seeds"],
        instructions: "1. Prepare potato filling. 2. Make thin dosa on pan. 3. Add filling and fold. 4. Serve with chutney."
      }
    ],
    nonVegetarian: [
      {
        name: "Scrambled Eggs with Toast",
        calories: 350,
        protein: 20,
        carbs: 30,
        fat: 15,
        cuisine: "Continental",
        cookingTime: 10,
        ingredients: ["3 eggs", "2 slices bread", "1 tbsp butter", "Salt & pepper", "Cheese"],
        instructions: "1. Whisk eggs with salt and pepper. 2. Scramble in butter. 3. Toast bread. 4. Serve together."
      },
      {
        name: "Chicken Sausage Breakfast Bowl",
        calories: 400,
        protein: 25,
        carbs: 35,
        fat: 18,
        cuisine: "Continental",
        cookingTime: 15,
        ingredients: ["2 chicken sausages", "2 eggs", "1/2 cup hash browns", "Bell peppers", "Cheese"],
        instructions: "1. Cook sausages. 2. Scramble eggs. 3. Fry hash browns. 4. Combine in bowl with cheese."
      },
      {
        name: "Egg Bhurji",
        calories: 300,
        protein: 18,
        carbs: 25,
        fat: 14,
        cuisine: "Indian",
        cookingTime: 15,
        ingredients: ["3 eggs", "1 onion", "2 tomatoes", "Green chili", "Spices"],
        instructions: "1. Sauté onions and tomatoes. 2. Add spices. 3. Scramble eggs into mixture. 4. Serve with bread."
      }
    ],
    vegan: [
      {
        name: "Tofu Scramble",
        calories: 280,
        protein: 18,
        carbs: 20,
        fat: 15,
        cuisine: "Asian",
        cookingTime: 15,
        ingredients: ["200g tofu", "Turmeric", "Vegetables", "Nutritional yeast", "Spices"],
        instructions: "1. Crumble tofu. 2. Sauté with turmeric and vegetables. 3. Add nutritional yeast. 4. Season and serve."
      },
      {
        name: "Chia Seed Pudding",
        calories: 250,
        protein: 8,
        carbs: 35,
        fat: 10,
        cuisine: "Continental",
        cookingTime: 5,
        ingredients: ["3 tbsp chia seeds", "1 cup almond milk", "Maple syrup", "Fruits", "Nuts"],
        instructions: "1. Mix chia seeds with almond milk. 2. Refrigerate overnight. 3. Top with fruits and nuts."
      },
      {
        name: "Smoothie Bowl",
        calories: 320,
        protein: 10,
        carbs: 55,
        fat: 8,
        cuisine: "Mixed",
        cookingTime: 10,
        ingredients: ["2 bananas", "1 cup berries", "Coconut milk", "Granola", "Seeds"],
        instructions: "1. Blend bananas, berries, and coconut milk. 2. Pour into bowl. 3. Top with granola and seeds."
      }
    ],
    keto: [
      {
        name: "Keto Egg Muffins",
        calories: 280,
        protein: 22,
        carbs: 5,
        fat: 20,
        cuisine: "Continental",
        cookingTime: 20,
        ingredients: ["4 eggs", "Cheese", "Bacon bits", "Spinach", "Bell peppers"],
        instructions: "1. Whisk eggs. 2. Mix in ingredients. 3. Pour into muffin tin. 4. Bake at 180°C for 15 mins."
      },
      {
        name: "Bulletproof Coffee with Eggs",
        calories: 350,
        protein: 18,
        carbs: 3,
        fat: 30,
        cuisine: "Mixed",
        cookingTime: 10,
        ingredients: ["Coffee", "1 tbsp butter", "1 tbsp MCT oil", "2 boiled eggs", "Salt"],
        instructions: "1. Blend coffee with butter and MCT oil. 2. Boil eggs. 3. Serve together."
      }
    ],
    paleo: [
      {
        name: "Sweet Potato Hash",
        calories: 320,
        protein: 15,
        carbs: 40,
        fat: 12,
        cuisine: "Continental",
        cookingTime: 25,
        ingredients: ["1 sweet potato", "2 eggs", "Bell peppers", "Onions", "Olive oil"],
        instructions: "1. Dice sweet potato and vegetables. 2. Sauté in olive oil. 3. Fry eggs. 4. Serve together."
      }
    ]
  },

  // LUNCH RECIPES
  lunch: {
    vegetarian: [
      {
        name: "Chickpea Curry with Rice",
        calories: 450,
        protein: 15,
        carbs: 70,
        fat: 12,
        cuisine: "Indian",
        cookingTime: 30,
        ingredients: ["1 cup chickpeas", "1 cup rice", "Tomatoes", "Onions", "Spices"],
        instructions: "1. Cook rice. 2. Prepare curry with chickpeas, tomatoes, and spices. 3. Serve together."
      },
      {
        name: "Paneer Tikka Wrap",
        calories: 420,
        protein: 20,
        carbs: 45,
        fat: 18,
        cuisine: "Indian",
        cookingTime: 25,
        ingredients: ["200g paneer", "Whole wheat wrap", "Yogurt", "Tikka masala", "Vegetables"],
        instructions: "1. Marinate paneer in yogurt and spices. 2. Grill or pan-fry. 3. Wrap with vegetables."
      },
      {
        name: "Quinoa Buddha Bowl",
        calories: 400,
        protein: 12,
        carbs: 55,
        fat: 15,
        cuisine: "Mediterranean",
        cookingTime: 25,
        ingredients: ["1 cup quinoa", "Roasted vegetables", "Chickpeas", "Tahini dressing", "Avocado"],
        instructions: "1. Cook quinoa. 2. Roast vegetables. 3. Assemble bowl with all ingredients. 4. Drizzle tahini."
      },
      {
        name: "Vegetable Biryani",
        calories: 480,
        protein: 10,
        carbs: 75,
        fat: 14,
        cuisine: "Indian",
        cookingTime: 45,
        ingredients: ["2 cups basmati rice", "Mixed vegetables", "Yogurt", "Biryani spices", "Saffron"],
        instructions: "1. Soak rice. 2. Cook vegetables with spices. 3. Layer rice and vegetables. 4. Cook on dum."
      },
      {
        name: "Mediterranean Pasta",
        calories: 450,
        protein: 12,
        carbs: 65,
        fat: 16,
        cuisine: "Mediterranean",
        cookingTime: 20,
        ingredients: ["Whole wheat pasta", "Cherry tomatoes", "Olives", "Feta cheese", "Basil"],
        instructions: "1. Cook pasta. 2. Sauté tomatoes and olives. 3. Toss with pasta. 4. Top with feta and basil."
      }
    ],
    nonVegetarian: [
      {
        name: "Grilled Chicken Salad",
        calories: 380,
        protein: 35,
        carbs: 25,
        fat: 15,
        cuisine: "Continental",
        cookingTime: 25,
        ingredients: ["200g chicken breast", "Mixed greens", "Cherry tomatoes", "Olive oil", "Lemon"],
        instructions: "1. Grill seasoned chicken. 2. Prepare salad with greens and tomatoes. 3. Slice chicken on top. 4. Dress with olive oil and lemon."
      },
      {
        name: "Chicken Biryani",
        calories: 520,
        protein: 30,
        carbs: 65,
        fat: 18,
        cuisine: "Indian",
        cookingTime: 50,
        ingredients: ["2 cups basmati rice", "300g chicken", "Yogurt", "Biryani spices", "Fried onions"],
        instructions: "1. Marinate chicken in yogurt and spices. 2. Cook rice partially. 3. Layer chicken and rice. 4. Cook on dum for 20 mins."
      },
      {
        name: "Salmon with Quinoa",
        calories: 480,
        protein: 32,
        carbs: 45,
        fat: 20,
        cuisine: "Mediterranean",
        cookingTime: 30,
        ingredients: ["200g salmon fillet", "1 cup quinoa", "Asparagus", "Lemon", "Herbs"],
        instructions: "1. Cook quinoa. 2. Season and bake salmon at 180°C for 15 mins. 3. Steam asparagus. 4. Serve together."
      },
      {
        name: "Butter Chicken with Naan",
        calories: 550,
        protein: 35,
        carbs: 50,
        fat: 22,
        cuisine: "Indian",
        cookingTime: 40,
        ingredients: ["300g chicken", "Tomato puree", "Cream", "Butter", "Naan bread"],
        instructions: "1. Cook chicken in tomato gravy. 2. Add cream and butter. 3. Serve with naan."
      }
    ],
    vegan: [
      {
        name: "Lentil Dal with Brown Rice",
        calories: 420,
        protein: 18,
        carbs: 70,
        fat: 8,
        cuisine: "Indian",
        cookingTime: 35,
        ingredients: ["1 cup red lentils", "1 cup brown rice", "Tomatoes", "Onions", "Spices"],
        instructions: "1. Cook lentils with spices. 2. Prepare tadka with onions and tomatoes. 3. Cook rice. 4. Serve together."
      },
      {
        name: "Vegan Buddha Bowl",
        calories: 400,
        protein: 15,
        carbs: 60,
        fat: 12,
        cuisine: "Asian",
        cookingTime: 30,
        ingredients: ["Quinoa", "Tofu", "Kale", "Sweet potato", "Tahini dressing"],
        instructions: "1. Cook quinoa. 2. Roast sweet potato. 3. Sauté tofu and kale. 4. Assemble bowl with tahini."
      },
      {
        name: "Chickpea Curry",
        calories: 380,
        protein: 14,
        carbs: 55,
        fat: 12,
        cuisine: "Indian",
        cookingTime: 30,
        ingredients: ["2 cups chickpeas", "Coconut milk", "Tomatoes", "Curry spices", "Rice"],
        instructions: "1. Sauté onions and tomatoes. 2. Add chickpeas and coconut milk. 3. Simmer for 15 mins. 4. Serve with rice."
      }
    ],
    keto: [
      {
        name: "Keto Chicken Bowl",
        calories: 450,
        protein: 40,
        carbs: 8,
        fat: 30,
        cuisine: "Mixed",
        cookingTime: 25,
        ingredients: ["200g chicken thigh", "Cauliflower rice", "Avocado", "Cheese", "Greens"],
        instructions: "1. Cook chicken. 2. Prepare cauliflower rice. 3. Assemble bowl with avocado and cheese."
      },
      {
        name: "Zucchini Noodles with Meat Sauce",
        calories: 420,
        protein: 35,
        carbs: 10,
        fat: 28,
        cuisine: "Continental",
        cookingTime: 30,
        ingredients: ["2 zucchinis", "200g ground beef", "Tomato sauce (no sugar)", "Parmesan", "Garlic"],
        instructions: "1. Spiralize zucchini. 2. Cook beef with garlic. 3. Add tomato sauce. 4. Serve over zoodles with parmesan."
      }
    ],
    paleo: [
      {
        name: "Grilled Steak with Sweet Potato",
        calories: 500,
        protein: 38,
        carbs: 35,
        fat: 22,
        cuisine: "Continental",
        cookingTime: 35,
        ingredients: ["200g beef steak", "1 large sweet potato", "Broccoli", "Olive oil", "Herbs"],
        instructions: "1. Season and grill steak. 2. Roast sweet potato. 3. Steam broccoli. 4. Serve together."
      }
    ]
  },

  // DINNER RECIPES
  dinner: {
    vegetarian: [
      {
        name: "Palak Paneer with Roti",
        calories: 420,
        protein: 18,
        carbs: 45,
        fat: 18,
        cuisine: "Indian",
        cookingTime: 35,
        ingredients: ["200g paneer", "2 cups spinach", "Cream", "Spices", "2 rotis"],
        instructions: "1. Blanch spinach and blend. 2. Cook with spices and paneer. 3. Add cream. 4. Serve with roti."
      },
      {
        name: "Vegetable Stir-fry with Rice",
        calories: 380,
        protein: 10,
        carbs: 60,
        fat: 12,
        cuisine: "Asian",
        cookingTime: 25,
        ingredients: ["Mixed vegetables", "1 cup rice", "Soy sauce", "Ginger-garlic", "Sesame oil"],
        instructions: "1. Cook rice. 2. Stir-fry vegetables with sauces. 3. Serve together."
      },
      {
        name: "Mushroom Risotto",
        calories: 450,
        protein: 12,
        carbs: 65,
        fat: 16,
        cuisine: "Italian",
        cookingTime: 40,
        ingredients: ["1 cup arborio rice", "200g mushrooms", "Parmesan", "White wine", "Vegetable stock"],
        instructions: "1. Sauté mushrooms. 2. Cook rice gradually with stock. 3. Add wine and parmesan. 4. Stir until creamy."
      }
    ],
    nonVegetarian: [
      {
        name: "Grilled Fish with Vegetables",
        calories: 400,
        protein: 35,
        carbs: 30,
        fat: 15,
        cuisine: "Mediterranean",
        cookingTime: 30,
        ingredients: ["200g fish fillet", "Zucchini", "Bell peppers", "Lemon", "Herbs"],
        instructions: "1. Marinate fish with lemon and herbs. 2. Grill fish and vegetables. 3. Serve together."
      },
      {
        name: "Chicken Curry with Rice",
        calories: 480,
        protein: 32,
        carbs: 55,
        fat: 16,
        cuisine: "Indian",
        cookingTime: 40,
        ingredients: ["300g chicken", "Curry spices", "Coconut milk", "Rice", "Onions"],
        instructions: "1. Cook chicken with spices. 2. Add coconut milk. 3. Cook rice. 4. Serve curry over rice."
      },
      {
        name: "Turkey Meatballs with Pasta",
        calories: 500,
        protein: 30,
        carbs: 55,
        fat: 18,
        cuisine: "Italian",
        cookingTime: 35,
        ingredients: ["250g ground turkey", "Whole wheat pasta", "Tomato sauce", "Herbs", "Parmesan"],
        instructions: "1. Form and bake meatballs. 2. Cook pasta. 3. Simmer in tomato sauce. 4. Serve with parmesan."
      }
    ],
    vegan: [
      {
        name: "Tofu Stir-fry",
        calories: 360,
        protein: 20,
        carbs: 45,
        fat: 12,
        cuisine: "Asian",
        cookingTime: 25,
        ingredients: ["200g tofu", "Mixed vegetables", "Rice", "Soy sauce", "Sesame oil"],
        instructions: "1. Press and cube tofu. 2. Stir-fry with vegetables. 3. Add soy sauce. 4. Serve with rice."
      },
      {
        name: "Lentil Soup",
        calories: 320,
        protein: 18,
        carbs: 50,
        fat: 6,
        cuisine: "Mediterranean",
        cookingTime: 35,
        ingredients: ["1 cup lentils", "Vegetables", "Vegetable broth", "Spices", "Bread"],
        instructions: "1. Sauté vegetables. 2. Add lentils and broth. 3. Simmer for 25 mins. 4. Serve with bread."
      }
    ],
    keto: [
      {
        name: "Keto Butter Chicken",
        calories: 480,
        protein: 38,
        carbs: 6,
        fat: 35,
        cuisine: "Indian",
        cookingTime: 35,
        ingredients: ["300g chicken", "Heavy cream", "Butter", "Tomato puree (low carb)", "Spices"],
        instructions: "1. Cook chicken in spices. 2. Add cream and butter. 3. Simmer. 4. Serve with cauliflower rice."
      },
      {
        name: "Ribeye Steak with Broccoli",
        calories: 520,
        protein: 42,
        carbs: 8,
        fat: 38,
        cuisine: "Continental",
        cookingTime: 25,
        ingredients: ["250g ribeye steak", "Broccoli", "Butter", "Garlic", "Herbs"],
        instructions: "1. Season and sear steak. 2. Steam broccoli. 3. Sauté with garlic butter. 4. Serve together."
      }
    ],
    paleo: [
      {
        name: "Baked Salmon with Asparagus",
        calories: 450,
        protein: 35,
        carbs: 20,
        fat: 25,
        cuisine: "Mediterranean",
        cookingTime: 30,
        ingredients: ["200g salmon", "Asparagus", "Olive oil", "Lemon", "Herbs"],
        instructions: "1. Season salmon. 2. Arrange with asparagus on baking sheet. 3. Bake at 200°C for 20 mins."
      }
    ]
  },

  // SNACK RECIPES
  snacks: {
    vegetarian: [
      {
        name: "Hummus with Veggie Sticks",
        calories: 180,
        protein: 6,
        carbs: 20,
        fat: 8,
        cuisine: "Mediterranean",
        cookingTime: 10,
        ingredients: ["Chickpeas", "Tahini", "Carrots", "Cucumber", "Bell peppers"],
        instructions: "1. Blend chickpeas with tahini, lemon, and garlic. 2. Cut vegetables into sticks. 3. Serve together."
      },
      {
        name: "Fruit and Nut Mix",
        calories: 200,
        protein: 8,
        carbs: 25,
        fat: 10,
        cuisine: "Mixed",
        cookingTime: 5,
        ingredients: ["Mixed nuts", "Dried fruits", "Dark chocolate chips"],
        instructions: "1. Mix all ingredients. 2. Portion into snack bags."
      },
      {
        name: "Roasted Chickpeas",
        calories: 150,
        protein: 8,
        carbs: 22,
        fat: 4,
        cuisine: "Indian",
        cookingTime: 30,
        ingredients: ["1 cup chickpeas", "Olive oil", "Spices", "Salt"],
        instructions: "1. Drain chickpeas. 2. Toss with oil and spices. 3. Roast at 200°C for 25 mins."
      }
    ],
    nonVegetarian: [
      {
        name: "Hard Boiled Eggs",
        calories: 140,
        protein: 12,
        carbs: 2,
        fat: 10,
        cuisine: "Mixed",
        cookingTime: 15,
        ingredients: ["2 eggs", "Salt", "Pepper"],
        instructions: "1. Boil eggs for 10 mins. 2. Cool and peel. 3. Season with salt and pepper."
      },
      {
        name: "Chicken Salad Lettuce Wraps",
        calories: 180,
        protein: 20,
        carbs: 8,
        fat: 8,
        cuisine: "Asian",
        cookingTime: 15,
        ingredients: ["100g cooked chicken", "Lettuce leaves", "Mayo", "Vegetables"],
        instructions: "1. Shred chicken. 2. Mix with mayo and veggies. 3. Wrap in lettuce."
      }
    ],
    vegan: [
      {
        name: "Energy Balls",
        calories: 160,
        protein: 6,
        carbs: 22,
        fat: 6,
        cuisine: "Mixed",
        cookingTime: 10,
        ingredients: ["Dates", "Nuts", "Cocoa powder", "Coconut"],
        instructions: "1. Blend dates and nuts. 2. Form into balls. 3. Roll in cocoa or coconut."
      },
      {
        name: "Edamame",
        calories: 120,
        protein: 12,
        carbs: 10,
        fat: 5,
        cuisine: "Asian",
        cookingTime: 10,
        ingredients: ["1 cup edamame", "Salt", "Chili flakes"],
        instructions: "1. Boil edamame for 5 mins. 2. Drain. 3. Season with salt and chili."
      }
    ],
    keto: [
      {
        name: "Cheese Crisps",
        calories: 150,
        protein: 12,
        carbs: 2,
        fat: 12,
        cuisine: "Mixed",
        cookingTime: 15,
        ingredients: ["Cheddar cheese", "Herbs"],
        instructions: "1. Grate cheese into small piles on baking sheet. 2. Bake at 180°C for 10 mins. 3. Cool until crispy."
      },
      {
        name: "Avocado with Salt",
        calories: 160,
        protein: 2,
        carbs: 8,
        fat: 15,
        cuisine: "Mixed",
        cookingTime: 5,
        ingredients: ["1/2 avocado", "Sea salt", "Lemon juice"],
        instructions: "1. Slice avocado. 2. Drizzle with lemon. 3. Sprinkle salt."
      }
    ],
    paleo: [
      {
        name: "Apple with Almond Butter",
        calories: 180,
        protein: 4,
        carbs: 25,
        fat: 8,
        cuisine: "Mixed",
        cookingTime: 5,
        ingredients: ["1 apple", "2 tbsp almond butter"],
        instructions: "1. Slice apple. 2. Serve with almond butter for dipping."
      }
    ]
  }
};

module.exports = recipeDatabase;