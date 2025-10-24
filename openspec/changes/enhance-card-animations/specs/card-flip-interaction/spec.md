# Card Flip Interaction

## REMOVED Requirements

### Requirement: Curved line animation triggers after 10 seconds of hover
**Rationale**: This interaction is being completely replaced by the 3D flip effect. The 10-second delay made it rarely discoverable.

**Removed Elements**:
- `@keyframes curve-path` animation (src/index.css:149-164)
- `.card-with-line` class and hover trigger (src/index.css:166-172)
- SVG curved line path in card markup (src/App.tsx:238-249)

---

## ADDED Requirements

### Requirement: Service cards MUST flip horizontally after 4 seconds of hover
Service cards SHALL flip 180 degrees on the Y-axis after 4 seconds of continuous hover.

**Priority**: High
**Rationale**: Creates engaging discoverable interaction; 4-second delay prevents accidental triggers while being discoverable during intentional browsing.

#### Scenario: User hovers over service card
**Given** user is viewing the service grid
**When** user moves mouse over any service card
**And** keeps mouse over card for 4 consecutive seconds
**Then** card should smoothly flip 180 degrees on Y-axis
**And** flip animation should take 0.6 seconds
**And** card back face should become visible
**And** card front face should be hidden

#### Scenario: Hover timer resets on mouse leave
**Given** user has hovered over card for 2 seconds
**When** user moves mouse away from card
**Then** flip timer should reset
**And** card should remain in normal (front) state
**And** no flip animation should trigger

#### Scenario: Card flips back when mouse leaves
**Given** card is currently flipped (showing back face)
**When** user moves mouse away from card
**Then** card should immediately flip back to front face
**And** flip-back animation should take 0.6 seconds
**And** transition should be smooth and match flip-forward easing

---

### Requirement: Card back face MUST display easter egg message
The back face SHALL display centered text "no hay nada por aquí" when visible.

**Priority**: High
**Rationale**: Provides playful element that rewards user exploration without interfering with primary navigation.

#### Scenario: Card back face content
**Given** card has flipped to show back face
**When** back face is visible
**Then** display centered text "no hay nada por aquí"
**And** use same theme colors as front face (respect dark/light mode)
**And** text should be body font size (text-base or text-lg)
**And** text color should match theme text color
**And** no other content should be visible on back face

#### Scenario: Back face maintains card structure
**Given** card is flipped
**When** viewing back face
**Then** back face should have same dimensions as front face
**And** same background color as front card
**And** same border styling as front card
**And** maintain hover shadow effects

---

### Requirement: 3D flip animation MUST preserve perspective
The flip animation SHALL use CSS 3D transforms with proper perspective and backface visibility.

**Priority**: Medium
**Rationale**: Proper 3D perspective creates realistic flip effect; improves perceived quality of interaction.

#### Scenario: CSS 3D transform setup
**Given** card element in DOM
**When** applying flip animation
**Then** parent container must have `perspective: 1000px`
**And** card must have `transform-style: preserve-3d`
**And** front and back faces must have `backface-visibility: hidden`
**And** back face must have `transform: rotateY(180deg)` in initial state

#### Scenario: Smooth animation timing
**Given** flip animation is triggered
**When** animating transform
**Then** use `ease-in-out` timing function
**And** duration should be `0.6s` for both flip and flip-back
**And** maintain 60fps performance on modern browsers
**And** no janky or stuttering motion

---

### Requirement: Click navigation MUST remain functional during flip
Card links SHALL remain clickable on front face, back face, and during flip animation.

**Priority**: High
**Rationale**: Flip is decorative; must not interfere with primary card function (navigation to service).

#### Scenario: User clicks flipped card
**Given** card is showing back face
**When** user clicks anywhere on the card
**Then** navigation to service URL should work normally
**And** user should be redirected to service page
**And** flip animation should not prevent click event

#### Scenario: User clicks card during flip animation
**Given** card is mid-flip (animation in progress)
**When** user clicks the card
**Then** click should be registered
**And** navigation should occur normally
**And** animation should not block pointer events

---

## Implementation Notes

**Files to Modify**:
1. `src/index.css` - Remove curved line animation, add flip animations
2. `src/App.tsx` - Remove SVG markup, restructure card with front/back faces

**CSS Architecture**:
```css
/* Perspective container */
.flip-card {
  perspective: 1000px;
}

/* Card inner container */
.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s ease-in-out;
  transform-style: preserve-3d;
}

/* Trigger flip on hover after 4s */
.flip-card:hover .flip-card-inner {
  animation: flip-delay 4s forwards;
}

@keyframes flip-delay {
  0%, 99% {
    transform: rotateY(0deg);
  }
  100% {
    transform: rotateY(180deg);
  }
}

/* Card faces */
.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.flip-card-back {
  transform: rotateY(180deg);
}
```

**Component Structure**:
```tsx
<a className="flip-card">
  <div className="flip-card-inner">
    {/* Front Face */}
    <div className="flip-card-front">
      <Card>
        {/* Existing card content */}
      </Card>
    </div>

    {/* Back Face */}
    <div className="flip-card-back">
      <Card>
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-lg">no hay nada por aquí</p>
        </CardContent>
      </Card>
    </div>
  </div>
</a>
```

**Challenges**:
- Absolute positioning of front/back faces requires careful height management
- Must ensure dark/light theme styles apply to back face
- Hover state management across nested elements
- Browser compatibility for `backface-visibility`

**Testing Checklist**:
- [ ] Flip triggers at exactly 4 seconds (use DevTools to verify)
- [ ] Flip resets when mouse leaves before 4s
- [ ] Card flips back when mouse leaves after flip
- [ ] Back face message displays correctly in dark mode
- [ ] Back face message displays correctly in light mode
- [ ] Click navigation works on front face
- [ ] Click navigation works on back face
- [ ] Click navigation works during flip animation
- [ ] No visual glitches or z-index issues
- [ ] Smooth 60fps animation on Chrome/Firefox/Safari
- [ ] Graceful degradation on browsers without 3D transforms
