export interface PaginationResponse<T> {
  results: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Helper function to create a new pagination response
export const createPaginationResponse = <T>(): PaginationResponse<T> => ({
  results: [],
  meta: {
    total: 0,
    page: 0,
    limit: 10,
    totalPages: 0,
  },
});
