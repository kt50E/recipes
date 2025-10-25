# My Recipe Collection

A personal recipe website to save and organize your favorite recipes. Includes a recipe ingestion script that automatically parses recipe URLs to extract only the essential recipe information without ads and extraneous content.

## Features

- Clean, minimalist recipe display
- Responsive design that works on all devices
- Recipe ingestion script to automatically extract recipes from URLs
- JSON-based storage (easy to edit and backup)
- Hosted on GitHub Pages

## Getting Started

### Viewing the Website

Simply open `index.html` in your browser, or visit the GitHub Pages URL once deployed.

### Adding Recipes

#### Method 1: Using the Recipe Ingestion Script

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the ingestion script with a recipe URL:
   ```bash
   cd scripts
   python ingest_recipe.py "https://www.example.com/recipe-url"
   ```

The script will automatically extract:
- Recipe title
- Description
- Prep time and cook time
- Servings
- Ingredients list
- Step-by-step instructions
- Recipe image
- Source URL

#### Method 2: Manual Entry

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
- JSON for data storage

## License

This is a personal project. Feel free to use and modify as you wish!
