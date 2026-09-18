import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Department, Unit, Role } from '../types/index.js';
import { Building2, Plus, Users, Check, X, Layers } from 'lucide-react';

interface DepartmentsPageProps {
  userRole?: Role;
}

export const DepartmentsPage: React.FC<DepartmentsPageProps> = ({ userRole = 'VIEWER' }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDept, setNewDept] = useState({
    name: '',
    code: '',
    headOfDepartment: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const canEdit = ['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN'].includes(userRole);

  const loadData = () => {
    setLoading(true);
    api
      .getDepartments()
      .then((res) => {
        setDepartments(res.departments || []);
        setUnits(res.units || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.name || !newDept.code) return;

    setSaving(true);
    try {
      await api.createDepartment({
        name: newDept.name,
        code: newDept.code.toUpperCase(),
        headOfDepartment: newDept.headOfDepartment,
        description: newDept.description,
      });
      setNewDept({ name: '', code: '', headOfDepartment: '', description: '' });
      setIsAddOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Departments &amp; Institutional Units
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Academic divisions, vocational training units, and administrative directorates at Wannune Skills Training Centre.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center space-x-1.5 bg-[#0f3a5d] hover:bg-[#164e7d] text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        )}
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => {
          const deptUnits = units.filter((u) => u.departmentId === dept.id);
          return (
            <div
              key={dept.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-[#0f3a5d]/10 text-[#0f3a5d] px-2 py-0.5 rounded">
                    CODE: {dept.code}
                  </span>
                  <div className="flex items-center space-x-1 text-slate-500 text-xs">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{deptUnits.length} Units</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {dept.description || 'Institutional department of GUE Educational Limited.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">
                    Head of Department (HOD)
                  </span>
                  <span className="font-semibold text-slate-800">
                    {dept.headOfDepartment || 'Office of the Director'}
                  </span>
                </div>

                {/* Units breakdown */}
                {deptUnits.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">
                      Sections / Units
                    </span>
                    <div className="space-y-1">
                      {deptUnits.map((u) => (
                        <div
                          key={u.id}
                          className="bg-slate-50 px-2 py-1 rounded text-[11px] text-slate-700 flex items-center justify-between"
                        >
                          <span className="font-medium">{u.name}</span>
                          <span className="font-mono text-[9px] text-slate-400">{u.code}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 px-5 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>ID Prefix: <strong className="font-mono text-slate-800">GUE/{dept.code}/...</strong></span>
                <span className="text-emerald-700 font-semibold">Active Division</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Department Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-[#0f3a5d] text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Add New Department</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDept} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  placeholder="e.g. Electrical &amp; Solar Installation"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f3a5d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Department Code (3-4 Letters, Used in Staff ID) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={newDept.code}
                  onChange={(e) => setNewDept({ ...newDept, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. ESI"
                  className="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f3a5d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Head of Department / Lead Instructor
                </label>
                <input
                  type="text"
                  value={newDept.headOfDepartment}
                  onChange={(e) => setNewDept({ ...newDept, headOfDepartment: e.target.value })}
                  placeholder="e.g. Engr. T. J. Iorliam"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f3a5d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newDept.description}
                  onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                  placeholder="Vocational training scope and functions..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f3a5d]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0f3a5d] hover:bg-[#164e7d] rounded-lg shadow-sm"
                >
                  {saving ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
