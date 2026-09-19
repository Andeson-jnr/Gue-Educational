import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import {
  User,
  Staff,
  Department,
  Unit,
  VerificationToken,
  VerificationLog,
  AuditLog,
  StaffDocument,
  SystemSettings,
  Role,
  EmploymentStatus,
} from '../types/index.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'gue_system.json');

export interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  departments: Department[];
  units: Unit[];
  staff: Staff[];
  verificationTokens: VerificationToken[];
  verificationLogs: VerificationLog[];
  auditLogs: AuditLog[];
  documents: StaffDocument[];
  settings: SystemSettings;
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function generateSecureToken(prefix = 'GUE'): string {
  // Generates 8 alphanumeric characters, formatted like GUE-8F42K9X7
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude ambiguous 0/O, 1/I
  let token = '';
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    token += chars[bytes[i] % chars.length];
  }
  return `${prefix}-${token}`;
}

const DEFAULT_SETTINGS: SystemSettings = {
  orgName: 'GUE EDUCATIONAL LIMITED',
  orgRc: 'RC: 9451933',
  orgTin: 'TIN: 2620760246226',
  trainingCentreName: 'GUE Educational Limited Skills Training Centre',
  address: 'Wannune, Tarka LGA, Benue State, Nigeria',
  phone: '+234 (0) 803 249 9451 / +234 (0) 812 550 1933',
  email: 'info@gue.edu.ng',
  website: 'https://gue.edu.ng',
  verificationBaseUrl: process.env.VERIFICATION_BASE_URL || 'https://verify.gue.edu.ng',
  staffIdPrefix: 'GUE',
  cardPrimaryColor: '#0f3a5d', // Deep institutional navy
  cardAccentColor: '#c59b27', // Gold institutional seal accent
  cardFooterNotice: 'Property of GUE Educational Limited. If found, please return to Wannune, Tarka LGA, Benue State.',
  logoUrl: '/gue_logo.jpg',
};

function getSeedData(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('Admin@GUE2026!', salt);

  const users: (User & { passwordHash: string })[] = [
    {
      id: 'usr-1',
      username: 'admin',
      email: 'admin@gue.edu.ng',
      fullName: 'Dr. Terseer G. Uba',
      role: 'SUPER_ADMIN',
      createdAt: '2026-01-10T08:00:00.000Z',
      isActive: true,
      passwordHash: defaultPasswordHash,
    },
    {
      id: 'usr-2',
      username: 'director',
      email: 'director@gue.edu.ng',
      fullName: 'Engr. Moses A. Kper',
      role: 'DIRECTOR',
      createdAt: '2026-01-11T09:30:00.000Z',
      isActive: true,
      passwordHash: bcrypt.hashSync('Director@GUE2026!', salt),
    },
    {
      id: 'usr-3',
      username: 'hr_admin',
      email: 'hr@gue.edu.ng',
      fullName: 'Victoria N. Chenge',
      role: 'HR_ADMIN',
      createdAt: '2026-01-12T10:00:00.000Z',
      isActive: true,
      passwordHash: bcrypt.hashSync('HRAdmin@GUE2026!', salt),
    },
    {
      id: 'usr-4',
      username: 'viewer',
      email: 'viewer@gue.edu.ng',
      fullName: 'Patience A. Doshima',
      role: 'VIEWER',
      createdAt: '2026-02-01T08:30:00.000Z',
      isActive: true,
      passwordHash: bcrypt.hashSync('Viewer@GUE2026!', salt),
    },
  ];

  const departments: Department[] = [
    {
      id: 'dept-stc',
      name: 'Skills Training Centre',
      code: 'STC',
      headOfDepartment: 'Engr. Moses A. Kper',
      description: 'Technical, vocational, ICT and craft skills vocational training workshops.',
    },
    {
      id: 'dept-ict',
      name: 'ICT & Digital Systems',
      code: 'ICT',
      headOfDepartment: 'Kwashie D. Emmanuel',
      description: 'Institutional computing, network infrastructure, software systems and e-learning.',
    },
    {
      id: 'dept-adm',
      name: 'General Administration',
      code: 'ADM',
      headOfDepartment: 'Barnabas S. Iortyom',
      description: 'Central registry, personnel coordination, corporate affairs and public relations.',
    },
    {
      id: 'dept-acc',
      name: 'Finance & Accounts',
      code: 'ACC',
      headOfDepartment: 'Mrs. Cynthia M. Tyovenda',
      description: 'Financial management, payroll processing, bursary and auditing.',
    },
    {
      id: 'dept-aca',
      name: 'Academics & Curriculum',
      code: 'ACA',
      headOfDepartment: 'Dr. Felix U. Agbatar',
      description: 'Academic planning, instructional delivery, examination and certification.',
    },
    {
      id: 'dept-qa',
      name: 'Quality Assurance & Compliance',
      code: 'QA',
      headOfDepartment: 'Dr. Theresa T. Awuhe',
      description: 'Standards enforcement, institutional regulatory compliance and training audits.',
    },
    {
      id: 'dept-sa',
      name: 'Student Affairs & Welfare',
      code: 'SA',
      headOfDepartment: 'Solomon O. Chia',
      description: 'Trainee admissions, hostel management, guidance counseling and extracurriculars.',
    },
  ];

  const units: Unit[] = [
    { id: 'unit-ict-1', departmentId: 'dept-ict', name: 'Software & Web Systems', code: 'SWS' },
    { id: 'unit-ict-2', departmentId: 'dept-ict', name: 'Network & Hardware Support', code: 'NHS' },
    { id: 'unit-stc-1', departmentId: 'dept-stc', name: 'Electrical Installation & Solar', code: 'EIS' },
    { id: 'unit-stc-2', departmentId: 'dept-stc', name: 'Welding & Metal Fabrication', code: 'WMF' },
    { id: 'unit-stc-3', departmentId: 'dept-stc', name: 'ICT Skills Lab', code: 'ISL' },
    { id: 'unit-adm-1', departmentId: 'dept-adm', name: 'Human Resources & Records', code: 'HRR' },
    { id: 'unit-acc-1', departmentId: 'dept-acc', name: 'Treasury & Revenue', code: 'TRV' },
  ];

  const staff: Staff[] = [
    {
      id: 'stf-001',
      staffId: 'GUE/STC/2026/001',
      firstName: 'John',
      middleName: 'Aondoaver',
      lastName: 'Doe',
      gender: 'MALE',
      dateOfBirth: '1988-04-14',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      phone: '+234 803 111 2233',
      email: 'john.doe@gue.edu.ng',
      address: 'Plot 14, Commercial Layout, Wannune, Benue State',
      designation: 'ICT Officer',
      departmentId: 'dept-stc',
      departmentName: 'Skills Training Centre',
      unitId: 'unit-stc-3',
      unitName: 'ICT Skills Lab',
      employmentType: 'FULL_TIME',
      employmentStatus: 'ACTIVE',
      dateOfAppointment: '2026-01-05',
      supervisor: 'Engr. Moses A. Kper',
      institution: 'GUE Educational Limited Skills Training Centre',
      staffCategory: 'TECHNICAL',
      highestQualification: 'B.Sc Computer Science (First Class Hons)',
      certifications: 'Cisco CCNA, CompTIA Security+, Microsoft Certified Educator',
      specialisation: 'Systems Administration & Digital Literacy Instruction',
      employeeNumber: 'EMP-2026-001',
      appointmentRef: 'GUE/HR/APP/2026/014',
      createdBy: 'Victoria N. Chenge (HR Admin)',
      createdAt: '2026-01-05T09:00:00.000Z',
      updatedAt: '2026-01-05T09:00:00.000Z',
      verificationToken: 'GUE-8F42K9X7',
      verificationStatus: 'ACTIVE',
    },
    {
      id: 'stf-002',
      staffId: 'GUE/ADM/2026/001',
      firstName: 'Mary',
      middleName: 'Ojoma',
      lastName: 'James',
      gender: 'FEMALE',
      dateOfBirth: '1992-09-21',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      phone: '+234 802 444 5566',
      email: 'mary.james@gue.edu.ng',
      address: 'No. 8 High Level, Makurdi Road, Wannune',
      designation: 'Senior Administrative Officer',
      departmentId: 'dept-adm',
      departmentName: 'General Administration',
      unitId: 'unit-adm-1',
      unitName: 'Human Resources & Records',
      employmentType: 'FULL_TIME',
      employmentStatus: 'ACTIVE',
      dateOfAppointment: '2026-01-10',
      supervisor: 'Barnabas S. Iortyom',
      institution: 'GUE Educational Limited Skills Training Centre',
      staffCategory: 'MANAGEMENT',
      highestQualification: 'M.Sc Public Administration',
      certifications: 'CIPM (Chartered Institute of Personnel Management)',
      specialisation: 'Institutional Governance & Records Management',
      employeeNumber: 'EMP-2026-002',
      appointmentRef: 'GUE/HR/APP/2026/018',
      createdBy: 'Dr. Terseer G. Uba (Super Admin)',
      createdAt: '2026-01-10T10:00:00.000Z',
      updatedAt: '2026-01-10T10:00:00.000Z',
      verificationToken: 'GUE-7F82A91C',
      verificationStatus: 'ACTIVE',
    },
    {
      id: 'stf-003',
      staffId: 'GUE/ACC/2026/001',
      firstName: 'Peter',
      middleName: 'Agada',
      lastName: 'Joseph',
      gender: 'MALE',
      dateOfBirth: '1985-11-03',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      phone: '+234 813 777 8899',
      email: 'peter.joseph@gue.edu.ng',
      address: 'GRA Extension, Wannune, Tarka LGA',
      designation: 'Chief Accountant',
      departmentId: 'dept-acc',
      departmentName: 'Finance & Accounts',
      unitId: 'unit-acc-1',
      unitName: 'Treasury & Revenue',
      employmentType: 'FULL_TIME',
      employmentStatus: 'ON_LEAVE',
      statusChangeReason: 'Approved annual research and study sabbatical leave (Jan-Apr 2026)',
      dateOfAppointment: '2025-06-15',
      supervisor: 'Mrs. Cynthia M. Tyovenda',
      institution: 'GUE Educational Limited Skills Training Centre',
      staffCategory: 'MANAGEMENT',
      highestQualification: 'B.Sc Accounting, MBA Financial Management',
      certifications: 'ICAN (Institute of Chartered Accountants of Nigeria)',
      specialisation: 'Educational Grants & Public Audit',
      employeeNumber: 'EMP-2025-045',
      appointmentRef: 'GUE/HR/APP/2025/082',
      createdBy: 'Victoria N. Chenge (HR Admin)',
      createdAt: '2025-06-15T11:00:00.000Z',
      updatedAt: '2026-02-01T14:20:00.000Z',
      verificationToken: 'GUE-4X92LMQ8',
      verificationStatus: 'ACTIVE',
    },
    {
      id: 'stf-004',
      staffId: 'GUE/STC/2026/002',
      firstName: 'Grace',
      middleName: 'Ene',
      lastName: 'Agbo',
      gender: 'FEMALE',
      dateOfBirth: '1990-07-19',
      photoUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
      phone: '+234 818 222 3344',
      email: 'grace.agbo@gue.edu.ng',
      address: '22 Skills Complex Way, Wannune',
      designation: 'Lead Solar & Electrical Instructor',
      departmentId: 'dept-stc',
      departmentName: 'Skills Training Centre',
      unitId: 'unit-stc-1',
      unitName: 'Electrical Installation & Solar',
      employmentType: 'FULL_TIME',
      employmentStatus: 'ACTIVE',
      dateOfAppointment: '2026-01-18',
      supervisor: 'Engr. Moses A. Kper',
      institution: 'GUE Educational Limited Skills Training Centre',
      staffCategory: 'TECHNICAL',
      highestQualification: 'HND Electrical/Electronics Engineering (Distinction)',
      certifications: 'COREN Certified Engineering Technologist, NABTEB Master Craftsman',
      specialisation: 'Photovoltaic Renewable Energy & Industrial Wiring',
      employeeNumber: 'EMP-2026-004',
      appointmentRef: 'GUE/HR/APP/2026/029',
      createdBy: 'Victoria N. Chenge (HR Admin)',
      createdAt: '2026-01-18T08:45:00.000Z',
      updatedAt: '2026-01-18T08:45:00.000Z',
      verificationToken: 'GUE-9A72LM8X',
      verificationStatus: 'ACTIVE',
    },
    {
      id: 'stf-005',
      staffId: 'GUE/QA/2026/001',
      firstName: 'Samuel',
      middleName: 'Terkura',
      lastName: 'Iorfa',
      gender: 'MALE',
      dateOfBirth: '1983-03-29',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      phone: '+234 809 333 4455',
      email: 'samuel.iorfa@gue.edu.ng',
      address: 'Wannune Township Road, Tarka LGA',
      designation: 'Compliance & Standards Inspector',
      departmentId: 'dept-qa',
      departmentName: 'Quality Assurance & Compliance',
      employmentType: 'CONTRACT',
      employmentStatus: 'SUSPENDED',
      statusChangeReason: 'Pending investigative panel review on certification audit discrepancy',
      dateOfAppointment: '2025-08-01',
      supervisor: 'Dr. Theresa T. Awuhe',
      institution: 'GUE Educational Limited Skills Training Centre',
      staffCategory: 'MANAGEMENT',
      highestQualification: 'M.Ed Educational Evaluation',
      certifications: 'ISO 9001 Lead Auditor',
      specialisation: 'Vocational Curricula Benchmarking',
      employeeNumber: 'EMP-2025-067',
      appointmentRef: 'GUE/HR/APP/2025/112',
      createdBy: 'Victoria N. Chenge (HR Admin)',
      createdAt: '2025-08-01T12:00:00.000Z',
      updatedAt: '2026-02-14T16:00:00.000Z',
      verificationToken: 'GUE-2B91JK44',
      verificationStatus: 'ACTIVE',
    },
    {
      id: 'stf-006',
      staffId: 'GUE/STC/2025/009',
      firstName: 'Paul',
      middleName: 'Nguher',
      lastName: 'Terver',
      gender: 'MALE',
      dateOfBirth: '1987-12-05',
      photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
      phone: '+234 814 555 6677',
      email: 'paul.terver@gue.edu.ng',
      address: 'Old Police Barracks Road, Wannune',
      designation: 'Assistant Metal Fabrication Trainer',
      departmentId: 'dept-stc',
      departmentName: 'Skills Training Centre',
      unitId: 'unit-stc-2',
      unitName: 'Welding & Metal Fabrication',
      employmentType: 'CONTRACT',
      employmentStatus: 'INACTIVE',
      statusChangeReason: 'Contract concluded upon end of vocational training cycle on 31 Dec 2025',
      dateOfAppointment: '2025-01-15',
      supervisor: 'Engr. Moses A. Kper',
      institution: 'GUE Educational Limited Skills Training Centre',
      staffCategory: 'TECHNICAL',
      highestQualification: 'National Diploma Mechanical Engineering',
      certifications: 'City & Guilds Metalwork Certification',
      specialisation: 'Arc Welding & Sheet Metal Forming',
      employeeNumber: 'EMP-2025-012',
      appointmentRef: 'GUE/HR/APP/2025/019',
      createdBy: 'Victoria N. Chenge (HR Admin)',
      createdAt: '2025-01-15T09:00:00.000Z',
      updatedAt: '2026-01-02T10:15:00.000Z',
      verificationToken: 'GUE-6D33PW81',
      verificationStatus: 'ACTIVE',
    },
  ];

  const verificationTokens: VerificationToken[] = staff.map((s) => ({
    id: `tok-${s.id}`,
    staffId: s.id,
    token: s.verificationToken!,
    status: 'ACTIVE',
    createdAt: s.createdAt,
  }));

  const verificationLogs: VerificationLog[] = [
    {
      id: 'vlog-1',
      verificationToken: 'GUE-8F42K9X7',
      staffId: 'stf-001',
      staffName: 'John Aondoaver Doe',
      department: 'Skills Training Centre',
      statusResult: 'VERIFIED',
      ipAddress: '102.89.41.112',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)',
      verifiedAt: '2026-09-18T08:42:15.000Z',
    },
    {
      id: 'vlog-2',
      verificationToken: 'GUE-7F82A91C',
      staffId: 'stf-002',
      staffName: 'Mary Ojoma James',
      department: 'General Administration',
      statusResult: 'VERIFIED',
      ipAddress: '197.210.54.89',
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro)',
      verifiedAt: '2026-09-18T08:31:02.000Z',
    },
    {
      id: 'vlog-3',
      verificationToken: 'GUE-4X92LMQ8',
      staffId: 'stf-003',
      staffName: 'Peter Agada Joseph',
      department: 'Finance & Accounts',
      statusResult: 'ON_LEAVE',
      ipAddress: '105.112.78.204',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      verifiedAt: '2026-09-18T07:15:40.000Z',
    },
    {
      id: 'vlog-4',
      verificationToken: 'GUE-6D33PW81',
      staffId: 'stf-006',
      staffName: 'Paul Nguher Terver',
      department: 'Skills Training Centre',
      statusResult: 'INACTIVE',
      ipAddress: '41.190.2.14',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      verifiedAt: '2026-09-17T16:22:11.000Z',
    },
    {
      id: 'vlog-5',
      verificationToken: 'GUE-1K82PQ4T',
      statusResult: 'INVALID',
      ipAddress: '102.89.23.6',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X)',
      verifiedAt: '2026-09-17T14:12:00.000Z',
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'alog-1',
      adminId: 'usr-1',
      adminName: 'Dr. Terseer G. Uba',
      adminRole: 'SUPER_ADMIN',
      action: 'ADMIN LOGIN',
      details: 'Super administrator authenticated successfully from Wannune Secretariat network.',
      ipAddress: '102.89.41.110',
      timestamp: '2026-09-18T07:45:00.000Z',
    },
    {
      id: 'alog-2',
      adminId: 'usr-3',
      adminName: 'Victoria N. Chenge',
      adminRole: 'HR_ADMIN',
      action: 'ADMIN CREATED STAFF',
      staffId: 'stf-004',
      staffName: 'Grace Ene Agbo',
      details: 'Registered new Lead Solar & Electrical Instructor under Skills Training Centre.',
      ipAddress: '102.89.41.115',
      timestamp: '2026-01-18T08:45:00.000Z',
    },
    {
      id: 'alog-3',
      adminId: 'usr-3',
      adminName: 'Victoria N. Chenge',
      adminRole: 'HR_ADMIN',
      action: 'ADMIN GENERATED ID',
      staffId: 'stf-001',
      staffName: 'John Aondoaver Doe',
      details: 'Issued official institutional identity credential and cryptographic verification token GUE-8F42K9X7.',
      ipAddress: '102.89.41.118',
      timestamp: '2026-01-05T09:30:00.000Z',
    },
    {
      id: 'alog-4',
      adminId: 'usr-1',
      adminName: 'Dr. Terseer G. Uba',
      adminRole: 'SUPER_ADMIN',
      action: 'ADMIN UPDATED STAFF STATUS',
      staffId: 'stf-005',
      staffName: 'Samuel Terkura Iorfa',
      details: 'Status changed from ACTIVE to SUSPENDED. Reason: Pending investigative panel review on certification audit.',
      ipAddress: '102.89.41.110',
      timestamp: '2026-02-14T16:00:00.000Z',
    },
  ];

  const documents: StaffDocument[] = [
    {
      id: 'doc-1',
      staffId: 'stf-001',
      docType: 'APPOINTMENT_LETTER',
      title: 'Official Letter of Employment - GUE/HR/APP/2026/014',
      fileName: 'John_Doe_Appointment_Letter_2026.pdf',
      fileSize: '420 KB',
      uploadedBy: 'Victoria N. Chenge',
      uploadedAt: '2026-01-05T09:15:00.000Z',
    },
    {
      id: 'doc-2',
      staffId: 'stf-001',
      docType: 'CERTIFICATE',
      title: 'B.Sc Computer Science Degree Certificate & CCNA',
      fileName: 'John_Doe_Degree_Certificates.pdf',
      fileSize: '1.2 MB',
      uploadedBy: 'Victoria N. Chenge',
      uploadedAt: '2026-01-05T09:20:00.000Z',
    },
    {
      id: 'doc-3',
      staffId: 'stf-002',
      docType: 'APPOINTMENT_LETTER',
      title: 'Letter of Employment - Senior Administrative Officer',
      fileName: 'Mary_James_Appointment_Letter.pdf',
      fileSize: '380 KB',
      uploadedBy: 'Victoria N. Chenge',
      uploadedAt: '2026-01-10T10:10:00.000Z',
    },
    {
      id: 'doc-4',
      staffId: 'stf-004',
      docType: 'CERTIFICATE',
      title: 'HND Electrical Certificate & COREN Technologist License',
      fileName: 'Grace_Agbo_COREN_NABTEB_Credentials.pdf',
      fileSize: '2.4 MB',
      uploadedBy: 'Victoria N. Chenge',
      uploadedAt: '2026-01-18T09:00:00.000Z',
    },
  ];

  return {
    users,
    departments,
    units,
    staff,
    verificationTokens,
    verificationLogs,
    auditLogs,
    documents,
    settings: DEFAULT_SETTINGS,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Guarantee all top-level keys and remove any legacy registrar or auditor users
        let loadedUsers = (parsed.users || []).filter(
          (u: any) =>
            u.role !== 'REGISTRAR' &&
            u.username?.toLowerCase() !== 'registrar' &&
            u.role !== 'AUDITOR' &&
            u.username?.toLowerCase() !== 'auditor'
        );
        // Ensure standard viewer user is present among remaining roles
        if (!loadedUsers.some((u: any) => u.username === 'viewer')) {
          const salt = bcrypt.genSaltSync(10);
          loadedUsers.push({
            id: 'usr-4',
            username: 'viewer',
            email: 'viewer@gue.edu.ng',
            fullName: 'Patience A. Doshima',
            role: 'VIEWER',
            createdAt: '2026-02-01T08:30:00.000Z',
            isActive: true,
            passwordHash: bcrypt.hashSync('Viewer@GUE2026!', salt),
          });
        }
        const loadedSettings: SystemSettings = {
          ...DEFAULT_SETTINGS,
          ...(parsed.settings || {}),
          logoUrl: parsed.settings?.logoUrl || '/gue_logo.jpg',
          email: parsed.settings?.email === 'registry@gue.edu.ng' ? 'info@gue.edu.ng' : (parsed.settings?.email || 'info@gue.edu.ng'),
        };

        return {
          users: loadedUsers,
          departments: parsed.departments || [],
          units: parsed.units || [],
          staff: parsed.staff || [],
          verificationTokens: parsed.verificationTokens || [],
          verificationLogs: parsed.verificationLogs || [],
          auditLogs: parsed.auditLogs || [],
          documents: parsed.documents || [],
          settings: loadedSettings,
        };
      }
    } catch (err) {
      console.error('Error reading database file, using seed data:', err);
    }
    const seed = getSeedData();
    this.save(seed);
    return seed;
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      const payload = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to database file:', err);
    }
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  // Users
  public findUserByUsername(username: string) {
    return this.data.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()
    );
  }

  public findUserById(id: string) {
    return this.data.users.find((u) => u.id === id);
  }

  public getAllUsers(): User[] {
    return this.data.users.map(({ passwordHash, ...user }) => user);
  }

  public createUser(user: User & { passwordHash: string }) {
    this.data.users.push(user);
    this.save();
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  public updateUser(id: string, updates: Partial<User & { passwordHash?: string }>) {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    const { passwordHash, ...safeUser } = this.data.users[idx];
    return safeUser;
  }

  // Departments & Units
  public getDepartments() {
    return this.data.departments.map((dept) => {
      const count = this.data.staff.filter((s) => s.departmentId === dept.id).length;
      return { ...dept, staffCount: count };
    });
  }

  public getDepartmentById(id: string) {
    return this.data.departments.find((d) => d.id === id);
  }

  public getUnits() {
    return this.data.units;
  }

  public createDepartment(dept: Department) {
    this.data.departments.push(dept);
    this.save();
    return dept;
  }

  // Staff
  public getAllStaff() {
    return this.data.staff;
  }

  public getStaffById(id: string) {
    return this.data.staff.find((s) => s.id === id);
  }

  public getStaffByStaffId(staffId: string) {
    return this.data.staff.find((s) => s.staffId.toLowerCase() === staffId.trim().toLowerCase());
  }

  public getStaffByToken(token: string) {
    const cleanToken = token.trim().toUpperCase();
    return this.data.staff.find((s) => s.verificationToken?.toUpperCase() === cleanToken);
  }

  public generateNextStaffId(departmentCode = 'STC'): string {
    const currentYear = new Date().getFullYear();
    const prefix = `${this.data.settings.staffIdPrefix}/${departmentCode.toUpperCase()}/${currentYear}/`;
    
    // Find highest sequence number
    let maxSeq = 0;
    this.data.staff.forEach((s) => {
      if (s.staffId.startsWith(prefix)) {
        const parts = s.staffId.split('/');
        const seq = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    });

    const nextSeq = (maxSeq + 1).toString().padStart(3, '0');
    return `${prefix}${nextSeq}`;
  }

  public createStaff(staffMember: Staff, creatorName: string) {
    // Generate verification token if none provided
    if (!staffMember.verificationToken) {
      staffMember.verificationToken = this.generateUniqueVerificationToken();
      staffMember.verificationStatus = 'ACTIVE';
    }

    // Add token record
    const tokenRecord: VerificationToken = {
      id: `tok-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      staffId: staffMember.id,
      token: staffMember.verificationToken,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    this.data.verificationTokens.push(tokenRecord);

    this.data.staff.push(staffMember);
    this.save();
    return staffMember;
  }

  public updateStaff(id: string, updates: Partial<Staff>) {
    const idx = this.data.staff.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    
    this.data.staff[idx] = {
      ...this.data.staff[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.staff[idx];
  }

  public deleteStaff(id: string) {
    const idx = this.data.staff.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.data.staff.splice(idx, 1);
    this.save();
    return true;
  }

  public generateUniqueVerificationToken(): string {
    let token = '';
    let exists = true;
    let attempts = 0;
    while (exists && attempts < 20) {
      token = generateSecureToken(this.data.settings.staffIdPrefix || 'GUE');
      exists = this.data.verificationTokens.some((t) => t.token === token);
      attempts++;
    }
    return token;
  }

  public regenerateStaffToken(staffId: string, revokedBy: string, reason?: string) {
    const staffMember = this.getStaffById(staffId);
    if (!staffMember) return null;

    // Revoke old token if any
    if (staffMember.verificationToken) {
      const oldToken = this.data.verificationTokens.find((t) => t.token === staffMember.verificationToken);
      if (oldToken) {
        oldToken.status = 'REVOKED';
        oldToken.revokedAt = new Date().toISOString();
        oldToken.revokedBy = revokedBy;
        oldToken.revocationReason = reason || 'Admin requested credential re-issuance';
      }
    }

    const newToken = this.generateUniqueVerificationToken();
    const tokenRecord: VerificationToken = {
      id: `tok-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      staffId: staffMember.id,
      token: newToken,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    this.data.verificationTokens.push(tokenRecord);

    staffMember.verificationToken = newToken;
    staffMember.verificationStatus = 'ACTIVE';
    staffMember.updatedAt = new Date().toISOString();
    this.save();

    return { staff: staffMember, newToken };
  }

  public revokeStaffToken(staffId: string, revokedBy: string, reason: string) {
    const staffMember = this.getStaffById(staffId);
    if (!staffMember || !staffMember.verificationToken) return null;

    const tokenRecord = this.data.verificationTokens.find((t) => t.token === staffMember.verificationToken);
    if (tokenRecord) {
      tokenRecord.status = 'REVOKED';
      tokenRecord.revokedAt = new Date().toISOString();
      tokenRecord.revokedBy = revokedBy;
      tokenRecord.revocationReason = reason;
    }

    staffMember.verificationStatus = 'REVOKED';
    staffMember.updatedAt = new Date().toISOString();
    this.save();
    return staffMember;
  }

  // Verification Logs
  public logVerification(log: Omit<VerificationLog, 'id' | 'verifiedAt'>) {
    const fullLog: VerificationLog = {
      ...log,
      id: `vlog-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      verifiedAt: new Date().toISOString(),
    };
    this.data.verificationLogs.unshift(fullLog);
    // Keep last 1000 logs for retention policy
    if (this.data.verificationLogs.length > 1000) {
      this.data.verificationLogs = this.data.verificationLogs.slice(0, 1000);
    }
    this.save();
    return fullLog;
  }

  public getVerificationLogs(limit = 100) {
    return this.data.verificationLogs.slice(0, limit);
  }

  // Audit Logs
  public logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const fullLog: AuditLog = {
      ...log,
      id: `alog-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(fullLog);
    if (this.data.auditLogs.length > 2000) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 2000);
    }
    this.save();
    return fullLog;
  }

  public getAuditLogs(limit = 100) {
    return this.data.auditLogs.slice(0, limit);
  }

  // Documents
  public getDocumentsByStaffId(staffId: string) {
    return this.data.documents.filter((d) => d.staffId === staffId);
  }

  public addDocument(doc: StaffDocument) {
    this.data.documents.push(doc);
    this.save();
    return doc;
  }

  public deleteDocument(id: string) {
    const idx = this.data.documents.findIndex((d) => d.id === id);
    if (idx === -1) return false;
    this.data.documents.splice(idx, 1);
    this.save();
    return true;
  }

  // Settings
  public getSettings(): SystemSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<SystemSettings>) {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
    return this.data.settings;
  }

  public exportBackup(): string {
    return JSON.stringify(this.data, null, 2);
  }

  public importBackup(backupJson: string): boolean {
    try {
      const parsed = JSON.parse(backupJson);
      if (parsed.users && parsed.staff && parsed.settings) {
        this.data = parsed;
        this.save();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

export const db = new Database();
