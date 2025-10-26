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
    - Handles tabs, bullets, and numbered lists as separators
    """
    # Normalize the text: replace tabs with newlines, handle various separators
    normalized = text.replace('\t', '\n')

    # Replace common section separators (⸻, ---, ===) with double newlines
    normalized = re.sub(r'\u2e3b+', '\n\n', normalized)  # horizontal bar separator (⸻)
    normalized = re.sub(r'\u2014+', '\n\n', normalized)  # em-dash (—)
    normalized = re.sub(r'-{3,}', '\n\n', normalized)  # triple dash (---)
    normalized = re.sub(r'={3,}', '\n\n', normalized)  # triple equals (===)

    # Split bullet points into separate lines (•, *, -, but not mid-sentence hyphens)
    # Only split on bullets that appear at start of line or after whitespace
    normalized = re.sub(r'\n•\n', '\n', normalized)  # Remove standalone bullets on their own line
    normalized = re.sub(r'(\s|^)•\s*', r'\n', normalized)
    normalized = re.sub(r'(\s|^)\*\s+', r'\n* ', normalized)

    # Split numbered lists (1., 2., etc.) into separate lines
    normalized = re.sub(r'\s+(\d+)\.\s+', r'\n\1. ', normalized)

    lines = [line.strip() for line in normalized.split('\n') if line.strip()]

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
        # Be more strict: section headers should be short and not part of numbered lists
        is_numbered = re.match(r'^\d+\.', line)
        is_ingredient_header = (
            not is_numbered and
            len(line) < 50 and
            any(keyword == lower_line.strip() or
                lower_line.strip().startswith(keyword + ':') or
                lower_line.strip().startswith(keyword + ' ') and len(lower_line.strip().split()) <= 3
                for keyword in ingredient_keywords)
        )
        is_instruction_header = (
            not is_numbered and
            len(line) < 50 and
            any(keyword == lower_line.strip() or
                lower_line.strip().startswith(keyword + ':') or
                lower_line.strip().startswith(keyword + ' ') and len(lower_line.strip().split()) <= 3
                for keyword in instruction_keywords)
        )

        if is_ingredient_header:
            current_section = 'ingredients'
            continue
        elif is_instruction_header:
            current_section = 'instructions'
            continue

        # Skip very short lines that are likely headers or empty
        if len(line) < 3:
            continue

        # If we have a section, add to it
        if current_section == 'ingredients':
            # Remove leading bullet/dash markers if present
            cleaned = re.sub(r'^[•\-\*]\s*', '', line)
            if cleaned:
                ingredients.append(cleaned)
        elif current_section == 'instructions':
            # Keep numbered prefixes but clean up bullet points
            if re.match(r'^\d+\.', line):
                # Keep numbered instructions as-is
                instructions.append(line)
            else:
                # Remove bullet points from unnumbered instructions
                cleaned = re.sub(r'^[•\-\*]\s*', '', line)
                if cleaned:
                    instructions.append(cleaned)
        else:
            # Try to guess based on patterns
            # Ingredients are usually:
            # - Shorter (< 150 chars)
            # - Start with quantity/measurement
            # - Contain measurement words (cup, tbsp, tsp, oz, lb, g, kg, etc.)

            measurement_pattern = r'\b(cup|cups|tablespoon|tbsp|teaspoon|tsp|ounce|oz|pound|lb|gram|grams|g|kg|ml|liter|pinch|dash)\b'
            has_measurement = re.search(measurement_pattern, lower_line)
            starts_with_number_quantity = re.match(r'^\d+(/\d+)?\s*(½|¼|¾)?\s*(cup|tbsp|tsp|oz|lb|g|kg|ml)', lower_line)
            is_short = len(line) < 150
            starts_with_step_number = re.match(r'^\d+\.', line)

            # Remove bullet point for pattern matching
            cleaned_line = re.sub(r'^[•\-\*]\s*', '', line)

            if starts_with_step_number:
                # Numbered items are instructions
                instructions.append(line)
            elif (has_measurement or starts_with_number_quantity) and is_short:
                ingredients.append(cleaned_line)
            else:
                instructions.append(cleaned_line)

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

    print(f"\n{'='*60}")
    print(f"PARSED RECIPE PREVIEW")
    print(f"{'='*60}")
    print(f"\nTitle: {recipe_data['title']}")
    print(f"ID: {recipe_data['id']}")
    print(f"\n--- INGREDIENTS ({len(recipe_data['ingredients'])} found) ---")
    if recipe_data['ingredients']:
        for i, ingredient in enumerate(recipe_data['ingredients'], 1):
            print(f"  {i}. {ingredient}")
    else:
        print("  ⚠️  WARNING: No ingredients found!")

    print(f"\n--- INSTRUCTIONS ({len(recipe_data['instructions'])} found) ---")
    if recipe_data['instructions']:
        for i, instruction in enumerate(recipe_data['instructions'], 1):
            # Truncate long instructions for preview
            display_text = instruction[:100] + "..." if len(instruction) > 100 else instruction
            print(f"  {i}. {display_text}")
    else:
        print("  ⚠️  WARNING: No instructions found!")

    print(f"\n{'='*60}")

    # Validate parsed content
    warnings = []
    if not recipe_data['ingredients']:
        warnings.append("No ingredients were found in the recipe text")
    if not recipe_data['instructions']:
        warnings.append("No instructions were found in the recipe text")
    if len(recipe_data['ingredients']) < 2:
        warnings.append(f"Only {len(recipe_data['ingredients'])} ingredient(s) found - this seems low")
    if len(recipe_data['instructions']) < 2:
        warnings.append(f"Only {len(recipe_data['instructions'])} instruction(s) found - this seems low")

    if warnings:
        print("\n⚠️  WARNINGS:")
        for warning in warnings:
            print(f"  - {warning}")
        print("\nThe recipe will still be saved, but you may want to check the formatting.")

    # Check for existing recipe with same ID
    existing_ids = [r['id'] for r in recipes]
    if recipe_data['id'] in existing_ids:
        print(f"\n⚠️  Recipe with ID '{recipe_data['id']}' already exists. Auto-overwriting...")
        recipes = [r for r in recipes if r['id'] != recipe_data['id']]

    # Add new recipe
    recipes.append(recipe_data)

    # Save updated recipes
    save_recipes(recipes, recipes_file)

    print(f"\n✅ Recipe '{recipe_data['title']}' saved successfully!")
    print(f"Total recipes in collection: {len(recipes)}")

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
