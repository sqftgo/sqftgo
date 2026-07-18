# Resolve Mobile Floating UI Elements Collision

Written against: 43eabc14d522ff78e7364600f59efff80493bdbd

## Evidence chain

- Surface: Mobile viewports (< 768px screen width) on home page and details page.
- Problem: The "Plan Your Dream" floating button, the Shortlist toast, and the Mobile Floating Bottom Navigation Bar overlap at the bottom right/center of the screen. This collision obscures content and prevents users from registering click gestures on individual items.
- Design evidence:
  - Mobile bottom navigation bar: `src/components/shared/Navbar.tsx` (lines 239-240) uses `fixed bottom-5 inset-x-4 md:hidden z-50`.
  - Floating action button: `src/components/shared/DreamProjectButton.tsx` (lines 109-120) uses `fixed bottom-6 right-6 z-40 sm:bottom-8 sm:right-8`.
  - Shortlist toast notice: `src/app/(public)/page.tsx` (line 1470) uses `fixed bottom-6 right-6 z-50`.
- Owner: `src/components/shared/DreamProjectButton.tsx`, `src/app/(public)/page.tsx`
- Scope and affected surfaces: Global mobile viewports on public layout.
- Uncertainty: none

## Design decision

Push the Floating action button vertically upwards (`bottom-24`) on screens below the tailwind `md` breakpoint so that it floats clearly above the mobile bottom tab bar. Relocate the Shortlist toast notification to `top-20` (just below the global sticky navbar) on mobile screens, falling back to the bottom-right corner on desktops.

## Reuse

- Responsive breakpoints: `md:bottom-8 md:right-8` (for the action button), `md:top-auto md:bottom-6 md:right-6` (for the toast notification).

## Changes

1. `src/components/shared/DreamProjectButton.tsx`
   - Change: Around line 109, modify the button positioning container:
     - Old: `fixed bottom-6 right-6 z-40 sm:bottom-8 sm:right-8`
     - New: `fixed bottom-24 right-6 z-40 md:bottom-8 md:right-8`
   - Preserve: Inner markup, gold icon scaling, animation properties, and text values.
   - Verify: The floating button rests above the bottom bar on mobile screen widths (320px - 767px) and aligns back to the bottom-right on wider screens.

2. `src/app/(public)/page.tsx`
   - Change: Around line 1470, update the positioning class of the toast container:
     - Old: `className="fixed bottom-6 right-6 z-50 bg-indigo text-white px-5 py-3 rounded-2xl shadow-2xl border border-sand/20 flex items-center gap-3"`
     - New: `className="fixed top-20 right-6 md:top-auto md:bottom-6 md:right-6 z-50 bg-indigo text-white px-5 py-3 rounded-2xl shadow-2xl border border-sand/20 flex items-center gap-3"`
   - Preserve: AnimatePresence layout animations (`initial`, `animate`, `exit`) and inner flex layout.
   - Verify: Adding a listing to shortlists displays the toast notice at the top-right of the viewport on mobile devices.

## Scope

- Inherit: Mobile breakpoints.
- Verify: Interactive overlays.
- Exclude: Desktop viewports.

## Validation

- Product: Floating layouts are free from collisions.
- Interface: Open [http://localhost:3000](http://localhost:3000) using a browser developer mobile simulator (e.g., iPhone 12 Pro width). Add a property to the shortlist to trigger the toast. Check that the bottom navbar, floating button, and toast are in their correct offset positions and are clickable.
- System: No overlapping layouts.
- Repository: `npm run build` → exits with 0

## Stop conditions

- Stop if any global toast provider is introduced that overrides local Toast notifications.

## Design documentation

- After acceptance and validation: none
