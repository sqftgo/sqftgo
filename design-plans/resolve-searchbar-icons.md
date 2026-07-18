# Resolve Search Bar Icon Mismatch

Written against: 43eabc14d522ff78e7364600f59efff80493bdbd

## Evidence chain

- Surface: `src/components/ui/SearchBar.tsx`
- Problem: The "Select City" dropdown and the "Locality" input field are adjacent to each other and both use the identical `<MapPin />` icon. This visual repetition causes confusion. The homepage search banner represents the "Locality" field using a `<Compass />` icon.
- Design evidence: `src/app/(public)/page.tsx` (using `<Compass />` for the locality selector around line 309).
- Owner: `src/components/ui/SearchBar.tsx`
- Scope and affected surfaces: SearchBar component on listings and service directories.
- Uncertainty: none

## Design decision

Swap the redundant `<MapPin />` icon inside the "Locality" search box container with a `<Compass />` icon, matching the icon semantics established on the home page search layout.

## Reuse

- Icon: `<Compass />` from `lucide-react`
- Exemplar: `src/app/(public)/page.tsx` (line 309)

## Changes

1. `src/components/ui/SearchBar.tsx`
   - Change:
     - Update the `lucide-react` import statement (around line 6) to include `Compass`:
       ```tsx
       import { Search, MapPin, Home, IndianRupee, Compass } from "lucide-react";
       ```
     - Around line 116, locate the Locality input container and swap the icon:
       - Old: `<MapPin className="w-5 h-5 text-terracotta/75 flex-shrink-0" />`
       - New: `<Compass className="w-5 h-5 text-terracotta/75 flex-shrink-0" />`
   - Preserve: Input styles, placeholder text, model bindings, and container grid layout.
   - Verify: The locality input field in the searchbar shows a compass icon instead of a map pin.

## Scope

- Inherit: All pages utilizing `<SearchBar />`.
- Verify: Listing search pages.
- Exclude: None.

## Validation

- Product: Search input displays consistent visual cues.
- Interface: Open a browser and load any listings route (e.g. `/listings`), verify the search panel displays the compass icon for the locality text box.
- System: Compile check the TypeScript references.
- Repository: `npm run build` → exits with 0

## Stop conditions

- None.

## Design documentation

- After acceptance and validation: none
