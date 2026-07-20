import { PageLoader } from "@/components/ui/Skeleton";

export default function ListingsLoading() {
  return (
    <div className="min-h-[60vh] bg-cream">
      <PageLoader label="Loading listings…" />
    </div>
  );
}
