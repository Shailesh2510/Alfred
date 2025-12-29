export interface IRoute {
  path: string;
  method: string;
}

export enum AccessType {
  TENANT,
  MERCHANT,
  HOTEL
}
