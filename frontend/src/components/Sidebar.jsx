import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Package, ArrowRightLeft, PenTool, CheckSquare, LogOut, Calendar, BarChart3, Activity } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/', section: 'main' },
    { label: 'Organization', icon: Users, to: '/organization', section: 'main', adminOnly: true },
    { label: 'Asset Directory', icon: Package, to: '/assets', section: 'main' },
    { label: 'Allocations', icon: ArrowRightLeft, to: '/allocations', section: 'main' },
    { label: 'Maintenance', icon: PenTool, to: '/maintenance', section: 'main' },
    { label: 'Audits', icon: CheckSquare, to: '/audits', section: 'main' },
    { label: 'Bookings', icon: Calendar, to: '/booking', section: 'main' },
    { label: 'Reports', icon: BarChart3, to: '/analytics', section: 'insights' },
    { label: 'Activity Logs', icon: Activity, to: '/logs', section: 'insights' },
  ];

  const mainItems = navItems.filter(i => i.section === 'main' && (!i.adminOnly || user.role === 'Admin'));
  const insightItems = navItems.filter(i => i.section === 'insights');

  const getRoleBadgeColor = () => {
    switch (user.role) {
      case 'Admin': return 'from-brand-600 to-brand-700 text-white';
      case 'Asset Manager': return 'from-emerald-500 to-teal-600 text-white';
      case 'Department Head': return 'from-amber-500 to-orange-600 text-white';
      default: return 'from-slate-500 to-slate-600 text-white';
    }
  };

  return (
    <div className="w-[260px] h-screen flex-shrink-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col border-r border-slate-800/60 relative overflow-hidden">
      
      {/* Decorative subtle glow */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-brand-600/5 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-brand-600/5 to-transparent pointer-events-none"></div>

      {/* Logo Section */}
      <div className="relative z-10 px-5 pt-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Package size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-tight leading-tight">AssetFlow</h1>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-[0.15em]">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 relative z-10 px-3 pt-2 pb-4 space-y-0.5 overflow-y-auto scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
        
        <p className="px-3 pt-1 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Navigation</p>
        
        {mainItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 text-[13px] transition-all duration-200 relative ${
                isActive
                  ? 'text-white bg-brand-600/15 font-bold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator bar */}
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 transition-all duration-200 ${
                  isActive ? 'bg-brand-500 shadow-sm shadow-brand-500/50' : 'bg-transparent group-hover:bg-slate-600 group-hover:h-4'
                }`}></div>
                
                <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  isActive ? 'bg-brand-500/15 text-brand-400' : 'text-slate-500 group-hover:text-slate-300 group-hover:bg-slate-800'
                }`}>
                  <item.icon size={17} />
                </div>
                <span className="truncate">{item.label}</span>
                
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 bg-brand-400 rounded-full shadow-sm shadow-brand-400/50"></div>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Section separator */}
        <div className="pt-4 pb-1">
          <div className="mx-3 h-px bg-gradient-to-r from-transparent via-slate-700/40 to-transparent mb-3"></div>
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">System Insights</p>
        </div>

        {insightItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 text-[13px] transition-all duration-200 relative ${
                isActive
                  ? 'text-white bg-brand-600/15 font-bold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 transition-all duration-200 ${
                  isActive ? 'bg-brand-500 shadow-sm shadow-brand-500/50' : 'bg-transparent group-hover:bg-slate-600 group-hover:h-4'
                }`}></div>
                
                <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  isActive ? 'bg-brand-500/15 text-brand-400' : 'text-slate-500 group-hover:text-slate-300 group-hover:bg-slate-800'
                }`}>
                  <item.icon size={17} />
                </div>
                <span className="truncate">{item.label}</span>
                
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 bg-brand-400 rounded-full shadow-sm shadow-brand-400/50"></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="relative z-10 p-3 border-t border-slate-800/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-[13px] font-medium text-slate-400 hover:text-accent-rose hover:bg-accent-rose/10 transition-all duration-200 group"
        >
          <div className="w-8 h-8 flex items-center justify-center text-slate-500 group-hover:text-accent-rose group-hover:bg-accent-rose/10 transition-all duration-200">
            <LogOut size={17} />
          </div>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
