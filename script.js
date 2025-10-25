// Load and display recipes
async function loadRecipes() {
    try {
        const response = await fetch('data/recipes.json');
        const recipes = await response.json();
        displayRecipes(recipes);
    } catch (error) {
        console.error('Error loading recipes:', error);
        document.getElementById('recipes').innerHTML = '<p>No recipes found yet. Add your first recipe!</p>';
    }
}

function displayRecipes(recipes) {
    const recipesContainer = document.getElementById('recipes');

    if (recipes.length === 0) {
        recipesContainer.innerHTML = '<p>No recipes found yet. Add your first recipe!</p>';
        return;
    }

    recipesContainer.innerHTML = recipes.map(recipe => `
        <div class="recipe-card">
            ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.title}">` : ''}
            <div class="recipe-content">
                <h2>${recipe.title}</h2>
                ${recipe.description ? `<p class="recipe-description">${recipe.description}</p>` : ''}
                <div class="recipe-meta">
                    ${recipe.prepTime ? `<span>⏱️ Prep: ${recipe.prepTime}</span>` : ''}
                    ${recipe.cookTime ? `<span>🍳 Cook: ${recipe.cookTime}</span>` : ''}
                    ${recipe.servings ? `<span>🍽️ Servings: ${recipe.servings}</span>` : ''}
                </div>
                ${recipe.tags && recipe.tags.length > 0 ? `
                    <div class="recipe-tags">
                        ${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
                <a href="recipe.html?id=${recipe.id}" class="view-recipe-btn">View Recipe</a>
            </div>
        </div>
    `).join('');
}

// Load recipes when page loads
if (document.getElementById('recipes')) {
    loadRecipes();
}
