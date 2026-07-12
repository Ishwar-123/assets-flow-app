import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext, getConfig } from '../context/AuthContext';
import { CheckSquare, Plus, Calendar, X, AlertCircle, FileText, CheckCircle, Search } from 'lucide-react';

const Audit = () => {
  const { user } = useContext(AuthContext);
  const [audits, setAudits] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAudit, setNewAudit] = useState({ name: '', startDate: '', endDate: '', auditors: [], scopeDepartment: '', scopeLocation: '' });

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [selectedAuditId, setSelectedAuditId] = useState(null);

  const [isExecuteOpen, setIsExecuteOpen] = useState(false);
  const [activeAuditForExecute, setActiveAuditForExecute] = useState(null);

  const fetchData = async () => {
    try {
      const config = getConfig();
      if (!config) return;
      const [auditRes, userRes, deptRes] = await Promise.all([
        axios.get('http://localhost:5000/api/audits', config),
        axios.get('http://localhost:5000/api/users', config),
        axios.get('http://localhost:5000/api/departments', config)
      ]);
      setAudits(auditRes.data);
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

  const handleStartCycle = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/audits', newAudit, getConfig());
      setIsModalOpen(false);
      setNewAudit({ name: '', startDate: '', endDate: '', auditors: [], scopeDepartment: '', scopeLocation: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to start audit cycle', error);
      alert('Failed to start audit cycle');
    }
  };

  const toggleAuditor = (userId) => {
    setNewAudit(prev => {
      const auditors = [...prev.auditors];
      if (auditors.includes(userId)) {
        return { ...prev, auditors: auditors.filter(id => id !== userId) };
      } else {
        return { ...prev, auditors: [...auditors, userId] };
      }
    });
  };

  const handleViewReport = async (auditId) => {
    try {
      setSelectedAuditId(auditId);
      const { data } = await axios.get(`http://localhost:5000/api/audits/${auditId}/discrepancies`, getConfig());
      setReportData(data);
      setIsReportOpen(true);
    } catch (error) {
      console.error('Failed to load report', error);
      alert('Failed to load discrepancy report');
    }
  };

  const handleCloseCycle = async (auditId) => {
    if(!window.confirm("Are you sure you want to close this audit cycle? This will lock the cycle and mark missing assets as 'Lost'.")) return;
    try {
      await axios.put(`http://localhost:5000/api/audits/${auditId}/close`, {}, getConfig());
      fetchData();
    } catch (error) {
      console.error('Failed to close cycle', error);
      alert(error.response?.data?.message || 'Failed to close audit cycle. Ensure all items are verified.');
    }
  };

  const handleVerifyAsset = async (assetId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/audits/${activeAuditForExecute._id}/verify-item`, {
        assetId,
        verifiedStatus: status,
        notes: ''
      }, getConfig());
      
      // Update local state to reflect changes instantly
      setActiveAuditForExecute(prev => ({
        ...prev,
        discrepancies: prev.discrepancies.map(d => 
          d.asset._id === assetId ? { ...d, verifiedStatus: status } : d
        )
      }));
      fetchData();
    } catch (error) {
      console.error('Failed to verify asset', error);
      alert(error.response?.data?.message || 'Failed to verify asset');
    }
  };

  const canManageAudits = ['Admin', 'Asset Manager'].includes(user?.role);

  return (
    <div className="p-8 bg-transparent min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Audit Cycles</h1>
          <p className="text-[var(--text-muted)] mt-1">Manage scheduled physical verifications.</p>
        </div>
        {canManageAudits && (
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-[var(--color-primary)] text-sm font-bold text-white hover:bg-[var(--color-primary-hover)] hover:-translate-y-0.5 transition-all flex items-center shadow-md">
            <Plus size={16} className="mr-2" /> Start Audit Cycle
          </button>
        )}
      </div>

      <div className="bg-[var(--bg-surface)] shadow-md border border-[var(--border-default)] p-6 min-h-[500px]">
        {loading ? (
          <div className="py-12 text-center text-[var(--text-muted)] font-bold animate-pulse">Loading audits...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audits.map(audit => (
              <div key={audit._id} className="border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                  <CheckSquare size={100} className="text-[var(--color-primary)]" />
                </div>
                
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">{audit.name}</h3>
                  <span className={`px-2 py-0.5 text-xs font-bold border ${audit.status === 'Active' ? 'bg-accent-amber/10 text-[var(--color-warning)] border-accent-amber/20' : 'bg-[var(--bg-surface-2)] text-[var(--text-muted)] border-[var(--border-default)]'}`}>
                    {audit.status}
                  </span>
                </div>
                
                <div className="flex items-center text-sm font-bold text-[var(--text-muted)] mb-4 relative z-10">
                  <Calendar size={14} className="mr-2 text-[var(--color-primary)]" />
                  {new Date(audit.startDate).toLocaleDateString()} - {new Date(audit.endDate).toLocaleDateString()}
                </div>
                
                <div className="mt-4 pt-4 border-t border-[var(--border-default)] relative z-10">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Assigned Auditors</p>
                  <div className="flex -space-x-2">
                    {audit.auditors.map((auditor, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-brand-100 text-[var(--color-primary)] flex items-center justify-center text-xs font-bold" title={auditor.name}>
                        {auditor.name.charAt(0)}
                      </div>
                    ))}
                    {audit.auditors.length === 0 && <span className="text-sm font-medium text-[var(--text-muted)]">None assigned</span>}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--border-default)] relative z-10 space-y-2">
                  {audit.auditors.some(a => a._id === user?.id || a === user?.id) && audit.status !== 'Closed' && (
                    <button onClick={() => { setActiveAuditForExecute(audit); setIsExecuteOpen(true); }} className="w-full py-2 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] text-sm font-bold transition-colors flex justify-center items-center shadow-md">
                      <CheckSquare size={14} className="mr-2"/> Execute Audit
                    </button>
                  )}
                  <button onClick={() => handleViewReport(audit._id)} className="w-full py-2 bg-[var(--bg-surface-2)] text-[var(--color-primary)] border border-[var(--border-default)] hover:bg-brand-50 hover:border-brand-200 text-sm font-bold transition-colors flex justify-center items-center">
                    <FileText size={14} className="mr-2"/> View Discrepancy Report
                  </button>
                  {canManageAudits && audit.status === 'Active' && (
                    <button onClick={() => handleCloseCycle(audit._id)} className="w-full py-2 bg-[var(--bg-surface)] text-[var(--color-error)] border border-accent-rose hover:bg-accent-rose hover:text-white text-sm font-bold transition-colors flex justify-center items-center">
                      <CheckCircle size={14} className="mr-2"/> Close Audit Cycle
                    </button>
                  )}
                </div>
              </div>
            ))}
            {audits.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <CheckSquare size={48} className="text-slate-300 mb-4" />
                <p className="text-[var(--text-muted)] font-bold text-lg">No audit cycles found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Discrepancy Report Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-surface)] shadow-2xl w-full max-w-2xl overflow-hidden border border-[var(--border-default)] flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-default)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center"><AlertCircle className="mr-2 text-[var(--color-error)]"/> Discrepancy Report</h2>
              <button onClick={() => setIsReportOpen(false)} className="text-slate-400 hover:text-[var(--text-secondary)] transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              {reportData.length === 0 ? (
                <div className="text-center py-10 bg-[var(--bg-surface-2)] border border-[var(--border-default)]">
                  <CheckCircle className="w-12 h-12 text-[var(--color-success)] mb-3" />
                  <p className="text-[var(--text-muted)] font-bold">No discrepancies found in this cycle.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reportData.map((item, idx) => (
                    <div key={idx} className="bg-[var(--bg-surface)] border border-[var(--border-default)] p-4 shadow-sm flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-2 py-0.5 text-xs font-bold border ${item.verifiedStatus === 'Missing' ? 'bg-accent-rose/10 text-[var(--color-error)] border-accent-rose/20' : 'bg-accent-amber/10 text-[var(--color-warning)] border-accent-amber/20'}`}>
                            {item.verifiedStatus}
                          </span>
                        </div>
                        <h4 className="font-bold text-[var(--text-primary)]">{item.asset?.name}</h4>
                        <p className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-surface-2)] px-1 inline-block mt-1">{item.asset?.assetTag}</p>
                        {item.notes && <p className="text-sm text-[var(--text-secondary)] mt-2 bg-[var(--bg-surface-2)] p-2 border border-[var(--border-default)]">{item.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Execute Audit Modal */}
      {isExecuteOpen && activeAuditForExecute && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-surface)] shadow-2xl w-full max-w-4xl overflow-hidden border border-[var(--border-default)] flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-default)]">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center"><CheckSquare className="mr-2 text-[var(--color-primary)]"/> Execute Audit: {activeAuditForExecute.name}</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Mark the physical status of each asset.</p>
              </div>
              <button onClick={() => { setIsExecuteOpen(false); setActiveAuditForExecute(null); }} className="text-slate-400 hover:text-[var(--text-secondary)] transition-colors"><X size={20} /></button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-6">
              <div className="grid grid-cols-1 gap-4">
                {activeAuditForExecute.discrepancies.map((item, idx) => (
                  <div key={idx} className="bg-[var(--bg-surface)] border border-[var(--border-default)] p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-[var(--text-primary)] text-lg">{item.asset?.name || 'Unknown Asset'}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono font-bold text-[var(--text-secondary)] bg-[var(--bg-surface-2)] px-2 py-0.5 border border-[var(--border-default)]">{item.asset?.assetTag || 'N/A'}</span>
                        <span className="text-xs text-[var(--text-muted)]">{item.asset?.location || 'No Location specified'}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleVerifyAsset(item.asset?._id, 'Verified')}
                        className={`px-4 py-2 text-sm font-bold border transition-colors ${item.verifiedStatus === 'Verified' ? 'bg-accent-teal text-white border-accent-teal shadow-md' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-accent-teal/10 hover:text-[var(--color-success)] hover:border-accent-teal/30'}`}
                      >
                        Verified
                      </button>
                      <button 
                        onClick={() => handleVerifyAsset(item.asset?._id, 'Missing')}
                        className={`px-4 py-2 text-sm font-bold border transition-colors ${item.verifiedStatus === 'Missing' ? 'bg-accent-rose text-white border-accent-rose shadow-md' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-accent-rose/10 hover:text-[var(--color-error)] hover:border-accent-rose/30'}`}
                      >
                        Missing
                      </button>
                      <button 
                        onClick={() => handleVerifyAsset(item.asset?._id, 'Damaged')}
                        className={`px-4 py-2 text-sm font-bold border transition-colors ${item.verifiedStatus === 'Damaged' ? 'bg-accent-amber text-white border-accent-amber shadow-md' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-accent-amber/10 hover:text-[var(--color-warning)] hover:border-accent-amber/30'}`}
                      >
                        Damaged
                      </button>
                    </div>
                  </div>
                ))}
                {(!activeAuditForExecute.discrepancies || activeAuditForExecute.discrepancies.length === 0) && (
                  <div className="text-center py-10 bg-[var(--bg-surface-2)] border border-[var(--border-default)]">
                    <p className="text-[var(--text-muted)] font-bold">No assets found in scope for this cycle.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-[var(--border-default)] bg-[var(--bg-surface-2)] flex justify-end">
              <button onClick={() => { setIsExecuteOpen(false); setActiveAuditForExecute(null); }} className="px-6 py-2 bg-[var(--color-primary)] text-white font-bold text-sm hover:bg-[var(--color-primary-hover)] shadow-md">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start Audit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-surface)] shadow-2xl w-full max-w-md overflow-hidden border border-[var(--border-default)]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-default)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Start New Audit Cycle</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-[var(--text-secondary)] transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleStartCycle} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-[var(--text-primary)] mb-1">Audit Cycle Name</label>
                <input required type="text" value={newAudit.name} onChange={e => setNewAudit({...newAudit, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none" placeholder="e.g. Q3 Electronics Audit" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[var(--text-primary)] mb-1">Scope: Department</label>
                  <select value={newAudit.scopeDepartment} onChange={e => setNewAudit({...newAudit, scopeDepartment: e.target.value})} className="w-full px-3 py-2 border border-slate-300  text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none  bg-[var(--bg-surface)]">
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--text-primary)] mb-1">Scope: Location</label>
                  <input type="text" value={newAudit.scopeLocation} onChange={e => setNewAudit({...newAudit, scopeLocation: e.target.value})} className="w-full px-3 py-2 border border-slate-300 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none" placeholder="e.g. Building A" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[var(--text-primary)] mb-1">Start Date</label>
                  <input required type="date" value={newAudit.startDate} onChange={e => setNewAudit({...newAudit, startDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--text-primary)] mb-1">End Date</label>
                  <input required type="date" value={newAudit.endDate} onChange={e => setNewAudit({...newAudit, endDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Assign Auditors</label>
                <div className="border border-slate-300 bg-[var(--bg-surface)] text-[var(--text-primary)] p-2 max-h-40 overflow-y-auto space-y-1 bg-[var(--bg-surface-2)]">
                  {users.filter(u => ['Admin', 'Asset Manager', 'Department Head'].includes(u.role)).map(u => (
                    <label key={u._id} className="flex items-center space-x-2 p-1.5 hover:bg-white dark:hover:bg-slate-900 cursor-pointer border border-transparent hover:border-[var(--border-default)] transition-colors">
                      <input 
                        type="checkbox" 
                        checked={newAudit.auditors.includes(u._id)}
                        onChange={() => toggleAuditor(u._id)}
                        className="rounded-none border-slate-300 bg-[var(--bg-surface)] text-[var(--text-primary)] text-[var(--color-primary)] focus:ring-brand-500"
                      />
                      <span className="text-sm font-bold text-[var(--text-primary)]">{u.name} <span className="font-normal text-[var(--text-muted)] ml-1">({u.role})</span></span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-colors shadow-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-colors shadow-md">Launch Cycle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Audit;
