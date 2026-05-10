# RunBuddy Standardization Report (2026-05-09)

## Purpose
This work standardized naming, folder structure, code style, and legacy file handling without changing project content or runtime behavior.

## 1. Semantic Page Naming (HTML)
The original page names were normalized to functional file names. Key mappings:
- `shouye.html` -> `home.html`
- `running.html` -> `run-tracker.html`
- `running_watch.html` -> `run-tracker-watch.html`
- `settling.html` -> `run-summary.html`
- `share.html` -> `run-share.html`
- `report_preview.html` -> `run-report-preview.html`
- `customize.html` -> `character-customization.html`
- `fashion shop.html` -> `academy-shop.html`
- `iphone17-31.html` -> `wardrobe-overview.html`
- `iphone17-35-1.html` -> `outfit-cart.html`
- `iphone17-36.html` -> `running-guidance.html`
- `iphone17-37.html` -> `community-post-editor.html`
- `iphone17-58.html` -> `academy-outfit-preview.html`
- `iphone17-59.html` -> `jacket-red-shop.html`
- `iphone17-60.html` -> `jacket-red-preview.html`
- `iphone17-62.html` -> `run-history.html`
- `iphone17-8.html` -> `community-feed.html`
- `iphone17-search.html` -> `community-search.html`
- `post-detail.html` -> `community-post-detail.html`
- `item-detail.html` -> `jacket-blue-detail.html`
- `jacket.html` -> `jacket-shop.html`
- `pants.html` -> `pants-shop.html`
- `page-bg.html` -> `cap-shop.html`

## 2. Unified Page Asset Layout (CSS/JS)
Page-specific styles and scripts were consolidated under:
- `frontend/css/pages/`
- `frontend/js/pages/`

Main moves included:
- `frontend/css/home.css` -> `frontend/css/pages/home.css`
- `frontend/css/run-tracker.css` -> `frontend/css/pages/run-tracker.css`
- `frontend/css/run-tracker-watch.css` -> `frontend/css/pages/run-tracker-watch.css`
- `frontend/css/run-summary.css` -> `frontend/css/pages/run-summary.css`
- `frontend/css/run-report-preview.css` -> `frontend/css/pages/run-report-preview.css`
- `frontend/js/home.js` -> `frontend/js/pages/home.js`
- `frontend/js/run-tracker.js` -> `frontend/js/pages/run-tracker.js`
- `frontend/js/run-report-exporter.js` -> `frontend/js/pages/run-report-exporter.js`

The onboarding entry resources were also extracted from the original inline `index.html` implementation:
- `frontend/css/pages/onboarding.css`
- `frontend/js/pages/onboarding.js`

## 3. Inline Code Extraction and Structure Cleanup
All `frontend/*.html` pages were normalized as follows:
- Inline `<style>` blocks were moved to matching `css/pages/<page>.css` files
- Inline `<script>` blocks were moved to matching `js/pages/<page>.js` files
- All `href`, `src`, and `location.href` references were updated to the new paths

The `index.html` entry page was also normalized:
- Inline CSS and JS were extracted into `onboarding.css` and `onboarding.js`
- Inline `onclick` handlers were removed in favor of script-based event binding
- The navigation target was unified to `frontend/home.html`

## 4. Code Quality and Style Cleanup
Main cleanup tasks:
- Removed corrupted comments and broken strings in HTML, CSS, and JS
- Fixed a few damaged markup fragments, such as the `run-history` record layout
- Removed debug output and redundant logging chains from page scripts
- Kept naming conventions consistent with kebab-case page files and matching page-level assets

## 5. Archiving Legacy Files and Redundant Assets
Archive folders were added and historical files were moved out of the main working set:
- `frontend/archive/legacy-backups/` for `.bak` and similar backups
- `frontend/archive/legacy-assets/images copy/` for the legacy image directory

## 6. Documentation Sync
Updated documentation includes:
- `README.md` project structure, now matching the actual directory layout, including `css/pages` and `js/pages`
- `ai_logs/README.md` script naming notes, aligned with the current file names

## 7. Functional Invariance
This cleanup did not introduce business-logic changes. The focus was structural and stylistic:
- `storage.js` data structures and persistence behavior remain unchanged
- Running, summary, sharing, community, and outfit features keep their original behavior
- All local resource references were checked for path consistency

## 8. Verification Suggestions
Suggested smoke tests:
- `index.html` -> `home.html` -> `run-tracker.html` -> `run-summary.html` -> `run-share.html`
- Home -> community feed -> post detail / new post flow
- Home -> outfit overview -> item shop -> cart
- Home -> running history -> monthly check-in
