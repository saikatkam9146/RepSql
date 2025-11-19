import { Department, UserItem, UserAccess, TimeZoneOffset, DatabaseConnection } from './user.model';

export interface ReportList {
  Total: number;
  Reports: ReportComplex[];
  Departments: Department[];
  Users: UserItem[];
  // Optional list of database connections (some API payloads include this)
  DatabaseConnection?: DatabaseConnection[];
}

export interface ReportEdit {
  Report: ReportComplex;
  FileExtensions: FileExtension[];
  Delimiters: Delimiter[];
  TimeZoneOffsets: TimeZoneOffset[];
  CurrentUser: UserItem | null;
  DatabaseConnectionsImport: DatabaseConnection[];
  DatabaseConnectionsExport: DatabaseConnection[];
  Users: UserItem[];
  Departments: Department[];
  // Some back-end responses include a flat list of DatabaseConnection objects
  DatabaseConnection?: DatabaseConnection[];
  Logs: Log[];
}

export interface SheetComplex {
  Sheet: Sheet;
  DatabaseConnection: DatabaseConnection | null;
}

export interface SearchList {
  DatabaseConnections: DatabaseConnection[];
}

export interface SearchTableColumn {
  TableName: string;
  ColumnName: string;
}

export interface ProcessReportQuery {
  ProcessStatus: number;
  SQLErrorMsg: string | null;
}

export interface ReportComplex {
  Report: Report;
  User?: UserItem | null;
  Department?: Department | null;
  UserAccess?: UserAccess | null;
  EmailReport?: EmailReport | null;
  ReportHistory?: ReportHistory | null;
  ReportStatus?: Status | null;
  ExistingWorkbook?: ExistingWorkbook | null;
  DatabaseConnection?: DatabaseConnection | null;
  Adhoc?: Adhoc | null;
  Minute?: Minute | null;
  Week?: Week | null;
  Month?: Month | null;
  Hour?: Hour | null;
  Status?: Status | null;
  Exports?: ExportComplex[];
  Sheets?: SheetComplex[];
  EmailLists?: EmailList[];
  ReportQueue?: ReportQueue | null;
  // TO BE DELETED
  ExportsToBeDeleted?: ExportComplex[];
  SheetsToBeDeleted?: SheetComplex[];
  EmailListsToBeDeleted?: EmailList[];
  // ACCESS
  HasEditAccess?: boolean;
}

export interface Report {
  fnReportID: number;
  fcReportName: string;
  fnConnectionID: number;
  fcSQL: string;
  fnUserID: number;
  fnUpdateExistingWorkbook: boolean;
  fdLastUpdate: string | null;
  fnLastEditUserID?: number | null;
  fdRunDate?: string | null;
  fnStatusID?: number | null;
  fnRunTimeDurationSeconds?: number | null;
}

export interface EmailReport {
  fnReportID: number;
  fnDisable: boolean;
  fcFrom?: string | null;
  fcSubject?: string | null;
  fcBody?: string | null;
  fnSendSecure?: boolean | null;
  fnAttachment?: boolean | null;
  fcAttachmentName?: string | null;
  fnZipFile?: boolean | null;
  fcZipPassword?: string | null;
}

export interface ReportHistory {
  fnInstanceID: number;
  fnReportID: number;
  fdRunDate: string;
  fnStatusID: number;
  fcStatusComments?: string | null;
  fnRunTimeDurationSeconds?: number;
  fcReportType?: string | null;
  fnPort?: number;
}

export interface Status {
  fnStatusID: number;
  fcStatusDescription?: string | null;
}

export interface ExistingWorkbook {
  fnReportID: number;
  fcWbLocation?: string | null;
  fcWbName?: string | null;
  fcWbAppendData?: boolean;
  IsDeleted?: boolean;
}

export interface Adhoc {
  fnReportID: number;
  fdDateTime: string;
  fnStatusID: number;
  fbRescheduled: boolean;
  IsDeleted?: boolean;
}

export interface Minute {
  fnReportID: number;
  fnStatusID: number;
  fdLastRun?: string | null;
  IsDeleted?: boolean;
}

export interface Week {
  fnReportID: number;
  fnSunday?: boolean;
  fnMonday?: boolean;
  fnTuesday?: boolean;
  fnWednesday?: boolean;
  fnThursday?: boolean;
  fnFriday?: boolean;
  fnSaturday?: boolean;
  fdLastRunDate?: string | null;
  fnStatusID?: number | null;
  fdLastStartTime?: string | null;
  fnRunHour?: number | null;
  fnRunMinute?: number | null;
  fbRescheduled?: boolean;
  fbCaptureMonthlySnapshot?: boolean;
  fnRunOnEveryFirstDayOfMonth?: boolean;
  IsDeleted?: boolean;
}

export interface Month {
  fnReportID: number;
  fnDayOfMonth?: number;
  fnRecurrenceMonths?: number | null;
  fdLastRunDate?: string | null;
  fnStatusID?: number | null;
  fnRunHour?: number | null;
  fnRunMinute?: number | null;
  fbRescheduled?: boolean;
  fnOndays?: string | null;
  fnWeekDay?: string | null;
  fnWeekNo?: number;
  fbCaptureMonthlySnapshot?: boolean;
  fnRunOnEveryFirstDayOfMonth?: boolean;
  IsDeleted?: boolean;
}

export interface Hour {
  fnReportID: number;
  fnRunMinute?: number | null;
  fnRunHourStart?: number | null;
  fnRunHourEnd?: number | null;
  fnRecurrenceHours?: number | null;
  fdLastRunDate?: string | null;
  fnStatusID?: number | null;
  fbRescheduled?: boolean;
  IsDeleted?: boolean;
}

export interface ExportComplex {
  Export: Export;
  FileExtension?: FileExtension | null;
  Delimiter?: Delimiter | null;
}

export interface Export {
  fnExportID: number;
  fnReportID?: number | null;
  fcExportLocation?: string | null;
  fcExportName?: string | null;
  fnAddDate?: number | null;
  fnFileExtensionID?: number | null;
  fnDelimiterID?: number | null;
  fnAddQuotes?: boolean;
  fnGenerateSQL?: boolean;
  fnIncludeHeader?: boolean;
}

export interface FileExtension {
  fnFileExtensionID: number;
  fcFileExtension?: string | null;
  fnXLFormat?: number;
}

export interface Delimiter {
  fnDelimiterID: number;
  fcDelimiter?: string | null;
}

export interface Sheet {
  fnSheetID: number;
  fnReportID: number;
  fnSheetOrder?: number;
  fcSheetName?: string | null;
  fnHideSheet?: boolean;
  fnDeleteSheet?: boolean;
  fbDBExport?: boolean;
  fnDBExportConnectionID?: number;
}

export interface EmailList {
  fnEmailListID: number;
  fnReportID: number;
  fcSendType?: string | null;
  fcEmailAddress?: string | null;
}

export interface ReportQueue {
  ReportQueueId: string; // GUID as string
  ReportId: number;
  Status?: string | null;
  ServerName?: string | null;
  ArriveTime?: string | null;
  StartTime?: string | null;
  EndTime?: string | null;
  Timestamp?: number[] | null;
  Duration?: number | null;
}

export interface TimeZoneOffsetModel extends TimeZoneOffset {}

export interface Log {
  LogId: string; // GUID string
  SeverityId: number;
  CodeId: number;
  Timestamp: string;
  MachineName?: string | null;
  ThreadId?: number;
  Message?: string | null;
  ReportId?: number | null;
  ReportQueueId?: string | null;
  StackTrace?: string | null;
}

// Additional simple placeholder model requested
export interface Setup {
  // Setup contains lists used by Reports module
  Users: UserItem[];
  Departments: Department[];
  DatabaseConnection: DatabaseConnection[];
}
