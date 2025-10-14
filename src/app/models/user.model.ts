export interface UserItem {
  fnUserID: number;
  fcFirstName: string;
  fcLastName: string;
  fcUserNT: string;
  fcUserEmail: string;
  fnDepartmentID?: number;
  fnAccessID?: number;
  fcApprovalStatus?: string;
  fcComments?: string;
  fnRunConsolePermission?: boolean;
  fbDeveloper?: boolean;
  TimeZoneID?: number;
}

export interface Department {
  fnDepartmentID: number;
  fcDepartmentName: string;
}

export interface UserAccess {
  fnAccessID: number;
  fcAccessDescription: string;
}

export interface TimeZoneOffset {
  TimeZoneID: number;
  TimeZoneCode: string;
  TimeZoneName: string;
  std_Offset: number;
  daylight_Offset: number;
}

export interface UserRecord {
  User: UserItem;
  Department?: Department;
  UserAccess?: UserAccess;
  TimeZoneOffset?: TimeZoneOffset;
}
