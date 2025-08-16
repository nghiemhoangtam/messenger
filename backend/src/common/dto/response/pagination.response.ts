export class PaginationResponse<T> {
  results: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(results: T[], total: number, page: number, limit: number) {
    this.results = results;
    this.meta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
