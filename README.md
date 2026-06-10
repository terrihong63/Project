# Writing Assistant

A small browser app for collecting diary entries, reports, and essays, then helping a
writer improve and rewrite them.

## Workflow

1. **Collect writing** - paste or write a diary entry, report, or essay and save it
   locally in the browser.
2. **Suggest a better version** - review writing stats, improvement suggestions, and
   a suggested revision.
3. **Rewrite and compare** - write your own revised version and calculate:
   - how closely it aligns with the suggested revision
   - how much it changed from the original draft

The app does not send writing to a server. Saved drafts use browser `localStorage`.

## Run locally

```bash
npm start
```

Then open <http://localhost:4173>.

You can also open `index.html` directly in a browser, but using the local server is
recommended for JavaScript module loading.

## Test

```bash
npm test
```
