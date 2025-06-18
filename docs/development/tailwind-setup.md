# Tailwind CSS Setup

This project uses Tailwind CSS v4 with the modern import syntax.

## Configuration

### CSS Import
The project uses Tailwind v4's new import style in `src/index.css`:

```css
@import "tailwindcss";
```

This single import replaces the older v3-style directives:
- `@tailwind base;`
- `@tailwind components;`
- `@tailwind utilities;`

### Configuration Files

- **tailwind.config.js**: Defines content paths and theme extensions
- **postcss.config.js**: Uses `@tailwindcss/postcss` plugin (v4 specific)

### Dependencies

Required packages for Tailwind v4:
- `tailwindcss@^4.1.10`
- `@tailwindcss/postcss@^4.1.10`
- `autoprefixer@^10.4.21`
- `postcss@^8.5.6`

## Usage

Tailwind classes can be used directly in React components:

```tsx
<div className="bg-blue-500 text-white p-4">
  Hello World
</div>
```

## Development

The development server automatically processes Tailwind CSS:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```