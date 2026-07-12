import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Package, ArrowRightLeft, PenTool, CheckSquare, LogOut, Calendar, BarChart3, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const navItems = [
    { type: 'link', label: 'Dashboard', icon: LayoutDashboard, to: '/', section: 'NAVIGATION' },
    { type: 'link', label: 'Organization', icon: Users, to: '/organization', section: 'NAVIGATION', adminOnly: true },
    { type: 'link', label: 'Asset Directory', icon: Package, to: '/assets', section: 'NAVIGATION' },
    { type: 'link', label: 'Allocations', icon: ArrowRightLeft, to: '/allocations', section: 'NAVIGATION' },
    { type: 'link', label: 'Maintenance', icon: PenTool, to: '/maintenance', section: 'NAVIGATION' },
    { type: 'link', label: 'Audits', icon: CheckSquare, to: '/audits', section: 'NAVIGATION' },
    { type: 'link', label: 'Bookings', icon: Calendar, to: '/booking', section: 'NAVIGATION' },
    { type: 'link', label: 'Reports', icon: BarChart3, to: '/analytics', section: 'SYSTEM INSIGHTS' },
    { type: 'link', label: 'Activity Logs', icon: Activity, to: '/logs', section: 'SYSTEM INSIGHTS' },
  ];

  const filteredItems = navItems.filter(i => !i.adminOnly || user.role === 'Admin');

  // Group items by section
  const sections = {};
  filteredItems.forEach(item => {
    if (!sections[item.section]) sections[item.section] = [];
    sections[item.section].push(item);
  });

  return (
    <aside
      className={`flex flex-col h-screen flex-shrink-0 select-none transition-all duration-300 z-40 relative border-r ${
        collapsed ? 'w-[64px]' : 'w-[260px]'
      }`}
      style={{ background: 'var(--bg-sidebar)', borderColor: 'var(--border-default)', color: 'var(--text-sidebar)' }}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 h-[56px]" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(to right, var(--bg-sidebar), transparent)' }}>
        {!collapsed && (
          <div className="flex items-center space-x-3 w-full">
            <div className="h-7 w-7 flex items-center justify-center text-sm font-extrabold text-white shadow-lg relative overflow-hidden group" style={{ background: 'var(--color-primary)', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}>
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
              A
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white tracking-[0.15em] uppercase leading-none">AssetFlow</span>
              <span className="text-[8px] font-mono tracking-widest mt-0.5" style={{ color: 'var(--color-primary)' }}>Enterprise v1.0</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="h-7 w-7 flex items-center justify-center text-sm font-bold text-white mx-auto shadow-lg relative overflow-hidden group" style={{ background: 'var(--color-primary)', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}>
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
            A
          </div>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1 custom-scrollbar">
        {Object.entries(sections).map(([sectionName, items], sIdx) => (
          <div key={sectionName}>
            {/* Section Label */}
            {collapsed ? (
              <div className="h-px w-1/2 mx-auto my-3" style={{ background: 'rgba(255,255,255,0.06)' }}></div>
            ) : (
              <div className="px-6 py-2 mt-2 text-[9px] font-black tracking-[0.2em] uppercase select-none flex items-center space-x-2" style={{ color: 'var(--text-sidebar-label)' }}>
                <span>{sectionName}</span>
                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }}></div>
              </div>
            )}

            {/* Nav Links */}
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center px-6 py-2.5 text-xs font-bold relative group transition-all duration-300 ${
                      isActive
                        ? 'text-white border-l-[3px]'
                        : 'border-l-[3px] border-l-transparent hover:text-white'
                    }`
                  }
                  style={({ isActive }) => ({
                    ...(isActive ? {
                      background: 'linear-gradient(to right, rgba(79, 70, 229, 0.15), transparent)',
                      borderLeftColor: 'var(--color-primary)',
                    } : {
                      color: 'var(--text-sidebar)',
                    })
                  })}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-[1px]" style={{ background: 'var(--color-primary)', boxShadow: '0 0 8px 2px var(--color-primary)' }}></div>
                      )}

                      <Icon
                        size={16}
                        className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'} ${collapsed ? 'mx-auto' : 'mr-3'}`}
                        style={{ color: isActive ? 'var(--color-primary)' : 'var(--text-sidebar)' }}
                      />

                      {!collapsed && <span className="flex-1">{item.label}</span>}

                      {/* Tooltip in collapsed state */}
                      {collapsed && (
                        <div className="absolute left-16 border text-xs font-bold px-3 py-1.5 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50" style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>
                          {item.label}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / Toggle + Logout */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-6 py-2.5 text-xs font-bold transition-all duration-200 group"
          style={{ color: 'var(--text-sidebar)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-sidebar)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut size={16} className={`transition-transform duration-300 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-3.5 transition-colors focus:outline-none group"
          style={{ color: 'var(--text-sidebar)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-sidebar)'; e.currentTarget.style.background = 'transparent'; }}
        >
          {collapsed ? (
            <ChevronRight size={16} className="group-hover:scale-110 transition-transform" />
          ) : (
            <div className="flex items-center space-x-2 text-xs font-bold tracking-widest uppercase">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Collapse Menu</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
