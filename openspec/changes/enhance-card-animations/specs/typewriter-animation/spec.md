# Typewriter Animation Enhancement

## MODIFIED Requirements

### Requirement: Title typewriter animation MUST complete 25% faster
The typewriter animation SHALL complete in 1.5 seconds (reduced from 2 seconds).

**Priority**: High
**Rationale**: Current 2-second duration feels sluggish; 1.5 seconds provides better perceived performance while maintaining readability.

#### Scenario: User loads portal for first time
**Given** user navigates to portal landing page
**When** page loads and animations start
**Then** "Portal de Servicios" title should type out character-by-character
**And** animation should complete in 1.5 seconds (±0.1s)
**And** subtitle "Centro de Control" should appear 0.5s after title completes

#### Scenario: Animation timing calculation
**Given** title contains 20 characters
**When** animation plays
**Then** use `steps(20, end)` timing function
**And** set duration to `1.5s` (reduced from `2s`)
**And** maintain 0.5s initial delay before animation starts

---

### Requirement: Typewriter cursor MUST be removed
The cursor element SHALL NOT be visible after animation completes.

**Priority**: High
**Rationale**: Blinking cursor conflicts with minimalist design philosophy; clean disappearance better suits the aesthetic.

#### Scenario: Title animation completes
**Given** typewriter animation is in progress
**When** animation completes
**Then** no blinking cursor should be visible
**And** title should display as plain text without borders
**And** no additional visual elements should persist

#### Scenario: CSS implementation
**Given** `.typewriter` class in `src/index.css`
**When** applying styles
**Then** remove `border-right: 3px solid` property
**And** remove `blink-caret` animation from animation list
**And** keep `overflow: hidden` for typing effect
**And** maintain `white-space: nowrap` for single-line display

---

## Implementation Notes

**File**: `src/index.css:119-146`

**Changes Required**:
```css
/* Before */
.typewriter {
  overflow: hidden;
  border-right: 3px solid;
  white-space: nowrap;
  animation:
    typewriter 2s steps(20, end) forwards,
    blink-caret 0.75s step-end 3;
  animation-delay: 0.5s;
  width: 0;
}

/* After */
.typewriter {
  overflow: hidden;
  white-space: nowrap;
  animation: typewriter 1.5s steps(20, end) forwards;
  animation-delay: 0.5s;
  width: 0;
}
```

**Also Remove**:
- `@keyframes blink-caret` (lines 128-135) - no longer needed

**Testing**:
- Verify animation duration with browser DevTools timeline
- Check subtitle timing (should appear at ~2.0s total: 0.5s delay + 1.5s animation)
- Ensure no visual artifacts after animation completes
- Test in dark and light themes
