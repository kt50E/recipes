#!/usr/bin/env python3
"""
Recipe Metadata Update Script
Updates various metadata fields for a specific recipe.
"""

import json
import os
import sys
import argparse


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


def update_recipe_metadata(recipe_id, recipes_file, **updates):
    """
    Update metadata fields for a recipe by its ID.

    Args:
        recipe_id: The ID of the recipe to update
        recipes_file: Path to the recipes JSON file
        **updates: Keyword arguments for fields to update
            (description, image, prepTime, cookTime, servings, sourceUrl)

    Returns:
        bool: True if successful, False otherwise
    """
    # Load existing recipes
    recipes = load_recipes(recipes_file)

    if not recipes:
        print("No recipes found in the collection.")
        return False

    # Find the recipe to update
    recipe_found = False
    updated_fields = []

    for recipe in recipes:
        if recipe['id'] == recipe_id:
            recipe_found = True

            print(f"\n{'='*60}")
            print(f"Updating recipe: {recipe['title']}")
            print(f"{'='*60}\n")

            # Update each provided field
            if 'description' in updates and updates['description'] is not None:
                old_value = recipe.get('description', '')
                recipe['description'] = updates['description']
                updated_fields.append('description')
                print(f"✓ Description updated")
                if old_value:
                    print(f"  Old: {old_value[:60]}...")
                print(f"  New: {updates['description'][:60]}...")

            if 'image' in updates and updates['image'] is not None:
                old_value = recipe.get('image', '')
                recipe['image'] = updates['image']
                updated_fields.append('image')
                print(f"✓ Image URL updated")
                if old_value:
                    print(f"  Old: {old_value}")
                print(f"  New: {updates['image']}")

            if 'prepTime' in updates and updates['prepTime'] is not None:
                old_value = recipe.get('prepTime', '')
                recipe['prepTime'] = updates['prepTime']
                updated_fields.append('prepTime')
                print(f"✓ Prep time: {old_value} → {updates['prepTime']}")

            if 'cookTime' in updates and updates['cookTime'] is not None:
                old_value = recipe.get('cookTime', '')
                recipe['cookTime'] = updates['cookTime']
                updated_fields.append('cookTime')
                print(f"✓ Cook time: {old_value} → {updates['cookTime']}")

            if 'servings' in updates and updates['servings'] is not None:
                old_value = recipe.get('servings', '')
                recipe['servings'] = updates['servings']
                updated_fields.append('servings')
                print(f"✓ Servings: {old_value} → {updates['servings']}")

            if 'sourceUrl' in updates and updates['sourceUrl'] is not None:
                old_value = recipe.get('sourceUrl', '')
                recipe['sourceUrl'] = updates['sourceUrl']
                updated_fields.append('sourceUrl')
                print(f"✓ Source URL updated")
                if old_value:
                    print(f"  Old: {old_value}")
                print(f"  New: {updates['sourceUrl']}")

            break

    if not recipe_found:
        print(f"❌ Error: Recipe with ID '{recipe_id}' not found.")
        print(f"\nAvailable recipe IDs:")
        for recipe in recipes:
            print(f"  - {recipe['id']}")
        return False

    if not updated_fields:
        print("\n⚠️  No fields were updated. Please provide at least one field to update.")
        return False

    # Save updated recipes
    save_recipes(recipes, recipes_file)

    print(f"\n{'='*60}")
    print(f"✅ Successfully updated {len(updated_fields)} field(s):")
    for field in updated_fields:
        print(f"   • {field}")
    print(f"{'='*60}\n")

    return True


def main():
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(
        description='Update recipe metadata fields',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Update description and image
  python update_recipe_metadata.py banana-muffins \\
    --description "Delicious homemade banana muffins" \\
    --image "https://example.com/image.jpg"

  # Update prep and cook time
  python update_recipe_metadata.py banana-muffins \\
    --prep-time "15 min" \\
    --cook-time "25 min"

  # Update all fields
  python update_recipe_metadata.py banana-muffins \\
    --description "Best muffins ever" \\
    --image "https://example.com/image.jpg" \\
    --prep-time "15 min" \\
    --cook-time "25 min" \\
    --servings "12" \\
    --source-url "https://example.com/recipe"
        """
    )

    parser.add_argument('recipe_id', help='Recipe ID to update')
    parser.add_argument('--description', help='Recipe description')
    parser.add_argument('--image', help='Image URL')
    parser.add_argument('--prep-time', dest='prepTime', help='Prep time (e.g., "15 min")')
    parser.add_argument('--cook-time', dest='cookTime', help='Cook time (e.g., "30 min")')
    parser.add_argument('--servings', help='Number of servings')
    parser.add_argument('--source-url', dest='sourceUrl', help='Original recipe source URL')

    args = parser.parse_args()

    # Determine the path to recipes.json
    script_dir = os.path.dirname(os.path.abspath(__file__))
    recipes_file = os.path.join(script_dir, '..', 'data', 'recipes.json')

    # Build updates dictionary (only include provided arguments)
    updates = {
        k: v for k, v in vars(args).items()
        if k != 'recipe_id' and v is not None
    }

    if not updates:
        parser.print_help()
        print("\n❌ Error: Please provide at least one field to update.")
        sys.exit(1)

    try:
        success = update_recipe_metadata(args.recipe_id, recipes_file, **updates)
        if not success:
            sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
