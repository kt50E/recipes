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
    from recipe_scrapers import scrape_me
    import requests
    from bs4 import BeautifulSoup
except ImportError as e:
    print(f"Error: Required library not found: {e}")
    print("Please install dependencies with: pip install recipe-scrapers requests beautifulsoup4")
    sys.exit(1)


def generate_recipe_id(title):
    """Generate a URL-friendly ID from the recipe title."""
    # Convert to lowercase, replace spaces with hyphens, remove special chars
    recipe_id = title.lower()
    recipe_id = re.sub(r'[^a-z0-9\s-]', '', recipe_id)
    recipe_id = re.sub(r'\s+', '-', recipe_id)
    recipe_id = re.sub(r'-+', '-', recipe_id)
    return recipe_id.strip('-')


def parse_duration(duration_str):
    """Parse ISO 8601 duration string to minutes."""
    if not duration_str:
        return ""

    # Match PT#H#M or PT#M format
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?', duration_str)
    if match:
        hours = int(match.group(1) or 0)
        minutes = int(match.group(2) or 0)
        total_minutes = hours * 60 + minutes
        if total_minutes > 0:
            if hours > 0 and minutes > 0:
                return f"{hours}h {minutes}min"
            elif hours > 0:
                return f"{hours}h"
            else:
                return f"{minutes} min"
    return ""


def parse_microdata_recipe(recipe_elem, url):
    """Parse recipe data from HTML microdata format."""
    try:
        def get_itemprop(prop_name):
            """Get value from itemprop attribute."""
            elem = recipe_elem.find(attrs={'itemprop': prop_name})
            if elem:
                # Check for content attribute first (common in meta tags)
                if elem.get('content'):
                    return elem.get('content')
                # Then check for text content
                return elem.get_text(strip=True)
            return ""

        def get_itemprop_list(prop_name):
            """Get list of values from itemprop attributes."""
            elems = recipe_elem.find_all(attrs={'itemprop': prop_name})
            results = []
            for elem in elems:
                if elem.get('content'):
                    results.append(elem.get('content'))
                else:
                    text = elem.get_text(strip=True)
                    if text:
                        results.append(text)
            return results

        # Extract basic info
        title = get_itemprop('name') or 'Untitled Recipe'
        description = get_itemprop('description')

        # Extract times
        prep_time = parse_duration(get_itemprop('prepTime'))
        cook_time = parse_duration(get_itemprop('cookTime'))

        # Extract servings
        servings = get_itemprop('recipeYield') or get_itemprop('yields')

        # Extract image
        image_elem = recipe_elem.find(attrs={'itemprop': 'image'})
        image = ''
        if image_elem:
            image = image_elem.get('src') or image_elem.get('content') or ''

        # Extract ingredients
        ingredients = get_itemprop_list('recipeIngredient')

        # Extract instructions
        instructions = []
        instruction_elems = recipe_elem.find_all(attrs={'itemprop': 'recipeInstructions'})
        for elem in instruction_elems:
            # Check if it has HowToStep children
            steps = elem.find_all(attrs={'itemprop': 'text'})
            if steps:
                instructions.extend([step.get_text(strip=True) for step in steps if step.get_text(strip=True)])
            else:
                text = elem.get_text(strip=True)
                if text:
                    instructions.append(text)

        # If instructions came as one block, try to split them
        if len(instructions) == 1 and '\n' in instructions[0]:
            instructions = [s.strip() for s in instructions[0].split('\n') if s.strip()]

        recipe_data = {
            "id": generate_recipe_id(title),
            "title": title,
            "description": description,
            "prepTime": prep_time,
            "cookTime": cook_time,
            "servings": servings,
            "image": image,
            "tags": [],
            "ingredients": ingredients,
            "instructions": instructions,
            "notes": "",
            "sourceUrl": url,
            "dateAdded": date.today().isoformat()
        }

        return recipe_data

    except Exception as e:
        print(f"Error parsing microdata: {e}")
        return None


def scrape_with_schema_org(url):
    """
    Fallback scraper using schema.org structured data (JSON-LD or microdata).
    Most recipe websites include this for SEO purposes.
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        # First, try to find microdata (HTML with itemtype attribute)
        recipe_microdata = soup.find(attrs={'itemtype': lambda x: x and 'schema.org/Recipe' in x if x else False})
        if recipe_microdata:
            print("Found microdata recipe structure")
            recipe_data = parse_microdata_recipe(recipe_microdata, url)
            if recipe_data:
                return recipe_data

        # Fall back to JSON-LD script tags
        scripts = soup.find_all('script', type='application/ld+json')

        for script in scripts:
            try:
                data = json.loads(script.string)

                # Handle @graph format
                if isinstance(data, dict) and '@graph' in data:
                    data = data['@graph']

                # Handle array format
                if isinstance(data, list):
                    # Find Recipe type
                    recipe = next((item for item in data if item.get('@type') == 'Recipe'), None)
                    if recipe:
                        data = recipe

                # Check if this is a Recipe
                if isinstance(data, dict) and data.get('@type') == 'Recipe':
                    # Extract ingredients
                    ingredients = data.get('recipeIngredient', [])
                    if isinstance(ingredients, str):
                        ingredients = [ingredients]

                    # Extract instructions
                    instructions_raw = data.get('recipeInstructions', [])
                    instructions = []

                    def extract_instruction_text(inst):
                        """Recursively extract instruction text from various schema.org formats."""
                        if isinstance(inst, str):
                            return [inst]
                        elif isinstance(inst, dict):
                            inst_type = inst.get('@type', '')

                            # Handle HowToSection (contains multiple steps)
                            if inst_type == 'HowToSection':
                                section_steps = []
                                # Get section name if present
                                section_name = inst.get('name', '')
                                if section_name:
                                    section_steps.append(f"{section_name}:")

                                # Extract steps within the section
                                items = inst.get('itemListElement', [])
                                for item in items:
                                    section_steps.extend(extract_instruction_text(item))
                                return section_steps

                            # Handle HowToStep
                            elif inst_type == 'HowToStep':
                                text = inst.get('text', '')
                                if text:
                                    return [text]

                            # Fallback: try to get text or name field
                            text = inst.get('text', inst.get('name', ''))
                            if text:
                                return [text]

                        return []

                    if isinstance(instructions_raw, str):
                        instructions = [instructions_raw]
                    elif isinstance(instructions_raw, list):
                        for inst in instructions_raw:
                            instructions.extend(extract_instruction_text(inst))

                    # Extract servings
                    servings = ""
                    if 'recipeYield' in data:
                        yield_val = data['recipeYield']
                        if isinstance(yield_val, list):
                            servings = str(yield_val[0]) if yield_val else ""
                        else:
                            servings = str(yield_val)

                    recipe_data = {
                        "id": generate_recipe_id(data.get('name', 'untitled')),
                        "title": data.get('name', 'Untitled Recipe'),
                        "description": data.get('description', ''),
                        "prepTime": parse_duration(data.get('prepTime', '')),
                        "cookTime": parse_duration(data.get('cookTime', '')),
                        "servings": servings,
                        "image": data.get('image', {}).get('url', '') if isinstance(data.get('image'), dict) else (data.get('image', [''])[0] if isinstance(data.get('image'), list) else data.get('image', '')),
                        "tags": [],
                        "ingredients": ingredients,
                        "instructions": instructions,
                        "notes": "",
                        "sourceUrl": url,
                        "dateAdded": date.today().isoformat()
                    }

                    return recipe_data

            except (json.JSONDecodeError, AttributeError, KeyError) as e:
                continue

        return None

    except Exception as e:
        print(f"Schema.org fallback error: {e}")
        return None


def scrape_recipe(url):
    """
    Scrape recipe data from a URL.

    First tries recipe-scrapers library for supported sites.
    Falls back to schema.org JSON-LD parsing for unsupported sites.

    Args:
        url: The recipe URL to scrape

    Returns:
        dict: Structured recipe data
    """
    # First, try recipe-scrapers library
    try:
        print("Trying recipe-scrapers library...")
        scraper = scrape_me(url)

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

        print("✓ Successfully scraped with recipe-scrapers library")
        return recipe_data

    except Exception as e:
        error_msg = str(e)
        print(f"Recipe-scrapers failed: {error_msg}")

        # Try schema.org fallback for any recipe-scrapers failure
        # This handles unsupported sites, missing data, or parsing errors
        print("Trying schema.org fallback parser...")
        recipe_data = scrape_with_schema_org(url)

        if recipe_data:
            print("✓ Successfully scraped with schema.org fallback")
            return recipe_data
        else:
            print("✗ Schema.org fallback failed - no structured data found")

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


def add_recipe(url, recipes_file='../data/recipes.json', auto_overwrite=False):
    """
    Add a new recipe from a URL.

    Args:
        url: The recipe URL to scrape
        recipes_file: Path to the recipes JSON file
        auto_overwrite: If True, automatically overwrite existing recipes without prompting
    """
    print(f"Scraping recipe from: {url}")

    # Scrape the recipe
    recipe_data = scrape_recipe(url)

    if not recipe_data:
        print("Failed to scrape recipe. Please check the URL and try again.")
        sys.exit(1)

    print(f"\nSuccessfully scraped: {recipe_data['title']}")

    # Load existing recipes
    recipes = load_recipes(recipes_file)

    # Check if recipe already exists
    existing_ids = [r['id'] for r in recipes]
    if recipe_data['id'] in existing_ids:
        if auto_overwrite:
            print(f"Recipe with similar title already exists. Auto-overwriting...")
            recipes = [r for r in recipes if r['id'] != recipe_data['id']]
        elif sys.stdin.isatty():
            # Only prompt if running interactively
            response = input(f"Recipe with similar title already exists. Overwrite? (y/n): ")
            if response.lower() != 'y':
                print("Recipe not added.")
                sys.exit(0)
            recipes = [r for r in recipes if r['id'] != recipe_data['id']]
        else:
            # In non-interactive mode (like GitHub Actions), auto-overwrite
            print(f"Recipe with similar title already exists. Auto-overwriting in non-interactive mode...")
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

    try:
        success = add_recipe(url, recipes_file)
        if not success:
            sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
