import { PageLoader } from "@/components/ui/Skeleton";

export default function DealerLoading() {
  return (
    <div className="min-h-screen bg-cream">
      <PageLoader label="Loading dealer portal…" />
    </div>
  );
}
