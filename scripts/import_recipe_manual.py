#!/usr/bin/env python3
"""
Manual Recipe Import Script
Parses recipe text (from OCR or manual entry) and adds it to recipes.json
"""

import json
import os
import sys
import argparse
import re
from datetime import date


def generate_recipe_id(title):
    """Generate a URL-friendly ID from the recipe title."""
    recipe_id = title.lower()
    recipe_id = re.sub(r'[^a-z0-9\s-]', '', recipe_id)
    recipe_id = re.sub(r'\s+', '-', recipe_id)
    recipe_id = re.sub(r'-+', '-', recipe_id)
    return recipe_id.strip('-')


def parse_recipe_text(text):
    """
    Intelligently parse recipe text to separate ingredients from instructions.

    Looks for:
    - Section headers (Ingredients, Instructions, Directions, Steps, etc.)
    - Numbered/bulleted lists
    - Line length patterns (ingredients are usually shorter)
    """
    lines = [line.strip() for line in text.split('\n') if line.strip()]

    ingredients = []
    instructions = []
    current_section = None

    # Keywords that indicate section headers
    ingredient_keywords = ['ingredient', 'ingredients', 'what you need', 'you will need']
    instruction_keywords = ['instruction', 'instructions', 'direction', 'directions',
                           'steps', 'method', 'preparation', 'how to make']

    for line in lines:
        lower_line = line.lower()

        # Check for section headers
        is_ingredient_header = any(keyword in lower_line for keyword in ingredient_keywords)
        is_instruction_header = any(keyword in lower_line for keyword in instruction_keywords)

        if is_ingredient_header and len(line) < 50:
            current_section = 'ingredients'
            continue
        elif is_instruction_header and len(line) < 50:
            current_section = 'instructions'
            continue

        # Skip very short lines that are likely headers or empty
        if len(line) < 3:
            continue

        # If we have a section, add to it
        if current_section == 'ingredients':
            ingredients.append(line)
        elif current_section == 'instructions':
            instructions.append(line)
        else:
            # Try to guess based on patterns
            # Ingredients are usually:
            # - Shorter (< 100 chars)
            # - Start with quantity/measurement
            # - Contain measurement words (cup, tbsp, tsp, oz, lb, etc.)

            measurement_pattern = r'\b(cup|cups|tablespoon|tbsp|teaspoon|tsp|ounce|oz|pound|lb|gram|g|kg|ml|liter|pinch|dash)\b'
            has_measurement = re.search(measurement_pattern, lower_line)
            starts_with_number = re.match(r'^\d+', line)
            is_short = len(line) < 100

            if (has_measurement or starts_with_number) and is_short:
                ingredients.append(line)
            else:
                instructions.append(line)

    # If we couldn't parse anything, put everything in instructions
    if not ingredients and not instructions:
        instructions = lines

    return ingredients, instructions


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


def create_recipe(title, recipe_text, prep_time='', cook_time='', servings='',
                 description='', image_url='', source_url=''):
    """Create a recipe dictionary from manual inputs."""

    # Parse the recipe text
    ingredients, instructions = parse_recipe_text(recipe_text)

    # Generate recipe ID
    recipe_id = generate_recipe_id(title)

    # Create recipe object
    recipe = {
        'id': recipe_id,
        'title': title,
        'description': description,
        'prepTime': prep_time,
        'cookTime': cook_time,
        'servings': servings,
        'image': image_url,
        'tags': [],
        'ingredients': ingredients,
        'instructions': instructions,
        'notes': '',
        'sourceUrl': source_url,
        'dateAdded': str(date.today())
    }

    return recipe


def add_recipe_manual(args, recipes_file):
    """Add a manually entered recipe to recipes.json."""

    # Load existing recipes
    recipes = load_recipes(recipes_file)

    # Create new recipe
    recipe_data = create_recipe(
        title=args.title,
        recipe_text=args.text,
        prep_time=args.prep_time,
        cook_time=args.cook_time,
        servings=args.servings,
        description=args.description,
        image_url=args.image,
        source_url=args.source
    )

    print(f"\nParsed Recipe:")
    print(f"  Title: {recipe_data['title']}")
    print(f"  ID: {recipe_data['id']}")
    print(f"  Ingredients found: {len(recipe_data['ingredients'])}")
    print(f"  Instructions found: {len(recipe_data['instructions'])}")

    # Check for existing recipe with same ID
    existing_ids = [r['id'] for r in recipes]
    if recipe_data['id'] in existing_ids:
        print(f"\nRecipe with similar title already exists. Auto-overwriting...")
        recipes = [r for r in recipes if r['id'] != recipe_data['id']]

    # Add new recipe
    recipes.append(recipe_data)

    # Save updated recipes
    save_recipes(recipes, recipes_file)

    print(f"\n✅ Recipe '{recipe_data['title']}' added successfully!")
    print(f"Total recipes: {len(recipes)}")

    return True


def main():
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(description='Import a recipe from manual text input')
    parser.add_argument('--title', required=True, help='Recipe title')
    parser.add_argument('--text', required=True, help='Recipe text (ingredients and instructions)')
    parser.add_argument('--prep-time', default='', help='Prep time (e.g., "10 min")')
    parser.add_argument('--cook-time', default='', help='Cook time (e.g., "30 min")')
    parser.add_argument('--servings', default='', help='Number of servings')
    parser.add_argument('--description', default='', help='Recipe description')
    parser.add_argument('--image', default='', help='Image URL')
    parser.add_argument('--source', default='', help='Source URL')

    args = parser.parse_args()

    # Determine the path to recipes.json
    script_dir = os.path.dirname(os.path.abspath(__file__))
    recipes_file = os.path.join(script_dir, '..', 'data', 'recipes.json')

    try:
        success = add_recipe_manual(args, recipes_file)
        if not success:
            sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
