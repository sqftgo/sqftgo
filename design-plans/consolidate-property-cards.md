# Consolidate Property Cards on Home Page

Written against: 43eabc14d522ff78e7364600f59efff80493bdbd

## Evidence chain

- Surface: `src/app/(public)/page.tsx`
- Problem: Manual duplication of property card structure, layout, and style logic on the home page instead of using the imported official component. This results in the omission of core interactive features like carousel arrow navigation, progress dots, and wishlist status indicators.
- Design evidence: `src/components/ui/PropertyCard.tsx` (the governing component implementation)
- Owner: `src/app/(public)/page.tsx`
- Scope and affected surfaces: `src/app/(public)/page.tsx`
- Uncertainty: none

## Design decision

Replacing manual property card code blocks on the home page with the official, reusable `<PropertyCard />` component ensures visual conformance across the site, activates missing image navigation controls on the homepage, and simplifies the codebase by centralizing card styles.

## Reuse

- Component: `<PropertyCard />` (default export from `src/components/ui/PropertyCard.tsx`)
- Exemplar: `src/app/(public)/listings/page.tsx` (line 544)

## Changes

1. `src/app/(public)/page.tsx`
   - Change: 
     - Locate the manual rendering of `displayTopPicks` around line 467-548 and replace the interior elements of the mapping with the `<PropertyCard />` component:
       ```tsx
       {displayTopPicks.map((property) => (
         <div key={property.id} className="w-[300px] sm:w-[360px] flex-shrink-0 snap-start">
           <PropertyCard property={property} />
         </div>
       ))}
       ```
     - Locate the manual rendering of `newlyAddedProperties` around line 1083-1128 and replace the interior elements of the mapping with the `<PropertyCard />` component:
       ```tsx
       {newlyAddedProperties.map((property) => (
         <div key={property.id} className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start">
           <PropertyCard property={property} />
         </div>
       ))}
       ```
   - Preserve: Outer flex scroll layout wrapper CSS classes (such as `snap-start`, `w-[300px]`, and `flex-shrink-0`) to keep the smooth horizontal carousel behavior intact.
   - Verify: Carousel listings render identical prices, image thumbnails, RERA badges, and now include image scroll arrows and wishlist/favorite actions.

## Scope

- Inherit: none
- Verify: `src/app/(public)/page.tsx`
- Exclude: All other public routes, listings, and dealer portals.

## Validation

- Product: Home page carousels render properties correctly.
- Interface: Open [http://localhost:3000](http://localhost:3000) on a browser, scroll to "SQFTGO's Top Picks" and "Newly-Added Properties", hover over cards, click arrows to cycles images, and toggle shortlists.
- System: Verify that no console warnings are generated during rendering and that `<PropertyCard />` is imported correctly.
- Repository: `npm run build` → exits with 0

## Stop conditions

- Stop if structural dependencies inside `PropertyCardProps` change in a way that requires adding new mandatory props.

## Design documentation

- After acceptance and validation: none
