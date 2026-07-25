import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../constants';
import {
  LayoutDashboard,
  Users,
  Sprout,
  PlusCircle,
  FileText,
  MessageSquareCode
} from 'lucide-react';

export default function BottomNavigation() {
  const { user } = useAuth();
  if (!user) return null;

  const isFarmer = user?.role === 'Farmer';

  const navItems = isFarmer
    ? [
        { to: ROUTES.DASHBOARD, label: 'Home', icon: LayoutDashboard },
        { to: ROUTES.COLLECTIONS, label: 'Deliveries', icon: PlusCircle },
        { to: ROUTES.STATEMENTS, label: 'Statement', icon: FileText },
      ]
    : [
        { to: ROUTES.DASHBOARD, label: 'Home', icon: LayoutDashboard },
        { to: ROUTES.FARMERS, label: 'Farmers', icon: Users },
        { to: ROUTES.PRODUCE, label: 'Produce', icon: Sprout },
        { to: ROUTES.COLLECTIONS, label: 'Collections', icon: PlusCircle },
        { to: ROUTES.STATEMENTS, label: 'Statements', icon: FileText },
        { to: ROUTES.ASSISTANT, label: 'AI Chat', icon: MessageSquareCode },
      ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-warm-border/60 shadow-[0_-4px_16px_rgba(27,67,50,0.06)] px-2 safe-bottom">
      <div className={`grid h-16 w-full ${isFarmer ? 'grid-cols-3' : 'grid-cols-6'}`}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all duration-250 cursor-pointer ${
                isActive
                  ? 'text-primary-green scale-105'
                  : 'text-slate-400 hover:text-leaf-green'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active top accent line */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.75 bg-primary-green rounded-b-full shadow-[0_1px_4px_rgba(27,67,50,0.4)] animate-pulse" />
                )}
                
                {/* Icon with micro-animation */}
                <item.icon
                  className={`h-5 w-5 transition-transform duration-250 ${
                    isActive ? 'stroke-[2.5px] scale-110' : 'stroke-[1.8px]'
                  }`}
                />
                
                {/* Label */}
                <span className="tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
