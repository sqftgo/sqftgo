"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { projectService } from "@/services";
import { ProjectForm, type ProjectFormValues } from "@/features/projects";
import { isOwnProject } from "@/lib/ownership";
import { useInvalidateMarketplace } from "@/hooks";
import { GlobalLoading } from "@/components/ui";
import type { Project } from "@/types";
import type { ProjectUpdateInput } from "@/lib/validation/project";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { userEmail, userProfile, addLog } = useApp();
  const { invalidateProjects } = useInvalidateMarketplace();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setAccessDenied(false);
      try {
        const fetched = await projectService.getById(id);
        if (cancelled) return;
        if (!fetched || !isOwnProject(fetched, userProfile?.id)) {
          setAccessDenied(true);
          setProject(null);
        } else {
          setProject(fetched);
        }
      } catch {
        if (!cancelled) setAccessDenied(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, userProfile?.id]);

  if (loading) {
    return <GlobalLoading label="Loading project…" />;
  }

  if (accessDenied || !project) {
    return (
      <div className="p-8 text-center bg-[#faf8f5] min-h-screen flex flex-col items-center justify-center">
        <div className="bg-white/80 border border-sand rounded-3xl p-8 max-w-sm w-full">
          <p className="text-charcoal/50 font-bold text-sm">Project not found or access denied.</p>
          <button
            type="button"
            onClick={() => router.back()}
            className="mt-4 w-full py-2.5 bg-indigo text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: ProjectFormValues) => {
    const payload: ProjectUpdateInput = {
      title: data.title,
      description: data.description,
      city: data.city,
      state: data.state,
      country: data.country,
      locality: data.locality,
      ownershipRole: data.ownershipRole,
      lifecycle: data.lifecycle,
      propertyTypes: data.propertyTypes as NonNullable<ProjectUpdateInput["propertyTypes"]>,
      configurations: data.configurations,
      priceFrom: data.priceFrom ?? null,
      priceTo: data.priceTo ?? null,
      sizeFrom: data.sizeFrom ?? null,
      sizeTo: data.sizeTo ?? null,
      amenities: data.amenities,
      images: data.images,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      // RERA deferred for projects (still used on properties / dealer profile).
      reraId: null,
      reraApproved: false,
      possessionDate: data.possessionDate ?? null,
      launchDate: data.launchDate ?? null,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      status: data.status,
    };
    await projectService.update(project.id, payload);
    await invalidateProjects();
    addLog({
      action: "Project Updated",
      performedBy: userEmail,
      role: "Dealer",
      target: data.title,
    });
  };

  return <ProjectForm mode="edit" initial={project} onSubmit={handleSubmit} />;
}
