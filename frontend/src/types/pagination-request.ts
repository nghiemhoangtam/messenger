
export interface PaginationRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  search?: string;
  filter?: Record<string, any>;
}

// Helper function to create a new pagination request
export const createPaginationRequest = (init?: Partial<PaginationRequest>): PaginationRequest => ({
  page: 0,
  limit: 10,
  ...init,
});

// Helper function to clean parameters (moved from class method)
export const cleanPaginationParams = (params: PaginationRequest) => {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .reduce(
      (obj, [key, value]) => {
        obj[key] = typeof value === "object" ? JSON.stringify(value) : value;
        return obj;
      },
      {} as Record<string, any>
    );
};