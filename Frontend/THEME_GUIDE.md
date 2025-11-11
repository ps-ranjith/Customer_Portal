# Theme System & Card Hover Effects Guide

## 🎨 Theme System Overview

This application now includes a comprehensive theme system that automatically applies to all components. The theme toggle in the navbar switches between light and dark themes, and the preference is saved in localStorage.

### Theme Variables

All theme colors, backgrounds, and styling are controlled by CSS custom properties (variables) defined in `src/styles.css`:

#### Light Theme Variables
```css
:root {
  --primary-color: #3b82f6;
  --primary-dark: #2563eb;
  --primary-light: #60a5fa;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  
  --background-color: #f8fafc;
  --card-background: #ffffff;
  --surface-background: #f1f5f9;
  
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --text-inverse: #ffffff;
  
  --border-color: #e2e8f0;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}
```

#### Dark Theme Variables
```css
.dark-theme {
  --primary-color: #60a5fa;
  --primary-dark: #3b82f6;
  --primary-light: #93c5fd;
  --secondary-color: #94a3b8;
  --success-color: #34d399;
  --warning-color: #fbbf24;
  --error-color: #f87171;
  
  --background-color: #0f172a;
  --card-background: #1e293b;
  --surface-background: #334155;
  
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --text-inverse: #1e293b;
  
  --border-color: #334155;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.3);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.3);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.3);
}
```

## 🎯 Card Hover Effects

The application includes several pre-defined card classes with beautiful hover effects:

### 1. Basic Card (`.card`)
```html
<div class="card">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</div>
```
**Effects:**
- Subtle gradient overlay on hover
- Lift animation (translateY)
- Enhanced shadow
- Border color change

### 2. Data Card (`.data-card`)
```html
<div class="data-card">
  <h3>Data Card</h3>
  <p>Perfect for data displays</p>
</div>
```
**Effects:**
- Sliding light effect from left to right
- Lift animation
- Enhanced shadow
- Border color change

### 3. Dashboard Card (`.dashboard-card`)
```html
<div class="dashboard-card">
  <h3>Dashboard Card</h3>
  <p>Great for dashboard widgets</p>
</div>
```
**Effects:**
- Top border animation (scaleX)
- Lift animation
- Enhanced shadow
- Border color change

### 4. Profile Card (`.profile-card`)
```html
<div class="profile-card">
  <h3>Profile Card</h3>
  <p>Perfect for user profiles</p>
</div>
```
**Effects:**
- Radial gradient overlay
- Scale and lift animation
- Enhanced shadow
- Border color change

### 5. Table Card (`.table-card`)
```html
<div class="table-card">
  <table>
    <!-- Table content -->
  </table>
</div>
```
**Effects:**
- Lift animation
- Enhanced shadow
- Border color change

## 🚀 How to Apply to Your Components

### Step 1: Add Card Classes to HTML
```html
<!-- For summary cards -->
<div class="summary-card dashboard-card">
  <h3>Summary</h3>
  <p>Value</p>
</div>

<!-- For data tables -->
<div class="table-container table-card">
  <table>
    <!-- Table content -->
  </table>
</div>

<!-- For individual data rows -->
<tr class="table-row data-card">
  <td>Data</td>
</tr>

<!-- For profile sections -->
<div class="profile-section profile-card">
  <h3>Profile Info</h3>
</div>
```

### Step 2: Use Theme Variables in CSS
```css
.my-component {
  background: var(--card-background);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
}

.my-component:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-color);
}
```

### Step 3: Add Button Classes
```html
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-success">Success Button</button>
<button class="btn btn-warning">Warning Button</button>
<button class="btn btn-error">Error Button</button>
```

## 🎨 Theme Toggle Implementation

The theme toggle is implemented in the navbar component:

```typescript
// In navbar.component.ts
toggleTheme(): void {
  const root = document.documentElement;
  const body = document.body;
  const isDark = root.classList.contains('dark-theme');
  
  if (isDark) {
    root.classList.remove('dark-theme');
    body.classList.remove('dark-theme');
    localStorage.setItem('theme', 'light');
    this.isDarkTheme = false;
  } else {
    root.classList.add('dark-theme');
    body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
    this.isDarkTheme = true;
  }
}
```

## 📱 Responsive Design

All card hover effects are responsive and adapt to different screen sizes:

```css
@media (max-width: 768px) {
  .card,
  .data-card,
  .dashboard-card,
  .profile-card,
  .table-card {
    margin: 0.5rem;
  }
  
  .card:hover,
  .data-card:hover,
  .dashboard-card:hover,
  .profile-card:hover,
  .table-card:hover {
    transform: translateY(-2px); /* Reduced lift on mobile */
  }
}
```

## 🎭 Animation Classes

Use these animation classes for additional effects:

```html
<div class="fade-in">Fades in from bottom</div>
<div class="slide-in">Slides in from left</div>
<div class="scale-in">Scales in from 90%</div>
<div class="pulse">Continuous pulse animation</div>
```

## 🔧 Customization

### Adding New Card Types
```css
.custom-card {
  background: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.custom-card::before {
  content: '';
  position: absolute;
  /* Add your custom hover effect */
}

.custom-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-color);
}
```

### Custom Theme Colors
```css
:root {
  --custom-color: #your-color;
}

.dark-theme {
  --custom-color: #your-dark-color;
}
```

## 📋 Best Practices

1. **Always use theme variables** instead of hardcoded colors
2. **Apply card classes** to containers that should have hover effects
3. **Use button classes** for consistent button styling
4. **Test both themes** to ensure good contrast and readability
5. **Keep animations subtle** - they should enhance UX, not distract
6. **Use semantic class names** that describe the purpose, not the appearance

## 🎯 Examples

### Complete Component Example
```html
<div class="my-component">
  <div class="header-section dashboard-card">
    <h2>Component Title</h2>
  </div>
  
  <div class="content-section">
    <div class="data-item data-card">
      <h3>Data Item</h3>
      <p>Description</p>
    </div>
  </div>
  
  <div class="actions">
    <button class="btn btn-primary">Action</button>
  </div>
</div>
```

```css
.my-component {
  background: var(--background-color);
  color: var(--text-primary);
  padding: 2rem;
}

.header-section {
  margin-bottom: 2rem;
}

.content-section {
  display: grid;
  gap: 1rem;
}

.actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
}
```

This system provides a consistent, beautiful, and accessible user experience across all components with smooth animations and proper theme support. 