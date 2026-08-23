"use client";

import { useApp } from "@/context/AppContext";
import { ProjectForm, type ProjectFormValues } from "@/features/projects";
import { projectService } from "@/services";
import { useInvalidateMarketplace } from "@/hooks";
import type { ProjectCreateInput } from "@/lib/validation/project";

export default function AddProjectPage() {
  const { addLog, userEmail, userName, userProfile } = useApp();
  const { invalidateProjects } = useInvalidateMarketplace();

  const handleSubmit = async (data: ProjectFormValues) => {
    const payload: ProjectCreateInput = {
      title: data.title,
      description: data.description,
      city: data.city,
      state: data.state,
      country: data.country,
      locality: data.locality,
      ownershipRole: data.ownershipRole,
      lifecycle: data.lifecycle,
      propertyTypes: data.propertyTypes as ProjectCreateInput["propertyTypes"],
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
    await projectService.create(payload);
    await invalidateProjects();
    addLog({
      action: data.status === "Draft" ? "Project Draft Saved" : "Project Submitted",
      performedBy: userEmail,
      role: "Dealer",
      target: data.title,
    });
  };

  return (
    <ProjectForm
      mode="create"
      defaultContactName={userProfile?.name || userName || undefined}
      defaultContactPhone={userProfile?.phone || undefined}
      onSubmit={handleSubmit}
    />
  );
}
