# Tasks: Enhance Card Animations

## Implementation Tasks

### 1. Speed up typewriter animation and remove cursor
**Spec**: `typewriter-animation`
**Files**: `src/index.css`
**Complexity**: Low

- [x] Update `.typewriter` animation duration from `2s` to `1.5s`
- [x] Remove `border-right: 3px solid` property from `.typewriter` class
- [x] Remove `blink-caret` animation from `.typewriter` animation list
- [x] Delete `@keyframes blink-caret` definition (no longer needed)
- [x] Test animation timing with browser DevTools
- [x] Verify subtitle appears at correct time (0.5s delay + 1.5s animation = 2.0s total)

**Validation**:
```bash
# Visual inspection
npm run dev
# Open http://localhost:5173
# Observe title animation completes in ~1.5s without cursor
```

---

### 2. Remove curved line hover animation
**Spec**: `card-flip-interaction` (REMOVED requirements)
**Files**: `src/index.css`, `src/App.tsx`
**Complexity**: Low

- [x] Delete `@keyframes curve-path` animation definition (src/index.css:149-164)
- [x] Delete `.card-with-line` class and hover rule (src/index.css:166-172)
- [x] Remove `card-with-line` class from card anchor element (src/App.tsx:235)
- [x] Remove SVG curved line markup from card (src/App.tsx:238-249)
- [x] Verify no visual artifacts remain on card hover

**Validation**:
```bash
# Check no curved line appears on hover
npm run dev
# Hover over cards, confirm no line animation
```

---

### 3. Implement 3D card flip structure
**Spec**: `card-flip-interaction`
**Files**: `src/App.tsx`, `src/index.css`
**Complexity**: Medium

**CSS Changes** (`src/index.css`):
- [x] Add `.flip-card` class with `perspective: 1000px`
- [x] Add `.flip-card-inner` class with `transform-style: preserve-3d`
- [x] Add transition: `transform 0.6s ease-in-out`
- [x] Create flip animation with state-based triggering
- [x] Add `.flipped` state: `.flip-card.flipped .flip-card-inner { transform: rotateY(180deg); }`
- [x] Add `.flip-card-front` and `.flip-card-back` classes
- [x] Set `backface-visibility: hidden` on both faces
- [x] Set initial `transform: rotateY(180deg)` on back face

**Component Changes** (`src/App.tsx`):
- [x] Add `useState` hook to track flipped card (by service id)
- [x] Add `useRef` for hover timer (4-second delay)
- [x] Wrap card content in flip-card structure:
  - Outer `<div className="flip-card">` with hover handlers
  - Inner `<div className="flip-card-inner">`
  - Front face with existing Card component
  - Back face with new Card containing message
- [x] Implement `onMouseEnter` handler:
  - Start 4-second timer
  - Set flipped state after timeout
- [x] Implement `onMouseLeave` handler:
  - Clear timer if not flipped yet
  - Unflip card if currently flipped
- [x] Apply theme classes to back face Card
- [x] Center "no hay nada por aquí" message in back face

**Validation**:
```bash
# Test flip timing
npm run dev
# Hover over card for 4 seconds - should flip
# Move mouse away before 4s - should not flip
# Move mouse away after flip - should flip back
```

---

### 4. Style card back face
**Spec**: `card-flip-interaction`
**Files**: `src/App.tsx`
**Complexity**: Low

- [x] Apply same background color as front card
- [x] Apply same border styling as front card
- [x] Center text vertically and horizontally
- [x] Use theme text color (`themeClasses.text`)
- [x] Set appropriate font size (text-lg or text-base)
- [x] Ensure back face has same dimensions as front
- [x] Test in both dark and light themes

**Validation**:
```bash
# Visual inspection in both themes
npm run dev
# Toggle theme, verify back face matches front styling
```

---

### 5. Ensure click navigation works during flip
**Spec**: `card-flip-interaction`
**Files**: `src/App.tsx`
**Complexity**: Low

- [x] Verify anchor `<a>` tag remains accessible (moved inside flip-card-front/back)
- [x] Test click navigation on front face
- [x] Test click navigation on back face
- [x] Test click navigation during flip animation
- [x] Ensure no `pointer-events: none` on flip container
- [x] Verify no z-index issues blocking clicks

**Validation**:
```bash
# Functional testing
npm run dev
# Click card before flip - should navigate
# Click card while flipping - should navigate
# Click card after flip (back face) - should navigate
```

---

### 6. Cross-browser compatibility testing
**Spec**: `card-flip-interaction`
**Complexity**: Medium

- [x] Implement 3D flip with vendor prefixes (-webkit-backface-visibility)
- [ ] Test 3D flip in Chrome (latest) - requires user testing
- [ ] Test 3D flip in Firefox (latest) - requires user testing
- [ ] Test 3D flip in Safari (latest) - requires user testing
- [ ] Test 3D flip in Edge (latest) - requires user testing
- [ ] Document any known browser limitations (user can report after testing)

**Validation**:
```bash
# Manual testing across browsers
# Check caniuse.com for backface-visibility support
```

---

### 7. Analyze UI for shadcn/ui recommendations
**Spec**: `ui-analysis`
**Complexity**: Medium

- [x] Review current header/topbar components
- [x] Analyze service card design and interactions
- [x] Evaluate login page UX and component usage
- [x] Identify general application improvement opportunities
- [x] Document accessibility gaps and opportunities
- [x] Research relevant shadcn/ui components for each area
- [x] Create prioritized list of recommendations
- [x] Identify 3-5 "quick win" improvements
- [x] Draft implementation roadmap
- [x] Create `ui-recommendations.md` deliverable

**Validation**:
```bash
# Review document completeness
cat openspec/changes/enhance-card-animations/ui-recommendations.md
# Ensure all analysis areas covered
# Verify specific component suggestions included
```

---

### 8. Build and deployment verification
**Complexity**: Low

- [x] Run type checking: `npx tsc --noEmit`
- [x] Run linter: `npm run lint` (pre-existing warnings in shadcn components)
- [ ] Build production bundle: `sudo npm run build` (requires elevated permissions)
- [ ] Check build output for warnings/errors
- [ ] Verify bundle size hasn't increased significantly
- [ ] Test production build locally: `npm run preview`
- [ ] Deploy to staging if available
- [ ] Manual QA checklist in production

**Validation**:
```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build
sudo npm run build

# Preview
npm run preview
# Open http://localhost:4173
```

---

### 9. Documentation updates
**Complexity**: Low

- [ ] Update `CLAUDE.md` with new animation descriptions (optional, for future maintainers)
- [ ] Document flip animation timing (4 seconds)
- [ ] Update "Common Tasks" section if needed
- [ ] Add troubleshooting notes for flip animation
- [ ] Document shadcn/ui analysis deliverable location

**Files**: `CLAUDE.md`

---

## Task Dependencies

```
1. Typewriter animation (independent)
   ↓
2. Remove curved line (independent)
   ↓
3. Implement flip structure
   ↓
4. Style back face
   ↓
5. Verify click navigation
   ↓
6. Cross-browser testing
   ↓
8. Build & deployment

7. UI analysis (parallel to all above)
   ↓
9. Documentation (after analysis + implementation)
```

**Parallelizable Work**:
- Tasks 1 & 2 can be done in parallel
- Task 7 (UI analysis) can be done while implementing animations
- Type checking and linting can run continuously during development

---

## Success Criteria Checklist

**Typewriter Animation**:
- [ ] Completes in 1.5 seconds (±0.1s)
- [ ] No blinking cursor visible
- [ ] Subtitle timing correct
- [ ] Works in dark and light themes

**Card Flip Interaction**:
- [ ] Flip triggers after exactly 4 seconds of hover
- [ ] Timer resets if mouse leaves before 4s
- [ ] Card flips back when mouse leaves
- [ ] Back face shows "no hay nada por aquí" message
- [ ] Message styled correctly in both themes
- [ ] Click navigation works on front, back, and during flip
- [ ] Smooth 60fps animation
- [ ] No visual glitches

**UI Analysis**:
- [ ] Comprehensive recommendations document created
- [ ] All UI areas analyzed (header, cards, login, general)
- [ ] At least 10 specific component recommendations
- [ ] 3+ quick wins identified
- [ ] Accessibility improvements documented

**Build & Quality**:
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Production build succeeds
- [ ] Bundle size reasonable
- [ ] Works in Chrome, Firefox, Safari, Edge

---

## Rollback Plan

If issues arise in production:

1. **Revert CSS changes**: Restore `src/index.css` from previous version
2. **Revert component changes**: Restore `src/App.tsx` from previous version
3. **Rebuild**: `sudo npm run build`
4. **Hard refresh**: `Ctrl+Shift+R` in browser

**Safe Rollback Points**:
- After task 1: Typewriter changes are isolated
- After task 2: Curve removal is isolated
- After task 5: Flip implementation is complete and tested

**Incremental Deployment**:
Consider deploying in phases:
- Phase 1: Tasks 1-2 (animation tweaks only)
- Phase 2: Tasks 3-6 (flip interaction)
- Phase 3: Task 7 (UI analysis and future improvements)
