import { Bell, Search, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

export function Topbar() {
  const user = useAuthStore((state) => state.user);

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center flex-1">
        {/* Search Bar */}
        <div className="relative w-full max-w-md hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors"
            placeholder="Buscar jugadores, equipos, fichas..."
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50">
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          <Bell className="h-5 w-5" />
        </button>
        
        {/* Profile Dropdown */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4 ml-2">
          <div className="flex flex-col text-right hidden sm:block">
            <span className="text-sm font-medium text-slate-900 leading-tight">
              {user?.displayName || 'Usuario'}
            </span>
            <span className="text-xs text-slate-500 truncate max-w-[120px]">
              {user?.email || 'Admin'}
            </span>
          </div>
          <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="h-8 w-8 rounded-full" />
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>
          <button 
            onClick={handleSignOut}
            className="ml-2 p-2 text-slate-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
            title="Cerrar sesión"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
