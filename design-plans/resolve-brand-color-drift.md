# Resolve Brand Color Drift in Global Components

Written against: 43eabc14d522ff78e7364600f59efff80493bdbd

## Evidence chain

- Surface: `src/components/shared/Footer.tsx`, `src/components/ui/UserDropdown.tsx`
- Problem: Use of ad-hoc purple hex codes `#6851f5` and `#5741e0` in buttons and hover states. This breaks consistency with the project's brand design system which is governed by warm terracotta and indigo earth tones.
- Design evidence: `src/app/globals.css` (defining `--brand-indigo: #1b3864` and `--brand-indigo-hover: #122849`)
- Owner: `src/components/shared/Footer.tsx`, `src/components/ui/UserDropdown.tsx`
- Scope and affected surfaces: `src/components/shared/Footer.tsx`, `src/components/ui/UserDropdown.tsx`
- Uncertainty: none

## Design decision

Replacing ad-hoc purple/blue hex code overrides with the predefined theme color utility classes (`bg-indigo` and `hover:bg-indigo-hover`) standardizes interactive elements and aligns global layout pieces with the brand's aesthetic.

## Reuse

- Theme tokens: `bg-indigo`, `hover:bg-indigo-hover`
- Exemplar: `src/components/shared/Navbar.tsx` (logo typography and dropdown trigger color mappings)

## Changes

1. `src/components/shared/Footer.tsx`
   - Change: Around line 244, modify the styling classes of the Newsletter subscription submit button:
     - Old: `bg-[#6851f5] hover:bg-[#5741e0]`
     - New: `bg-indigo hover:bg-indigo-hover`
   - Preserve: Other layout, spacing, shadow, and transition utilities: `text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]`
   - Verify: Newsletter button renders in standard deep brand indigo and transits to dark brand indigo on hover.

2. `src/components/ui/UserDropdown.tsx`
   - Change: Around line 204, modify the styling classes of the "Add Property Listing" button:
     - Old: `bg-indigo hover:bg-[#5741e0]`
     - New: `bg-indigo hover:bg-indigo-hover`
   - Preserve: Other dropdown button utility classes: `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-white transition-colors shadow-sm`
   - Verify: Hovering over the button triggers the brand's dark indigo background instead of the ad-hoc purple.

## Scope

- Inherit: Footer and UserDropdown consumers.
- Verify: Rendered states of the layout on all pages.
- Exclude: Third-party SVG icon fills or non-brand elements.

## Validation

- Product: Buttons render in brand colors and respond with appropriate hover states.
- Interface: Open [http://localhost:3000](http://localhost:3000), log in to trigger dropdown, open it, verify the "Add Property" button hover. Scroll down to the Footer, verify the "Join" button color.
- System: Verify class names match variables defined under `@theme` in `globals.css`.
- Repository: `npm run build` → exits with 0

## Stop conditions

- Stop if these components are migrated to dark mode styling that requires a separate palette.

## Design documentation

- After acceptance and validation: none
