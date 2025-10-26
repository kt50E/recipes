# Recipe Import Guide 📸➡️🍳

This guide explains how to import recipes from handwritten notes, recipe cards, or any text source into your TLDR Kitchen website.

## Quick Start

### Step 1: Extract Text from Your Recipe Photo

Use any OCR app on your phone to extract text from your handwritten recipe:

**Recommended Free Apps:**
- **Google Lens** (iOS/Android) - Built into Google Photos
- **Microsoft Office Lens** (iOS/Android)
- **Apple Live Text** (iOS 15+) - Built into Photos app

**How to use:**
1. Open the app
2. Point camera at your recipe or open the photo
3. Select the text
4. Copy to clipboard

### Step 2: Import via GitHub Actions

1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/recipes`
2. Click **Actions** tab
3. Click **Import Recipe (Manual)** in the left sidebar
4. Click **Run workflow** button
5. Fill in the form:
   - **Title**: Recipe name (required)
   - **Recipe Text**: Paste the OCR text (required)
   - **Prep Time**: Optional (e.g., "10 min", "1h 30min")
   - **Cook Time**: Optional (e.g., "30 min")
   - **Servings**: Optional (e.g., "4", "6-8")
   - **Description**: Optional short description
   - **Image URL**: Optional (see tips below)
   - **Source URL**: Optional

6. Click **Run workflow**
7. Wait ~30 seconds
8. Your recipe is live! 🎉

## Tips for Best Results

### Recipe Text Format

The script is smart about parsing, but here are tips for best results:

**Good Format:**
```
Ingredients:
2 cups flour
1 tsp salt
3 eggs

Instructions:
Mix dry ingredients
Beat eggs and add to mixture
Bake at 350°F for 30 minutes
```

**Also Works:**
```
flour - 2 cups
salt - 1 tsp
eggs - 3

1. Mix dry ingredients
2. Beat eggs and add to mixture
3. Bake at 350°F for 30 minutes
```

**Even This Works:**
Just paste everything and the script will figure it out based on:
- Measurement words (cup, tbsp, tsp, etc.)
- Line length (ingredients are usually shorter)
- Numbering/bullets

### Finding Image URLs

**Option 1: Google Image Search**
1. Search for your recipe name
2. Right-click image → "Copy image address"
3. Paste URL into workflow

**Option 2: Upload to GitHub Issue**
1. Create a new issue in your repo
2. Drag/drop image into comment
3. Copy the URL GitHub generates
4. Paste into workflow
5. Close the issue

**Option 3: Skip It**
Leave blank - you can add an image later by editing `data/recipes.json`

## Examples

### Example 1: Handwritten Cookie Recipe

**What you paste:**
```
Grandma's Chocolate Chip Cookies

2 1/4 cups flour
1 tsp baking soda
1 cup butter softened
3/4 cup sugar
2 eggs
2 cups chocolate chips

Preheat oven to 375
Mix butter and sugar
Add eggs
Mix in dry ingredients
Add chocolate chips
Bake 9-11 minutes
```

**Fill in:**
- Title: `Grandma's Chocolate Chip Cookies`
- Recipe Text: [paste above]
- Prep Time: `15 min`
- Cook Time: `10 min`
- Servings: `48 cookies`

### Example 2: Recipe Card

**What you paste:**
```
Ingredients
1 lb chicken breast
2 tbsp olive oil
1 onion chopped
3 cloves garlic
1 can diced tomatoes
Salt and pepper

Directions
Heat oil in pan over medium heat
Add chicken cook until browned
Remove chicken add onion and garlic
Cook 5 minutes until soft
Add tomatoes and chicken back to pan
Simmer 20 minutes
```

**Fill in:**
- Title: `Easy Chicken Tomato Skillet`
- Recipe Text: [paste above]
- Prep Time: `10 min`
- Cook Time: `30 min`
- Servings: `4`

## Troubleshooting

### Ingredients and Instructions Got Mixed Up

**Fix:** Edit the recipe text before submitting to have clear sections:
```
Ingredients:
[list ingredients here]

Instructions:
[list steps here]
```

### Recipe Already Exists

The workflow will automatically overwrite a recipe with the same title. This is useful if you want to fix/update a recipe.

### OCR Mistakes

Common OCR errors:
- `1` might become `l` or `I`
- `0` might become `O`
- Fractions might become weird characters

**Fix:** Just correct these in the text before pasting to GitHub Actions

### Missing Image

You can always add an image later:
1. Edit `data/recipes.json` on GitHub
2. Find your recipe
3. Update the `"image"` field with a URL
4. Commit changes

## Advanced: Direct Editing

You can also manually edit `data/recipes.json` and commit:

```json
{
  "id": "recipe-name",
  "title": "Recipe Name",
  "description": "Description here",
  "prepTime": "10 min",
  "cookTime": "30 min",
  "servings": "4",
  "image": "https://example.com/image.jpg",
  "tags": [],
  "ingredients": [
    "2 cups flour",
    "1 tsp salt"
  ],
  "instructions": [
    "Mix ingredients",
    "Bake for 30 minutes"
  ],
  "notes": "",
  "sourceUrl": "",
  "dateAdded": "2025-10-26"
}
```

## Need Help?

- Check the Actions tab to see workflow logs
- Look at existing recipes in `data/recipes.json` for format examples
- The script is forgiving - just paste and see what happens!

Happy cooking! 👨‍🍳👩‍🍳
