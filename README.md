# The Soucy Family — Recipe Publishing Automation (V3)

## What changes
The existing family homepage, stylesheet, and Cajun pasta recipe remain intact. The recipe library now has an automatically generated card section. Every new recipe page added to `recipes/<slug>/index.html` is indexed by a GitHub Actions workflow.

## Install
Upload the contents of this ZIP to the **root** of the `mike97722/thesoucys.net` repository, preserving folder paths. Make sure `.github/workflows/update-recipes.yml` and `scripts/build_recipe_index.py` are included. Commit to `main`.

**Check repository Settings → Actions → General → Workflow permissions**: the workflow needs **Read and write permissions** to commit the generated library. On some accounts/orgs this setting is restricted. Do not change DNS or GitHub Pages settings.

## Adding recipes
1. Prepare an AnyList-compatible HTML recipe page with valid `application/ld+json` Schema.org `Recipe` data (and retain the HTML microdata that AnyList already recognizes).
2. Add `recipes/your-recipe-slug/index.html` to the repository on `main`.
3. In **Actions → Update recipe library**, check that the workflow succeeded. It will commit the updated `recipes/index.html` automatically. Pages then deploys the change.
4. Verify the new card appears at https://thesoucys.net/recipes/ and test AnyList on the new recipe URL.

To rebuild locally: `python3 scripts/build_recipe_index.py`. No external Python packages required.

## Safety
- This is **automatic indexing**, not direct publishing from ChatGPT. A recipe HTML file must still be added to GitHub.
- Existing recipes are not rewritten by the generator, protecting AnyList markup.
- This website and its recipe files are public.
- If an Action fails due to branch protection, check repository rules or use the local script and commit the generated index manually.
