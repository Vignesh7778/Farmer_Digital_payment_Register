import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="h-16 border-b border-warm-border/60 bg-white px-4 lg:px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-2 lg:gap-3">
        <span className="font-extrabold text-base lg:text-lg text-primary-green tracking-wide shrink-0">🌾 CropLedger</span>
        {user && (
          <span className={`text-[10px] lg:text-xs px-2 py-0.5 lg:py-1 rounded-full font-bold border shrink-0 ${
            user?.role === 'Farmer' 
              ? 'bg-leaf-green/10 text-leaf-green border-leaf-green/20' 
              : 'bg-primary-green/10 text-primary-green border-primary-green/20'
          }`}>
            <span className="lg:hidden">{user?.role === 'Farmer' ? 'Farmer' : 'Operator'}</span>
            <span className="hidden lg:inline">{user?.role === 'Farmer' ? 'Farmer Member Portal' : 'Collection Operator Portal'}</span>
          </span>
        )}
      </div>
      {user && (
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="flex items-center gap-1 lg:gap-2 text-earth-brown text-xs lg:text-sm font-semibold">
            <User className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-leaf-green shrink-0" />
            <span className="hidden sm:inline max-w-[80px] lg:max-w-none truncate">{user.username}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1 text-slate-500 hover:text-red-600 text-xs lg:text-sm font-semibold py-1 px-2 rounded-lg hover:bg-red-50 transition duration-200 cursor-pointer"
            title="Logout"
          >
            <LogOut className="h-3.5 w-3.5 lg:h-4 lg:w-4 shrink-0" />
            <span className="hidden lg:inline">Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
}
