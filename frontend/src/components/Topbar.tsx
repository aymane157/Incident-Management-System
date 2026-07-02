import { Bell, Search } from 'lucide-react';

export default function Topbar() {
  return (
    <div className="h-16 border-b border-gray-200 bg-surface/50 backdrop-blur-sm sticky top-0 z-40 flex items-center justify-between px-8">
      <div className="flex items-center space-x-2 text-sm text-muted">
        <span>Incidents</span>
        <span>/</span>
        <span className="text-text font-medium">Dashboard</span>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="relative group cursor-pointer hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <div className="bg-background border border-gray-200 rounded-full py-1.5 pl-10 pr-4 text-sm flex items-center space-x-8 hover:border-gray-300 transition-colors">
            <span className="text-gray-500">Search anything...</span>
            <div className="flex items-center space-x-1">
              <kbd className="bg-white border border-gray-200 rounded px-1.5 text-xs text-gray-500 shadow-sm font-sans">Ctrl</kbd>
              <kbd className="bg-white border border-gray-200 rounded px-1.5 text-xs text-gray-500 shadow-sm font-sans">K</kbd>
            </div>
          </div>
        </div>
        
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition text-gray-600">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border-2 border-white"></span>
        </button>
      </div>
    </div>
  );
}