#!/usr/bin/env python3
"""
Recipe Notes Update Script
Updates the notes field for a specific recipe.
"""

import json
import os
import sys


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


def update_recipe_notes(recipe_id, notes, recipes_file):
    """
    Update notes for a recipe by its ID.

    Args:
        recipe_id: The ID of the recipe to update
        notes: The notes text to add
        recipes_file: Path to the recipes JSON file

    Returns:
        bool: True if successful, False otherwise
    """
    print(f"Updating notes for recipe: {recipe_id}")

    # Load existing recipes
    recipes = load_recipes(recipes_file)

    if not recipes:
        print("No recipes found in the collection.")
        return False

    # Find the recipe to update
    recipe_found = False
    for recipe in recipes:
        if recipe['id'] == recipe_id:
            recipe['notes'] = notes
            recipe_found = True
            print(f"\n✓ Successfully updated notes for: {recipe['title']}")
            break

    if not recipe_found:
        print(f"Error: Recipe with ID '{recipe_id}' not found.")
        print(f"\nAvailable recipe IDs:")
        for recipe in recipes:
            print(f"  - {recipe['id']}")
        return False

    # Save updated recipes
    save_recipes(recipes, recipes_file)

    return True


def main():
    """Main entry point for the script."""
    if len(sys.argv) < 3:
        print("Usage: python update_notes.py <recipe_id> <notes>")
        print("\nExample:")
        print('  python update_notes.py sample-chocolate-chip-cookies "Best cookies ever! I added extra chocolate chips."')
        sys.exit(1)

    recipe_id = sys.argv[1]
    notes = sys.argv[2]

    # Determine the path to recipes.json
    script_dir = os.path.dirname(os.path.abspath(__file__))
    recipes_file = os.path.join(script_dir, '..', 'data', 'recipes.json')

    try:
        success = update_recipe_notes(recipe_id, notes, recipes_file)
        if not success:
            sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
