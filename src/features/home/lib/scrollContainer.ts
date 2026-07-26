import type React from "react";

export function scrollContainer(
  ref: React.RefObject<HTMLDivElement | null>,
  direction: "left" | "right"
) {
  if (ref.current) {
    const { scrollLeft, clientWidth } = ref.current;
    const scrollAmount = clientWidth * 0.75;
    ref.current.scrollTo({
      left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
      behavior: "smooth"
    });
  }
}
