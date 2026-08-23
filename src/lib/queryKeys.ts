export const queryKeys = {
  properties: {
    all: ["properties"] as const,
    list: (filters: Record<string, unknown> = {}) =>
      ["properties", "list", filters] as const,
    detail: (id: string) => ["properties", "detail", id] as const,
  },
  projects: {
    all: ["projects"] as const,
    list: (filters: Record<string, unknown> = {}) =>
      ["projects", "list", filters] as const,
    detail: (id: string) => ["projects", "detail", id] as const,
  },
  dealers: {
    all: ["dealers"] as const,
    list: (filters: Record<string, unknown> = {}) =>
      ["dealers", "list", filters] as const,
    detail: (id: string) => ["dealers", "detail", id] as const,
  },
  adminUsers: {
    all: ["admin-users"] as const,
    list: (filters: Record<string, unknown> = {}) =>
      ["admin-users", "list", filters] as const,
  },
};
