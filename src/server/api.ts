import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { authenticateToken, requireRoles, signToken, AuthRequest } from './auth.js';
import { generateQrDataUrl } from './qr.js';
import {
  Staff,
  Role,
  EmploymentStatus,
  PublicVerificationResult,
  StaffDocument,
} from '../types/index.js';

export const apiRouter = express.Router();

// Helper to get client IP
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

// -------------------------------------------------------------
// 1. PUBLIC VERIFICATION (NO AUTH REQUIRED)
// -------------------------------------------------------------
apiRouter.get('/verify/:token', async (req: Request, res: Response) => {
  const token = req.params.token.trim().toUpperCase();
  const ipAddress = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'Unknown Device';

  const settings = db.getSettings();
  const staffMember = db.getStaffByToken(token);

  if (!staffMember) {
    // Log invalid attempt
    db.logVerification({
      verificationToken: token,
      statusResult: 'INVALID',
      ipAddress,
      userAgent,
    });

    const result: PublicVerificationResult = {
      valid: false,
      codeStatus: 'INVALID',
      message: 'This verification code could not be found in the GUE Educational Limited staff verification system. Please contact the organisation for confirmation.',
      verificationId: token,
      verifiedAt: new Date().toISOString(),
      institution: {
        name: settings.orgName,
        centre: settings.trainingCentreName,
        rc: settings.orgRc,
        tin: settings.orgTin,
        address: settings.address,
        verifiedBy: settings.orgName,
      },
    };
    return res.json(result);
  }

  // Check if token itself is marked revoked
  const tokenRecord = db.getData().verificationTokens.find((t) => t.token === token);
  if (tokenRecord && tokenRecord.status === 'REVOKED') {
    db.logVerification({
      verificationToken: token,
      staffId: staffMember.id,
      staffName: `${staffMember.firstName} ${staffMember.lastName}`,
      department: staffMember.departmentName,
      statusResult: 'REVOKED',
      ipAddress,
      userAgent,
    });

    const result: PublicVerificationResult = {
      valid: false,
      codeStatus: 'REVOKED',
      message: 'This institutional verification credential was formally revoked by GUE Educational Limited administration.',
      verificationId: token,
      verifiedAt: new Date().toISOString(),
      institution: {
        name: settings.orgName,
        centre: settings.trainingCentreName,
        rc: settings.orgRc,
        tin: settings.orgTin,
        address: settings.address,
        verifiedBy: settings.orgName,
      },
    };
    return res.json(result);
  }

  // Evaluate live employment status in database
  const status = staffMember.employmentStatus;

  // Safe public staff details (Strictly NO NIN, BVN, Bank, Salary, Home Address, Phone, DOB, Next of Kin)
  const safeStaffPayload = {
    name: `${staffMember.firstName} ${staffMember.middleName ? staffMember.middleName + ' ' : ''}${staffMember.lastName}`,
    staffId: staffMember.staffId,
    designation: staffMember.designation,
    department: staffMember.departmentName || 'GUE Educational Limited',
    institution: staffMember.institution || settings.trainingCentreName,
    employmentStatus: status,
    photoUrl: staffMember.photoUrl || '',
    dateOfAppointment: staffMember.dateOfAppointment,
  };

  if (status === 'ACTIVE') {
    db.logVerification({
      verificationToken: token,
      staffId: staffMember.id,
      staffName: safeStaffPayload.name,
      department: staffMember.departmentName,
      statusResult: 'VERIFIED',
      ipAddress,
      userAgent,
    });

    const result: PublicVerificationResult = {
      valid: true,
      codeStatus: 'VERIFIED',
      message: 'This verification confirms that the presented staff identification record is currently registered in the organisation\'s staff verification system.',
      verificationId: token,
      verifiedAt: new Date().toISOString(),
      staff: safeStaffPayload,
      institution: {
        name: settings.orgName,
        centre: settings.trainingCentreName,
        rc: settings.orgRc,
        tin: settings.orgTin,
        address: settings.address,
        verifiedBy: settings.orgName,
      },
    };
    return res.json(result);
  }

  if (status === 'INACTIVE') {
    db.logVerification({
      verificationToken: token,
      staffId: staffMember.id,
      staffName: safeStaffPayload.name,
      department: staffMember.departmentName,
      statusResult: 'INACTIVE',
      ipAddress,
      userAgent,
    });

    const result: PublicVerificationResult = {
      valid: false,
      codeStatus: 'INACTIVE',
      message: 'This staff identification record is no longer recognised as belonging to an active staff member of GUE Educational Limited.',
      verificationId: token,
      verifiedAt: new Date().toISOString(),
      staff: {
        ...safeStaffPayload,
        photoUrl: '', // Redact photo on inactive card
      },
      institution: {
        name: settings.orgName,
        centre: settings.trainingCentreName,
        rc: settings.orgRc,
        tin: settings.orgTin,
        address: settings.address,
        verifiedBy: settings.orgName,
      },
    };
    return res.json(result);
  }

  if (status === 'SUSPENDED') {
    db.logVerification({
      verificationToken: token,
      staffId: staffMember.id,
      staffName: safeStaffPayload.name,
      department: staffMember.departmentName,
      statusResult: 'SUSPENDED',
      ipAddress,
      userAgent,
    });

    const result: PublicVerificationResult = {
      valid: false,
      codeStatus: 'SUSPENDED',
      message: 'This staff record is not currently active. Institutional credentials are held in suspension.',
      verificationId: token,
      verifiedAt: new Date().toISOString(),
      staff: safeStaffPayload,
      institution: {
        name: settings.orgName,
        centre: settings.trainingCentreName,
        rc: settings.orgRc,
        tin: settings.orgTin,
        address: settings.address,
        verifiedBy: settings.orgName,
      },
    };
    return res.json(result);
  }

  if (status === 'ON_LEAVE') {
    db.logVerification({
      verificationToken: token,
      staffId: staffMember.id,
      staffName: safeStaffPayload.name,
      department: staffMember.departmentName,
      statusResult: 'ON_LEAVE',
      ipAddress,
      userAgent,
    });

    const result: PublicVerificationResult = {
      valid: true,
      codeStatus: 'ON_LEAVE',
      message: 'STAFF RECORD VALID — CURRENTLY ON APPROVED LEAVE',
      verificationId: token,
      verifiedAt: new Date().toISOString(),
      staff: safeStaffPayload,
      institution: {
        name: settings.orgName,
        centre: settings.trainingCentreName,
        rc: settings.orgRc,
        tin: settings.orgTin,
        address: settings.address,
        verifiedBy: settings.orgName,
      },
    };
    return res.json(result);
  }

  // Default fallback for TRANSFERRED or other statuses
  db.logVerification({
    verificationToken: token,
    staffId: staffMember.id,
    staffName: safeStaffPayload.name,
    department: staffMember.departmentName,
    statusResult: 'TRANSFERRED',
    ipAddress,
    userAgent,
  });

  return res.json({
    valid: false,
    codeStatus: 'TRANSFERRED',
    message: 'Staff member has been transferred or reassigned to another institutional jurisdiction.',
    verificationId: token,
    verifiedAt: new Date().toISOString(),
    staff: safeStaffPayload,
    institution: {
      name: settings.orgName,
      centre: settings.trainingCentreName,
      rc: settings.orgRc,
      tin: settings.orgTin,
      address: settings.address,
      verifiedBy: settings.orgName,
    },
  });
});

// -------------------------------------------------------------
// 2. AUTHENTICATION & USERS
// -------------------------------------------------------------
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const ipAddress = getClientIp(req);

  if (!username || !password) {
    return res.status(400).json({ error: 'Username/Email and Password are required.' });
  }

  const user = db.findUserByUsername(username);
  if (!user) {
    db.logAudit({
      adminId: 'ANONYMOUS',
      adminName: username,
      adminRole: 'VIEWER',
      action: 'FAILED LOGIN',
      details: `Failed login attempt for non-existent identifier: ${username}`,
      ipAddress,
    });
    return res.status(401).json({ error: 'Invalid login credentials.' });
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    db.logAudit({
      adminId: user.id,
      adminName: user.fullName,
      adminRole: user.role,
      action: 'FAILED LOGIN',
      details: `Failed password verification for user ${user.username}`,
      ipAddress,
    });
    return res.status(401).json({ error: 'Invalid login credentials.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: 'This administrator account has been deactivated.' });
  }

  // Update last login
  const updated = db.updateUser(user.id, { lastLogin: new Date().toISOString() });
  const token = signToken(user);

  db.logAudit({
    adminId: user.id,
    adminName: user.fullName,
    adminRole: user.role,
    action: 'ADMIN LOGIN',
    details: `Administrator logged into institutional portal from ${ipAddress}`,
    ipAddress,
  });

  return res.json({
    token,
    user: updated,
  });
});

apiRouter.get('/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

apiRouter.post('/auth/logout', authenticateToken, (req: AuthRequest, res: Response) => {
  db.logAudit({
    adminId: req.user!.id,
    adminName: req.user!.fullName,
    adminRole: req.user!.role,
    action: 'ADMIN LOGOUT',
    details: 'Administrator logged out of session',
    ipAddress: getClientIp(req),
  });
  res.json({ success: true });
});

// Admin management (SUPER_ADMIN only)
apiRouter.get('/auth/users', authenticateToken, requireRoles(['SUPER_ADMIN']), (req: Request, res: Response) => {
  res.json({ users: db.getAllUsers() });
});

apiRouter.post('/auth/users', authenticateToken, requireRoles(['SUPER_ADMIN']), (req: AuthRequest, res: Response) => {
  const { username, email, fullName, role, password } = req.body;
  if (!username || !email || !fullName || !role || !password) {
    return res.status(400).json({ error: 'Missing required administrator fields.' });
  }

  if (db.findUserByUsername(username)) {
    return res.status(400).json({ error: 'Username or email already exists.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser = db.createUser({
    id: `usr-${Date.now()}`,
    username: username.toLowerCase().trim(),
    email: email.toLowerCase().trim(),
    fullName: fullName.trim(),
    role: role as Role,
    createdAt: new Date().toISOString(),
    isActive: true,
    passwordHash,
  });

  db.logAudit({
    adminId: req.user!.id,
    adminName: req.user!.fullName,
    adminRole: req.user!.role,
    action: 'ADMIN CREATED ADMINISTRATOR',
    details: `Created new ${role} user account for ${fullName} (${username})`,
    ipAddress: getClientIp(req),
  });

  res.status(201).json({ user: newUser });
});

apiRouter.patch('/auth/users/:id', authenticateToken, requireRoles(['SUPER_ADMIN']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role, isActive, password, fullName } = req.body;

  const updates: any = {};
  if (role) updates.role = role;
  if (typeof isActive === 'boolean') updates.isActive = isActive;
  if (fullName) updates.fullName = fullName;
  if (password && password.trim().length >= 6) {
    const salt = bcrypt.genSaltSync(10);
    updates.passwordHash = bcrypt.hashSync(password, salt);
  }

  const updated = db.updateUser(id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'User not found.' });
  }

  db.logAudit({
    adminId: req.user!.id,
    adminName: req.user!.fullName,
    adminRole: req.user!.role,
    action: 'ADMIN UPDATED ADMINISTRATOR',
    details: `Updated account settings for user ID ${id}`,
    ipAddress: getClientIp(req),
  });

  res.json({ user: updated });
});

// -------------------------------------------------------------
// 3. STAFF MANAGEMENT APIS
// -------------------------------------------------------------
// List staff with search, filters, pagination
apiRouter.get('/staff', authenticateToken, (req: Request, res: Response) => {
  let list = [...db.getAllStaff()];

  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const departmentId = typeof req.query.departmentId === 'string' ? req.query.departmentId : '';
  const status = typeof req.query.status === 'string' ? req.query.status : '';
  const employmentType = typeof req.query.employmentType === 'string' ? req.query.employmentType : '';
  const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'name';
  const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';

  if (search) {
    list = list.filter((s) => {
      const fullName = `${s.firstName} ${s.middleName || ''} ${s.lastName}`.toLowerCase();
      const staffId = s.staffId.toLowerCase();
      const token = (s.verificationToken || '').toLowerCase();
      const designation = s.designation.toLowerCase();
      const email = s.email.toLowerCase();
      return (
        fullName.includes(search) ||
        staffId.includes(search) ||
        token.includes(search) ||
        designation.includes(search) ||
        email.includes(search)
      );
    });
  }

  if (departmentId && departmentId !== 'ALL') {
    list = list.filter((s) => s.departmentId === departmentId);
  }

  if (status && status !== 'ALL') {
    list = list.filter((s) => s.employmentStatus === status);
  }

  if (employmentType && employmentType !== 'ALL') {
    list = list.filter((s) => s.employmentType === employmentType);
  }

  // Sorting
  list.sort((a, b) => {
    let valA = '';
    let valB = '';
    if (sortBy === 'staffId') {
      valA = a.staffId;
      valB = b.staffId;
    } else if (sortBy === 'date') {
      valA = a.dateOfAppointment;
      valB = b.dateOfAppointment;
    } else {
      valA = `${a.lastName} ${a.firstName}`;
      valB = `${b.lastName} ${b.firstName}`;
    }

    if (sortOrder === 'desc') {
      return valB.localeCompare(valA);
    }
    return valA.localeCompare(valB);
  });

  res.json({
    total: list.length,
    staff: list,
  });
});

// Next staff ID suggestion
apiRouter.get('/staff/next-id', authenticateToken, (req: Request, res: Response) => {
  const deptCode = typeof req.query.deptCode === 'string' ? req.query.deptCode : 'STC';
  const nextId = db.generateNextStaffId(deptCode);
  res.json({ nextStaffId: nextId });
});

// Get single staff by ID
apiRouter.get('/staff/:id', authenticateToken, (req: Request, res: Response) => {
  const staff = db.getStaffById(req.params.id);
  if (!staff) {
    return res.status(404).json({ error: 'Staff record not found.' });
  }
  res.json({ staff });
});

// Create staff
apiRouter.post(
  '/staff',
  authenticateToken,
  requireRoles(['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN']),
  (req: AuthRequest, res: Response) => {
    const data = req.body;
    const ipAddress = getClientIp(req);

    // Validate essential fields
    if (!data.firstName || !data.lastName || !data.designation || !data.departmentId) {
      return res.status(400).json({ error: 'First Name, Last Name, Designation, and Department are required.' });
    }

    // Auto-resolve department name
    const dept = db.getDepartmentById(data.departmentId);
    const departmentName = dept ? dept.name : 'Skills Training Centre';
    const deptCode = dept ? dept.code : 'STC';

    // Auto-generate staff ID if not provided
    let staffId = data.staffId ? data.staffId.trim() : '';
    if (!staffId) {
      staffId = db.generateNextStaffId(deptCode);
    }

    // Check duplicate staff ID
    const existing = db.getStaffByStaffId(staffId);
    if (existing) {
      return res.status(409).json({ error: `Staff ID "${staffId}" is already assigned to another staff member.` });
    }

    // Check duplicate email if provided
    if (data.email) {
      const emailDup = db.getAllStaff().find((s) => s.email.toLowerCase() === data.email.toLowerCase().trim());
      if (emailDup) {
        return res.status(409).json({ error: `Staff email "${data.email}" is already registered.` });
      }
    }

    const settings = db.getSettings();
    const newStaff: Staff = {
      id: `stf-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      staffId,
      firstName: data.firstName.trim(),
      middleName: (data.middleName || '').trim(),
      lastName: data.lastName.trim(),
      gender: data.gender || 'MALE',
      dateOfBirth: data.dateOfBirth || '',
      photoUrl: data.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      phone: data.phone || '',
      email: (data.email || '').trim().toLowerCase(),
      address: data.address || '',
      designation: data.designation.trim(),
      departmentId: data.departmentId,
      departmentName,
      unitId: data.unitId || '',
      unitName: data.unitName || '',
      employmentType: data.employmentType || 'FULL_TIME',
      employmentStatus: data.employmentStatus || 'ACTIVE',
      dateOfAppointment: data.dateOfAppointment || new Date().toISOString().split('T')[0],
      supervisor: data.supervisor || dept?.headOfDepartment || 'Director of Training',
      institution: settings.trainingCentreName,
      staffCategory: data.staffCategory || 'TECHNICAL',
      highestQualification: data.highestQualification || 'B.Sc / HND Equivalent',
      certifications: data.certifications || '',
      specialisation: data.specialisation || 'Vocational Training & Institutional Instruction',
      employeeNumber: data.employeeNumber || `EMP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      appointmentRef: data.appointmentRef || `GUE/HR/APP/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      createdBy: `${req.user!.fullName} (${req.user!.role})`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = db.createStaff(newStaff, req.user!.fullName);

    db.logAudit({
      adminId: req.user!.id,
      adminName: req.user!.fullName,
      adminRole: req.user!.role,
      action: 'ADMIN CREATED STAFF',
      staffId: saved.id,
      staffName: `${saved.firstName} ${saved.lastName}`,
      details: `Registered new staff member ${saved.staffId} (${saved.designation}) in ${saved.departmentName}. Verification Token: ${saved.verificationToken}`,
      ipAddress,
    });

    res.status(201).json({ staff: saved });
  }
);

// Update staff
apiRouter.put(
  '/staff/:id',
  authenticateToken,
  requireRoles(['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN']),
  (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const existing = db.getStaffById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Staff record not found.' });
    }

    const updates = { ...req.body };
    delete updates.id;
    delete updates.verificationToken; // Keep token modification to designated endpoints

    // Resolve dept name if dept changed
    if (updates.departmentId && updates.departmentId !== existing.departmentId) {
      const dept = db.getDepartmentById(updates.departmentId);
      if (dept) updates.departmentName = dept.name;
    }

    const updated = db.updateStaff(id, updates);

    db.logAudit({
      adminId: req.user!.id,
      adminName: req.user!.fullName,
      adminRole: req.user!.role,
      action: 'ADMIN UPDATED STAFF',
      staffId: existing.id,
      staffName: `${existing.firstName} ${existing.lastName}`,
      details: `Updated personal and institutional profile details for ${existing.staffId}`,
      ipAddress: getClientIp(req),
    });

    res.json({ staff: updated });
  }
);

// Change staff employment status (ACTIVATE, DEACTIVATE, SUSPEND, ON_LEAVE, TRANSFERRED)
apiRouter.patch(
  '/staff/:id/status',
  authenticateToken,
  requireRoles(['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN']),
  (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!status || !reason) {
      return res.status(400).json({ error: 'Status and institutional reason are required.' });
    }

    const staffMember = db.getStaffById(id);
    if (!staffMember) {
      return res.status(404).json({ error: 'Staff record not found.' });
    }

    const previousStatus = staffMember.employmentStatus;
    const updated = db.updateStaff(id, {
      employmentStatus: status as EmploymentStatus,
      statusChangeReason: reason.trim(),
    });

    const actionName =
      status === 'INACTIVE'
        ? 'ADMIN DEACTIVATED STAFF'
        : status === 'ACTIVE'
        ? 'ADMIN ACTIVATED STAFF'
        : 'ADMIN UPDATED STAFF STATUS';

    db.logAudit({
      adminId: req.user!.id,
      adminName: req.user!.fullName,
      adminRole: req.user!.role,
      action: actionName,
      staffId: staffMember.id,
      staffName: `${staffMember.firstName} ${staffMember.lastName}`,
      details: `Status changed from ${previousStatus} to ${status}. Reason: ${reason}`,
      ipAddress: getClientIp(req),
    });

    res.json({ staff: updated });
  }
);

// Delete staff (SUPER_ADMIN only)
apiRouter.delete(
  '/staff/:id',
  authenticateToken,
  requireRoles(['SUPER_ADMIN']),
  (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const staff = db.getStaffById(id);
    if (!staff) {
      return res.status(404).json({ error: 'Staff record not found.' });
    }

    db.deleteStaff(id);

    db.logAudit({
      adminId: req.user!.id,
      adminName: req.user!.fullName,
      adminRole: req.user!.role,
      action: 'ADMIN DELETED STAFF RECORD',
      staffId: staff.id,
      staffName: `${staff.firstName} ${staff.lastName}`,
      details: `Permanently removed staff record ${staff.staffId} from the database.`,
      ipAddress: getClientIp(req),
    });

    res.json({ success: true, message: 'Staff record deleted.' });
  }
);

// -------------------------------------------------------------
// 4. QR CODE & VERIFICATION TOKEN GENERATION
// -------------------------------------------------------------
// Get QR code for staff member
apiRouter.get('/staff/:id/qr', authenticateToken, async (req: Request, res: Response) => {
  const staff = db.getStaffById(req.params.id);
  if (!staff || !staff.verificationToken) {
    return res.status(404).json({ error: 'Staff or verification token not found.' });
  }

  const settings = db.getSettings();
  const host = req.get('host');
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  
  // Prefer institutional verification domain if configured, or current live deployment URL
  const baseUrl = settings.verificationBaseUrl || `${protocol}://${host}`;
  const verificationUrl = `${baseUrl}/v/${staff.verificationToken}`;

  try {
    const qrDataUrl = await generateQrDataUrl(verificationUrl);
    res.json({
      qrDataUrl,
      verificationUrl,
      token: staff.verificationToken,
      status: staff.verificationStatus,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code.' });
  }
});

// Regenerate / re-issue token
apiRouter.post(
  '/staff/:id/regenerate-token',
  authenticateToken,
  requireRoles(['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN']),
  (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;
    const result = db.regenerateStaffToken(id, req.user!.fullName, reason);

    if (!result) {
      return res.status(404).json({ error: 'Staff member not found.' });
    }

    db.logAudit({
      adminId: req.user!.id,
      adminName: req.user!.fullName,
      adminRole: req.user!.role,
      action: 'ADMIN GENERATED ID',
      staffId: result.staff.id,
      staffName: `${result.staff.firstName} ${result.staff.lastName}`,
      details: `Issued new verification token ${result.newToken}. Reason: ${reason || 'Admin re-issuance'}`,
      ipAddress: getClientIp(req),
    });

    res.json({ staff: result.staff, token: result.newToken });
  }
);

// Revoke token
apiRouter.post(
  '/staff/:id/revoke-token',
  authenticateToken,
  requireRoles(['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN']),
  (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Revocation reason is required.' });
    }

    const staff = db.revokeStaffToken(id, req.user!.fullName, reason);
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found.' });
    }

    db.logAudit({
      adminId: req.user!.id,
      adminName: req.user!.fullName,
      adminRole: req.user!.role,
      action: 'ADMIN REVOKED TOKEN',
      staffId: staff.id,
      staffName: `${staff.firstName} ${staff.lastName}`,
      details: `Revoked verification token ${staff.verificationToken}. Reason: ${reason}`,
      ipAddress: getClientIp(req),
    });

    res.json({ staff });
  }
);

// Batch QR & ID cards query
apiRouter.post('/staff/batch-cards', authenticateToken, async (req: Request, res: Response) => {
  const { staffIds } = req.body;
  if (!Array.isArray(staffIds) || staffIds.length === 0) {
    return res.status(400).json({ error: 'Array of staff IDs is required.' });
  }

  const settings = db.getSettings();
  const host = req.get('host');
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const baseUrl = settings.verificationBaseUrl || `${protocol}://${host}`;

  const results = [];
  for (const id of staffIds) {
    const staff = db.getStaffById(id);
    if (staff) {
      const verificationUrl = `${baseUrl}/v/${staff.verificationToken}`;
      let qrDataUrl = '';
      try {
        qrDataUrl = await generateQrDataUrl(verificationUrl);
      } catch (e) {
        // Skip or empty
      }
      results.push({ staff, qrDataUrl, verificationUrl });
    }
  }

  res.json({ cards: results });
});

// CSV Import for staff records
apiRouter.post(
  '/staff/import-csv',
  authenticateToken,
  requireRoles(['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN']),
  (req: AuthRequest, res: Response) => {
    const { rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty CSV rows array.' });
    }

    const settings = db.getSettings();
    const imported: Staff[] = [];
    const errors: string[] = [];

    const depts = db.getDepartments();
    const defaultDept = depts[0];

    rows.forEach((row, idx) => {
      try {
        if (!row.first_name || !row.last_name) {
          errors.push(`Row ${idx + 1}: Missing first_name or last_name.`);
          return;
        }

        // Match department
        const matchedDept =
          depts.find(
            (d) =>
              d.name.toLowerCase().includes((row.department || '').toLowerCase()) ||
              d.code.toLowerCase() === (row.department || '').toLowerCase()
          ) || defaultDept;

        const staffId = db.generateNextStaffId(matchedDept.code);

        const newStaff: Staff = {
          id: `stf-imp-${Date.now()}-${idx}`,
          staffId,
          firstName: row.first_name.trim(),
          middleName: (row.middle_name || '').trim(),
          lastName: row.last_name.trim(),
          gender: (row.gender && ['MALE', 'FEMALE'].includes(row.gender.toUpperCase())) ? row.gender.toUpperCase() : 'MALE',
          dateOfBirth: row.date_of_birth || '1990-01-01',
          photoUrl: row.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          phone: row.phone || '',
          email: (row.email || '').trim().toLowerCase(),
          address: row.address || 'Wannune, Tarka LGA, Benue State',
          designation: row.designation || 'Training Instructor',
          departmentId: matchedDept.id,
          departmentName: matchedDept.name,
          unitId: '',
          unitName: row.unit || '',
          employmentType: (row.employment_type || 'FULL_TIME') as any,
          employmentStatus: (row.employment_status || 'ACTIVE') as any,
          dateOfAppointment: row.date_of_appointment || new Date().toISOString().split('T')[0],
          supervisor: matchedDept.headOfDepartment,
          institution: settings.trainingCentreName,
          staffCategory: 'TECHNICAL',
          highestQualification: row.highest_qualification || 'Degree / Equivalent',
          certifications: row.certifications || '',
          specialisation: row.specialisation || 'Vocational Instruction',
          employeeNumber: `EMP-${Date.now().toString().slice(-4)}-${idx + 1}`,
          appointmentRef: `GUE/HR/APP/${new Date().getFullYear()}/${idx + 10}`,
          createdBy: `${req.user!.fullName} (CSV Batch Import)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const saved = db.createStaff(newStaff, req.user!.fullName);
        imported.push(saved);
      } catch (err: any) {
        errors.push(`Row ${idx + 1}: ${err.message}`);
      }
    });

    db.logAudit({
      adminId: req.user!.id,
      adminName: req.user!.fullName,
      adminRole: req.user!.role,
      action: 'ADMIN BATCH CSV IMPORT',
      details: `Imported ${imported.length} staff records into institutional database. Failures: ${errors.length}`,
      ipAddress: getClientIp(req),
    });

    res.json({
      success: true,
      importedCount: imported.length,
      errors,
      imported,
    });
  }
);

// -------------------------------------------------------------
// 5. DEPARTMENTS
// -------------------------------------------------------------
apiRouter.get('/departments', authenticateToken, (req: Request, res: Response) => {
  res.json({ departments: db.getDepartments(), units: db.getUnits() });
});

apiRouter.post(
  '/departments',
  authenticateToken,
  requireRoles(['SUPER_ADMIN', 'DIRECTOR']),
  (req: AuthRequest, res: Response) => {
    const { name, code, headOfDepartment, description } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Department name and prefix code are required.' });
    }

    const newDept = db.createDepartment({
      id: `dept-${code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      headOfDepartment: (headOfDepartment || 'To be appointed').trim(),
      description: (description || '').trim(),
    });

    db.logAudit({
      adminId: req.user!.id,
      adminName: req.user!.fullName,
      adminRole: req.user!.role,
      action: 'ADMIN CREATED DEPARTMENT',
      details: `Created new institutional department ${newDept.name} (${newDept.code})`,
      ipAddress: getClientIp(req),
    });

    res.status(201).json({ department: newDept });
  }
);

// -------------------------------------------------------------
// 6. VERIFICATION LOGS & AUDIT LOGS
// -------------------------------------------------------------
apiRouter.get('/verification/logs', authenticateToken, (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string, 10) || 200;
  res.json({ logs: db.getVerificationLogs(limit) });
});

apiRouter.get('/verification/stats', authenticateToken, (req: Request, res: Response) => {
  try {
    const logs = db.getData().verificationLogs;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;
    let verifiedCount = 0;
    let invalidCount = 0;
    let inactiveCount = 0;

    logs.forEach((log) => {
      const logDate = new Date(log.verifiedAt);
      if (log.verifiedAt && log.verifiedAt.startsWith(todayStr)) todayCount++;
      if (logDate >= oneWeekAgo) weekCount++;
      if (logDate >= oneMonthAgo) monthCount++;

      if (log.statusResult === 'VERIFIED') verifiedCount++;
      else if (log.statusResult === 'INVALID') invalidCount++;
      else inactiveCount++;
    });

    res.json({
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      total: logs.length,
      breakdown: {
        verified: verifiedCount,
        invalid: invalidCount,
        inactiveOrSuspended: inactiveCount,
      },
      recent: logs.slice(0, 10),
    });
  } catch (err: any) {
    console.error('Error computing verification stats:', err);
    res.status(500).json({ error: err.message || 'Failed to compute verification statistics' });
  }
});

apiRouter.get('/audit-logs', authenticateToken, requireRoles(['SUPER_ADMIN', 'DIRECTOR']), (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string, 10) || 200;
  res.json({ logs: db.getAuditLogs(limit) });
});

// -------------------------------------------------------------
// 7. DOCUMENTS (PRIVATE - NEVER PUBLIC)
// -------------------------------------------------------------
apiRouter.get('/staff/:id/documents', authenticateToken, (req: Request, res: Response) => {
  const docs = db.getDocumentsByStaffId(req.params.id);
  res.json({ documents: docs });
});

apiRouter.post(
  '/staff/:id/documents',
  authenticateToken,
  requireRoles(['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN']),
  (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { docType, title, fileName, fileSize } = req.body;

    if (!title || !docType) {
      return res.status(400).json({ error: 'Document title and type are required.' });
    }

    const doc: StaffDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      staffId: id,
      docType,
      title: title.trim(),
      fileName: fileName || `${title.replace(/\s+/g, '_')}.pdf`,
      fileSize: fileSize || '500 KB',
      uploadedBy: req.user!.fullName,
      uploadedAt: new Date().toISOString(),
    };

    const saved = db.addDocument(doc);

    db.logAudit({
      adminId: req.user!.id,
      adminName: req.user!.fullName,
      adminRole: req.user!.role,
      action: 'ADMIN UPLOADED STAFF DOCUMENT',
      staffId: id,
      details: `Uploaded private document "${saved.title}" (${saved.docType})`,
      ipAddress: getClientIp(req),
    });

    res.status(201).json({ document: saved });
  }
);

apiRouter.delete(
  '/documents/:docId',
  authenticateToken,
  requireRoles(['SUPER_ADMIN', 'HR_ADMIN']),
  (req: AuthRequest, res: Response) => {
    const { docId } = req.params;
    const success = db.deleteDocument(docId);
    if (!success) {
      return res.status(404).json({ error: 'Document not found.' });
    }
    res.json({ success: true });
  }
);

// -------------------------------------------------------------
// 8. REPORTS & ANALYTICS
// -------------------------------------------------------------
apiRouter.get('/reports/summary', authenticateToken, (req: Request, res: Response) => {
  try {
    const staff = db.getAllStaff();
    const depts = db.getDepartments();

    const activeCount = staff.filter((s) => s.employmentStatus === 'ACTIVE').length;
    const inactiveCount = staff.filter((s) => s.employmentStatus === 'INACTIVE').length;
    const suspendedCount = staff.filter((s) => s.employmentStatus === 'SUSPENDED').length;
    const onLeaveCount = staff.filter((s) => s.employmentStatus === 'ON_LEAVE').length;
    const transferredCount = staff.filter((s) => s.employmentStatus === 'TRANSFERRED').length;

    const departmentCounts = depts.map((d) => ({
      name: d.name,
      code: d.code,
      count: staff.filter((s) => s.departmentId === d.id).length,
    }));

    const typeCounts = {
      FULL_TIME: staff.filter((s) => s.employmentType === 'FULL_TIME').length,
      PART_TIME: staff.filter((s) => s.employmentType === 'PART_TIME').length,
      CONTRACT: staff.filter((s) => s.employmentType === 'CONTRACT').length,
      ADJUNCT: staff.filter((s) => s.employmentType === 'ADJUNCT').length,
      INTERN: staff.filter((s) => s.employmentType === 'INTERN').length,
    };

    const idCardsIssued = staff.filter((s) => s.verificationToken).length;

    res.json({
      totalStaff: staff.length,
      activeStaff: activeCount,
      inactiveStaff: inactiveCount,
      suspendedStaff: suspendedCount,
      onLeaveStaff: onLeaveCount,
      transferredStaff: transferredCount,
      idCardsIssued,
      departmentCounts,
      typeCounts,
      recentStaff: staff.slice(-6).reverse(),
    });
  } catch (err: any) {
    console.error('Error computing reports summary:', err);
    res.status(500).json({ error: err.message || 'Failed to compute reports summary' });
  }
});

// -------------------------------------------------------------
// 9. SYSTEM SETTINGS & BRANDING
// -------------------------------------------------------------
apiRouter.get('/settings', (req: Request, res: Response) => {
  // Publicly readable for card branding and institutional header
  res.json({ settings: db.getSettings() });
});

apiRouter.put(
  '/settings',
  authenticateToken,
  requireRoles(['SUPER_ADMIN', 'DIRECTOR']),
  (req: AuthRequest, res: Response) => {
    const updates = req.body;
    const updated = db.updateSettings(updates);

    db.logAudit({
      adminId: req.user!.id,
      adminName: req.user!.fullName,
      adminRole: req.user!.role,
      action: 'ADMIN UPDATED SYSTEM SETTINGS',
      details: 'Modified institutional branding, address, or ID card configuration parameters.',
      ipAddress: getClientIp(req),
    });

    res.json({ settings: updated });
  }
);

apiRouter.get('/settings/backup', authenticateToken, requireRoles(['SUPER_ADMIN']), (req: Request, res: Response) => {
  const backup = db.exportBackup();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=gue_backup_${new Date().toISOString().split('T')[0]}.json`);
  res.send(backup);
});

apiRouter.post('/settings/restore', authenticateToken, requireRoles(['SUPER_ADMIN']), (req: AuthRequest, res: Response) => {
  const { backupJson } = req.body;
  if (!backupJson) {
    return res.status(400).json({ error: 'Backup JSON payload is required.' });
  }

  const success = db.importBackup(backupJson);
  if (!success) {
    return res.status(400).json({ error: 'Invalid backup structure. Restore failed.' });
  }

  db.logAudit({
    adminId: req.user!.id,
    adminName: req.user!.fullName,
    adminRole: req.user!.role,
    action: 'ADMIN RESTORED DATABASE BACKUP',
    details: 'System database restored from administrative backup archive.',
    ipAddress: getClientIp(req),
  });

  res.json({ success: true, message: 'Database restored successfully.' });
});
