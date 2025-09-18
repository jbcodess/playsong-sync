import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Home, Search, Library, Clock, User, Settings, Crown, Menu, X, Palette, Volume2, Bell, Shield, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

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

  const { signOut } = useAuth();

  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(80);

  const handleSectionChange = (section: string) => {
    if (section === 'settings') {
      setShowSettings(true);
      return;
    }
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
                 
                 {/* Logout Button */}
                 <Button
                   variant="ghost"
                   className="w-full justify-start gap-3 h-12 px-4 rounded-xl transition-all text-red-500 hover:text-red-600 hover:bg-red-500/10"
                   onClick={() => {
                     signOut();
                     onToggle();
                   }}
                 >
                   <LogOut className="h-5 w-5" />
                   <span className="font-medium">Sair</span>
                 </Button>
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

          {/* Settings Panel */}
          {showSettings && (
            <div className="absolute inset-0 bg-app-background z-10 overflow-y-auto">
              {/* Settings Header */}
              <div className="flex items-center gap-3 p-6 border-b border-app-surface-hover">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold text-app-text-primary">Configurações</h1>
              </div>

              <div className="p-4 space-y-6">
                {/* Theme Settings */}
                <div className="bg-app-surface rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Palette className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-app-text-primary">Aparência</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-app-text-primary font-medium text-sm">Tema do Aplicativo</h3>
                        <p className="text-app-text-secondary text-xs">Escolha entre tema claro ou escuro</p>
                      </div>
                      <Select defaultValue="dark">
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Claro</SelectItem>
                          <SelectItem value="dark">Escuro</SelectItem>
                          <SelectItem value="auto">Auto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-app-text-primary font-medium text-sm">Cor de Destaque</h3>
                        <p className="text-app-text-secondary text-xs">Personalize a cor principal</p>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-6 h-6 bg-blue-500 rounded-full cursor-pointer border-2 border-white"></div>
                        <div className="w-6 h-6 bg-purple-500 rounded-full cursor-pointer"></div>
                        <div className="w-6 h-6 bg-green-500 rounded-full cursor-pointer"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audio Settings */}
                <div className="bg-app-surface rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <Volume2 className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-app-text-primary">Áudio</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-app-text-primary font-medium text-sm">Volume Principal</h3>
                        <span className="text-app-text-secondary text-xs">{volume}%</span>
                      </div>
                      <Slider 
                        value={[volume]} 
                        max={100} 
                        step={1} 
                        onValueChange={(value) => setVolume(value[0])}
                        className="w-full" 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-app-text-primary font-medium text-sm">Equalização</h3>
                        <p className="text-app-text-secondary text-xs">Ajuste a qualidade do som</p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-app-text-primary font-medium text-sm">Reprodução Cruzada</h3>
                        <p className="text-app-text-secondary text-xs">Transição suave entre músicas</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="bg-app-surface rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <Bell className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-app-text-primary">Notificações</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-app-text-primary font-medium text-sm">Controles de Mídia</h3>
                        <p className="text-app-text-secondary text-xs">Mostrar controles na tela de bloqueio</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-app-text-primary font-medium text-sm">Novos Lançamentos</h3>
                        <p className="text-app-text-secondary text-xs">Notificar sobre artistas seguidos</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                {/* Privacy & Security */}
                <div className="bg-app-surface rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-app-text-primary">Privacidade</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-app-text-primary font-medium text-sm">Perfil Privado</h3>
                        <p className="text-app-text-secondary text-xs">Ocultar suas playlists</p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-app-text-primary font-medium text-sm">Coleta de Dados</h3>
                        <p className="text-app-text-secondary text-xs">Permitir análise para melhorar</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                {/* Help & Support */}
                <div className="bg-app-surface rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <HelpCircle className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-app-text-primary">Ajuda e Suporte</h2>
                  </div>
                  
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start text-app-text-primary text-sm h-8">
                      Central de Ajuda
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-app-text-primary text-sm h-8">
                      Reportar Problema
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-app-text-primary text-sm h-8">
                      Sobre o PlaySong
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};