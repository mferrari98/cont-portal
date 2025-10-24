# Portal de Servicios - Design System

Complete design system documentation for the Portal de Servicios. Use this guide to replicate the aesthetic, patterns, and components in other Servicoop applications.

## 📋 Table of Contents

- [Design Philosophy](#design-philosophy)
- [Color Palette](#color-palette)
- [Typography](#typography)
- [Spacing & Layout](#spacing--layout)
- [Components](#components)
- [Animations](#animations)
- [Implementation Examples](#implementation-examples)
- [Best Practices](#best-practices)

## 🎨 Design Philosophy

### Core Principles

1. **Minimalism**: Clean interfaces with intentional white space
2. **Consistency**: Unified color palette and typography across all views
3. **Accessibility**: WCAG 2.1 AA compliant, keyboard navigable
4. **Responsiveness**: Mobile-first, adapts to all screen sizes
5. **Performance**: Smooth 60fps animations, optimized bundle size

### Visual Language

- **Geometric shapes**: Rounded corners (8px radius for cards, 6px for buttons)
- **Subtle shadows**: Layered depth without heavy drop shadows
- **Smooth transitions**: 200-300ms easing for interactions
- **Mesh gradients**: Animated radial gradients for ambient backgrounds

## 🎨 Color Palette

### Dark Mode (Primary)

#### Background Colors
```css
--bg-main: #0d0d0d;        /* Main background - Near black */
--bg-card: #2e2f31;         /* Card backgrounds - Dark gray */
--bg-icon: #0d0d0d;         /* Icon containers */
```

#### Text Colors
```css
--text-primary: #ffffff;    /* Primary text - White */
--text-muted: #ffffff/70;   /* Secondary text - 70% opacity */
--text-subtle: #6ccff6;     /* Accented text - Cyan */
--text-faded: #ffffff/50;   /* Tertiary text - 50% opacity */
```

#### Accent Colors
```css
--accent-green: #00a54f;    /* Primary accent - Green */
--accent-cyan: #6ccff6;     /* Secondary accent - Cyan */
```

#### Border Colors
```css
--border-default: #ffffff/20;  /* Default borders - 20% opacity */
--border-light: #ffffff/10;    /* Subtle borders - 10% opacity */
```

### Light Mode

#### Background Colors
```css
--bg-main: #ffffff;         /* Main background - White */
--bg-card: #ffffff;         /* Card backgrounds - White */
--bg-icon: #0d0d0d/5;       /* Icon containers - 5% black */
--input-bg: #f5f5f5;        /* Input backgrounds - Light gray */
```

#### Text Colors
```css
--text-primary: #0d0d0d;    /* Primary text - Near black */
--text-muted: #0d0d0d/70;   /* Secondary text - 70% opacity */
--text-subtle: #0d0d0d/60;  /* Accented text - 60% opacity */
--text-faded: #0d0d0d/50;   /* Tertiary text - 50% opacity */
```

#### Accent Colors
```css
--accent-green: #00a54f;    /* Primary accent - Green */
/* Same as dark mode */
```

#### Border Colors
```css
--border-default: #0d0d0d/30;  /* Default borders - 30% opacity */
--border-light: #0d0d0d/20;    /* Subtle borders - 20% opacity */
```

### Color Usage Guidelines

| Element | Dark Mode | Light Mode | Usage |
|---------|-----------|------------|-------|
| Buttons (primary) | `#00a54f` | `#00a54f` | Call-to-action buttons |
| Tooltips | `#00a54f` | `#00a54f` | Info tooltips |
| Hover states | `#00a54f` | `#00a54f` | Card borders, button hovers |
| Subtitles | `#6ccff6` | `#0d0d0d/60` | Section subtitles |
| Icons (muted) | `#6ccff6` | `#00a54f` | Secondary icons |
| Focus rings | `#00a54f` | `#00a54f` | Input focus |
| Links | `#00a54f` | `#00a54f` | Text links |

## ✏️ Typography

### Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
             'Helvetica Neue', sans-serif;
```

System fonts for optimal performance and native feel.

### Type Scale

| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| H1 (Hero) | `text-5xl` (48px) | 700 (Bold) | `tracking-tight` | Main page titles |
| H2 (Page) | `text-4xl` (36px) | 700 (Bold) | `tracking-tight` | Section headers |
| H3 (Card) | `text-lg` (18px) | 600 (Semibold) | `leading-tight` | Card titles |
| Body | `text-base` (16px) | 400 (Regular) | 1.5 | Main content |
| Small | `text-sm` (14px) | 400 (Regular) | `leading-snug` | Card descriptions |
| Tiny | `text-xs` (12px) | 500 (Medium) | Normal | Tooltips, labels |

### Font Smoothing

```css
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

Applied globally for crisp text rendering.

## 📏 Spacing & Layout

### Spacing Scale (Tailwind)

```
0.5 → 2px    1 → 4px     1.5 → 6px    2 → 8px
2.5 → 10px   3 → 12px    4 → 16px     5 → 20px
6 → 24px     8 → 32px    10 → 40px    12 → 48px
```

### Common Spacing Patterns

| Element | Spacing | Tailwind Class |
|---------|---------|----------------|
| Card padding | 16px | `p-4` |
| Button padding (horizontal) | 12px | `px-3` |
| Button padding (vertical) | 6px | `py-1.5` |
| Icon-text gap | 12px | `gap-3` |
| Card gap in grid | 16px | `gap-4` |
| Section vertical margin | 24px | `my-6` |

### Grid Layout

**Service Cards Grid:**
```css
grid-template-columns: repeat(1, 1fr);     /* Mobile */
grid-template-columns: repeat(2, 1fr);     /* Tablet (md:) */
grid-template-columns: repeat(3, 1fr);     /* Desktop (lg:) */
gap: 1rem;  /* 16px between cards */
```

**Container Widths:**
```css
max-width: 1280px;  /* 5xl container for main content */
margin: 0 auto;     /* Center container */
padding: 1rem;      /* 16px horizontal padding */
```

## 🧩 Components

### Service Card

**Structure:**
```typescript
<Card> (min-h-96px, 3D flip animation)
  <CardContent> (p-4, flex items-center)
    <Icon Container> (w-11 h-11, rounded-lg, border-2)
    <Text Container> (flex-1)
      <Title> (text-lg, font-semibold, leading-tight)
      <Description> (text-sm, leading-snug)
```

**CSS Classes:**
```css
/* Card container */
border-2
border-white/20 (dark) | border-black/30 (light)
bg-[#2e2f31] (dark) | bg-white (light)
rounded-lg
transition-all duration-300
hover:border-[#00a54f]
hover:shadow-2xl hover:shadow-[#00a54f]/30
hover:-translate-y-1

/* Icon container */
w-11 h-11
rounded-lg
border-2
bg-[#0d0d0d] (dark) | bg-[#0d0d0d]/5 (light)
transition-all duration-300
group-hover:border-[#00a54f]

/* Title */
text-lg
font-semibold
leading-tight
transition-colors duration-300
group-hover:text-[#00a54f]
```

**3D Flip Animation:**
```css
/* Container */
.flip-card {
  perspective: 1000px;
  position: relative;
  min-height: 96px;
}

/* Inner wrapper */
.flip-card-inner {
  position: relative;
  width: 100%;
  min-height: 96px;
  transition: transform 0.34s ease-in-out;
  transform-style: preserve-3d;
}

/* Flipped state */
.flip-card.flipped .flip-card-inner {
  transform: rotateY(180deg);
}

/* Front/back faces */
.flip-card-front,
.flip-card-back {
  backface-visibility: hidden;
  min-height: 96px;
}

.flip-card-back {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  transform: rotateY(180deg);
}
```

### Button

**Variants:**

```typescript
// Primary button
className="bg-[#00a54f] text-white font-semibold rounded-lg
           hover:bg-[#008f44] transition-all duration-200
           hover:shadow-lg hover:shadow-[#00a54f]/30"

// Outline button
className="border-2 border-white/20 text-white font-medium
           hover:border-[#00a54f] hover:bg-[#00a54f]/10
           rounded-lg transition-all duration-200"

// Icon button
className="border-2 border-white/20 text-white rounded-md
           h-8 w-8 flex items-center justify-center
           hover:border-[#00a54f] transition-all"
```

### Badge

```typescript
className="flex items-center gap-1.5 px-3 py-1.5
           border border-white/20 text-white text-sm
           rounded-md"
```

### Dialog (Modal)

```typescript
// Overlay
className="fixed inset-0 z-50 bg-black/80"

// Content container
className="fixed left-[50%] top-[50%] z-50
           translate-x-[-50%] translate-y-[-50%]
           max-w-lg w-full bg-[#2e2f31] border-2 border-white/20
           rounded-lg p-6 shadow-lg"

// Title
className="text-lg font-semibold"

// Description
className="text-sm text-white/70 mt-2"
```

### Tooltip

```typescript
className="z-50 overflow-hidden rounded-md
           bg-[#00a54f] border border-[#00a54f]/50
           px-3 py-1.5 text-xs text-white font-medium
           shadow-lg animate-in fade-in-0 zoom-in-95"
```

### Input Field

```typescript
className="w-full px-4 py-3 text-base
           bg-[#0d0d0d] (dark) | bg-[#f5f5f5] (light)
           border-2 border-white/20 (dark) | border-black/30 (light)
           rounded-lg text-white (dark) | text-black (light)
           focus:outline-none focus:ring-2 focus:ring-[#00a54f]
           focus:border-[#00a54f] transition-all duration-200"
```

## 🎬 Animations

### Typewriter Effect

**HTML:**
```tsx
<h1 className="text-5xl font-bold tracking-tight text-white typewriter">
  Portal de Servicios
</h1>
```

**CSS:**
```css
@keyframes typewriter {
  from { width: 0; }
  to { width: 100%; }
}

.typewriter {
  overflow: hidden;
  animation: typewriter 2s steps(21, end) forwards;
  animation-delay: 0.3s;
  width: 0;
  white-space: nowrap;
}
```

**Parameters:**
- Duration: `2s`
- Steps: `21` (number of characters in "Portal de Servicios")
- Delay: `0.3s`
- Easing: `steps(21, end)` for letter-by-letter effect

### Fade In

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}
```

### Fade In Up

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
}
```

**Stagger Effect** (for cards):
```css
.stagger-1 { animation-delay: 0.1s; }
.stagger-2 { animation-delay: 0.2s; }
.stagger-3 { animation-delay: 0.3s; }
.stagger-4 { animation-delay: 0.4s; }
.stagger-5 { animation-delay: 0.5s; }
.stagger-6 { animation-delay: 0.6s; }
```

### Mesh Gradient Background

```css
@keyframes mesh-movement {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
    opacity: 0.8;
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
    opacity: 0.9;
  }
}

.mesh-gradient-1 {
  animation: mesh-movement 20s ease-in-out infinite;
}

.mesh-gradient-2 {
  animation: mesh-movement 25s ease-in-out infinite reverse;
}
```

**Implementation:**
```tsx
<div className="fixed inset-0 pointer-events-none">
  <div
    className="absolute top-[10%] left-[20%] w-[600px] h-[600px]
               rounded-full blur-[120px] opacity-20 mesh-gradient-1"
    style={{
      background: 'radial-gradient(circle, rgba(0,165,79,0.4) 0%, transparent 70%)'
    }}
  />
  <div
    className="absolute bottom-[20%] right-[15%] w-[500px] h-[500px]
               rounded-full blur-[100px] opacity-15 mesh-gradient-2"
    style={{
      background: 'radial-gradient(circle, rgba(108,207,246,0.3) 0%, transparent 70%)'
    }}
  />
</div>
```

### Hover Transitions

**Standard transition:**
```css
transition-all duration-300 ease-in-out
```

**Fast transition (buttons, inputs):**
```css
transition-all duration-200 ease-in-out
```

**Card hover lift:**
```css
hover:-translate-y-1
transition-all duration-300
```

## 💻 Implementation Examples

### Complete Service Card Component

```tsx
<div
  className="flip-card animate-fade-in-up stagger-1"
  onMouseEnter={() => handleCardMouseEnter('service-id')}
  onMouseLeave={handleCardMouseLeave}
>
  <div className="flip-card-inner">
    {/* Front Face */}
    <div className="flip-card-front">
      <a href="/service/" className="group block h-full">
        <Card className="border-2 border-white/20 bg-[#2e2f31] hover:border-[#00a54f]
                         transition-all duration-300 hover:shadow-2xl
                         hover:shadow-[#00a54f]/30 hover:-translate-y-1 h-full">
          <CardContent className="p-4 h-full min-h-[96px] flex items-center">
            <div className="flex items-start gap-3 w-full">
              <div className="w-11 h-11 rounded-lg border-2 flex items-center justify-center
                              flex-shrink-0 bg-[#0d0d0d] border-white/20
                              transition-all duration-300 group-hover:border-[#00a54f]">
                <Shield className="w-6 h-6 text-white
                                   transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold mb-1.5 text-white
                               leading-tight break-words
                               transition-colors duration-300 group-hover:text-[#00a54f]">
                  Service Name
                </h3>
                <p className="text-sm text-white/70 leading-snug break-words">
                  Short description of the service
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </a>
    </div>

    {/* Back Face */}
    <div className="flip-card-back">
      <a href="/service/" className="block w-full h-full">
        <Card className="border-2 border-white/20 bg-[#2e2f31] h-full">
          <CardContent className="p-4 h-full min-h-[96px] flex items-center justify-center">
            <p className="text-sm text-white/70 text-center leading-relaxed">
              Detailed description shown on card flip
            </p>
          </CardContent>
        </Card>
      </a>
    </div>
  </div>
</div>
```

### Theme Toggle Implementation

```tsx
const [theme, setTheme] = useState<'light' | 'dark'>('dark')

// Apply dark mode class to document
useEffect(() => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}, [theme])

const toggleTheme = () => {
  const newTheme = theme === 'dark' ? 'light' : 'dark'
  setTheme(newTheme)
  localStorage.setItem('portal_theme', newTheme)
}

// Theme classes object
const isDark = theme === 'dark'
const themeClasses = {
  bg: isDark ? 'bg-[#0d0d0d]' : 'bg-[#ffffff]',
  bgCard: isDark ? 'bg-[#2e2f31]' : 'bg-[#ffffff]',
  text: isDark ? 'text-[#ffffff]' : 'text-[#0d0d0d]',
  // ... more theme classes
}
```

### Login Form with Theme Support

```tsx
<Card className={`border-2 ${themeClasses.border} ${themeClasses.bgCard}`}>
  <CardContent className="p-8">
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
          Usuario
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className={`h-5 w-5 ${themeClasses.textMuted}`} />
          </div>
          <input
            type="text"
            className={`w-full pl-11 pr-4 py-3 text-base
                       ${themeClasses.inputBg}
                       border-2 ${themeClasses.border}
                       rounded-lg ${themeClasses.text}
                       focus:outline-none focus:ring-2 focus:ring-[#00a54f]
                       focus:border-[#00a54f] transition-all duration-200`}
            placeholder="Ingresa tu usuario"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-[#00a54f] text-white font-semibold rounded-lg
                   hover:bg-[#008f44] transition-all duration-200
                   hover:shadow-lg hover:shadow-[#00a54f]/30"
      >
        Iniciar sesión
      </Button>
    </form>
  </CardContent>
</Card>
```

## ✅ Best Practices

### Accessibility

1. **Keyboard Navigation**: All interactive elements must be keyboard accessible
   ```tsx
   <button tabIndex={0} onKeyPress={(e) => e.key === 'Enter' && handleClick()}>
   ```

2. **ARIA Labels**: Provide descriptive labels for screen readers
   ```tsx
   <button aria-label="Cerrar sesión">
     <LogOut className="w-4 h-4" />
   </button>
   ```

3. **Focus Indicators**: Always show focus rings
   ```css
   focus:outline-none focus:ring-2 focus:ring-[#00a54f]
   ```

4. **Color Contrast**: Maintain WCAG AA compliance
   - Dark mode: White text (#ffffff) on dark backgrounds
   - Light mode: Dark text (#0d0d0d) on light backgrounds

### Performance

1. **Bundle Size**: Keep total bundle < 300KB gzipped
2. **Image Optimization**: Use SVG icons, avoid raster images
3. **Code Splitting**: Lazy load heavy components
4. **Animation Performance**: Use `transform` and `opacity` only

### Responsive Design

1. **Mobile First**: Start with mobile layout, enhance for larger screens
   ```css
   /* Mobile (default) */
   grid-cols-1

   /* Tablet */
   md:grid-cols-2

   /* Desktop */
   lg:grid-cols-3
   ```

2. **Touch Targets**: Minimum 44x44px for buttons on mobile
3. **Readable Line Length**: Max 65-75 characters per line

### Code Organization

1. **Component Structure**:
   ```
   components/
   ├── ui/           # Reusable UI primitives
   └── [Feature].tsx # Feature-specific components
   ```

2. **Style Consistency**: Use Tailwind classes, avoid inline styles except for dynamic values
3. **Type Safety**: Define interfaces for all props

```typescript
interface ServiceCardProps {
  id: string
  name: string
  icon: React.ReactNode
  desc: string
  url: string
}
```

## 📦 Replication Checklist

To replicate this design system in a new project:

- [ ] Install dependencies: React, TypeScript, Tailwind CSS v4, shadcn/ui
- [ ] Copy color palette to CSS variables or Tailwind config
- [ ] Implement dark mode with class-based toggle
- [ ] Set up typography scale (system fonts)
- [ ] Create base components (Button, Card, Input, Badge, Tooltip, Dialog)
- [ ] Implement animations (fade-in, fade-in-up, typewriter, mesh gradients)
- [ ] Add flip card animation for interactive elements
- [ ] Configure responsive grid layouts
- [ ] Set up path aliases (@/)
- [ ] Test accessibility (keyboard nav, screen readers, color contrast)
- [ ] Verify performance (bundle size, animation fps)

---

**Questions or Clarifications?**

For implementation details, see the source code in `src/` or contact the development team.

**Last Updated**: January 2025
