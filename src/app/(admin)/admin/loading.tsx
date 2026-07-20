import { PageLoader } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-cream">
      <PageLoader label="Loading admin…" />
    </div>
  );
}
