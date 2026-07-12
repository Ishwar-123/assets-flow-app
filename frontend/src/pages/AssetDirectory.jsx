import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Search, Plus, Filter, X } from 'lucide-react';

const AssetDirectory = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', category: '', serialNumber: '', acquisitionCost: '' });

  const getConfig = () => ({
    headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo'))?.token}` }
  });

  const fetchData = async () => {
    try {
      const [assetRes, catRes] = await Promise.all([
        axios.get('http://localhost:5000/api/assets', getConfig()),
        axios.get('http://localhost:5000/api/categories', getConfig())
      ]);
      setAssets(assetRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegisterAsset = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/assets', newAsset, getConfig());
      setIsModalOpen(false);
      setNewAsset({ name: '', category: '', serialNumber: '', acquisitionCost: '' });
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Failed to register asset', error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Available': return 'bg-green-100 text-green-700 border-green-200';
      case 'Allocated': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Under Maintenance': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Reserved': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asset Directory</h1>
          <p className="text-gray-500 mt-1">Search, track, and manage all organization assets.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors flex items-center shadow-md"
        >
          <Plus size={16} className="mr-2" /> Register Asset
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row justify-between mb-6 space-y-4 md:space-y-0">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search by name, tag, or serial..." 
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
            />
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter size={16} className="mr-2 text-gray-500" /> Filters
            </button>
          </div>
        </div>

        {/* Assets Table */}
        {loading ? (
          <div className="py-12 text-center text-gray-500 animate-pulse">Loading assets...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 rounded-lg border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 font-semibold">Asset Tag</th>
                  <th className="px-4 py-4 font-semibold">Name & Category</th>
                  <th className="px-4 py-4 font-semibold">Status</th>
                  <th className="px-4 py-4 font-semibold">Current Holder</th>
                  <th className="px-4 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(asset => (
                  <tr key={asset._id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group">
                    <td className="px-4 py-4 font-mono text-gray-600">{asset.assetTag}</td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{asset.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{asset.category?.name || 'Uncategorized'}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {asset.currentHolderUser ? asset.currentHolderUser.name : (asset.currentHolderDepartment ? asset.currentHolderDepartment.name : '—')}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button className="text-indigo-600 hover:text-indigo-900 font-medium opacity-0 group-hover:opacity-100 transition-opacity">View Details</button>
                    </td>
                  </tr>
                ))}
                {assets.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-16 text-center">
                      <Package size={48} className="text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No assets found</p>
                      <p className="text-gray-400 text-sm mt-1">Register an asset to see it here.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Asset Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Register New Asset</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRegisterAsset} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
                <input required type="text" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. MacBook Pro M2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select required value={newAsset.category} onChange={e => setNewAsset({...newAsset, category: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                <input type="text" value={newAsset.serialNumber} onChange={e => setNewAsset({...newAsset, serialNumber: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Acquisition Cost ($)</label>
                <input type="number" value={newAsset.acquisitionCost} onChange={e => setNewAsset({...newAsset, acquisitionCost: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Optional" />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">Register Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDirectory;
