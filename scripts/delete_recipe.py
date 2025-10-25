#!/usr/bin/env python3
"""
Recipe Deletion Script
Deletes a recipe from the collection by its ID.
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


def delete_recipe(recipe_id, recipes_file):
    """
    Delete a recipe by its ID.

    Args:
        recipe_id: The ID of the recipe to delete
        recipes_file: Path to the recipes JSON file

    Returns:
        bool: True if successful, False otherwise
    """
    print(f"Attempting to delete recipe with ID: {recipe_id}")

    # Load existing recipes
    recipes = load_recipes(recipes_file)

    if not recipes:
        print("No recipes found in the collection.")
        return False

    # Find the recipe to delete
    recipe_to_delete = None
    for recipe in recipes:
        if recipe['id'] == recipe_id:
            recipe_to_delete = recipe
            break

    if not recipe_to_delete:
        print(f"Error: Recipe with ID '{recipe_id}' not found.")
        print(f"\nAvailable recipe IDs:")
        for recipe in recipes:
            print(f"  - {recipe['id']}")
        return False

    # Remove the recipe
    recipes = [r for r in recipes if r['id'] != recipe_id]

    # Save updated recipes
    save_recipes(recipes, recipes_file)

    print(f"\n✓ Successfully deleted recipe: {recipe_to_delete['title']}")
    print(f"Remaining recipes: {len(recipes)}")

    return True


def main():
    """Main entry point for the script."""
    if len(sys.argv) < 2:
        print("Usage: python delete_recipe.py <recipe_id>")
        print("\nExample:")
        print("  python delete_recipe.py sample-chocolate-chip-cookies")
        sys.exit(1)

    recipe_id = sys.argv[1]

    # Determine the path to recipes.json
    script_dir = os.path.dirname(os.path.abspath(__file__))
    recipes_file = os.path.join(script_dir, '..', 'data', 'recipes.json')

    try:
        success = delete_recipe(recipe_id, recipes_file)
        if not success:
            sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
