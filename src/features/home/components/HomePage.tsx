"use client";

import { HomeHero } from "./HomeHero";
import { HomeTopPicks } from "./HomeTopPicks";
import { HomeProminentProjects } from "./HomeProminentProjects";
import { HomeHighlightedProjects } from "./HomeHighlightedProjects";
import { HomeTrustedDevelopers } from "./HomeTrustedDevelopers";
import { HomeRecommendedSellers } from "./HomeRecommendedSellers";
import { HomeNewlyAdded } from "./HomeNewlyAdded";
import { HomeSellCta } from "./HomeSellCta";
import { HomeShortlistToast } from "./HomeShortlistToast";

export function HomePage() {
  return (
    <div className="flex-1 flex flex-col w-full relative">
      <HomeHero />
      <HomeTopPicks />
      <HomeProminentProjects />
      <HomeHighlightedProjects />
      <HomeTrustedDevelopers />
      <HomeRecommendedSellers />
      <HomeNewlyAdded />
      <HomeSellCta />
      <HomeShortlistToast />
    </div>
  );
}
