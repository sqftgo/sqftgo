"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { servicePlatformService } from "@/services";
import type { ServiceBooking } from "@/types";
import { Alert, Badge, Button, Panel } from "@/components/ui";

export default function MyServiceBookingsPage() {
  const router = useRouter();
  const { isLoggedIn, sessionReady } = useApp();
  const [items, setItems] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionReady) return;
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent("/my-service-bookings")}`);
      return;
    }
    void (async () => {
      setLoading(true);
      try {
        const res = await servicePlatformService.listMyBookings();
        setItems(res.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load bookings");
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionReady, isLoggedIn, router]);

  const cancel = async (id: string) => {
    try {
      const updated = await servicePlatformService.updateBooking(id, { status: "cancelled" });
      setItems((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to cancel");
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 max-w-3xl pb-24 pt-10 space-y-6">
      <div>
        <h1 className="font-serif font-black text-3xl text-indigo">Service bookings</h1>
        <p className="text-sm text-charcoal/60 font-semibold mt-1">
          Requests you sent to city service partners.
        </p>
      </div>

      {error ? <Alert variant="danger" title="Error" description={error} /> : null}
      {loading ? (
        <p className="text-sm font-semibold text-charcoal/50">Loading…</p>
      ) : items.length === 0 ? (
        <Panel className="p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-charcoal/60">No service bookings yet.</p>
          <Link href="/services" className="text-sm font-bold text-terracotta">
            Browse services
          </Link>
        </Panel>
      ) : (
        <div className="space-y-3">
          {items.map((b) => (
            <Panel key={b.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <Link
                  href={`/services/${b.directoryProfileId}`}
                  className="font-serif font-black text-lg text-indigo hover:text-terracotta"
                >
                  {b.firmName ?? "Service partner"}
                </Link>
                <p className="text-xs text-charcoal/55 font-semibold mt-1">
                  {b.city ? `${b.city} · ` : ""}
                  {new Date(b.preferredAt).toLocaleString()}
                </p>
                {b.message ? (
                  <p className="text-sm text-charcoal/70 mt-2">{b.message}</p>
                ) : null}
                <Badge className="mt-2" tone="info">
                  {b.status}
                </Badge>
              </div>
              {b.status === "pending" ? (
                <Button type="button" size="sm" variant="outline" onClick={() => void cancel(b.id)}>
                  Cancel
                </Button>
              ) : null}
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
