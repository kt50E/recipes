# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TLDR Kitchen is a personal recipe collection website with automated recipe ingestion from 300+ recipe sites. The project is a static site hosted on GitHub Pages with Python scripts for recipe management and GitHub Actions workflows for automation.

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3 (no frameworks)
- **Backend**: Python 3 scripts using `recipe-scrapers`, `requests`, `beautifulsoup4`
- **Data Storage**: JSON (`data/recipes.json`)
- **Hosting**: GitHub Pages
- **Automation**: GitHub Actions workflows

## Common Commands

### Python Setup
```bash
# Install dependencies (required for recipe scripts)
pip install -r requirements.txt
```

### Adding Recipes

**Method 1: Local script (preferred for development)**
```bash
cd scripts
python ingest_recipe.py "https://www.example.com/recipe-url"
```

**Method 2: GitHub Actions (production)**
- Trigger the "Add Recipe from URL" workflow manually via GitHub UI
- The workflow is defined in `.github/workflows/add-recipe.yml`

### Managing Recipes

```bash
# Delete a recipe by ID
cd scripts
python delete_recipe.py "recipe-id"

# Update recipe notes
cd scripts
python update_notes.py "recipe-id" "Your notes here"
```

### Local Development
```bash
# Serve the site locally (use any simple HTTP server)
python -m http.server 8000
# OR
npx serve .

# Then visit http://localhost:8000
```

## Architecture

### Data Flow

1. **Recipe Ingestion** (`scripts/ingest_recipe.py`):
   - Attempts to scrape using `recipe-scrapers` library first (supports 300+ sites)
   - Falls back to custom schema.org JSON-LD/microdata parser if library fails
   - Generates URL-friendly ID from recipe title
   - Parses ISO 8601 duration strings to human-readable format
   - Handles duplicate recipes by ID (prompts or auto-overwrites in non-interactive mode)
   - Appends to `data/recipes.json`

2. **Frontend Loading** (`script.js` for index, `recipe-detail.js` for detail page):
   - Fetches `data/recipes.json` on page load
   - Implements client-side search across title, description, and ingredients
   - Supports sorting by newest, oldest, title, or total time
   - All HTML content is escaped to prevent XSS

3. **Recipe Detail Page** (`recipe.html`):
   - Reads recipe ID from URL query parameter (`?id=recipe-id`)
   - Implements interactive serving size adjustment with fraction math
   - Scales ingredients proportionally when servings are changed
   - Displays link to original source and GitHub edit workflow

### Key Components

**Recipe Data Structure** (in `data/recipes.json`):
```json
{
  "id": "unique-recipe-id",          // Generated from title
  "title": "Recipe Name",
  "description": "Brief description",
  "prepTime": "15 min",              // Human-readable format
  "cookTime": "30 min",
  "servings": "4",
  "image": "https://...",
  "tags": [],                        // Currently unused
  "ingredients": ["1 cup flour"],
  "instructions": ["Step 1"],
  "notes": "",                       // User-added notes
  "sourceUrl": "https://...",
  "dateAdded": "2025-10-25"          // ISO format
}
```

**Recipe Scraping Logic** (`scripts/ingest_recipe.py`):
- Primary: `recipe-scrapers` library (`scrape_me()`)
- Fallback 1: schema.org microdata parser (`parse_microdata_recipe()`)
- Fallback 2: schema.org JSON-LD parser (`scrape_with_schema_org()`)
- ID generation uses lowercase, hyphens, removes special chars (`generate_recipe_id()`)
- Duration parsing converts `PT1H30M` → `1h 30min` (`parse_duration()`)

**Frontend State Management** (`script.js`):
- Global state: `allRecipes`, `filteredRecipes`, `currentSearch`, `currentSort`
- Search is case-insensitive and searches title, description, ingredients
- No external dependencies; all vanilla JS

**Serving Size Adjustment** (`recipe-detail.js`):
- Parses fractions (1/2, 1 1/2, ½) and decimals from ingredient strings
- Scales quantities proportionally to new serving size
- Converts results back to fractions for display
- Handles Unicode fraction characters (¼, ½, ¾)

### GitHub Actions Workflows

**add-recipe.yml**: Triggered manually via workflow_dispatch, accepts recipe URL, runs `ingest_recipe.py`, commits to main

**delete-recipe.yml**: Manual trigger for deleting recipes by ID

**update-notes.yml**: Manual trigger for updating recipe notes

All workflows use `github-actions[bot]` for commits.

## Important Notes

- Recipe IDs are generated from titles and must be unique
- The ingestion script handles non-interactive mode for GitHub Actions (auto-overwrites duplicates)
- All user-generated content is HTML-escaped on the frontend
- Images are hotlinked from source sites (not stored locally)
- The site is fully static with no backend server or database
- Recipe data changes require committing `data/recipes.json` and pushing to trigger GitHub Pages rebuild
