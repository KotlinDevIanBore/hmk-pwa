# HMK Logo Extraction Guide

## Current Status
The HMK logo exists as a PDF file: `Project screen shots/Hope Mobility logo R10cm - Blue.pdf`

## How to Extract the Logo

### Method 1: Using Adobe Acrobat Reader (Recommended)
1. Open the PDF in Adobe Acrobat Reader
2. Right-click on the logo image
3. Select "Copy Image"
4. Open an image editor (Photoshop, GIMP, etc.)
5. Paste and save as PNG with transparent background
6. Save as `public/hmk-logo.png`

### Method 2: Using PDF to Image Converter
1. Go to https://www.ilovepdf.com/pdf_to_image
2. Upload `Hope Mobility logo R10cm - Blue.pdf`
3. Convert to PNG or JPG
4. Download the image
5. Save as `public/hmk-logo.png`

### Method 3: Using Inkscape (For Vector Quality)
1. Install Inkscape (free): https://inkscape.org/
2. Open the PDF in Inkscape
3. Select the logo
4. Export as PNG at high resolution (300 DPI)
5. Save as `public/hmk-logo.png`

### Method 4: Using Online PDF Editor
1. Go to https://www.sejda.com/pdf-to-jpg
2. Upload the PDF
3. Extract images
4. Download and save as `public/hmk-logo.png`

## Required Logo Versions

After extraction, create these versions:

### 1. Main Logo
- **File:** `public/hmk-logo.png`
- **Size:** Original high resolution
- **Background:** Transparent
- **Usage:** Headers, main branding

### 2. Logo Icon
- **File:** `public/hmk-logo-icon.png`
- **Size:** 512x512px (square)
- **Background:** Transparent or white
- **Usage:** Favicons, app icons

### 3. Logo Light Version
- **File:** `public/hmk-logo-light.png`
- **Size:** Same as main
- **Background:** Transparent
- **Usage:** Dark backgrounds

### 4. Logo Dark Version
- **File:** `public/hmk-logo-dark.png`
- **Size:** Same as main
- **Background:** Transparent
- **Usage:** Light backgrounds

## Optimization

After extracting, optimize the images:

### Using TinyPNG (Online)
1. Go to https://tinypng.com/
2. Upload your PNG files
3. Download optimized versions

### Using ImageOptim (Mac)
```bash
# Install
brew install imageoptim

# Optimize
imageoptim public/hmk-logo*.png
```

### Using OptiPNG (Command Line)
```bash
# Install
# Windows: Download from http://optipng.sourceforge.net/
# Mac: brew install optipng
# Linux: sudo apt-get install optipng

# Optimize
optipng -o7 public/hmk-logo.png
```

## Expected Results

Once extracted, you should have:
- Clear, high-quality logo image
- Transparent background (for overlaying on any color)
- Multiple size variants
- Optimized file sizes (< 100KB per file)

## Temporary Solution

Until the logo is extracted, the project uses:
- SVG icon placeholder (`public/icon.svg`)
- Text-based branding ("HMK PWA")
- Accessibility icon as visual identifier

## After Extraction

Update these files with the new logo:

1. **Navigation Header:** `components/layouts/Header.tsx`
2. **Footer:** `components/layouts/Footer.tsx`
3. **Homepage:** `app/[locale]/page.tsx`
4. **PWA Manifest:** `public/manifest.json`
5. **Favicon:** Generate from logo icon

## Testing Logo

After adding the logo:
1. Check it displays correctly in header
2. Verify it works on light backgrounds
3. Verify it works on dark backgrounds
4. Test high contrast mode compatibility
5. Check mobile responsiveness
6. Verify it prints correctly
7. Test in different browsers

## Logo Usage Guidelines

### Do's:
✅ Maintain aspect ratio when resizing
✅ Provide adequate spacing around logo (minimum 16px)
✅ Use on contrasting backgrounds
✅ Keep logo legible at all sizes
✅ Provide alt text for accessibility

### Don'ts:
❌ Distort or stretch the logo
❌ Add effects or filters
❌ Change logo colors (unless official variants)
❌ Place on busy backgrounds
❌ Make it too small to read

## Accessibility Considerations

When adding the logo:
```tsx
<Image
  src="/hmk-logo.png"
  alt="Hope Mobility Kenya - Empowering Persons with Disabilities"
  width={200}
  height={60}
  priority // For header logo
  className="h-auto w-auto"
/>
```

## File Naming Convention

Use consistent naming:
- `hmk-logo.png` - Main logo
- `hmk-logo-icon.png` - Square icon version
- `hmk-logo-light.png` - Light version (for dark backgrounds)
- `hmk-logo-dark.png` - Dark version (for light backgrounds)
- `hmk-logo-sm.png` - Small version (optional)
- `hmk-logo-lg.png` - Large version (optional)

## Next Steps

1. Extract logo from PDF using one of the methods above
2. Save to `public/` folder
3. Optimize file sizes
4. Update component files to use the logo
5. Test across all pages and devices
6. Update PWA icons with logo

---

**Current Status:** Logo file exists in PDF format  
**Action Required:** Extract and optimize logo images  
**Priority:** High (for brand consistency)

