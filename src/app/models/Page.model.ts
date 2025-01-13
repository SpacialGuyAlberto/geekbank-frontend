// models/page.ts
export interface Page<T> {
  content: T[];
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  // etc., lo que necesites
}


