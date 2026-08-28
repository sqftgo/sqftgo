"use client";

import { HomeHero } from "./HomeHero";
import { HomeTopPicks } from "./HomeTopPicks";
import { HomeDealerProjects } from "./HomeDealerProjects";
import { HomeProminentProjects } from "./HomeProminentProjects";
import { HomeHighlightedProjects } from "./HomeHighlightedProjects";
import { HomeTrustedDevelopers } from "./HomeTrustedDevelopers";
import { HomeNewlyAdded } from "./HomeNewlyAdded";
import { HomeSellCta } from "./HomeSellCta";
import { HomeShortlistToast } from "./HomeShortlistToast";

export function HomePage() {
  return (
    <div className="flex-1 flex flex-col w-full relative">
      <HomeHero />
      <HomeTopPicks />
      <HomeDealerProjects />
      <HomeProminentProjects />
      <HomeHighlightedProjects />
      <HomeTrustedDevelopers />
      <HomeNewlyAdded />
      <HomeSellCta />
      <HomeShortlistToast />
    </div>
  );
}
