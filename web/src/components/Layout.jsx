import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-primary text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-8 h-8" />
            <h1 className="text-2xl font-bold tracking-tight">FieldConnect</h1>
          </div>
          <nav>
            <Link to="/" className="hover:underline">Inicio</Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; 2026 Electra S.A. - Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
