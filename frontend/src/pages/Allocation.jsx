import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowRightLeft, Plus, CheckCircle, Clock, X } from 'lucide-react';

const Allocation = () => {
  const [allocations, setAllocations] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAlloc, setNewAlloc] = useState({ asset: '', allocatedToUser: '', expectedReturnDate: '' });

  const getConfig = () => ({
    headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo'))?.token}` }
  });

  const fetchData = async () => {
    try {
      const [allocRes, assetRes, userRes, deptRes] = await Promise.all([
        axios.get('http://localhost:5000/api/allocations', getConfig()),
        axios.get('http://localhost:5000/api/assets', getConfig()),
        axios.get('http://localhost:5000/api/users', getConfig()),
        axios.get('http://localhost:5000/api/departments', getConfig())
      ]);
      setAllocations(allocRes.data);
      // Only show available assets
      setAssets(assetRes.data.filter(a => a.status === 'Available'));
      setUsers(userRes.data);
      setDepartments(deptRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAllocate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/allocations', newAlloc, getConfig());
      setIsModalOpen(false);
      setNewAlloc({ asset: '', allocatedToUser: '', expectedReturnDate: '' });
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Failed to allocate asset', error);
      alert(error.response?.data?.message || 'Failed to allocate asset');
    }
  };

  const handleReturn = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/allocations/${id}/return`, {}, getConfig());
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Failed to return asset', error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asset Allocations</h1>
          <p className="text-gray-500 mt-1">Manage active bookings and asset transfers.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors flex items-center shadow-md">
          <Plus size={16} className="mr-2" /> Allocate Asset
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {loading ? (
          <div className="py-12 text-center text-gray-500 animate-pulse">Loading allocations...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 rounded-lg">
                <tr>
                  <th className="px-4 py-4 font-semibold">Asset</th>
                  <th className="px-4 py-4 font-semibold">Allocated To</th>
                  <th className="px-4 py-4 font-semibold">Expected Return</th>
                  <th className="px-4 py-4 font-semibold">Status</th>
                  <th className="px-4 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map(alloc => (
                  <tr key={alloc._id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{alloc.asset?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">{alloc.asset?.assetTag || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      {alloc.allocatedToUser?.name || alloc.allocatedToDepartment?.name || '—'}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {alloc.expectedReturnDate ? new Date(alloc.expectedReturnDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border flex items-center w-max ${
                        alloc.status === 'Active' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {alloc.status === 'Active' ? <Clock size={12} className="mr-1"/> : <CheckCircle size={12} className="mr-1"/>}
                        {alloc.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {alloc.status === 'Active' && (
                        <button onClick={() => handleReturn(alloc._id)} className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors">
                          Mark as Returned
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {allocations.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-16 text-center">
                      <ArrowRightLeft size={48} className="text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No allocations found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Allocation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Allocate Asset</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAllocate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Available Asset</label>
                <select required value={newAlloc.asset} onChange={e => setNewAlloc({...newAlloc, asset: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  <option value="">Select Asset...</option>
                  {assets.map(a => <option key={a._id} value={a._id}>{a.name} ({a.assetTag})</option>)}
                </select>
                {assets.length === 0 && <p className="text-xs text-red-500 mt-1">No assets available. Register one first.</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To (User)</label>
                <select required value={newAlloc.allocatedToUser} onChange={e => setNewAlloc({...newAlloc, allocatedToUser: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  <option value="">Select Employee...</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Return Date</label>
                <input type="date" value={newAlloc.expectedReturnDate} onChange={e => setNewAlloc({...newAlloc, expectedReturnDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={assets.length === 0} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50">Confirm Allocation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Allocation;
