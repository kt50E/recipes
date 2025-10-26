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

// Parse fractions and mixed numbers from strings
function parseFraction(str) {
    // Handle mixed numbers like "1 1/2" or "1½"
    const mixedMatch = str.match(/(\d+)\s+(\d+)\/(\d+)/);
    if (mixedMatch) {
        return parseInt(mixedMatch[1]) + parseInt(mixedMatch[2]) / parseInt(mixedMatch[3]);
    }

    // Handle fractions like "1/2"
    const fractionMatch = str.match(/(\d+)\/(\d+)/);
    if (fractionMatch) {
        return parseInt(fractionMatch[1]) / parseInt(fractionMatch[2]);
    }

    // Handle decimals like "1.5"
    const decimalMatch = str.match(/\d+\.?\d*/);
    if (decimalMatch) {
        return parseFloat(decimalMatch[0]);
    }

    return null;
}

// Convert decimal to fraction for display
function decimalToFraction(decimal) {
    if (decimal === Math.floor(decimal)) {
        return decimal.toString();
    }

    const tolerance = 1.0E-6;
    let numerator = 1;
    let denominator = 1;
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = decimal;

    do {
        let a = Math.floor(b);
        let aux = h1;
        h1 = a * h1 + h2;
        h2 = aux;
        aux = k1;
        k1 = a * k1 + k2;
        k2 = aux;
        b = 1 / (b - a);
    } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);

    numerator = h1;
    denominator = k1;

    // Check if it's a mixed number
    if (numerator > denominator) {
        const whole = Math.floor(numerator / denominator);
        const remainder = numerator % denominator;
        if (remainder === 0) {
            return whole.toString();
        }
        return `${whole} ${remainder}/${denominator}`;
    }

    return `${numerator}/${denominator}`;
}

// Normalize Unicode fraction characters to ASCII
function normalizeUnicodeFractions(str) {
    const unicodeFractions = {
        '¼': '1/4',
        '½': '1/2',
        '¾': '3/4',
        '⅐': '1/7',
        '⅑': '1/9',
        '⅒': '1/10',
        '⅓': '1/3',
        '⅔': '2/3',
        '⅕': '1/5',
        '⅖': '2/5',
        '⅗': '3/5',
        '⅘': '4/5',
        '⅙': '1/6',
        '⅚': '5/6',
        '⅛': '1/8',
        '⅜': '3/8',
        '⅝': '5/8',
        '⅞': '7/8'
    };

    let result = str;
    for (const [unicode, ascii] of Object.entries(unicodeFractions)) {
        result = result.replace(new RegExp(unicode, 'g'), ascii);
    }
    return result;
}

// Scale an ingredient string by a multiplier
function scaleIngredient(ingredient, multiplier) {
    if (multiplier === 1) return ingredient;

    // First normalize any Unicode fraction characters
    let normalized = normalizeUnicodeFractions(ingredient);

    // Try to find and scale any numbers in the ingredient
    // Order matters: try complex patterns first
    const numberPattern = /(\d+\s+\d+\/\d+|\d+\/\d+|\d+\.\d+|\d+)/g;

    return normalized.replace(numberPattern, (match) => {
        const value = parseFraction(match);
        if (value === null) return match;

        const scaled = value * multiplier;

        // Format the result nicely
        if (scaled < 0.1) {
            return 'pinch of';
        }

        return decimalToFraction(scaled);
    });
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
        document.title = `${recipeTitle} | TLDR Kitchen`;
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

// Create serving calculator with scaling functionality
function createServingCalculator(recipe, ingredientsList) {
    const originalServings = parseServings(recipe.servings);
    if (!originalServings) return null;

    // Store original ingredients for resetting
    const originalIngredients = [...recipe.ingredients];

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

    const scaleBtn = document.createElement('button');
    scaleBtn.type = 'button';
    scaleBtn.textContent = 'Scale Ingredients';
    scaleBtn.setAttribute('aria-label', 'Scale ingredients to new serving size');

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.textContent = 'Reset';
    resetBtn.setAttribute('aria-label', 'Reset to original serving size');

    // Scale button functionality
    scaleBtn.addEventListener('click', () => {
        const newServings = parseInt(input.value);
        if (!newServings || newServings < 1) {
            alert('Please enter a valid number of servings (1 or more)');
            return;
        }

        const multiplier = newServings / originalServings;

        // Clear and rebuild ingredients list
        ingredientsList.innerHTML = '';

        originalIngredients
            .filter(ingredient => ingredient && ingredient.trim())
            .forEach(ingredient => {
                const li = document.createElement('li');
                li.textContent = scaleIngredient(ingredient, multiplier);
                ingredientsList.appendChild(li);
            });
    });

    // Reset button functionality
    resetBtn.addEventListener('click', () => {
        input.value = originalServings;

        // Restore original ingredients
        ingredientsList.innerHTML = '';
        originalIngredients
            .filter(ingredient => ingredient && ingredient.trim())
            .forEach(ingredient => {
                const li = document.createElement('li');
                li.textContent = ingredient;
                ingredientsList.appendChild(li);
            });
    });

    calculator.appendChild(label);
    calculator.appendChild(input);
    calculator.appendChild(scaleBtn);
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

    // Ingredients Section
    if (recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
        const ingredientsSection = document.createElement('div');
        ingredientsSection.className = 'ingredients';

        const ingredientsHeading = document.createElement('h2');
        ingredientsHeading.textContent = 'Ingredients';
        ingredientsSection.appendChild(ingredientsHeading);

        // Create ingredients list first
        const ingredientsList = document.createElement('ul');
        recipe.ingredients
            .filter(ingredient => ingredient && ingredient.trim())
            .forEach(ingredient => {
                const li = document.createElement('li');
                li.textContent = ingredient;
                ingredientsList.appendChild(li);
            });

        // Add serving calculator with reference to ingredients list
        const calculator = createServingCalculator(recipe, ingredientsList);
        if (calculator) {
            ingredientsSection.appendChild(calculator);
        }

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
        noNotes.textContent = 'No notes added yet.';
        notesSection.appendChild(noNotes);
    }

    detailContainer.appendChild(notesSection);
}

// Load recipe when page loads
if (document.getElementById('recipe-detail')) {
    loadRecipeDetail();
}
