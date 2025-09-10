import React from 'react';
import { Settings, Palette, Volume2, Bell, Shield, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SettingsPage = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-app-text-primary mb-2">Configurações</h1>
        <p className="text-app-text-secondary">Personalize sua experiência no PlaySong</p>
      </div>

      {/* Theme Settings */}
      <div className="bg-app-surface rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
            <Palette className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-app-text-primary">Aparência</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-app-text-primary font-semibold">Tema do Aplicativo</h3>
              <p className="text-app-text-secondary text-sm">Escolha entre tema claro ou escuro</p>
            </div>
            <Select defaultValue="dark">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
                <SelectItem value="auto">Automático</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-app-text-primary font-semibold">Cor de Destaque</h3>
              <p className="text-app-text-secondary text-sm">Personalize a cor principal do app</p>
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full cursor-pointer border-2 border-white"></div>
              <div className="w-8 h-8 bg-purple-500 rounded-full cursor-pointer"></div>
              <div className="w-8 h-8 bg-green-500 rounded-full cursor-pointer"></div>
              <div className="w-8 h-8 bg-red-500 rounded-full cursor-pointer"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Settings */}
      <div className="bg-app-surface rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <Volume2 className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-app-text-primary">Áudio</h2>
        </div>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-app-text-primary font-semibold">Volume Principal</h3>
              <span className="text-app-text-secondary text-sm">80%</span>
            </div>
            <Slider defaultValue={[80]} max={100} step={1} className="w-full" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-app-text-primary font-semibold">Equalização</h3>
              <p className="text-app-text-secondary text-sm">Ajuste a qualidade do som</p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-app-text-primary font-semibold">Reprodução Cruzada</h3>
              <p className="text-app-text-secondary text-sm">Transição suave entre músicas</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-app-surface rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-app-text-primary">Notificações</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-app-text-primary font-semibold">Controles de Mídia</h3>
              <p className="text-app-text-secondary text-sm">Mostrar controles na tela de bloqueio</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-app-text-primary font-semibold">Novos Lançamentos</h3>
              <p className="text-app-text-secondary text-sm">Notificar sobre artistas seguidos</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-app-surface rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-app-text-primary">Privacidade e Segurança</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-app-text-primary font-semibold">Perfil Privado</h3>
              <p className="text-app-text-secondary text-sm">Ocultar suas playlists e atividades</p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-app-text-primary font-semibold">Coleta de Dados</h3>
              <p className="text-app-text-secondary text-sm">Permitir análise para melhorar o app</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>

      {/* Help & Support */}
      <div className="bg-app-surface rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <HelpCircle className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-app-text-primary">Ajuda e Suporte</h2>
        </div>
        
        <div className="space-y-3">
          <Button variant="ghost" className="w-full justify-start text-app-text-primary">
            Central de Ajuda
          </Button>
          <Button variant="ghost" className="w-full justify-start text-app-text-primary">
            Reportar Problema
          </Button>
          <Button variant="ghost" className="w-full justify-start text-app-text-primary">
            Sobre o PlaySong
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;