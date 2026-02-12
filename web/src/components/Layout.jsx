import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, LogOut, User, LayoutDashboard, Calendar, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '../api/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = [
    { label: 'Booking', path: '/booking', icon: Calendar, active: location.pathname === '/booking', roles: ['User', 'Admin'] },
    { label: 'Admin', path: '/admin', icon: LayoutDashboard, active: location.pathname === '/admin', roles: ['Admin'] },
    { label: 'Specialist', path: '/specialist', icon: Settings, active: location.pathname === '/specialist', roles: ['Specialist'] },
    { label: 'Perfil', path: '/profile', icon: User, active: location.pathname === '/profile', roles: ['User', 'Specialist', 'Admin'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user?.Role));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden animate-in fade-in duration-500">
      <header className="bg-white border-b border-surface/50 h-24 md:h-20 sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
              <img src="/Logo.png" alt="Electra Logo" className="w-20 h-20 md:w-24 md:h-24 object-contain" />
              <div className="hidden sm:block">
                <h1 className="text-2xl font-black text-accent tracking-tighter leading-none">FieldConnect</h1>
                <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Electra Portal</span>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {filteredNav.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${item.active ? 'bg-primary/10 text-primary' : 'text-secondary hover:bg-surface hover:text-accent'
                  }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-4 border-l border-surface pl-4 md:pl-6">
            <div className="hidden lg:block text-right">
              <p className="text-sm font-black text-accent leading-none">{user?.Name}</p>
              <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                {user?.Role}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={logout}
                className="p-2 md:p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm"
                title="Cerrar Sesión"
              >
                <LogOut size={20} />
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-surface text-accent hover:bg-primary hover:text-white transition-all shadow-sm"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 top-24 z-40 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="absolute inset-0 bg-accent/20 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
            <div className="relative bg-white border-b border-surface shadow-2xl p-6 space-y-4">
              <div className="flex flex-col space-y-2">
                {filteredNav.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-4 p-4 rounded-xl text-lg font-black transition-all ${item.active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-accent hover:bg-surface'
                      }`}
                  >
                    <item.icon size={22} />
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="pt-4 border-t border-surface flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-accent">{user?.Name}</p>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{user?.Role}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black">
                  {user?.Name?.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow container mx-auto px-6 py-10 max-w-7xl">
        <div className="animate-in slide-in-from-bottom-4 duration-700 fill-mode-both">
          <Outlet />
        </div>
      </main>

      <footer className="bg-white border-t border-surface py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-secondary text-sm font-medium">
            &copy; 2026 <span className="text-accent font-bold italic underline decoration-primary">Electra S.A.</span> - Enterprise Field Management.
          </p>
          <div className="flex gap-6 text-xs font-bold text-secondary uppercase tracking-widest">
            <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
            <a href="#" className="hover:text-primary transition-colors">Soporte técnico</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
