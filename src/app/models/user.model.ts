export interface UserItem {
  fnUserID: number;
  fcFirstName: string;
  fcLastName: string;
  fcUserNT: string;
  fcUserEmail: string;
  fnDepartmentID: number;
  fnAccessID: number;
  fcApprovalStatus?: string;
  fcComments?: string;
  fnRunConsolePermission: boolean;
  fbDeveloper: boolean;
  TimeZoneID: number;
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

// Corresponds to C# UserComplex which wraps the inner user + related objects
export interface UserComplex {
  User: UserItem;
  Department?: Department;
  UserAccess?: UserAccess;
  TimeZoneOffset?: TimeZoneOffset;
  CurrentUserAccesslevel?: string;
}

// Database connection details (inferred fields - will adjust if you provide exact C# class)
export interface DatabaseConnection {
  fnConnectionID?: number;
  fcConnectionName?: string;
  fcConnectionType?: string;
  fcProvider?: string;
  fcDataSource?: string;
  fcInitialCatalog?: string;
  fcIntegratedSecurity?: string;
  fcTrustedConnection?: string;
  fnDatabaseActive?: boolean;
  fdLastUpdate?: string | null; // ISO date string or null
  fcSchema?: string;
  HasDatabaseEditAccess?: boolean;
}

export interface DatabaseAccess {
  fnDatabaseAccessID?: number;
  fnUserID?: number;
  fnConnectionID?: number;
  fbImportAccess?: boolean;
  fbExportAccess?: boolean;
}

export interface DatabaseAccessComplex {
  DatabaseConnection?: DatabaseConnection;
  DatabaseAccess?: DatabaseAccess;
}

export interface UserList {
  Users: UserComplex[];
  Departments: Department[];
  HasUserEditAccess: boolean;
}

export interface UserEdit {
  User: UserComplex;
  DatabaseAccess: DatabaseAccessComplex[];
  Departments: Department[];
  UserAccess: UserAccess[];
  TimeZone: TimeZoneOffset[];
}
