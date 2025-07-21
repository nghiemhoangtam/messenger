export class PaginationResponse<T> {
  results: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor() {
    this.results = [];
    this.meta = {
      total: 0,
      page: 0,
      limit: 10,
      totalPages: 0,
    };
  }
}
