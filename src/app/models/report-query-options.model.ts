/**
 * ReportQueryOptions — TypeScript model mirroring ReportQueryOptions.cs
 * Example JSON: {"Take":10,"OrderBy":1,"OrderByReverse":false,"Status":8,"Type":null,"TypeDayOfWeek":null,
 * "TypeDayOfMonth":null,"User":null,"Department":null,"SearchTerm":"","Skip":0}
 *
 * Types:
 * - Take, Skip, OrderBy are number (int)
 * - SearchTerm, Database, Server are string
 * - OrderByReverse is boolean
 * - all others are nullable numbers (number | null)
 */
export interface ReportQueryOptions {
  Take: number; // page size
  Skip: number; // offset
  OrderBy: number; // numeric sort key
  OrderByReverse: boolean;
  Status?: number | null;
  Type?: number | null;
  TypeDayOfWeek?: number | null;
  TypeDayOfMonth?: number | null;
  User?: number | null;
  Department?: number | null;
  SearchTerm?: string;
  Database?: string;
  Server?: string;
}

/** Returns a default ReportQueryOptions instance matching the example defaults */
export function defaultReportQueryOptions(): ReportQueryOptions {
  return {
    Take: 10,
    Skip: 0,
    OrderBy: 1,
    OrderByReverse: false,
    Status: null,
    Type: null,
    TypeDayOfWeek: null,
    TypeDayOfMonth: null,
    User: null,
    Department: null,
    SearchTerm: '',
    Database: '',
    Server: ''
  };
}
