# NGPF Logo Setup Instructions

## Where to place your logo file:

1. **Save your logo file as:** `ngpf-logo.png`
2. **Place it in the:** `public/` folder (same level as `index.html`)
3. **Final path should be:** `public/ngpf-logo.png`

## Logo requirements:
- Format: PNG (recommended) or SVG
- Size: Optimal height is around 32px (8 units in the header)
- Background: Transparent PNG works best
- Colors: Should work well against white header background

## Current fallback:
If no logo file is found, the header will automatically display a blue "ngpf" text logo as a fallback.

## File structure:
```
your-project/
├── public/
│   ├── ngpf-logo.png  ← PUT YOUR LOGO HERE
│   ├── index.html
│   └── favicon.ico
├── src/
│   └── ...
└── package.json
```

## Testing:
After placing the logo file, refresh your browser. If the image doesn't load, check:
1. File name is exactly `ngpf-logo.png`
2. File is in the `public/` folder
3. Check browser console for any loading errors 