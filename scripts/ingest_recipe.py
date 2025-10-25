#!/usr/bin/env python3
"""
Recipe Ingestion Script
Parses recipe URLs and extracts structured recipe data without ads and extraneous content.
"""

import json
import os
import sys
from datetime import date
from urllib.parse import urlparse
import re

try:
    from recipe_scrapers import scrape_me_now
except ImportError:
    print("Error: recipe_scrapers library not found.")
    print("Please install it with: pip install recipe-scrapers")
    sys.exit(1)


def generate_recipe_id(title):
    """Generate a URL-friendly ID from the recipe title."""
    # Convert to lowercase, replace spaces with hyphens, remove special chars
    recipe_id = title.lower()
    recipe_id = re.sub(r'[^a-z0-9\s-]', '', recipe_id)
    recipe_id = re.sub(r'\s+', '-', recipe_id)
    recipe_id = re.sub(r'-+', '-', recipe_id)
    return recipe_id.strip('-')


def scrape_recipe(url):
    """
    Scrape recipe data from a URL.

    Args:
        url: The recipe URL to scrape

    Returns:
        dict: Structured recipe data
    """
    try:
        scraper = scrape_me_now(url)

        recipe_data = {
            "id": generate_recipe_id(scraper.title()),
            "title": scraper.title(),
            "description": scraper.description() if hasattr(scraper, 'description') else "",
            "prepTime": f"{scraper.prep_time()} min" if scraper.prep_time() else "",
            "cookTime": f"{scraper.cook_time()} min" if scraper.cook_time() else "",
            "servings": str(scraper.yields()) if scraper.yields() else "",
            "image": scraper.image() if scraper.image() else "",
            "tags": [],
            "ingredients": scraper.ingredients(),
            "instructions": scraper.instructions_list() if hasattr(scraper, 'instructions_list') else [scraper.instructions()],
            "notes": "",
            "sourceUrl": url,
            "dateAdded": date.today().isoformat()
        }

        # Clean up instructions if they came as a single string
        if len(recipe_data["instructions"]) == 1 and '\n' in recipe_data["instructions"][0]:
            recipe_data["instructions"] = [
                step.strip() for step in recipe_data["instructions"][0].split('\n')
                if step.strip()
            ]

        return recipe_data

    except Exception as e:
        print(f"Error scraping recipe: {e}")
        return None


def load_recipes(recipes_file):
    """Load existing recipes from JSON file."""
    if os.path.exists(recipes_file):
        with open(recipes_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []


def save_recipes(recipes, recipes_file):
    """Save recipes to JSON file."""
    with open(recipes_file, 'w', encoding='utf-8') as f:
        json.dump(recipes, f, indent=2, ensure_ascii=False)


def add_recipe(url, recipes_file='../data/recipes.json'):
    """
    Add a new recipe from a URL.

    Args:
        url: The recipe URL to scrape
        recipes_file: Path to the recipes JSON file
    """
    print(f"Scraping recipe from: {url}")

    # Scrape the recipe
    recipe_data = scrape_recipe(url)

    if not recipe_data:
        print("Failed to scrape recipe. Please check the URL and try again.")
        return False

    print(f"\nSuccessfully scraped: {recipe_data['title']}")

    # Load existing recipes
    recipes = load_recipes(recipes_file)

    # Check if recipe already exists
    existing_ids = [r['id'] for r in recipes]
    if recipe_data['id'] in existing_ids:
        response = input(f"Recipe with similar title already exists. Overwrite? (y/n): ")
        if response.lower() != 'y':
            print("Recipe not added.")
            return False
        # Remove existing recipe
        recipes = [r for r in recipes if r['id'] != recipe_data['id']]

    # Add new recipe
    recipes.append(recipe_data)

    # Save updated recipes
    save_recipes(recipes, recipes_file)

    print(f"Recipe '{recipe_data['title']}' added successfully!")
    print(f"Total recipes: {len(recipes)}")

    return True


def main():
    """Main entry point for the script."""
    if len(sys.argv) < 2:
        print("Usage: python ingest_recipe.py <recipe_url>")
        print("\nExample:")
        print("  python ingest_recipe.py https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/")
        sys.exit(1)

    url = sys.argv[1]

    # Determine the path to recipes.json
    script_dir = os.path.dirname(os.path.abspath(__file__))
    recipes_file = os.path.join(script_dir, '..', 'data', 'recipes.json')

    add_recipe(url, recipes_file)


if __name__ == '__main__':
    main()
