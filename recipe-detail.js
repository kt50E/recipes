// Get recipe ID from URL
function getRecipeId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Load and display recipe details
async function loadRecipeDetail() {
    const recipeId = getRecipeId();

    if (!recipeId) {
        document.getElementById('recipe-detail').innerHTML = '<p>Recipe not found.</p>';
        return;
    }

    try {
        const response = await fetch('data/recipes.json');
        const recipes = await response.json();
        const recipe = recipes.find(r => r.id === recipeId);

        if (!recipe) {
            document.getElementById('recipe-detail').innerHTML = '<p>Recipe not found.</p>';
            return;
        }

        displayRecipeDetail(recipe);
    } catch (error) {
        console.error('Error loading recipe:', error);
        document.getElementById('recipe-detail').innerHTML = '<p>Error loading recipe.</p>';
    }
}

function displayRecipeDetail(recipe) {
    const detailContainer = document.getElementById('recipe-detail');

    detailContainer.innerHTML = `
        <a href="index.html" class="back-link">← Back to all recipes</a>
        <h1>${recipe.title}</h1>
        ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.title}">` : ''}
        ${recipe.description ? `<p>${recipe.description}</p>` : ''}

        <div class="recipe-meta">
            ${recipe.prepTime ? `<span>⏱️ Prep Time: ${recipe.prepTime}</span>` : ''}
            ${recipe.cookTime ? `<span>🍳 Cook Time: ${recipe.cookTime}</span>` : ''}
            ${recipe.servings ? `<span>🍽️ Servings: ${recipe.servings}</span>` : ''}
        </div>

        ${recipe.tags && recipe.tags.length > 0 ? `
            <div class="recipe-tags">
                ${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        ` : ''}

        ${recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? `
            <div class="ingredients">
                <h2>Ingredients</h2>
                <ul>
                    ${recipe.ingredients.filter(i => i && i.trim()).map(ingredient => `<li>${ingredient}</li>`).join('')}
                </ul>
            </div>
        ` : ''}

        ${recipe.instructions && Array.isArray(recipe.instructions) && recipe.instructions.length > 0 ? `
            <div class="instructions">
                <h2>Instructions</h2>
                <ol>
                    ${recipe.instructions.filter(i => i && i.trim()).map(instruction => `<li>${instruction}</li>`).join('')}
                </ol>
            </div>
        ` : ''}

        ${recipe.notes ? `
            <div class="instructions">
                <h2>Notes</h2>
                <p>${recipe.notes}</p>
            </div>
        ` : ''}

        ${recipe.sourceUrl ? `<p><a href="${recipe.sourceUrl}" target="_blank">Original Recipe Source</a></p>` : ''}
    `;
}

// Load recipe when page loads
loadRecipeDetail();
