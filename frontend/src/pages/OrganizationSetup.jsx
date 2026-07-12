import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext, getConfig } from '../context/AuthContext';
import { Building2, Tags, Users, Plus, ShieldCheck, X, Edit, Trash2 } from 'lucide-react';

const OrganizationSetup = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Department Modal State
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ id: null, name: '', head: '', parentDepartment: '', status: 'Active' });

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', customFields: [] });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [deptRes, catRes, empRes] = await Promise.all([
        axios.get('http://localhost:5000/api/departments', getConfig()),
        axios.get('http://localhost:5000/api/categories', getConfig()),
        axios.get('http://localhost:5000/api/users', getConfig())
      ]);
      setDepartments(deptRes.data);
      setCategories(catRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Department Actions
  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    if (!deptForm.name) return;
    try {
      const payload = {
        name: deptForm.name,
        head: deptForm.head || undefined,
        parentDepartment: deptForm.parentDepartment || undefined,
        status: deptForm.status
      };
      if (deptForm.id) {
        await axios.put(`http://localhost:5000/api/departments/${deptForm.id}`, payload, getConfig());
      } else {
        await axios.post('http://localhost:5000/api/departments', payload, getConfig());
      }
      setIsDeptModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save department', err);
    }
  };

  const openDeptModal = (dept = null) => {
    if (dept) {
      setDeptForm({
        id: dept._id,
        name: dept.name,
        head: dept.head?._id || '',
        parentDepartment: dept.parentDepartment?._id || '',
        status: dept.status
      });
    } else {
      setDeptForm({ id: null, name: '', head: '', parentDepartment: '', status: 'Active' });
    }
    setIsDeptModalOpen(true);
  };

  const deactivateDepartment = async (id) => {
    if(!window.confirm('Deactivate this department?')) return;
    try {
      await axios.put(`http://localhost:5000/api/departments/${id}`, { status: 'Inactive' }, getConfig());
      fetchData();
    } catch(err) {
      console.error(err);
    }
  };

  // Category Actions
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catForm.name) return;
    try {
      if (catForm.id) {
        await axios.put(`http://localhost:5000/api/categories/${catForm.id}`, catForm, getConfig());
      } else {
        await axios.post('http://localhost:5000/api/categories', catForm, getConfig());
      }
      setIsCatModalOpen(false);
      fetchData();
    } catch(err) {
      console.error('Failed to save category', err);
      alert('Failed to save category');
    }
  };

  const addCustomField = () => {
    setCatForm({ ...catForm, customFields: [...catForm.customFields, { fieldName: '', fieldType: 'text' }] });
  };

  const updateCustomField = (index, key, value) => {
    const updated = [...catForm.customFields];
    updated[index][key] = value;
    setCatForm({ ...catForm, customFields: updated });
  };

  const removeCustomField = (index) => {
    const updated = catForm.customFields.filter((_, i) => i !== index);
    setCatForm({ ...catForm, customFields: updated });
  };

  const openCatModal = (cat = null) => {
    if (cat) {
      setCatForm({ id: cat._id, name: cat.name, customFields: cat.customFields || [] });
    } else {
      setCatForm({ id: null, name: '', customFields: [] });
    }
    setIsCatModalOpen(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/categories/${id}`, getConfig());
      fetchData();
    } catch (err) {
      console.error('Failed to delete category', err);
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  // Role Action
  const handleUpdateRole = async (id, newRole) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${id}/role`, { role: newRole }, getConfig());
      fetchData();
    } catch (err) {
      console.error('Failed to update role');
    }
  };

  if (user?.role !== 'Admin') {
    return <div className="p-8 text-center text-[var(--color-error)] font-bold">Access Denied. Admin privileges required.</div>;
  }

  return (
    <div className="p-8 bg-transparent min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Organization Setup</h1>
        <p className="text-[var(--text-muted)] mt-1">Manage master data, departments, and roles.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-200 p-1 mb-6 w-max shadow-sm">
        <button onClick={() => setActiveTab('departments')} className={`flex items-center px-4 py-2 text-sm font-bold transition-colors ${activeTab === 'departments' ? 'bg-[var(--bg-surface)] shadow-sm text-[var(--color-primary)]' : 'text-[var(--text-secondary)] hover:text-slate-900 hover:bg-slate-300'}`}>
          <Building2 size={16} className="mr-2" /> Departments
        </button>
        <button onClick={() => setActiveTab('categories')} className={`flex items-center px-4 py-2 text-sm font-bold transition-colors ${activeTab === 'categories' ? 'bg-[var(--bg-surface)] shadow-sm text-[var(--color-primary)]' : 'text-[var(--text-secondary)] hover:text-slate-900 hover:bg-slate-300'}`}>
          <Tags size={16} className="mr-2" /> Asset Categories
        </button>
        <button onClick={() => setActiveTab('employees')} className={`flex items-center px-4 py-2 text-sm font-bold transition-colors ${activeTab === 'employees' ? 'bg-[var(--bg-surface)] shadow-sm text-[var(--color-primary)]' : 'text-[var(--text-secondary)] hover:text-slate-900 hover:bg-slate-300'}`}>
          <Users size={16} className="mr-2" /> Employee Directory
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)] animate-pulse font-bold">Loading data...</div>
      ) : (
        <div className="bg-[var(--bg-surface)] shadow-md border border-[var(--border-default)] p-6 min-h-[500px]">
          
          {/* DEPARTMENTS TAB */}
          {activeTab === 'departments' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Departments</h2>
                <button onClick={() => openDeptModal()} className="bg-[var(--color-primary)] text-white px-4 py-2 shadow-md hover:shadow-lg text-sm font-bold hover:bg-[var(--color-primary-hover)] hover:-translate-y-0.5 transition-all flex items-center">
                  <Plus size={16} className="mr-1" /> Add Department
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="text-xs text-[var(--text-muted)] uppercase bg-[var(--bg-surface-2)] border-b border-[var(--border-default)]">
                    <tr>
                      <th className="px-4 py-3 font-bold tracking-wider">Name</th>
                      <th className="px-4 py-3 font-bold tracking-wider">Head</th>
                      <th className="px-4 py-3 font-bold tracking-wider">Status</th>
                      <th className="px-4 py-3 font-bold tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map(dept => (
                      <tr key={dept._id} className="border-b border-[var(--border-default)] even:bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-2)]/50 transition-colors">
                        <td className="px-4 py-3 font-bold text-[var(--text-primary)]">{dept.name}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)] font-medium">{dept.head?.name || 'Unassigned'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-bold border ${dept.status === 'Active' ? 'bg-accent-teal/10 text-[var(--color-success)] border-accent-teal/20' : 'bg-[var(--bg-surface-2)] text-[var(--text-muted)] border-[var(--border-default)]'}`}>
                            {dept.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end space-x-3">
                            <button onClick={() => openDeptModal(dept)} className="text-[var(--color-primary)] hover:text-brand-800 transition-colors" title="Edit">
                              <Edit size={16} />
                            </button>
                            {dept.status === 'Active' && (
                              <button onClick={() => deactivateDepartment(dept._id)} className="text-[var(--color-error)] hover:text-rose-800 transition-colors" title="Deactivate">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {departments.length === 0 && (
                      <tr><td colSpan="4" className="px-4 py-8 text-center text-[var(--text-muted)] font-bold">No departments found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Asset Categories</h2>
                <button onClick={() => openCatModal()} className="bg-[var(--color-primary)] text-white px-4 py-2 shadow-md hover:shadow-lg text-sm font-bold hover:bg-[var(--color-primary-hover)] hover:-translate-y-0.5 transition-all flex items-center">
                  <Plus size={16} className="mr-1" /> Add Category
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(cat => (
                  <div key={cat._id} className="p-6 border border-[var(--border-default)] shadow-sm bg-[var(--bg-surface)] hover:shadow-md transition-shadow relative group">
                    
                    <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openCatModal(cat)} className="p-1.5 text-slate-400 hover:text-[var(--color-primary)] bg-slate-100 hover:bg-brand-50 rounded-sm transition-colors" title="Edit Category">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDeleteCategory(cat._id)} className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-sm transition-colors" title="Delete Category">
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <h3 className="font-bold text-[var(--text-primary)] flex items-center text-lg mb-2 pr-12">
                      <Tags size={20} className="mr-2 text-[var(--color-primary)]" /> {cat.name}
                    </h3>
                    <div className="mt-4 space-y-1">
                      <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Custom Fields</p>
                      {cat.customFields && cat.customFields.length > 0 ? (
                        cat.customFields.map((cf, idx) => (
                          <div key={idx} className="flex justify-between text-sm bg-[var(--bg-surface-2)] p-2 border border-[var(--border-default)]">
                            <span className="font-medium text-[var(--text-primary)]">{cf.fieldName}</span>
                            <span className="text-[var(--text-muted)] font-mono text-xs">{cf.fieldType}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400 italic">No custom fields</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMPLOYEES TAB */}
          {activeTab === 'employees' && (
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">Employee Directory & Roles</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="text-xs text-[var(--text-muted)] uppercase bg-[var(--bg-surface-2)] border-b border-[var(--border-default)]">
                    <tr>
                      <th className="px-4 py-3 font-bold tracking-wider">Name</th>
                      <th className="px-4 py-3 font-bold tracking-wider">Email</th>
                      <th className="px-4 py-3 font-bold tracking-wider">Current Role</th>
                      <th className="px-4 py-3 font-bold tracking-wider text-right">Promote To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(emp => (
                      <tr key={emp._id} className="border-b border-[var(--border-default)] even:bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-2)]/50 transition-colors">
                        <td className="px-4 py-3 font-bold text-[var(--text-primary)] flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-100 text-[var(--color-primary)] flex items-center justify-center text-xs font-bold border border-brand-200">
                            {emp.name.charAt(0)}
                          </div>
                          {emp.name}
                        </td>
                        <td className="px-4 py-3 text-[var(--text-muted)]">{emp.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 text-xs font-bold border ${
                            emp.role === 'Admin' ? 'bg-accent-rose/10 text-[var(--color-error)] border-accent-rose/20' :
                            emp.role === 'Asset Manager' ? 'bg-brand-100 text-[var(--color-primary)] border-brand-200' :
                            emp.role === 'Department Head' ? 'bg-accent-teal/10 text-[var(--color-success)] border-accent-teal/20' :
                            'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] border-[var(--border-default)]'
                          }`}>
                            {emp.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {emp.role === 'Employee' && (
                            <div className="flex justify-end space-x-2">
                              <button onClick={() => handleUpdateRole(emp._id, 'Department Head')} className="text-xs font-bold text-[var(--color-success)] hover:text-white bg-accent-teal/10 hover:bg-accent-teal border border-accent-teal/20 px-3 py-1.5 transition-all shadow-sm">
                                Dept Head
                              </button>
                              <button onClick={() => handleUpdateRole(emp._id, 'Asset Manager')} className="text-xs font-bold text-[var(--color-primary)] hover:text-white bg-brand-100 hover:bg-[var(--color-primary)] border border-brand-200 px-3 py-1.5 transition-all flex items-center shadow-sm">
                                <ShieldCheck size={14} className="mr-1" /> Asset Mgr
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-surface)] shadow-2xl w-full max-w-md border border-[var(--border-default)]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-default)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">{deptForm.id ? 'Edit Department' : 'Create Department'}</h2>
              <button onClick={() => setIsDeptModalOpen(false)} className="text-slate-400 hover:text-[var(--text-secondary)] transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveDepartment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-[var(--text-primary)] mb-1">Department Name</label>
                <input required type="text" value={deptForm.name} onChange={e => setDeptForm({...deptForm, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--text-primary)] mb-1">Department Head</label>
                <select value={deptForm.head} onChange={e => setDeptForm({...deptForm, head: e.target.value})} className="w-full px-3 py-2 border border-slate-300  text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none  bg-[var(--bg-surface)]">
                  <option value="">None</option>
                  {employees.filter(e => e.role === 'Department Head' || e.role === 'Admin').map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--text-primary)] mb-1">Parent Department</label>
                <select value={deptForm.parentDepartment} onChange={e => setDeptForm({...deptForm, parentDepartment: e.target.value})} className="w-full px-3 py-2 border border-slate-300  text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none  bg-[var(--bg-surface)]">
                  <option value="">None (Top Level)</option>
                  {departments.filter(d => d._id !== deptForm.id).map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsDeptModalOpen(false)} className="px-4 py-2 text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-md transition-colors">Save Department</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-surface)] shadow-2xl w-full max-w-lg border border-[var(--border-default)]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-default)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Create Asset Category</h2>
              <button onClick={() => setIsCatModalOpen(false)} className="text-slate-400 hover:text-[var(--text-secondary)] transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveCategory} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-[var(--text-primary)] mb-1">Category Name</label>
                <input required type="text" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} placeholder="e.g. Laptops, Vehicles" className="w-full px-3 py-2 border border-slate-300 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-[var(--text-primary)]">Custom Fields</label>
                  <button type="button" onClick={addCustomField} className="text-xs font-bold text-[var(--color-primary)] hover:text-brand-800 flex items-center">
                    <Plus size={14} className="mr-1" /> Add Field
                  </button>
                </div>
                {catForm.customFields.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)] italic p-4 bg-[var(--bg-surface-2)] border border-[var(--border-default)] text-center">No custom fields defined.</p>
                ) : (
                  <div className="space-y-3">
                    {catForm.customFields.map((field, idx) => (
                      <div key={idx} className="flex items-center space-x-2 bg-[var(--bg-surface-2)] p-2 border border-[var(--border-default)]">
                        <input required type="text" placeholder="Field Name (e.g. Warranty)" value={field.fieldName} onChange={e => updateCustomField(idx, 'fieldName', e.target.value)} className="flex-1 px-2 py-1.5 border border-slate-300 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm outline-none focus:border-brand-500" />
                        <select value={field.fieldType} onChange={e => updateCustomField(idx, 'fieldType', e.target.value)} className="w-32 px-2 py-1.5 border border-slate-300  text-[var(--text-primary)] text-sm outline-none focus:border-brand-500  bg-[var(--bg-surface)]">
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                        </select>
                        <button type="button" onClick={() => removeCustomField(idx)} className="p-1.5 text-slate-400 hover:text-[var(--color-error)] hover:bg-rose-50 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsCatModalOpen(false)} className="px-4 py-2 text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-md transition-colors">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationSetup;
