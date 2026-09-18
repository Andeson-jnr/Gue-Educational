export type Role = 'SUPER_ADMIN' | 'DIRECTOR' | 'HR_ADMIN' | 'VIEWER';

export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ON_LEAVE' | 'TRANSFERRED';

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'ADJUNCT' | 'INTERN';

export type StaffCategory = 'ACADEMIC' | 'NON_ACADEMIC' | 'TECHNICAL' | 'MANAGEMENT';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string; // e.g. STC, ICT, ADM, ACC, ACA, QA
  headOfDepartment: string;
  description: string;
  staffCount?: number;
}

export interface Unit {
  id: string;
  departmentId: string;
  name: string;
  code: string;
}

export interface Staff {
  id: string;
  staffId: string; // e.g. GUE/STC/2026/001
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth: string; // Private
  photoUrl: string;
  
  // Contact
  phone: string;
  email: string;
  address: string;
  
  // Employment
  designation: string;
  departmentId: string;
  departmentName?: string;
  unitId?: string;
  unitName?: string;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  dateOfAppointment: string;
  supervisor: string;
  institution: string; // GUE Educational Limited Skills Training Centre
  staffCategory: StaffCategory;
  
  // Qualifications
  highestQualification: string;
  certifications?: string;
  specialisation: string;
  
  // Administrative
  employeeNumber: string;
  appointmentRef: string;
  statusChangeReason?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;

  // Active Verification Token
  verificationToken?: string;
  verificationStatus?: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

export interface VerificationToken {
  id: string;
  staffId: string;
  token: string; // e.g. GUE-8F42K9X7
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  createdAt: string;
  revokedAt?: string;
  revokedBy?: string;
  revocationReason?: string;
}

export interface VerificationLog {
  id: string;
  verificationToken: string;
  staffId?: string;
  staffName?: string;
  department?: string;
  statusResult: 'VERIFIED' | 'INACTIVE' | 'SUSPENDED' | 'ON_LEAVE' | 'TRANSFERRED' | 'INVALID' | 'REVOKED';
  ipAddress: string;
  userAgent: string;
  verifiedAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  adminRole: Role;
  action: string;
  staffId?: string;
  staffName?: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface StaffDocument {
  id: string;
  staffId: string;
  docType: 'APPOINTMENT_LETTER' | 'CV' | 'CERTIFICATE' | 'ID_DOCUMENT' | 'OTHER';
  title: string;
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface SystemSettings {
  orgName: string;
  orgRc: string;
  orgTin: string;
  trainingCentreName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  verificationBaseUrl: string;
  staffIdPrefix: string;
  cardPrimaryColor: string;
  cardAccentColor: string;
  cardFooterNotice: string;
  logoUrl?: string;
}

export interface PublicVerificationResult {
  valid: boolean;
  codeStatus: 'VERIFIED' | 'INACTIVE' | 'SUSPENDED' | 'ON_LEAVE' | 'TRANSFERRED' | 'INVALID' | 'REVOKED';
  message: string;
  verificationId: string;
  verifiedAt: string;
  staff?: {
    name: string;
    staffId: string;
    designation: string;
    department: string;
    institution: string;
    employmentStatus: string;
    photoUrl: string;
    dateOfAppointment: string;
  };
  institution: {
    name: string;
    centre: string;
    rc: string;
    tin: string;
    address: string;
    verifiedBy: string;
  };
}
