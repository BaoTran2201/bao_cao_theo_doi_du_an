export enum ProjectStatus {
  NOT_STARTED = "Chưa bắt đầu",
  IN_PROGRESS = "Đang thực hiện",
  ON_HOLD = "Đang treo",
  LATE = "Trễ hạn", // Keep for legacy/fallback
  COMPLETED = "Đã hoàn thành",
  WAITING_ACCEPTANCE = "Chờ nghiệm thu",
  WAITING_LIQUIDATION = "Chờ thanh lý",
  WAITING_PAYMENT = "Chờ thu tiền"
}

export enum RiskLevel {
  HIGH = "Cao",
  MEDIUM = "Trung bình",
  LOW = "Thấp",
}

export enum ProjectType {
  NEW = "Dự án mới",
  RENEWAL = "Gia hạn/Tái ký",
  MAINTENANCE = "Bảo trì",
  OTHER = "Khác",
}

export interface Project {
  id: string;
  name: string;
  client: string;
  salesRep: string;
  implRep: string;
  signYear: number;
  signMonth: number;
  valueSigned: number;
  revenueRecognized: number;
  deadline: string;
  completionDate?: string;
  status: string; // Changed to string to accommodate various raw statuses
  riskLevel: RiskLevel;
  projectType?: string;
  
  // Metrics
  softwareErrors: number;
  complaints: number;
  daysLate: number;

  // New detailed fields for Project Detail Page
  kickoffDate: string;
  issueAttitude: boolean; // Lỗi thái độ/tác phong
  issueSpec: boolean;     // Lỗi phạm vi hợp đồng
  issueClient: boolean;   // Lỗi từ phía khách hàng
  issueSkill: boolean;    // Lỗi kỹ năng
  issueSoftware: boolean; // Lỗi phần mềm (boolean flag from JSON)
  managerNote: string;    // Ghi chú của quản lý
  managerRating: number;  // Đánh giá 1-5 sao
}

export interface FilterState {
  year: string;
  month: string;
  salesRep: string;
  implRep: string;
  status: string;
  riskLevel: string;
}

export interface KPIStats {
  totalProjects: number;
  totalValue: number;
  totalRevenue: number;
  remainingValue: number;
  latePercentage: number;
  errorPercentage: number;
}

// --- AI INSIGHT TYPES ---

export enum InsightCategory {
  SCHEDULE = "Tiến độ",
  PEOPLE = "Nhân sự",
  QUALITY = "Chất lượng",
  FINANCIAL = "Tài chính",
  CLIENT = "Khách hàng",
}

export enum InsightSeverity {
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low",
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  category: InsightCategory;
  severity: InsightSeverity;
  projectId?: string; // If related to a specific project
  actionLabel?: string; // CTA text
}

// --- ADMIN & AUDIT TYPES ---

export enum UserRole {
  ADMIN = "Admin",
  MANAGER = "Manager",
  OPERATOR = "Operator",
  VIEWER = "Viewer"
}

export enum AuditAction {
  CREATE = "Create",
  UPDATE = "Update",
  DELETE = "Delete",
  LOGIN = "Login",
  EXPORT = "Export"
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: AuditAction;
  targetType: string; // Project, User, System
  targetId: string;
  description: string;
  oldValue?: string;
  newValue?: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
}

// --- DATA IMPORT TYPES ---

export enum ImportStatus {
  SUCCESS = "Success",
  FAILED = "Failed",
  PARTIAL = "Partial"
}

export enum ImportSource {
  EXCEL = "Excel File",
  GSHEET = "Google Sheet"
}

export interface ImportHistoryEntry {
  id: string;
  timestamp: string;
  fileName: string;
  source: ImportSource;
  importedBy: string;
  rowsTotal: number;
  rowsSuccess: number;
  rowsFailed: number;
  status: ImportStatus;
}
