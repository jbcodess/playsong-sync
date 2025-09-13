import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Home, Search, Library, Clock, User, Settings, Crown, Menu, X } from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onClearHistory?: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ 
  isOpen, 
  onToggle, 
  activeSection, 
  onSectionChange,
  onClearHistory
}) => {
  const navItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'search', label: 'Explorar', icon: Search },
    { id: 'library', label: 'Minha Biblioteca', icon: Library },
    { id: 'history', label: 'Histórico', icon: Clock },
  ];

  const userItems = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'settings', label: 'Configurações', icon: Settings },
    { id: 'upgrade', label: 'Upgrade', icon: Crown },
  ];

  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    onToggle(); // Close drawer on mobile after selection
  };

  return (
    <>
      {/* Mobile Menu Button - Always visible on mobile */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 md:hidden bg-app-surface/90 backdrop-blur-sm hover:bg-app-surface-hover text-app-text-primary border border-app-surface-hover"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Drawer */}
      <Sheet open={isOpen} onOpenChange={onToggle}>
        <SheetContent 
          side="left" 
          className="w-80 bg-app-sidebar border-app-surface-hover p-0"
        >
          <div className="flex flex-col h-full">
            {/* Logo Section */}
            <div className="p-6 border-b border-app-surface-hover">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center overflow-hidden">
                  <img 
                    src="/lovable-uploads/67508e0d-5de8-4d0a-a3e9-3d86ae04639e.png" 
                    alt="PlaySong" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <h1 className="text-2xl font-bold text-app-text-primary">PlaySong</h1>
              </div>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 p-4">
              <div className="space-y-1 mb-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={`w-full justify-start gap-3 h-12 px-4 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-app-accent/10 text-app-accent border border-app-accent/20' 
                          : 'text-app-text-secondary hover:text-app-text-primary hover:bg-app-surface-hover'
                      }`}
                      onClick={() => handleSectionChange(item.id)}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="h-px bg-app-surface-hover mb-6" />

              {/* User Section */}
              <div className="space-y-1">
                {userItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={`w-full justify-start gap-3 h-12 px-4 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-app-accent/10 text-app-accent border border-app-accent/20' 
                          : 'text-app-text-secondary hover:text-app-text-primary hover:bg-app-surface-hover'
                      }`}
                      onClick={() => handleSectionChange(item.id)}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Clear History Button (only show in history section) */}
            {activeSection === 'history' && (
              <div className="p-4 border-t border-app-surface-hover">
                <Button
                  variant="outline"
                  onClick={() => {
                    onClearHistory?.();
                    onToggle();
                  }}
                  className="w-full text-destructive border-destructive/20 hover:bg-destructive/10"
                >
                  Limpar Histórico
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};