# PWA Icon Generation Instructions

The PWA requires icon files in multiple sizes. An SVG template has been created at `icon.svg`.

## Required Icon Files

You need to create the following PNG files from the SVG icon:

1. `icon-192x192.png` - Required for PWA manifest
2. `icon-512x512.png` - Required for PWA manifest
3. `apple-touch-icon.png` - Optional, for iOS devices (180x180)
4. `favicon.ico` - Browser favicon

## How to Generate Icons

### Option 1: Using Online Tools

1. Go to https://realfavicongenerator.net/
2. Upload the `icon.svg` file
3. Configure settings for PWA
4. Download and extract all generated files to the `public` folder

### Option 2: Using ImageMagick (Command Line)

```bash
# Install ImageMagick first
# Windows: https://imagemagick.org/script/download.php
# macOS: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Generate PNG icons from SVG
magick icon.svg -resize 192x192 icon-192x192.png
magick icon.svg -resize 512x512 icon-512x512.png
magick icon.svg -resize 180x180 apple-touch-icon.png
magick icon.svg -resize 32x32 favicon.ico
```

### Option 3: Using PWA Asset Generator (NPM)

```bash
# Install globally
npm install -g pwa-asset-generator

# Generate all assets
pwa-asset-generator icon.svg ./public --icon-only --favicon
```

### Option 4: Manual Design

If you have the Hope Mobility Kenya logo:

1. Open the logo in an image editor (Photoshop, GIMP, Figma, etc.)
2. Create a square canvas (512x512 or 1024x1024)
3. Center the logo on a blue (#2563eb) background
4. Export as PNG at required sizes:
   - 192x192 → `icon-192x192.png`
   - 512x512 → `icon-512x512.png`
   - 180x180 → `apple-touch-icon.png`

## Placeholder Icons

For development, you can use placeholder icons temporarily:

```bash
# Create simple colored squares as placeholders
# (This is just for testing until you have proper icons)
```

## Icon Design Guidelines

- **Background:** Use the primary brand color (#2563eb - blue)
- **Foreground:** White or light-colored symbol/logo
- **Shape:** Square with optional rounded corners (handled by OS)
- **Safe area:** Keep important content within 80% of the canvas
- **Contrast:** Ensure good contrast for visibility on all backgrounds
- **Simplicity:** Icon should be recognizable at small sizes

## Testing Icons

After generating icons:

1. Place all PNG files in the `public` folder
2. Start the development server: `npm run dev`
3. Open browser dev tools → Application → Manifest
4. Verify all icons are loading correctly
5. Test PWA installation on mobile device

## Hope Mobility Kenya Logo

If you have the official Hope Mobility Kenya logo:
- Use `Hope Mobility logo R10cm - Blue.pdf` from `Project screen shots` folder
- Convert to PNG and follow the steps above
- Maintain brand consistency with official colors

## Alternative: Use SVG Directly

Modern browsers support SVG icons in manifests. If PNG generation is difficult, you can temporarily use the SVG:

```json
// In manifest.json (temporary solution)
"icons": [
  {
    "src": "/icon.svg",
    "sizes": "any",
    "type": "image/svg+xml"
  }
]
```

Note: PNG icons are preferred for better compatibility with all devices.


