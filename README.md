# Daily English Report Coach

A lightweight static website for practicing daily English reports with a
three-step workflow:

1. Write a daily report and receive a corrected version.
2. Generate a more interpretive, higher-level English suggestion.
3. Rewrite the report, compare it with the suggestion, and receive advice for
   another rewrite.

## Run locally

Open `index.html` in a browser.

## Test

```bash
npm test
```

The site has no runtime dependencies. The test suite uses Node's built-in test
runner to verify the correction, elevated rewrite, and similarity logic.
