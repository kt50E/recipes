/**
 * Recipe Detail Page - JavaScript
 * Handles loading and displaying individual recipe details
 */

// Configuration - Get from meta tag or use defaults
const getGitHubRepo = () => {
    const repoMeta = document.querySelector('meta[name="github-repo"]');
    return repoMeta ? repoMeta.content : 'kt50E/recipes';
};

// HTML escaping for XSS protection
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    const div = document.createElement('div');
    div.textContent = unsafe;
    return div.innerHTML;
}

// Get recipe ID from URL parameters
function getRecipeId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Parse servings string to number
function parseServings(servingsStr) {
    if (!servingsStr) return null;
    const match = servingsStr.match(/\d+/);
    return match ? parseInt(match[0]) : null;
}

// Load and display recipe details
async function loadRecipeDetail() {
    const recipeId = getRecipeId();
    const detailContainer = document.getElementById('recipe-detail');

    if (!recipeId) {
        displayError('Recipe not found. Please check the URL.');
        return;
    }

    try {
        const response = await fetch('data/recipes.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const recipes = await response.json();
        const recipe = recipes.find(r => r.id === recipeId);

        if (!recipe) {
            displayError('Recipe not found in the collection.');
            return;
        }

        displayRecipeDetail(recipe);
        updatePageTitle(recipe.title);
        updateMetaTags(recipe);
    } catch (error) {
        console.error('Error loading recipe:', error);
        displayError('Error loading recipe. Please try again later.');
    }
}

// Display error message
function displayError(message) {
    const detailContainer = document.getElementById('recipe-detail');
    detailContainer.innerHTML = '';

    const errorDiv = document.createElement('div');
    errorDiv.className = 'empty-state';

    const heading = document.createElement('h2');
    heading.textContent = 'Oops!';

    const messagePara = document.createElement('p');
    messagePara.textContent = message;

    const backLink = document.createElement('a');
    backLink.href = 'index.html';
    backLink.className = 'back-link';
    backLink.textContent = '← Back to all recipes';

    errorDiv.appendChild(heading);
    errorDiv.appendChild(messagePara);
    errorDiv.appendChild(backLink);
    detailContainer.appendChild(errorDiv);
}

// Update page title with recipe name
function updatePageTitle(recipeTitle) {
    if (recipeTitle) {
        document.title = `${recipeTitle} | My Recipe Collection`;
    }
}

// Update meta tags for better sharing
function updateMetaTags(recipe) {
    // Update Open Graph title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && recipe.title) {
        ogTitle.content = recipe.title;
    }

    // Update Open Graph description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && recipe.description) {
        ogDesc.content = recipe.description;
    }

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && recipe.description) {
        metaDesc.content = recipe.description;
    }

    // Add og:image if recipe has an image
    if (recipe.image) {
        let ogImage = document.querySelector('meta[property="og:image"]');
        if (!ogImage) {
            ogImage = document.createElement('meta');
            ogImage.setAttribute('property', 'og:image');
            document.head.appendChild(ogImage);
        }
        ogImage.content = recipe.image;
    }
}

// Create serving calculator
function createServingCalculator(recipe) {
    const originalServings = parseServings(recipe.servings);
    if (!originalServings) return null;

    const calculator = document.createElement('div');
    calculator.className = 'serving-calculator';

    const label = document.createElement('label');
    label.htmlFor = 'serving-input';
    label.textContent = 'Adjust servings:';

    const input = document.createElement('input');
    input.type = 'number';
    input.id = 'serving-input';
    input.min = '1';
    input.max = '100';
    input.value = originalServings;
    input.setAttribute('aria-label', 'Number of servings');

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.textContent = 'Reset';
    resetBtn.setAttribute('aria-label', 'Reset to original serving size');

    // Note: Full ingredient scaling would require parsing amounts
    // This is a simplified version showing the UI
    resetBtn.addEventListener('click', () => {
        input.value = originalServings;
    });

    calculator.appendChild(label);
    calculator.appendChild(input);
    calculator.appendChild(resetBtn);

    return calculator;
}

// Display recipe details (DOM-based, XSS-safe)
function displayRecipeDetail(recipe) {
    const detailContainer = document.getElementById('recipe-detail');
    detailContainer.innerHTML = ''; // Clear loading state

    // Back link
    const backLink = document.createElement('a');
    backLink.href = 'index.html';
    backLink.className = 'back-link';
    backLink.textContent = '← Back to all recipes';
    detailContainer.appendChild(backLink);

    // Title
    const title = document.createElement('h1');
    title.textContent = recipe.title || 'Untitled Recipe';
    detailContainer.appendChild(title);

    // Image
    if (recipe.image) {
        const img = document.createElement('img');
        img.src = recipe.image;
        img.alt = recipe.title || 'Recipe image';
        img.loading = 'eager'; // Load immediately for detail page
        detailContainer.appendChild(img);
    }

    // Description
    if (recipe.description) {
        const description = document.createElement('p');
        description.textContent = recipe.description;
        detailContainer.appendChild(description);
    }

    // Recipe Meta (prep time, cook time, servings)
    if (recipe.prepTime || recipe.cookTime || recipe.servings) {
        const metaDiv = document.createElement('div');
        metaDiv.className = 'recipe-meta';

        if (recipe.prepTime) {
            const prepSpan = document.createElement('span');
            prepSpan.innerHTML = `⏱️ <span class="sr-only">Prep time: </span>Prep Time: ${escapeHtml(recipe.prepTime)}`;
            metaDiv.appendChild(prepSpan);
        }

        if (recipe.cookTime) {
            const cookSpan = document.createElement('span');
            cookSpan.innerHTML = `🍳 <span class="sr-only">Cook time: </span>Cook Time: ${escapeHtml(recipe.cookTime)}`;
            metaDiv.appendChild(cookSpan);
        }

        if (recipe.servings) {
            const servingSpan = document.createElement('span');
            servingSpan.innerHTML = `🍽️ <span class="sr-only">Servings: </span>Servings: ${escapeHtml(recipe.servings)}`;
            metaDiv.appendChild(servingSpan);
        }

        detailContainer.appendChild(metaDiv);
    }

    // Tags
    if (recipe.tags && Array.isArray(recipe.tags) && recipe.tags.length > 0) {
        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'recipe-tags';

        recipe.tags.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'tag';
            tagSpan.textContent = tag;
            tagsDiv.appendChild(tagSpan);
        });

        detailContainer.appendChild(tagsDiv);
    }

    // Ingredients Section
    if (recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
        const ingredientsSection = document.createElement('div');
        ingredientsSection.className = 'ingredients';

        const ingredientsHeading = document.createElement('h2');
        ingredientsHeading.textContent = 'Ingredients';
        ingredientsSection.appendChild(ingredientsHeading);

        // Add serving calculator
        const calculator = createServingCalculator(recipe);
        if (calculator) {
            ingredientsSection.appendChild(calculator);
        }

        const ingredientsList = document.createElement('ul');
        recipe.ingredients
            .filter(ingredient => ingredient && ingredient.trim())
            .forEach(ingredient => {
                const li = document.createElement('li');
                li.textContent = ingredient;
                ingredientsList.appendChild(li);
            });

        ingredientsSection.appendChild(ingredientsList);
        detailContainer.appendChild(ingredientsSection);
    }

    // Instructions Section
    if (recipe.instructions && Array.isArray(recipe.instructions) && recipe.instructions.length > 0) {
        const instructionsSection = document.createElement('div');
        instructionsSection.className = 'instructions';

        const instructionsHeading = document.createElement('h2');
        instructionsHeading.textContent = 'Instructions';
        instructionsSection.appendChild(instructionsHeading);

        const instructionsList = document.createElement('ol');
        recipe.instructions
            .filter(instruction => instruction && instruction.trim())
            .forEach(instruction => {
                const li = document.createElement('li');
                li.textContent = instruction;
                instructionsList.appendChild(li);
            });

        instructionsSection.appendChild(instructionsList);
        detailContainer.appendChild(instructionsSection);
    }

    // Source URL
    if (recipe.sourceUrl) {
        const sourcePara = document.createElement('p');
        const sourceLink = document.createElement('a');
        sourceLink.href = recipe.sourceUrl;
        sourceLink.textContent = 'Original Recipe Source';
        sourceLink.target = '_blank';
        sourceLink.rel = 'noopener noreferrer';
        sourcePara.appendChild(sourceLink);
        detailContainer.appendChild(sourcePara);
    }

    // My Notes Section
    const notesSection = document.createElement('div');
    notesSection.className = 'my-notes-section';

    const notesHeading = document.createElement('h2');
    notesHeading.textContent = 'My Notes';
    notesSection.appendChild(notesHeading);

    if (recipe.notes && recipe.notes.trim()) {
        const notesContent = document.createElement('div');
        notesContent.className = 'notes-content';

        const notesPara = document.createElement('p');
        notesPara.textContent = recipe.notes;
        notesPara.style.whiteSpace = 'pre-wrap'; // Preserve line breaks
        notesContent.appendChild(notesPara);

        notesSection.appendChild(notesContent);
    } else {
        const noNotes = document.createElement('p');
        noNotes.className = 'no-notes';
        noNotes.textContent = 'No notes added yet. Click below to add your personal notes!';
        notesSection.appendChild(noNotes);
    }

    detailContainer.appendChild(notesSection);

    // Recipe Actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'recipe-actions';

    const githubRepo = getGitHubRepo();

    // Edit Notes Button
    const editNotesLink = document.createElement('a');
    editNotesLink.href = `https://github.com/${githubRepo}/actions/workflows/update-notes.yml`;
    editNotesLink.target = '_blank';
    editNotesLink.rel = 'noopener noreferrer';
    editNotesLink.className = 'edit-notes-btn';
    editNotesLink.textContent = recipe.notes ? 'Edit Notes' : 'Add Notes';
    editNotesLink.setAttribute('aria-label', recipe.notes ? 'Edit recipe notes' : 'Add recipe notes');

    editNotesLink.addEventListener('click', (e) => {
        const message = `You'll need to enter:\n\nRecipe ID: ${recipe.id}\n\nThen paste your notes in the next field.`;
        if (!confirm(message)) {
            e.preventDefault();
        }
    });

    actionsDiv.appendChild(editNotesLink);

    // Delete Recipe Button
    const deleteLink = document.createElement('a');
    deleteLink.href = `https://github.com/${githubRepo}/actions/workflows/delete-recipe.yml`;
    deleteLink.target = '_blank';
    deleteLink.rel = 'noopener noreferrer';
    deleteLink.className = 'delete-recipe-btn';
    deleteLink.textContent = 'Delete Recipe';
    deleteLink.setAttribute('aria-label', 'Delete this recipe');

    deleteLink.addEventListener('click', (e) => {
        const message = `Are you sure you want to delete this recipe?\n\nYou'll need to enter the recipe ID: ${recipe.id}`;
        if (!confirm(message)) {
            e.preventDefault();
        }
    });

    actionsDiv.appendChild(deleteLink);

    detailContainer.appendChild(actionsDiv);

    // Print button (optional enhancement)
    const printBtn = document.createElement('button');
    printBtn.textContent = '🖨️ Print Recipe';
    printBtn.className = 'edit-notes-btn'; // Reuse styling
    printBtn.style.marginTop = '1rem';
    printBtn.setAttribute('aria-label', 'Print this recipe');
    printBtn.addEventListener('click', () => window.print());
    actionsDiv.appendChild(printBtn);
}

// Load recipe when page loads
if (document.getElementById('recipe-detail')) {
    loadRecipeDetail();
}
