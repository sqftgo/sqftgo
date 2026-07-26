"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ExternalLink, LogOut, Menu, X, type LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { PageLoader, SearchInput, Avatar } from "@/components/ui";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: string;
  query?: Record<string, string>;
}

export interface DashboardNavSection {
  title: string;
  items: DashboardNavItem[];
}

export interface DashboardShellProps {
  children: React.ReactNode;
  portalLabel: string;
  accent?: "terracotta" | "indigo";
  brandIcon?: React.ReactNode;
  profileName: string;
  profileEmail: string;
  profileInitial?: string;
  navSections: DashboardNavSection[];
  getBadgeCount?: (badge?: string) => number;
  publicSiteHref?: string;
  publicSiteLabel?: string;
  /** When false, hides the sidebar “View Public Site” footer link. Defaults to true. */
  showPublicSiteLink?: boolean;
  onLogout: () => void;
  topBarExtra?: React.ReactNode;
  searchPlaceholder?: string;
  /** When true, hides the sticky top bar (search + extras). Mobile menu toggle remains available. */
  hideTopBar?: boolean;
  ready?: boolean;
  accessDenied?: React.ReactNode;
}

function navItemHref(item: DashboardNavItem): string {
  if (!item.query) return item.href;
  return `${item.href}?${new URLSearchParams(item.query).toString()}`;
}

function NavUpdateDot({ active }: { active: boolean }) {
  return (
    <span
      className="relative flex h-2 w-2 shrink-0"
      aria-hidden
    >
      <span
        className={cn(
          "absolute inline-flex h-full w-full animate-ping rounded-full opacity-70",
          active ? "bg-white" : "bg-terracotta"
        )}
      />
      <span
        className={cn(
          "relative inline-flex h-2 w-2 rounded-full",
          active ? "bg-white" : "bg-terracotta"
        )}
      />
    </span>
  );
}

interface SidebarContentProps {
  brandIcon?: React.ReactNode;
  portalLabel: string;
  profileName: string;
  profileEmail: string;
  accent: "terracotta" | "indigo";
  navSections: DashboardNavSection[];
  isActive: (item: DashboardNavItem) => boolean;
  getBadgeCount?: (badge?: string) => number;
  publicSiteHref: string;
  publicSiteLabel: string;
  showPublicSiteLink: boolean;
  onLogout: () => void;
  onNavClick: (href: string) => void;
  setSidebarOpen: (open: boolean) => void;
  activeClasses: string;
  idleHover: string;
  iconIdle: string;
}

function SidebarContent({
  brandIcon,
  portalLabel,
  profileName,
  profileEmail,
  accent,
  navSections,
  isActive,
  getBadgeCount,
  publicSiteHref,
  publicSiteLabel,
  showPublicSiteLink,
  onLogout,
  onNavClick,
  setSidebarOpen,
  activeClasses,
  idleHover,
  iconIdle,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full bg-sand/40 text-charcoal select-none">
      <div className="px-6 py-5 border-b border-indigo/5 shrink-0 bg-white/40">
        <Link href="/" className="flex items-center gap-2.5">
          {brandIcon && (
            <div className="w-8 h-8 bg-terracotta rounded-lg flex items-center justify-center shadow-sm">
              {brandIcon}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-logo text-sm text-indigo leading-none">SqftGo</span>
            <span className="text-[8px] text-terracotta font-black uppercase tracking-wider mt-0.5">
              {portalLabel}
            </span>
          </div>
        </Link>
      </div>

      <div className="px-6 py-5 border-b border-indigo/5 shrink-0 bg-white/20">
        <div className="flex items-center gap-3">
          <Avatar
            name={profileName}
            size="md"
            shape="rounded"
            tone={accent === "terracotta" ? "terracotta" : "indigo"}
            className="shadow-sm bg-white"
          />
          <div className="min-w-0">
            <p className="text-charcoal font-bold text-xs truncate leading-tight">{profileName}</p>
            <p className="text-charcoal/40 text-[10px] font-semibold truncate mt-0.5">{profileEmail}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 overflow-y-auto no-scrollbar space-y-4" aria-label={`${portalLabel} navigation`}>
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="text-[9px] font-black text-indigo/40 uppercase tracking-widest pl-3 mb-1.5">
              {section.title}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon;
              const match = isActive(item);
              const hasUpdate = (getBadgeCount?.(item.badge) ?? 0) > 0;
              const href = navItemHref(item);
              return (
                <Link
                  key={item.label}
                  href={href}
                  onClick={() => {
                    onNavClick(href);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 group",
                    match ? activeClasses : idleHover
                  )}
                  aria-current={match ? "page" : undefined}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        match ? "text-white" : iconIdle
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                  {hasUpdate ? <NavUpdateDot active={match} /> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-indigo/5 bg-white/40 space-y-1 shrink-0">
        {showPublicSiteLink ? (
          <Link
            href={publicSiteHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all",
              idleHover
            )}
          >
            <ExternalLink className={cn("w-4 h-4", iconIdle)} />
            <span>{publicSiteLabel}</span>
          </Link>
        ) : null}
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-500 hover:bg-rose-500/5 transition-all cursor-pointer text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}

function DashboardShellInner({
  children,
  portalLabel,
  accent = "terracotta",
  brandIcon,
  profileName,
  profileEmail,
  navSections,
  getBadgeCount,
  publicSiteHref = "/",
  publicSiteLabel = "View Public Site",
  showPublicSiteLink = true,
  onLogout,
  topBarExtra,
  searchPlaceholder = "Search dashboard...",
  hideTopBar = false,
  ready = true,
  accessDenied,
}: DashboardShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname, searchKey]);

  const activeClasses =
    accent === "terracotta"
      ? "bg-terracotta text-white shadow-md shadow-terracotta/15"
      : "bg-indigo text-white shadow-md shadow-indigo/15";
  const idleHover =
    accent === "terracotta"
      ? "text-charcoal/65 hover:text-terracotta hover:bg-terracotta/5"
      : "text-charcoal/65 hover:text-indigo hover:bg-indigo/5";
  const iconIdle =
    accent === "terracotta"
      ? "text-terracotta/60 group-hover:text-terracotta"
      : "text-indigo/60 group-hover:text-indigo";

  if (!ready) {
    return (
      <div className="min-h-screen bg-cream">
        <PageLoader label="Loading portal…" />
      </div>
    );
  }

  if (accessDenied) {
    return <>{accessDenied}</>;
  }

  const isActive = (item: DashboardNavItem) => {
    const href = navItemHref(item);
    if (pendingHref) {
      return pendingHref === href;
    }

    if (item.query) {
      const matchesQuery = Object.entries(item.query).every(
        ([key, value]) => searchParams.get(key) === value
      );
      return pathname === item.href && matchesQuery;
    }

    // Plain path items yield to query-filtered siblings (e.g. Drafts).
    if (searchParams.get("status") && pathname === item.href) {
      return false;
    }

    return item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const sidebarContentProps: SidebarContentProps = {
    brandIcon,
    portalLabel,
    profileName,
    profileEmail,
    accent,
    navSections,
    isActive,
    getBadgeCount,
    publicSiteHref,
    publicSiteLabel,
    showPublicSiteLink,
    onLogout,
    onNavClick: setPendingHref,
    setSidebarOpen,
    activeClasses,
    idleHover,
    iconIdle,
  };

  return (
    <div className="flex h-screen bg-cream text-charcoal font-sans overflow-hidden">
      <aside className="hidden lg:flex w-64 xl:w-70 bg-sand/40 border-r border-indigo/10 flex-col shrink-0">
        <SidebarContent {...sidebarContentProps} />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              aria-hidden
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 450, damping: 40 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-sand/40 border-r border-indigo/10 z-50 flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4.5 right-4.5 p-2 bg-indigo/5 hover:bg-indigo/10 text-charcoal rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent {...sidebarContentProps} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {hideTopBar ? (
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed top-4 left-4 z-30 p-2.5 bg-white/90 backdrop-blur-md border border-indigo/10 shadow-sm hover:bg-indigo/5 rounded-xl text-indigo transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        ) : (
          <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-indigo/5 z-30 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-indigo/5 rounded-xl text-indigo transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
              <SearchInput
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                accent={accent === "terracotta" ? "terracotta" : "indigo"}
                containerClassName="hidden sm:block flex-none min-w-0 w-56"
                className="py-2"
              />
            </div>
            {topBarExtra}
          </header>
        )}

        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function DashboardShell(props: DashboardShellProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream">
          <PageLoader label="Loading portal…" />
        </div>
      }
    >
      <DashboardShellInner {...props} />
    </Suspense>
  );
}

export default DashboardShell;
