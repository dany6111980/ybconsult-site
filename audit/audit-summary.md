# YB_YMM Website — Audit Summary

**Timestamp:** 2025-11-10 20:14:09
**Root:** C:\Users\danyg\Documents\YB_YMM_WEBSITE

## Stack & Build
- Node (detected): v22.20.0
- npm: 10.9.3
- See: audit/package-meta.json

## Netlify
netlify.toml NOT found
_redirects present
Mapping /api/ask-yb -> /.netlify/functions/ask-yb ? False
SPA fallback /* -> /index.html 200 ? True


## Ask-YB CORS
CORS: Origin=False CORS: Headers=False CORS: Methods=False Has OPTIONS handler=False Streaming hint found=False


## Plausible
Plausible snippet FOUND


## i18n Status
- Total keys: 9
- Missing in FR: 0
- Missing in DE: 0
- Missing in ES: 0

Artifacts:
- i18n_master_keys.json
- i18n-missing-keys.json
- i18n_for_translation.csv

## Files Tree
See audit/files-tree.txt

## Next Steps
1) Fill **i18n_for_translation.csv** for FR/DE/ES (tomorrow’s sprint).
2) Add CORS headers in **ask-yb.js** if missing; map **/api/ask-yb** in _redirects.
3) Keep **publish=dist** and **functions=website/netlify/functions**.

