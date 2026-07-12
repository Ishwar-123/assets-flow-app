import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, Filter, Plus, Package, Edit, Trash2, Eye, ShieldCheck, Image, FileText, Download, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { AuthContext, getConfig } from '../context/AuthContext';

const AssetDirectory = () => {
  const { user } = React.useContext(AuthContext);
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ category: '', status: '', department: '', location: '' });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [selectedAssetHistory, setSelectedAssetHistory] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  
  // Form State
  const [newAsset, setNewAsset] = useState({ 
    name: '', category: '', description: '', acquisitionDate: '', cost: '', location: '', department: '',
    serialNumber: '', condition: 'New', isBookable: false
  });
  const [customFieldValues, setCustomFieldValues] = useState({});
  const [files, setFiles] = useState({ photoUrl: null, documents: null });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams({
        search: debouncedSearch,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      }).toString();

      const [assetRes, catRes, deptRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/assets?${queryParams}`, getConfig()),
        axios.get('http://localhost:5000/api/categories', getConfig()),
        axios.get('http://localhost:5000/api/departments', getConfig())
      ]);
      setAssets(assetRes.data);
      setCategories(catRes.data);
      setDepartments(deptRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRegisterAsset = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(newAsset).forEach(key => formData.append(key, newAsset[key]));
      // Note: backend expects custom fields as a stringified object if supported
      formData.append('customFieldValues', JSON.stringify(customFieldValues));
      
      if (files.photoUrl) formData.append('photoUrl', files.photoUrl[0]);
      if (files.documents) {
        Array.from(files.documents).forEach(file => formData.append('documents', file));
      }

      const res = await axios.post('http://localhost:5000/api/assets', formData, {
        headers: { ...getConfig().headers, 'Content-Type': 'multipart/form-data' }
      });
      
      alert(`Asset Registered Successfully! Auto-generated Tag: ${res.data.assetTag}`);
      setIsModalOpen(false);
      setNewAsset({ name: '', category: '', description: '', acquisitionDate: '', cost: '', location: '', department: '', serialNumber: '', condition: 'New', isBookable: false });
      setCustomFieldValues({});
      setFiles({ photoUrl: null, documents: null });
      fetchData();
    } catch (error) {
      console.error('Failed to register asset', error);
      alert('Failed to register asset: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/assets/${editForm._id}`, editForm, getConfig());
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to edit asset', error);
      alert('Failed to edit asset: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (assetId) => {
    if (!window.confirm('Are you sure you want to soft-delete this asset? It will be marked as Disposed.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/assets/${assetId}`, getConfig());
      fetchData();
    } catch (error) {
      console.error('Failed to delete asset', error);
      alert('Failed to delete asset');
    }
  };

  const handleViewHistory = async (assetId) => {
    setSelectedAssetHistory(assetId);
    try {
      const res = await axios.get(`http://localhost:5000/api/assets/${assetId}/history`, getConfig());
      setHistoryData(res.data);
    } catch (error) {
      console.error('Failed to fetch history', error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Available': return 'bg-accent-teal/10 text-[var(--color-success)] border-accent-teal/20';
      case 'Allocated': return 'bg-brand-100 text-[var(--color-primary)] border-brand-200';
      case 'Under Maintenance': return 'bg-accent-amber/10 text-[var(--color-warning)] border-accent-amber/20';
      case 'Lost': 
      case 'Disposed': 
        return 'bg-accent-rose/10 text-[var(--color-error)] border-accent-rose/20';
      default: return 'bg-[var(--bg-surface-2)] text-[var(--text-primary)] border-[var(--border-default)]';
    }
  };

  const selectedCategoryObj = categories.find(c => c._id === newAsset.category);

  return (
    <div className="p-8 bg-transparent min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Asset Directory</h1>
          <p className="text-[var(--text-muted)] mt-1">Search, track, and manage all organization assets.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[var(--color-primary)] text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] hover:-translate-y-0.5 transition-all duration-200 flex items-center shadow-md"
        >
          <Plus size={16} className="mr-2" /> Register Asset
        </button>
      </div>

      <div className="bg-[var(--bg-surface)] shadow-md border border-[var(--border-default)] p-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row justify-between mb-6 space-y-4 md:space-y-0 gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search by name, tag, or QR code..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-slate-300 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
            />
          </div>
          <div className="flex space-x-3 flex-wrap gap-y-2">
            <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})} className="px-3 py-2 border border-slate-300 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="px-3 py-2 border border-slate-300 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none">
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Allocated">Allocated</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Lost">Lost</option>
              <option value="Disposed">Disposed</option>
            </select>
            <select value={filters.department} onChange={e => setFilters({...filters, department: e.target.value})} className="px-3 py-2 border border-slate-300 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none">
              <option value="">All Departments</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
        </div>

        {/* Assets Table */}
        {loading ? (
          <div className="py-12 text-center text-[var(--text-muted)] animate-pulse">Loading assets...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[var(--text-muted)] uppercase bg-[var(--bg-surface-2)] border-b border-[var(--border-default)]">
                <tr>
                  <th className="px-4 py-4 font-bold tracking-wider">Asset Tag</th>
                  <th className="px-4 py-4 font-bold tracking-wider">Name & Category</th>
                  <th className="px-4 py-4 font-bold tracking-wider">Status</th>
                  <th className="px-4 py-4 font-bold tracking-wider">Current Holder</th>
                  <th className="px-4 py-4 font-bold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(asset => (
                  <tr key={asset._id} className="border-b border-[var(--border-default)] even:bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-2)]/50 transition-colors group">
                    <td className="px-4 py-4 font-mono text-[var(--text-primary)] font-bold">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-1 rounded-sm shadow-sm border border-slate-200">
                          <QRCodeSVG value={asset.assetTag} size={28} />
                        </div>
                        <div className="flex items-center gap-1">
                          {asset.photoUrl ? <Image size={14} className="text-[var(--color-primary)]" /> : <Package size={14} className="text-slate-400" />}
                          {asset.assetTag}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-[var(--text-primary)]">{asset.name}</div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">{asset.category?.name || 'Uncategorized'}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold border ${getStatusColor(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[var(--text-secondary)] font-medium">
                      {asset.currentHolderUser ? asset.currentHolderUser.name : (asset.currentHolderDepartment ? asset.currentHolderDepartment.name : '—')}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <button onClick={() => handleViewHistory(asset._id)} className="text-[var(--color-primary)] hover:text-brand-800 transition-colors" title="View History">
                          <Eye size={16} />
                        </button>
                        {(user?.role === 'Admin' || user?.role === 'Asset Manager') && (
                          <>
                            <button onClick={() => { setEditForm(asset); setIsEditModalOpen(true); }} className="text-amber-600 hover:text-amber-800 transition-colors" title="Edit Asset">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(asset._id)} className="text-[var(--color-error)] hover:text-rose-800 transition-colors" title="Delete Asset">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {assets.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-16 text-center">
                      <Package size={48} className="text-slate-300 mb-4" />
                      <p className="text-[var(--text-muted)] font-bold">No assets found</p>
                      <p className="text-slate-400 text-sm mt-1">Adjust your filters or register a new asset.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Asset History Drawer/Modal */}
      {selectedAssetHistory && (
        <div className="fixed inset-0 bg-slate-950/60 flex justify-end z-50">
          <div className="bg-[var(--bg-surface)] w-full max-w-md h-full shadow-2xl border-l border-[var(--border-default)] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-default)] bg-[var(--bg-surface-2)] sticky top-0">
              <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2"><Eye className="text-[var(--color-primary)]"/> Asset History</h2>
              <button onClick={() => setSelectedAssetHistory(null)} className="text-slate-400 hover:text-[var(--text-secondary)] transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6">
              {historyData.length === 0 ? (
                <p className="text-[var(--text-muted)] text-center">No history recorded for this asset.</p>
              ) : (
                historyData.map((item, idx) => (
                  <div key={idx} className="relative pl-6 border-l-2 border-brand-200">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[var(--color-primary)] border-4 border-white"></div>
                    <div className="mb-1 flex justify-between items-center">
                      <span className={`text-xs font-bold px-2 py-0.5 bg-[var(--bg-surface-2)] text-[var(--text-primary)]`}>{item.type}</span>
                      <span className="text-xs font-mono text-slate-400">{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm text-[var(--text-primary)]">
                      {item.type === 'Allocation' && `Allocated to ${item.details.allocatedToUser?.name || 'Unknown'}`}
                      {item.type === 'Maintenance' && `Maintenance reported by ${item.details.reportedBy?.name || 'Unknown'}. Status: ${item.details.status}`}
                      {item.type === 'Booking' && `Booked by ${item.details.bookedBy?.name || 'Unknown'} from ${new Date(item.details.startTime).toLocaleTimeString()}`}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Asset Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[var(--bg-surface)] shadow-2xl w-full max-w-lg overflow-hidden border border-[var(--border-default)] my-8">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-default)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Register New Asset</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-[var(--text-secondary)] transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRegisterAsset} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="p-3 bg-brand-50 text-brand-800 text-xs font-medium border border-brand-100">
                Asset Tag will be auto-generated by the system (e.g. AF-0001)
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Asset Name</label>
                  <input required type="text" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Serial Number</label>
                  <input type="text" value={newAsset.serialNumber || ''} onChange={e => setNewAsset({...newAsset, serialNumber: e.target.value})} className="w-full px-3 py-2 border border-slate-300 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Category</label>
                  <select required value={newAsset.category} onChange={e => setNewAsset({...newAsset, category: e.target.value})} className="w-full px-3 py-2 border border-slate-300  text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none  bg-[var(--bg-surface)]">
                    <option value="">Select Category...</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Condition</label>
                  <select required value={newAsset.condition || 'Good'} onChange={e => setNewAsset({...newAsset, condition: e.target.value})} className="w-full px-3 py-2 border border-slate-300  text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none  bg-[var(--bg-surface)]">
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
              </div>

              {selectedCategoryObj?.customFields?.length > 0 && (
                <div className="p-4 bg-[var(--bg-surface-2)] border border-[var(--border-default)] space-y-3">
                  <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Category Specific Fields</h4>
                  {selectedCategoryObj.customFields.map((field, idx) => (
                    <div key={idx}>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{field.fieldName}</label>
                      <input 
                        type={field.fieldType === 'number' ? 'number' : field.fieldType === 'date' ? 'date' : 'text'}
                        className="w-full px-3 py-2 border border-slate-300 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                        onChange={e => setCustomFieldValues({...customFieldValues, [field.fieldName]: e.target.value})}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Acquisition Date</label>
                  <input required type="date" value={newAsset.acquisitionDate} onChange={e => setNewAsset({...newAsset, acquisitionDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Cost ($)</label>
                  <input required type="number" value={newAsset.cost} onChange={e => setNewAsset({...newAsset, cost: e.target.value})} className="w-full px-3 py-2 border border-slate-300 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Department</label>
                <select value={newAsset.department} onChange={e => setNewAsset({...newAsset, department: e.target.value})} className="w-full px-3 py-2 border border-slate-300  text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none  bg-[var(--bg-surface)]">
                  <option value="">None (Central Pool)</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Location</label>
                <input type="text" value={newAsset.location} onChange={e => setNewAsset({...newAsset, location: e.target.value})} className="w-full px-3 py-2 border border-slate-300 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Description</label>
                <textarea rows="2" value={newAsset.description} onChange={e => setNewAsset({...newAsset, description: e.target.value})} className="w-full px-3 py-2 border border-slate-300 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>

              <div className="flex items-center space-x-2 bg-[var(--bg-surface-2)] p-3 border border-[var(--border-default)]">
                <input 
                  type="checkbox" 
                  id="isBookable"
                  checked={newAsset.isBookable || false} 
                  onChange={e => setNewAsset({...newAsset, isBookable: e.target.checked})}
                  className="w-4 h-4 text-[var(--color-primary)] bg-white border-slate-300 rounded focus:ring-brand-500"
                />
                <label htmlFor="isBookable" className="text-sm font-bold text-[var(--text-primary)] cursor-pointer">
                  Shared / Bookable Resource
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Photo Upload</label>
                  <input type="file" accept="image/*" onChange={e => setFiles({...files, photoUrl: e.target.files})} className="w-full text-sm text-[var(--text-muted)] file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-[var(--color-primary)] hover:file:bg-brand-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Documents (up to 5)</label>
                  <input type="file" multiple max="5" onChange={e => setFiles({...files, documents: e.target.files})} className="w-full text-sm text-[var(--text-muted)] file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-[var(--bg-surface-2)] file:text-[var(--text-primary)] hover:file:bg-slate-200" />
                </div>
              </div>

              <div className="pt-6 flex justify-end space-x-3 sticky bottom-0 bg-[var(--bg-surface)] pb-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">Register Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Asset Modal */}
      {isEditModalOpen && editForm && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-surface)] w-full max-w-xl shadow-2xl border border-[var(--border-default)] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-default)] bg-[var(--bg-surface-2)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center"><Edit className="mr-2 text-[var(--color-primary)]" /> Edit Asset</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-[var(--text-secondary)] transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="editAssetForm" onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Asset Name *</label>
                    <input type="text" required value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full px-4 py-2.5 bg-[var(--bg-surface-2)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Category *</label>
                    <select required value={editForm.category?._id || editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full px-4 py-2.5 bg-[var(--bg-surface-2)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none">
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Condition</label>
                    <select value={editForm.condition} onChange={e => setEditForm({...editForm, condition: e.target.value})} className="w-full px-4 py-2.5 bg-[var(--bg-surface-2)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none">
                      <option value="New">New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                      <option value="Damaged">Damaged</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Status</label>
                    <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full px-4 py-2.5 bg-[var(--bg-surface-2)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none">
                      <option value="Available">Available</option>
                      <option value="Allocated">Allocated</option>
                      <option value="Under Maintenance">Under Maintenance</option>
                      <option value="Lost">Lost</option>
                      <option value="Disposed">Disposed</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Location</label>
                  <input type="text" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} className="w-full px-4 py-2.5 bg-[var(--bg-surface-2)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-[var(--border-default)] bg-[var(--bg-surface-2)] flex justify-end gap-3">
              <button onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-[var(--text-secondary)] hover:bg-slate-200 transition-colors">Cancel</button>
              <button type="submit" form="editAssetForm" className="px-5 py-2.5 text-sm font-bold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors shadow-md flex items-center">
                <ShieldCheck size={16} className="mr-2"/> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDirectory;
