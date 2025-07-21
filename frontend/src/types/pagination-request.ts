
export class PaginationRequest {
  page?: number = 0;
  limit?: number = 10;
  sortBy?: string;
  search?: string;
  filter?: Record<string, any>;

  constructor(init?: Partial<PaginationRequest>) {
    Object.assign(this, init);
  }

  cleanParams() {
    return Object.entries(this)
    .filter(([_, value]) => value !== undefined && value !== null)
    .reduce(
      (obj, [key, value]) => {
        obj[key] = typeof value === "object" ? JSON.stringify(value) : value;
        return obj;
      },
      {} as Record<string, any>
    );
  }
}