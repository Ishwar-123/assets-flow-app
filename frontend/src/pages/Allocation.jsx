import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext, getConfig } from '../context/AuthContext';
import { ArrowRightLeft, Plus, CheckCircle, Clock, X, ArrowUpRight, Check, AlertCircle } from 'lucide-react';

const Allocation = () => {
  const { user } = useContext(AuthContext);
  const [allocations, setAllocations] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State - Allocate
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAlloc, setNewAlloc] = useState({ asset: '', allocatedToUser: '', expectedReturnDate: '' });

  // Modal State - Return
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnAlloc, setReturnAlloc] = useState({ id: '', conditionNotes: '' });

  // Modal State - Transfer Request
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferAlloc, setTransferAlloc] = useState({ id: '', transferToUser: '' });

  const fetchData = async () => {
    try {
      const config = getConfig();
      const [allocRes, assetRes, userRes, deptRes] = await Promise.all([
        axios.get('http://localhost:5000/api/allocations', config),
        axios.get('http://localhost:5000/api/assets', config),
        axios.get('http://localhost:5000/api/users', config),
        axios.get('http://localhost:5000/api/departments', config)
      ]);
      setAllocations(allocRes.data);
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
      fetchData();
    } catch (error) {
      console.error('Failed to allocate asset', error);
      if (error.response?.data?.canRequestTransfer) {
        alert(error.response.data.message + '\nUse the Transfer option instead.');
      } else {
        alert(error.response?.data?.message || 'Failed to allocate asset');
      }
    }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/allocations/${returnAlloc.id}/return`, { conditionNotes: returnAlloc.conditionNotes }, getConfig());
      setIsReturnModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to return asset', error);
    }
  };

  const handleTransferRequest = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/allocations/${transferAlloc.id}/transfer-request`, { transferToUser: transferAlloc.transferToUser }, getConfig());
      setIsTransferModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to request transfer', error);
    }
  };

  const handleTransferApprove = async (id) => {
    if(!window.confirm('Approve this transfer? The asset will be immediately reallocated.')) return;
    try {
      await axios.put(`http://localhost:5000/api/allocations/${id}/transfer-approve`, {}, getConfig());
      fetchData();
    } catch (error) {
      console.error('Failed to approve transfer', error);
    }
  };

  const handleTransferReject = async (id) => {
    if(!window.confirm('Reject this transfer request?')) return;
    try {
      await axios.put(`http://localhost:5000/api/allocations/${id}/transfer-reject`, {}, getConfig());
      fetchData();
    } catch (error) {
      console.error('Failed to reject transfer', error);
    }
  };

  const canApproveTransfers = ['Admin', 'Asset Manager', 'Department Head'].includes(user?.role);

  return (
    <div className="p-8 max-w-7xl mx-auto bg-transparent min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Asset Allocations</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage active bookings, assignments, and transfers.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-brand-600 rounded-none text-sm font-bold text-white hover:bg-brand-700 hover:-translate-y-0.5 transition-all flex items-center shadow-md">
          <Plus size={16} className="mr-2" /> Allocate Asset
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl rounded-none shadow-md border border-slate-200 dark:border-slate-700 p-6 min-h-[500px]">
        {loading ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 font-bold animate-pulse">Loading allocations...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 rounded-none border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-4 font-bold tracking-wider">Asset</th>
                  <th className="px-4 py-4 font-bold tracking-wider">Allocated To</th>
                  <th className="px-4 py-4 font-bold tracking-wider">Expected Return</th>
                  <th className="px-4 py-4 font-bold tracking-wider">Status</th>
                  <th className="px-4 py-4 font-bold tracking-wider">Transfer</th>
                  <th className="px-4 py-4 font-bold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map(alloc => (
                  <tr key={alloc._id} className="border-b border-slate-100 dark:border-slate-800 even:bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{alloc.asset?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 bg-slate-200 dark:bg-slate-700 px-1 inline-block">{alloc.asset?.assetTag || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-300">
                      {alloc.allocatedToUser?.name || alloc.allocatedToDepartment?.name || '—'}
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-bold">
                      {alloc.expectedReturnDate ? new Date(alloc.expectedReturnDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold border flex items-center w-max ${
                        alloc.status === 'Active' ? 'bg-brand-100 text-brand-700 border-brand-200' :
                        alloc.status === 'Returned' ? 'bg-accent-teal/10 text-accent-teal border-accent-teal/20' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}>
                        {alloc.status === 'Active' ? <Clock size={12} className="mr-1"/> : <CheckCircle size={12} className="mr-1"/>}
                        {alloc.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {alloc.transferStatus === 'Requested' ? (
                        <div className="flex flex-col items-start gap-2">
                          <span className="px-2.5 py-1 text-xs font-bold border bg-accent-amber/10 text-accent-amber border-accent-amber/20 flex items-center">
                            <ArrowRightLeft size={12} className="mr-1" /> To: {alloc.transferToUser?.name || 'User'}
                          </span>
                          {canApproveTransfers && (
                            <div className="flex gap-1">
                              <button onClick={() => handleTransferApprove(alloc._id)} className="bg-accent-teal text-white p-1 hover:bg-teal-700 transition-colors shadow-sm" title="Approve">
                                <Check size={14}/>
                              </button>
                              <button onClick={() => handleTransferReject(alloc._id)} className="bg-accent-rose text-white p-1 hover:bg-rose-700 transition-colors shadow-sm" title="Reject">
                                <X size={14}/>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : alloc.transferStatus === 'Approved' ? (
                        <span className="text-xs text-slate-400 font-bold italic">Transferred</span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {alloc.status === 'Active' && alloc.transferStatus !== 'Requested' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setTransferAlloc({ id: alloc._id, transferToUser: '' }); setIsTransferModalOpen(true); }} className="text-xs font-bold text-brand-600 bg-brand-50 border border-brand-200 hover:bg-brand-600 hover:text-white px-3 py-1.5 transition-all shadow-sm flex items-center">
                            <ArrowUpRight size={14} className="mr-1"/> Transfer
                          </button>
                          <button onClick={() => { setReturnAlloc({ id: alloc._id, conditionNotes: '' }); setIsReturnModalOpen(true); }} className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-700 hover:text-white px-3 py-1.5 transition-all shadow-sm">
                            Return
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {allocations.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <ArrowRightLeft size={48} className="text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">No allocations found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Allocate Asset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900/95 backdrop-blur-xl rounded-none shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Allocate Asset</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleAllocate} className="p-6 space-y-4">
              <div className="p-3 bg-brand-50 border border-brand-100 text-brand-800 text-xs font-bold flex items-center">
                <AlertCircle size={16} className="mr-2" /> Only 'Available' assets are shown here. To allocate an in-use asset, use the Transfer flow.
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Select Available Asset</label>
                <select required value={newAlloc.asset} onChange={e => setNewAlloc({...newAlloc, asset: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700  text-slate-900 dark:text-white rounded-none text-sm focus:ring-2 focus:ring-brand-500 outline-none  bg-white dark:bg-slate-800">
                  <option value="">Select Asset...</option>
                  {assets.map(a => <option key={a._id} value={a._id}>{a.name} ({a.assetTag})</option>)}
                </select>
                {assets.length === 0 && <p className="text-xs text-accent-rose mt-1 font-bold">No assets available. Register one first.</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Assign To (User)</label>
                <select required value={newAlloc.allocatedToUser} onChange={e => setNewAlloc({...newAlloc, allocatedToUser: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700  text-slate-900 dark:text-white rounded-none text-sm focus:ring-2 focus:ring-brand-500 outline-none  bg-white dark:bg-slate-800">
                  <option value="">Select Employee...</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Expected Return Date</label>
                <input required type="date" value={newAlloc.expectedReturnDate} onChange={e => setNewAlloc({...newAlloc, expectedReturnDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-none text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm">Cancel</button>
                <button type="submit" disabled={assets.length === 0} className="px-4 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors disabled:opacity-50 shadow-md">Confirm Allocation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Asset Modal */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900/95 backdrop-blur-xl rounded-none shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Return Asset</h2>
              <button onClick={() => setIsReturnModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleReturn} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Condition Notes on Return</label>
                <textarea required rows="3" value={returnAlloc.conditionNotes} onChange={e => setReturnAlloc({...returnAlloc, conditionNotes: e.target.value})} placeholder="e.g. Returned in good working condition, screen scratched..." className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-none text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsReturnModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 transition-colors shadow-md">Mark as Returned</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900/95 backdrop-blur-xl rounded-none shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Request Transfer</h2>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleTransferRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Transfer To (User)</label>
                <select required value={transferAlloc.transferToUser} onChange={e => setTransferAlloc({...transferAlloc, transferToUser: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700  text-slate-900 dark:text-white rounded-none text-sm focus:ring-2 focus:ring-brand-500 outline-none  bg-white dark:bg-slate-800">
                  <option value="">Select Employee...</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                </select>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsTransferModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-brand-700 bg-brand-100 hover:bg-brand-600 hover:text-white transition-colors shadow-md border border-brand-200">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Allocation;
