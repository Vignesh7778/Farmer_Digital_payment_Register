import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../constants';
import {
  LayoutDashboard,
  Users,
  Sprout,
  PlusCircle,
  History,
  FileText,
  MessageSquareCode,
  SlidersHorizontal,
  Info
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  const isFarmer = user?.role === 'Farmer';

  const navItems = isFarmer
    ? [
        { to: ROUTES.DASHBOARD, label: 'My Dashboard', icon: LayoutDashboard },
        { to: ROUTES.COLLECTIONS, label: 'My Deliveries', icon: PlusCircle },
        { to: ROUTES.STATEMENTS, label: 'My Statement', icon: FileText },
      ]
    : [
        { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
        { to: ROUTES.FARMERS, label: 'Farmers', icon: Users },
        { to: ROUTES.PRODUCE, label: 'Produce Types', icon: Sprout },
        { to: ROUTES.COLLECTIONS, label: 'Produce Collections', icon: PlusCircle },
        { to: ROUTES.STATEMENTS, label: 'Farmer Statements', icon: FileText },
        { to: ROUTES.ASSISTANT, label: 'AI Assistant', icon: MessageSquareCode },
      ];

  return (
    <aside className="w-64 border-r border-warm-border/60 bg-white min-h-[calc(100vh-4rem)] flex flex-col p-4 shadow-sm select-none">
      <div className="flex-1 flex flex-col gap-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-leaf-green/10 text-primary-green border-l-4 border-leaf-green shadow-sm'
                  : 'text-earth-brown/80 hover:bg-warm-cream/60 hover:text-primary-green'
              }`
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
      <div className="pt-4 border-t border-warm-border/50 text-[10px] uppercase font-bold text-slate-400 text-center tracking-wider">
        <span>🌾 CropLedger Desk v1.0.0</span>
      </div>
    </aside>
  );
}
