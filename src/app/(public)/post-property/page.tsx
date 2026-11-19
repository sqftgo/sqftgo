"use client";

import dynamic from "next/dynamic";

const PostPropertyWizard = dynamic(
  () =>
    import("@/features/properties/components/PostPropertyWizard").then(
      (m) => m.PostPropertyWizard
    ),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center px-4 py-16 text-sm text-charcoal/60">
        Loading property form…
      </div>
    ),
  }
);

export default function PostPropertyPage() {
  return <PostPropertyWizard />;
}
