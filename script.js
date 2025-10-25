/**
 * Recipe Collection - Main Script
 * Handles loading, searching, filtering, and displaying recipes
 */

// Global state
let allRecipes = [];
let filteredRecipes = [];
let currentSearch = '';
let currentTagFilter = '';
let currentSort = 'newest';

// HTML escaping for XSS protection
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    const div = document.createElement('div');
    div.textContent = unsafe;
    return div.innerHTML;
}

// Parse time string to minutes for sorting
function parseTimeToMinutes(timeStr) {
    if (!timeStr) return 0;
    let totalMinutes = 0;

    const hourMatch = timeStr.match(/(\d+)\s*h/i);
    const minuteMatch = timeStr.match(/(\d+)\s*min/i);

    if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;
    if (minuteMatch) totalMinutes += parseInt(minuteMatch[1]);

    return totalMinutes;
}

// Load recipes from JSON file
async function loadRecipes() {
    try {
        const response = await fetch('data/recipes.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allRecipes = await response.json();
        initializeFilters();
        applyFiltersAndSort();
    } catch (error) {
        console.error('Error loading recipes:', error);
        displayError('Unable to load recipes. Please try again later.');
    }
}

// Display error message
function displayError(message) {
    const recipesContainer = document.getElementById('recipes');
    recipesContainer.innerHTML = `
        <div class="empty-state">
            <h2>Oops!</h2>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
    updateRecipeCount(0, 0);
}

// Initialize filter dropdowns with available tags
function initializeFilters() {
    const tagFilter = document.getElementById('tag-filter');
    if (!tagFilter) return;

    // Collect all unique tags
    const allTags = new Set();
    allRecipes.forEach(recipe => {
        if (recipe.tags && Array.isArray(recipe.tags)) {
            recipe.tags.forEach(tag => allTags.add(tag));
        }
    });

    // Sort tags alphabetically
    const sortedTags = Array.from(allTags).sort();

    // Clear existing options (except "All Tags")
    tagFilter.innerHTML = '<option value="">All Tags</option>';

    // Add tag options
    sortedTags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        tagFilter.appendChild(option);
    });
}

// Search recipes
function searchRecipes(recipes, query) {
    if (!query) return recipes;

    const lowerQuery = query.toLowerCase();
    return recipes.filter(recipe => {
        // Search in title
        if (recipe.title && recipe.title.toLowerCase().includes(lowerQuery)) {
            return true;
        }

        // Search in description
        if (recipe.description && recipe.description.toLowerCase().includes(lowerQuery)) {
            return true;
        }

        // Search in ingredients
        if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
            if (recipe.ingredients.some(ing => ing.toLowerCase().includes(lowerQuery))) {
                return true;
            }
        }

        // Search in tags
        if (recipe.tags && Array.isArray(recipe.tags)) {
            if (recipe.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) {
                return true;
            }
        }

        return false;
    });
}

// Filter recipes by tag
function filterByTag(recipes, tag) {
    if (!tag) return recipes;

    return recipes.filter(recipe => {
        return recipe.tags && Array.isArray(recipe.tags) && recipe.tags.includes(tag);
    });
}

// Sort recipes
function sortRecipes(recipes, sortBy) {
    const recipesCopy = [...recipes];

    switch (sortBy) {
        case 'newest':
            return recipesCopy.sort((a, b) => {
                const dateA = new Date(a.dateAdded || '1970-01-01');
                const dateB = new Date(b.dateAdded || '1970-01-01');
                return dateB - dateA;
            });

        case 'oldest':
            return recipesCopy.sort((a, b) => {
                const dateA = new Date(a.dateAdded || '1970-01-01');
                const dateB = new Date(b.dateAdded || '1970-01-01');
                return dateA - dateB;
            });

        case 'title-asc':
            return recipesCopy.sort((a, b) => {
                return (a.title || '').localeCompare(b.title || '');
            });

        case 'title-desc':
            return recipesCopy.sort((a, b) => {
                return (b.title || '').localeCompare(a.title || '');
            });

        case 'prep-time':
            return recipesCopy.sort((a, b) => {
                const timeA = parseTimeToMinutes(a.prepTime);
                const timeB = parseTimeToMinutes(b.prepTime);
                return timeA - timeB;
            });

        case 'cook-time':
            return recipesCopy.sort((a, b) => {
                const timeA = parseTimeToMinutes(a.cookTime);
                const timeB = parseTimeToMinutes(b.cookTime);
                return timeA - timeB;
            });

        default:
            return recipesCopy;
    }
}

// Apply all filters and sorting
function applyFiltersAndSort() {
    // Start with all recipes
    let recipes = [...allRecipes];

    // Apply search
    recipes = searchRecipes(recipes, currentSearch);

    // Apply tag filter
    recipes = filterByTag(recipes, currentTagFilter);

    // Apply sorting
    recipes = sortRecipes(recipes, currentSort);

    filteredRecipes = recipes;
    displayRecipes(filteredRecipes);
    updateRecipeCount(filteredRecipes.length, allRecipes.length);
}

// Update recipe count display
function updateRecipeCount(filtered, total) {
    const countText = document.getElementById('recipe-count-text');
    if (!countText) return;

    if (filtered === total) {
        countText.textContent = `${total} ${total === 1 ? 'recipe' : 'recipes'}`;
    } else {
        countText.textContent = `${filtered} of ${total} ${total === 1 ? 'recipe' : 'recipes'}`;
    }
}

// Create recipe card element (DOM-based, no innerHTML for user content)
function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.setAttribute('role', 'listitem');

    // Image
    if (recipe.image) {
        const img = document.createElement('img');
        img.src = recipe.image;
        img.alt = recipe.title || 'Recipe image';
        img.loading = 'lazy'; // Native lazy loading
        card.appendChild(img);
    }

    // Content container
    const content = document.createElement('div');
    content.className = 'recipe-content';

    // Title
    const title = document.createElement('h2');
    title.textContent = recipe.title || 'Untitled Recipe';
    content.appendChild(title);

    // Description
    if (recipe.description) {
        const desc = document.createElement('p');
        desc.className = 'recipe-description';
        desc.textContent = recipe.description;
        content.appendChild(desc);
    }

    // Meta information (prep time, cook time, servings)
    if (recipe.prepTime || recipe.cookTime || recipe.servings) {
        const meta = document.createElement('div');
        meta.className = 'recipe-meta';

        if (recipe.prepTime) {
            const prepSpan = document.createElement('span');
            prepSpan.innerHTML = `⏱️ <span class="sr-only">Prep time: </span>Prep: ${escapeHtml(recipe.prepTime)}`;
            meta.appendChild(prepSpan);
        }

        if (recipe.cookTime) {
            const cookSpan = document.createElement('span');
            cookSpan.innerHTML = `🍳 <span class="sr-only">Cook time: </span>Cook: ${escapeHtml(recipe.cookTime)}`;
            meta.appendChild(cookSpan);
        }

        if (recipe.servings) {
            const servingSpan = document.createElement('span');
            servingSpan.innerHTML = `🍽️ <span class="sr-only">Servings: </span>Servings: ${escapeHtml(recipe.servings)}`;
            meta.appendChild(servingSpan);
        }

        content.appendChild(meta);
    }

    // Tags
    if (recipe.tags && Array.isArray(recipe.tags) && recipe.tags.length > 0) {
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'recipe-tags';

        recipe.tags.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'tag';
            tagSpan.textContent = tag;
            tagSpan.setAttribute('role', 'button');
            tagSpan.setAttribute('tabindex', '0');
            tagSpan.setAttribute('aria-label', `Filter by ${tag}`);

            // Make tags clickable to filter
            tagSpan.addEventListener('click', () => {
                currentTagFilter = tag;
                document.getElementById('tag-filter').value = tag;
                applyFiltersAndSort();
            });

            // Keyboard support
            tagSpan.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    currentTagFilter = tag;
                    document.getElementById('tag-filter').value = tag;
                    applyFiltersAndSort();
                }
            });

            tagsContainer.appendChild(tagSpan);
        });

        content.appendChild(tagsContainer);
    }

    // View recipe button
    const link = document.createElement('a');
    link.href = `recipe.html?id=${encodeURIComponent(recipe.id)}`;
    link.className = 'view-recipe-btn';
    link.textContent = 'View Recipe';
    link.setAttribute('aria-label', `View recipe: ${recipe.title}`);
    content.appendChild(link);

    card.appendChild(content);
    return card;
}

// Display recipes in the grid
function displayRecipes(recipes) {
    const recipesContainer = document.getElementById('recipes');
    if (!recipesContainer) return;

    // Clear existing content
    recipesContainer.innerHTML = '';

    if (recipes.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';

        const heading = document.createElement('h2');
        heading.textContent = 'No Recipes Found';

        const message = document.createElement('p');
        if (currentSearch || currentTagFilter) {
            message.textContent = 'Try adjusting your search or filters.';
        } else {
            message.textContent = 'No recipes found yet. Add your first recipe!';
        }

        emptyState.appendChild(heading);
        emptyState.appendChild(message);
        recipesContainer.appendChild(emptyState);
        return;
    }

    // Create and append recipe cards
    const fragment = document.createDocumentFragment();
    recipes.forEach(recipe => {
        const card = createRecipeCard(recipe);
        fragment.appendChild(card);
    });
    recipesContainer.appendChild(fragment);
}

// Debounce function for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Setup event listeners
function setupEventListeners() {
    // Search input with debounce
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        const debouncedSearch = debounce((e) => {
            currentSearch = e.target.value;
            applyFiltersAndSort();
        }, 300);

        searchInput.addEventListener('input', debouncedSearch);
    }

    // Tag filter
    const tagFilter = document.getElementById('tag-filter');
    if (tagFilter) {
        tagFilter.addEventListener('change', (e) => {
            currentTagFilter = e.target.value;
            applyFiltersAndSort();
        });
    }

    // Sort select
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            applyFiltersAndSort();
        });
    }
}

// Initialize the app
async function init() {
    setupEventListeners();
    await loadRecipes();
}

// Load recipes when page loads
if (document.getElementById('recipes')) {
    init();
}
