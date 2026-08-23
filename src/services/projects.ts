import type { Project } from "@/types";
import { apiClient, type PaginatedResult } from "@/lib/api/client";
import type { ProjectCreateInput, ProjectUpdateInput } from "@/lib/validation/project";

export interface ProjectFilters {
  city?: string;
  status?: Project["status"];
  search?: string;
  mine?: boolean;
  limit?: number;
  offset?: number;
}

function toQuery(filters?: ProjectFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.city) params.set("city", filters.city);
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.mine) params.set("mine", "1");
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.offset !== undefined) params.set("offset", String(filters.offset));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const projectService = {
  async listPage(filters?: ProjectFilters) {
    return apiClient<PaginatedResult<Project>>(`/api/projects${toQuery(filters)}`);
  },

  async list(filters?: ProjectFilters) {
    const page = await this.listPage(filters);
    return page.items;
  },

  async getById(id: string) {
    try {
      return await apiClient<Project>(`/api/projects/${id}`);
    } catch {
      return null;
    }
  },

  async create(input: ProjectCreateInput) {
    return apiClient<Project>("/api/projects", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async update(id: string, updates: ProjectUpdateInput) {
    return apiClient<Project>(`/api/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  async remove(id: string) {
    await apiClient<{ ok: boolean }>(`/api/projects/${id}`, { method: "DELETE" });
  },
};
