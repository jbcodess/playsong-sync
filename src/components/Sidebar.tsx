import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, Search, Library, Clock, Menu, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onToggle, 
  activeSection, 
  onSectionChange 
}) => {
  const navItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'search', label: 'Explorar', icon: Search },
    { id: 'library', label: 'Minha Biblioteca', icon: Library },
    { id: 'history', label: 'Histórico', icon: Clock },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 md:hidden bg-app-surface/80 backdrop-blur-sm hover:bg-app-surface text-app-text-primary"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-app-sidebar z-40
        transform transition-transform duration-300 ease-in-out
        md:relative md:transform-none md:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 pt-12 md:pt-0">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/lovable-uploads/67508e0d-5de8-4d0a-a3e9-3d86ae04639e.png" alt="PlaySong" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-app-text-primary">PlaySong</h1>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "music-card" : "ghost"}
                  className={`w-full justify-start gap-3 ${
                    isActive 
                      ? 'bg-app-surface-hover text-app-text-primary' 
                      : 'text-app-text-secondary hover:text-app-text-primary hover:bg-app-surface-hover'
                  }`}
                  onClick={() => {
                    onSectionChange(item.id);
                    if (window.innerWidth < 768) onToggle();
                  }}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};