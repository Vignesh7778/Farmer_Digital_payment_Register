import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="h-16 border-b border-warm-border/60 bg-white px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="font-extrabold text-lg text-primary-green tracking-wide">🌾 FPG Digital Register</span>
        <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
          user?.role === 'Farmer' 
            ? 'bg-leaf-green/10 text-leaf-green border-leaf-green/20' 
            : 'bg-primary-green/10 text-primary-green border-primary-green/20'
        }`}>
          {user?.role === 'Farmer' ? 'Farmer member Portal' : 'Collection operator Portal'}
        </span>
      </div>
      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-earth-brown text-sm font-semibold">
            <User className="h-4 w-4 text-leaf-green" />
            <span>{user.username}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-slate-500 hover:text-red-600 text-sm font-semibold py-1 px-2.5 rounded-lg hover:bg-red-50 transition duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
}
