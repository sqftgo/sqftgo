import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

/** Legacy `/dealers/dashboard` → canonical `/dealer/dashboard`. */
export default function LegacyDealersDashboardRedirect() {
  redirect(ROUTES.dealerDashboard);
}
