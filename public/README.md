# Public Assets Directory

This directory contains all static assets that are publicly accessible.

## Directory Structure

```
public/
├── images/          # General images (hero images, banners, etc.)
├── logos/           # Logo files (PNG, SVG, etc.)
├── icons/           # Icon files
├── assets/          # Other assets (fonts, documents, etc.)
└── favicon.ico      # Site favicon (root level)
```

## Usage in Next.js

Files in the `public` directory are served from the root URL path.

### Examples:

- `public/logo.png` → Accessible at `/logo.png`
- `public/images/hero.jpg` → Accessible at `/images/hero.jpg`

### In React Components:

```tsx
// Using Next.js Image component
import Image from 'next/image'

<Image 
  src="/images/hero.jpg" 
  alt="Hero" 
  width={1200} 
  height={600} 
/>

// Using regular img tag
<img src="/logo.png" alt="Logo" />

// Using SVG logo
```

## Best Practices

1. **Optimize images** before adding them (compress, resize)
2. **Use Next.js Image component** for automatic optimization
3. **Organize by type** (images, logos, icons)
4. **Use descriptive filenames** (hero-banner.jpg, not img1.jpg)
5. **Keep file sizes reasonable** for faster loading

## File Types

- **Images**: JPG, PNG, WebP, AVIF
- **Logos**: SVG (preferred), PNG
- **Icons**: SVG, PNG
- **Favicon**: ICO, PNG, SVG

