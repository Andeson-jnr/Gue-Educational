import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Staff, Department, Unit, EmploymentStatus, EmploymentType } from '../types/index.js';
import {
  User,
  Building,
  GraduationCap,
  FileCheck,
  ArrowLeft,
  Save,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Camera,
} from 'lucide-react';

interface StaffFormProps {
  staffIdToEdit?: string;
  onNavigate: (tab: any, params?: any) => void;
}

export const StaffForm: React.FC<StaffFormProps> = ({ staffIdToEdit, onNavigate }) => {
  const isEditing = !!staffIdToEdit;
  const [departments, setDepartments] = useState<Department[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    dateOfBirth: '1990-01-01',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    phone: '+234 803 000 0000',
    email: '',
    residentialAddress: 'Wannune, Tarka LGA, Benue State',
    departmentId: 'dept-stc',
    unitId: 'unit-stc-1',
    designation: '',
    employmentType: 'FULL_TIME' as EmploymentType,
    dateOfAppointment: new Date().toISOString().slice(0, 10),
    employmentStatus: 'ACTIVE' as EmploymentStatus,
    highestQualification: 'B.Sc / HND',
    certifications: '',
    specialisation: '',
    employeeNumber: '',
    appointmentRef: '',
    notes: '',
  });

  const [suggestedStaffId, setSuggestedStaffId] = useState('GUE/STC/2026/001');

  useEffect(() => {
    api
      .getDepartments()
      .then((res) => {
        setDepartments(res.departments || []);
        setUnits(res.units || []);
        if (res.departments.length > 0 && !isEditing) {
          setFormData((prev) => ({ ...prev, departmentId: res.departments[0].id }));
        }
      })
      .catch((err) => console.error(err));
  }, [isEditing]);

  // Load staff if editing
  useEffect(() => {
    if (isEditing && staffIdToEdit) {
      setLoading(true);
      api
        .getStaffById(staffIdToEdit)
        .then((res) => {
          const s = res.staff;
          setFormData({
            firstName: s.firstName || '',
            middleName: s.middleName || '',
            lastName: s.lastName || '',
            gender: (s.gender as any) || 'MALE',
            dateOfBirth: s.dateOfBirth || '',
            photoUrl: s.photoUrl || '',
            phone: s.phone || '',
            email: s.email || '',
            residentialAddress: s.address || '',
            departmentId: s.departmentId || '',
            unitId: s.unitId || '',
            designation: s.designation || '',
            employmentType: s.employmentType || 'FULL_TIME',
            dateOfAppointment: s.dateOfAppointment || '',
            employmentStatus: s.employmentStatus || 'ACTIVE',
            highestQualification: s.highestQualification || '',
            certifications: s.certifications || '',
            specialisation: s.specialisation || '',
            employeeNumber: s.employeeNumber || '',
            appointmentRef: s.appointmentRef || '',
            notes: (s as any).notes || '',
          });
          setSuggestedStaffId(s.staffId);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [isEditing, staffIdToEdit]);

  // Auto-generate Staff ID preview when department changes (if new)
  useEffect(() => {
    if (!isEditing && formData.departmentId) {
      const selectedDept = departments.find((d) => d.id === formData.departmentId);
      const code = selectedDept ? selectedDept.code : 'STC';
      api
        .getNextStaffId(code)
        .then((res) => setSuggestedStaffId(res.nextStaffId))
        .catch(() => {});
    }
  }, [formData.departmentId, departments, isEditing]);

  const filteredUnits = units.filter((u) => u.departmentId === formData.departmentId);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name are mandatory.');
      return;
    }
    if (!formData.designation.trim()) {
      setError('Designation / Job Title is mandatory.');
      return;
    }

    setSaving(true);
    try {
      const staffPayload: any = {
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim(),
        lastName: formData.lastName.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        photoUrl: formData.photoUrl,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.residentialAddress.trim(),
        departmentId: formData.departmentId,
        unitId: formData.unitId,
        designation: formData.designation.trim(),
        employmentType: formData.employmentType,
        dateOfAppointment: formData.dateOfAppointment,
        employmentStatus: formData.employmentStatus,
        highestQualification: formData.highestQualification.trim(),
        certifications: formData.certifications.trim(),
        specialisation: formData.specialisation.trim(),
        employeeNumber: formData.employeeNumber.trim(),
        appointmentRef: formData.appointmentRef.trim(),
      };

      if (isEditing && staffIdToEdit) {
        await api.updateStaff(staffIdToEdit, staffPayload);
        setSuccessMessage('Staff record updated successfully.');
        setTimeout(() => {
          onNavigate('staff-detail', { staffId: staffIdToEdit });
        }, 1200);
      } else {
        const res = await api.createStaff(staffPayload);
        setSuccessMessage(`Staff record created successfully with ID ${res.staff.staffId}!`);
        setTimeout(() => {
          onNavigate('id-cards', { staffId: res.staff.id });
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save staff record');
    } finally {
      setSaving(false);
    }
  };

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('staff')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isEditing ? 'Edit Staff Identity Record' : 'Register New Institutional Staff'}
            </h1>
            <p className="text-xs text-slate-500">
              GUE Educational Limited Skills Training Centre • Wannune, Benue State
            </p>
          </div>
        </div>

        {/* Live ID Preview badge */}
        <div className="text-right">
          <div className="text-[10px] uppercase font-bold text-slate-400">Assigned Staff ID</div>
          <div className="font-mono font-black text-[#0f3a5d] text-sm bg-slate-100 px-2.5 py-1 rounded border border-slate-300">
            {suggestedStaffId}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: PERSONAL INFORMATION */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 text-[#0f3a5d]">
            <User className="w-5 h-5 text-[#0f3a5d]" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              1. Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="e.g. Terungwa"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Middle Name
              </label>
              <input
                type="text"
                value={formData.middleName}
                onChange={(e) => handleChange('middleName', e.target.value)}
                placeholder="e.g. David"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Last Name (Surname) *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="e.g. Akaa"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Date of Birth <span className="text-slate-400 font-normal">(Confidential)</span>
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Photograph URL
              </label>
              <input
                type="url"
                value={formData.photoUrl}
                onChange={(e) => handleChange('photoUrl', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
              />
            </div>
          </div>

          {/* Quick Photo Presets */}
          <div className="flex items-center space-x-2 pt-2">
            <span className="text-xs text-slate-500 font-medium">Quick Photo Selector:</span>
            <div className="flex items-center space-x-2">
              {sampleAvatars.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt="avatar"
                  onClick={() => handleChange('photoUrl', url)}
                  className={`w-7 h-7 rounded-full object-cover cursor-pointer border-2 hover:scale-110 transition ${
                    formData.photoUrl === url ? 'border-[#0f3a5d] ring-2 ring-[#0f3a5d]/30' : 'border-slate-200'
                  }`}
                  referrerPolicy="no-referrer"
                />
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 2: CONTACT & RESIDENCE */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 text-[#0f3a5d]">
            <Building className="w-5 h-5 text-[#0f3a5d]" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              2. Contact Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="staff.name@gue.edu.ng"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Official Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+234 803..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Residential Address <span className="text-slate-400 font-normal">(Confidential)</span>
              </label>
              <input
                type="text"
                value={formData.residentialAddress}
                onChange={(e) => handleChange('residentialAddress', e.target.value)}
                placeholder="Wannune, Tarka LGA, Benue State"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: EMPLOYMENT & INSTITUTIONAL ASSIGNMENT */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 text-[#0f3a5d]">
            <FileCheck className="w-5 h-5 text-[#0f3a5d]" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              3. Employment &amp; Institutional Assignment
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Department *
              </label>
              <select
                required
                value={formData.departmentId}
                onChange={(e) => handleChange('departmentId', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Unit / Training Section
              </label>
              <select
                value={formData.unitId}
                onChange={(e) => handleChange('unitId', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
              >
                <option value="">-- General Unit --</option>
                {filteredUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Designation / Job Title *
              </label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => handleChange('designation', e.target.value)}
                placeholder="e.g. Senior Vocational Instructor"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Employment Type
              </label>
              <select
                value={formData.employmentType}
                onChange={(e) => handleChange('employmentType', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
              >
                <option value="FULL_TIME">Full-Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="ADJUNCT">Adjunct / Visiting</option>
                <option value="INTERN">Intern / Trainee</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Date of Appointment
              </label>
              <input
                type="date"
                value={formData.dateOfAppointment}
                onChange={(e) => handleChange('dateOfAppointment', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Employment Status *
              </label>
              <select
                value={formData.employmentStatus}
                onChange={(e) => handleChange('employmentStatus', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
              >
                <option value="ACTIVE">ACTIVE — Will pass public QR verification</option>
                <option value="INACTIVE">INACTIVE — Blocked from verification</option>
                <option value="SUSPENDED">SUSPENDED — Temporary hold</option>
                <option value="ON_LEAVE">ON_LEAVE — Sabbatical / Approved Leave</option>
                <option value="TRANSFERRED">TRANSFERRED</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: QUALIFICATIONS */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 text-[#0f3a5d]">
            <GraduationCap className="w-5 h-5 text-[#0f3a5d]" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              4. Academic &amp; Professional Qualifications
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Highest Academic Qualification
              </label>
              <input
                type="text"
                value={formData.highestQualification}
                onChange={(e) => handleChange('highestQualification', e.target.value)}
                placeholder="e.g. B.Tech Computer Engineering"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Area of Specialisation
              </label>
              <input
                type="text"
                value={formData.specialisation}
                onChange={(e) => handleChange('specialisation', e.target.value)}
                placeholder="e.g. Solar Power Installation &amp; Grid"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Professional Certifications
              </label>
              <input
                type="text"
                value={formData.certifications}
                onChange={(e) => handleChange('certifications', e.target.value)}
                placeholder="e.g. COREN, NABTEB, CISCO"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => onNavigate('staff')}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition"
          >
            Cancel
          </button>
          <button
            id="btn-save-staff"
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#0f3a5d] hover:bg-[#164e7d] disabled:opacity-50 text-white font-bold text-sm rounded-lg shadow-sm transition flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : isEditing ? 'Update Staff Record' : 'Enroll Staff & Generate ID'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
