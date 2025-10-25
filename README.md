# My Recipe Collection

A personal recipe website to save and organize your favorite recipes. Includes a recipe ingestion script that automatically parses recipe URLs to extract only the essential recipe information without ads and extraneous content.

## Features

- Clean, minimalist recipe display
- Responsive design that works on all devices
- **One-click recipe submission via GitHub Actions** - add recipes directly from the website!
- Automatic recipe scraping from 300+ recipe sites
- JSON-based storage (easy to edit and backup)
- Hosted on GitHub Pages

## Getting Started

### Viewing the Website

Simply open `index.html` in your browser, or visit the GitHub Pages URL once deployed.

### Adding Recipes

#### Method 1: Via Website (Automated - Recommended!)

1. Visit your live recipe website
2. Click the "Add Recipe from URL" button at the top
3. You'll be redirected to GitHub Actions
4. Click the "Run workflow" button
5. Paste your recipe URL and click "Run workflow"
6. GitHub will automatically scrape the recipe, add it to your collection, and update your live site!

The script will automatically extract:
- Recipe title
- Description
- Prep time and cook time
- Servings
- Ingredients list
- Step-by-step instructions
- Recipe image
- Source URL

#### Method 2: Using the Local Script

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the ingestion script with a recipe URL:
   ```bash
   cd scripts
   python ingest_recipe.py "https://www.example.com/recipe-url"
   ```

3. Push your changes:
   ```bash
   git add data/recipes.json
   git commit -m "Add new recipe"
   git push
   ```

#### Method 3: Manual Entry

Edit `data/recipes.json` and add your recipe following this format:

```json
{
  "id": "unique-recipe-id",
  "title": "Recipe Name",
  "description": "Brief description",
  "prepTime": "15 min",
  "cookTime": "30 min",
  "servings": "4",
  "image": "https://example.com/image.jpg",
  "tags": ["dinner", "vegetarian"],
  "ingredients": [
    "1 cup flour",
    "2 eggs"
  ],
  "instructions": [
    "Step 1",
    "Step 2"
  ],
  "notes": "Optional notes",
  "sourceUrl": "https://original-recipe-url.com",
  "dateAdded": "2025-10-25"
}
```

## Supported Recipe Sites

The ingestion script supports recipes from over 300+ websites including:
- AllRecipes
- Food Network
- Bon Appétit
- Serious Eats
- NYT Cooking
- And many more!

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── add-recipe.yml  # GitHub Actions workflow for automated recipe submission
├── index.html              # Main page listing all recipes
├── recipe.html             # Individual recipe detail page
├── styles.css              # Website styling
├── script.js               # Recipe loading for main page
├── recipe-detail.js        # Recipe detail page logic
├── data/
│   └── recipes.json        # Recipe data storage
├── scripts/
│   └── ingest_recipe.py    # Recipe URL parser
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## Deploying to GitHub Pages

1. Push this repository to GitHub
2. Go to repository Settings → Pages
3. Select branch `main` and folder `/ (root)`
4. Your site will be live at `https://yourusername.github.io/repository-name/`

## Technologies Used

- HTML5, CSS3, JavaScript (Vanilla)
- Python 3 with recipe-scrapers library
- GitHub Actions for automated workflows
- JSON for data storage
- GitHub Pages for hosting

## License

This is a personal project. Feel free to use and modify as you wish!
