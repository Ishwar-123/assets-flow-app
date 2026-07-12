import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, Filter, Plus, Package, Edit, Trash2, Eye, ShieldCheck, Image, FileText, Download, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getConfig } from '../context/AuthContext';

const AssetDirectory = () => {
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
      case 'Available': return 'bg-accent-teal/10 text-accent-teal border-accent-teal/20';
      case 'Allocated': return 'bg-brand-100 text-brand-700 border-brand-200';
      case 'Under Maintenance': return 'bg-accent-amber/10 text-accent-amber border-accent-amber/20';
      case 'Lost': 
      case 'Disposed': 
        return 'bg-accent-rose/10 text-accent-rose border-accent-rose/20';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const selectedCategoryObj = categories.find(c => c._id === newAsset.category);

  return (
    <div className="p-8 max-w-7xl mx-auto bg-transparent min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Asset Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Search, track, and manage all organization assets.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-brand-600 rounded-none text-sm font-medium text-white hover:bg-brand-700 hover:-translate-y-0.5 transition-all duration-200 flex items-center shadow-md"
        >
          <Plus size={16} className="mr-2" /> Register Asset
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl rounded-none shadow-md border border-slate-200 dark:border-slate-700 p-6">
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
              className="pl-10 w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-none text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
            />
          </div>
          <div className="flex space-x-3 flex-wrap gap-y-2">
            <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})} className="px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none rounded-none">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none rounded-none">
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Allocated">Allocated</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Lost">Lost</option>
              <option value="Disposed">Disposed</option>
            </select>
            <select value={filters.department} onChange={e => setFilters({...filters, department: e.target.value})} className="px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none rounded-none">
              <option value="">All Departments</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
        </div>

        {/* Assets Table */}
        {loading ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 animate-pulse">Loading assets...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 rounded-none border-b border-slate-200 dark:border-slate-700">
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
                  <tr key={asset._id} className="border-b border-slate-100 dark:border-slate-800 even:bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-4 py-4 font-mono text-slate-900 dark:text-white font-bold">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-1 rounded-sm shadow-sm border border-slate-200">
                          <QRCodeSVG value={asset.assetTag} size={28} />
                        </div>
                        <div className="flex items-center gap-1">
                          {asset.photoUrl ? <Image size={14} className="text-brand-500" /> : <Package size={14} className="text-slate-400" />}
                          {asset.assetTag}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{asset.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{asset.category?.name || 'Uncategorized'}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold border ${getStatusColor(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-medium">
                      {asset.currentHolderUser ? asset.currentHolderUser.name : (asset.currentHolderDepartment ? asset.currentHolderDepartment.name : '—')}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button onClick={() => handleViewHistory(asset._id)} className="text-brand-600 hover:text-brand-800 font-medium transition-colors flex items-center justify-end w-full">
                        <Eye size={16} className="mr-1" /> View History
                      </button>
                    </td>
                  </tr>
                ))}
                {assets.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-16 text-center">
                      <Package size={48} className="text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 dark:text-slate-400 font-bold">No assets found</p>
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
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex justify-end z-50">
          <div className="bg-white dark:bg-slate-900/95 backdrop-blur-xl w-full max-w-md h-full shadow-2xl border-l border-slate-200 dark:border-slate-700 overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 sticky top-0">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><Eye className="text-brand-600"/> Asset History</h2>
              <button onClick={() => setSelectedAssetHistory(null)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6">
              {historyData.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-center">No history recorded for this asset.</p>
              ) : (
                historyData.map((item, idx) => (
                  <div key={idx} className="relative pl-6 border-l-2 border-brand-200">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand-500 border-4 border-white dark:border-slate-800"></div>
                    <div className="mb-1 flex justify-between items-center">
                      <span className={`text-xs font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300`}>{item.type}</span>
                      <span className="text-xs font-mono text-slate-400">{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm text-slate-800 dark:text-slate-200">
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
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900/95 backdrop-blur-xl rounded-none shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700 my-8">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Register New Asset</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRegisterAsset} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="p-3 bg-brand-50 text-brand-800 text-xs font-medium border border-brand-100">
                Asset Tag will be auto-generated by the system (e.g. AF-0001)
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Asset Name</label>
                  <input required type="text" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-none text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Serial Number</label>
                  <input type="text" value={newAsset.serialNumber || ''} onChange={e => setNewAsset({...newAsset, serialNumber: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-none text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select required value={newAsset.category} onChange={e => setNewAsset({...newAsset, category: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700  text-slate-900 dark:text-white rounded-none text-sm focus:ring-2 focus:ring-brand-500 outline-none  bg-white dark:bg-slate-800">
                    <option value="">Select Category...</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Condition</label>
                  <select required value={newAsset.condition || 'Good'} onChange={e => setNewAsset({...newAsset, condition: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700  text-slate-900 dark:text-white rounded-none text-sm focus:ring-2 focus:ring-brand-500 outline-none  bg-white dark:bg-slate-800">
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
              </div>

              {selectedCategoryObj?.customFields?.length > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Category Specific Fields</h4>
                  {selectedCategoryObj.customFields.map((field, idx) => (
                    <div key={idx}>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{field.fieldName}</label>
                      <input 
                        type={field.fieldType === 'number' ? 'number' : field.fieldType === 'date' ? 'date' : 'text'}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-none text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                        onChange={e => setCustomFieldValues({...customFieldValues, [field.fieldName]: e.target.value})}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Acquisition Date</label>
                  <input required type="date" value={newAsset.acquisitionDate} onChange={e => setNewAsset({...newAsset, acquisitionDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-none text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cost ($)</label>
                  <input required type="number" value={newAsset.cost} onChange={e => setNewAsset({...newAsset, cost: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-none text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
                <select value={newAsset.department} onChange={e => setNewAsset({...newAsset, department: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700  text-slate-900 dark:text-white rounded-none text-sm focus:ring-2 focus:ring-brand-500 outline-none  bg-white dark:bg-slate-800">
                  <option value="">None (Central Pool)</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
                <input type="text" value={newAsset.location} onChange={e => setNewAsset({...newAsset, location: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-none text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea rows="2" value={newAsset.description} onChange={e => setNewAsset({...newAsset, description: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-none text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>

              <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-200 dark:border-slate-700">
                <input 
                  type="checkbox" 
                  id="isBookable"
                  checked={newAsset.isBookable || false} 
                  onChange={e => setNewAsset({...newAsset, isBookable: e.target.checked})}
                  className="w-4 h-4 text-brand-600 bg-white border-slate-300 rounded focus:ring-brand-500"
                />
                <label htmlFor="isBookable" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Shared / Bookable Resource
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Photo Upload</label>
                  <input type="file" accept="image/*" onChange={e => setFiles({...files, photoUrl: e.target.files})} className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Documents (up to 5)</label>
                  <input type="file" multiple max="5" onChange={e => setFiles({...files, documents: e.target.files})} className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-slate-100 dark:bg-slate-800 file:text-slate-700 dark:text-slate-300 hover:file:bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>

              <div className="pt-6 flex justify-end space-x-3 sticky bottom-0 bg-white dark:bg-slate-900 pb-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-none transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 shadow-md hover:shadow-lg rounded-none transition-all hover:-translate-y-0.5">Register Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDirectory;
