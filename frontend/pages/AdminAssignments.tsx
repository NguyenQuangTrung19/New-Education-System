import React, { useState, useEffect, useCallback } from 'react';
import api from '../src/api/client';
import { User } from '../types';
import {
  Plus, Trash2, Pencil, X, AlertCircle, CheckCircle,
  Search, Filter, Users, BookOpen, Calendar, Clock, UserCheck,
  ChevronDown, Save, RefreshCcw, ClipboardList
} from 'lucide-react';

interface AdminAssignmentsProps {
  currentUser: User;
}

interface AssignmentRecord {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  subject?: { id: string; name: string; code: string };
  teacherId: string;
  teacher?: { id: string; user: { name: string } };
  classIds: string[];
  classes?: { id: string; name: string }[];
  dueDate: string;
  duration?: number;
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT';
  createdAt: string;
}

interface FormState {
  title: string;
  description: string;
  subjectId: string;
  teacherId: string;
  classIds: string[];
  dueDate: string;
  duration: number;
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT';
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  subjectId: '',
  teacherId: '',
  classIds: [],
  dueDate: '',
  duration: 45,
  status: 'ACTIVE',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  CLOSED: 'bg-gray-100 text-gray-600',
  DRAFT: 'bg-amber-100 text-amber-700',
};

const statusLabels: Record<string, string> = {
  ACTIVE: 'Active',
  CLOSED: 'Closed',
  DRAFT: 'Draft',
};

export const AdminAssignments: React.FC<AdminAssignmentsProps> = ({ currentUser }) => {
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [asgRes, tchRes, subRes, clsRes] = await Promise.all([
        api.get('/assignments'),
        api.get('/teachers'),
        api.get('/subjects'),
        api.get('/classes'),
      ]);
      setAssignments(asgRes.data);
      setTeachers(tchRes.data?.data ?? tchRes.data);
      setSubjects(subRes.data);
      setClasses(clsRes.data?.data ?? clsRes.data);
    } catch (e) {
      console.error('Failed to fetch allocation data', e);
      showToast('error', 'Failed to load data. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Derived filtered list
  const filtered = assignments.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.teacher?.user?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (a.subject?.name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Form helpers
  const toggleClass = (id: string) => {
    setForm(prev => ({
      ...prev,
      classIds: prev.classIds.includes(id)
        ? prev.classIds.filter(c => c !== id)
        : [...prev.classIds, id],
    }));
  };

  const validateForm = (): string | null => {
    if (!form.title.trim()) return 'Assignment title is required.';
    if (!form.subjectId) return 'A subject must be selected.';
    if (!form.teacherId) return 'A teacher must be assigned.';
    if (!form.dueDate) return 'A due date is required.';
    if (form.classIds.length === 0) return 'At least one class must be selected.';
    if (form.duration <= 0) return 'Duration must be greater than 0 minutes.';
    return null;
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (a: AssignmentRecord) => {
    setForm({
      title: a.title,
      description: a.description ?? '',
      subjectId: a.subjectId,
      teacherId: a.teacherId,
      classIds: a.classIds,
      dueDate: a.dueDate ? new Date(a.dueDate).toISOString().split('T')[0] : '',
      duration: a.duration ?? 45,
      status: a.status,
    });
    setEditingId(a.id);
    setFormError(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    const err = validateForm();
    if (err) { setFormError(err); return; }
    setFormError(null);
    setSaving(true);
    try {
      const payload = {
        ...form,
        dueDate: new Date(form.dueDate).toISOString(),
      };
      if (editingId) {
        const { data } = await api.patch(`/assignments/${editingId}`, payload);
        setAssignments(prev => prev.map(a => a.id === editingId ? { ...a, ...data } : a));
        showToast('success', 'Assignment updated successfully.');
      } else {
        const { data } = await api.post('/assignments', payload);
        setAssignments(prev => [data, ...prev]);
        showToast('success', 'Assignment created and allocated.');
      }
      setShowModal(false);
    } catch (e: any) {
      const msg = e.response?.data?.message ?? 'Save failed. Please try again.';
      setFormError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/assignments/${id}`);
      setAssignments(prev => prev.filter(a => a.id !== id));
      showToast('success', 'Assignment removed.');
    } catch (e: any) {
      showToast('error', 'Delete failed. The assignment may have submissions.');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  // ---- Render ----
  return (
    <div className="animate-fade-in pb-10">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold transition-all ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Assignment Allocation</h2>
          <p className="text-gray-500 mt-1">Create, assign, and manage tasks allocated to teachers and classes.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all"
        >
          <Plus className="h-5 w-5" /> Allocate New Assignment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, teacher, or subject..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white appearance-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
        <button onClick={fetchAll} className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 transition-colors" title="Refresh">
          <RefreshCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">Loading assignments...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="font-bold text-gray-700">No assignments found</h3>
          <p className="text-gray-400 text-sm mt-1">{search || statusFilter !== 'ALL' ? 'Try clearing filters.' : 'Create the first allocation above.'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-bold text-gray-500 uppercase text-xs tracking-wide">Title</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase text-xs tracking-wide hidden md:table-cell">Subject</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase text-xs tracking-wide hidden lg:table-cell">Teacher</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase text-xs tracking-wide hidden lg:table-cell">Classes</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase text-xs tracking-wide hidden md:table-cell">Due Date</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase text-xs tracking-wide">Status</th>
                <th className="text-right px-5 py-3 font-bold text-gray-500 uppercase text-xs tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-gray-900">{a.title}</p>
                    {a.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{a.description}</p>}
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="inline-flex items-center gap-1.5 text-gray-700">
                      <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                      {a.subject?.name ?? subjects.find(s => s.id === a.subjectId)?.name ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className="inline-flex items-center gap-1.5 text-gray-700">
                      <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                      {a.teacher?.user?.name ?? teachers.find(t => t.id === a.teacherId)?.user?.name ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(a.classes ?? classes.filter(c => a.classIds.includes(c.id))).slice(0, 3).map((c: any) => (
                        <span key={c.id} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">{c.name}</span>
                      ))}
                      {a.classIds.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-medium">+{a.classIds.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell text-gray-600">
                    {new Date(a.dueDate).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[a.status]}`}>
                      {statusLabels[a.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(a)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit / Reassign"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(a.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove assignment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-400 font-medium">
            Showing {filtered.length} of {assignments.length} assignments
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit / Reassign Assignment' : 'Allocate New Assignment'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {formError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  {formError}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Chapter 5 Quiz"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Description</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Optional instructions..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Subject <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white appearance-none"
                      value={form.subjectId}
                      onChange={e => setForm({ ...form, subjectId: e.target.value })}
                    >
                      <option value="">-- Select Subject --</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Teacher */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Assign to Teacher <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white appearance-none"
                      value={form.teacherId}
                      onChange={e => setForm({ ...form, teacherId: e.target.value })}
                    >
                      <option value="">-- Select Teacher --</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.user?.name ?? t.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Due Date <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={form.dueDate}
                      onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Duration (minutes)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      min={1}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={form.duration}
                      onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Status</label>
                <div className="flex gap-2 flex-wrap">
                  {(['ACTIVE', 'DRAFT', 'CLOSED'] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, status: s })}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                        form.status === s ? `${statusColors[s]} border-current scale-105` : 'border-gray-200 text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      {statusLabels[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Classes */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Assign to Classes <span className="text-red-500">*</span></label>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({
                      ...prev,
                      classIds: prev.classIds.length === classes.length ? [] : classes.map(c => c.id)
                    }))}
                    className="text-xs text-indigo-600 font-bold hover:underline"
                  >
                    {form.classIds.length === classes.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-xl max-h-32 overflow-y-auto bg-gray-50">
                  {classes.length === 0 && <p className="text-xs text-gray-400">Loading classes...</p>}
                  {classes.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleClass(c.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                        form.classIds.includes(c.id)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-gray-200 text-gray-500 hover:border-indigo-300'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">{form.classIds.length} class(es) selected</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 rounded-xl font-bold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-500/30 flex items-center gap-2 transition-all disabled:opacity-60"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {editingId ? 'Save Changes' : 'Allocate Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Remove Assignment?</h3>
                <p className="text-gray-500 text-sm mt-1">
                  This will permanently delete the assignment and all student submissions. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-bold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
