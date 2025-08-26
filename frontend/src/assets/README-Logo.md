# How to Add Company Logo to PDF Reports

## Method 1: Base64 Encoded Image (Recommended)
1. Convert your logo to base64 (use online tools like base64-image.de)
2. Replace the empty string in ReportEditExport.tsx:

```tsx
logoUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ..."
```

## Method 2: Use URL
If your logo is hosted online:
```tsx
logoUrl="https://yourcompany.com/logo.png"
```

## Method 3: Import Local File
1. Place your logo in `frontend/src/assets/`
2. Import it:
```tsx
import logoImage from '@/assets/company-logo.png';

// Then use:
logoUrl={logoImage}
```

## Recommended Logo Specs:
- Format: PNG with transparent background
- Size: 400x150px (or similar ratio)
- File size: < 50KB for best performance
- Colors: Works best with dark logo on white background

## Current Setup:
- Logo area: 120x40 points in PDF
- Position: Centered at top of document
- Fallback: "COMPANY LOGO" placeholder text
