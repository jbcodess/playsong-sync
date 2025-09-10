import React from 'react';
import { History as HistoryIcon, Trash2, User, Settings, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Link } from 'react-router-dom';

const History = () => {
  const [history, setHistory] = useLocalStorage<any[]>('playsong-history', []);

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-app-text-primary mb-2">Histórico</h1>
        <p className="text-app-text-secondary">Suas músicas reproduzidas recentemente</p>
      </div>

      {/* History */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <HistoryIcon className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-app-text-primary">Reproduzido Recentemente</h2>
          </div>
          
          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearHistory}
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Histórico
            </Button>
          )}
        </div>
        
        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((track, index) => (
              <div
                key={`${track.id}-${index}`}
                className="bg-app-surface rounded-2xl p-4 hover:bg-app-surface-hover transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={track.albumArt}
                    alt={track.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-app-text-primary font-semibold truncate">{track.title}</h3>
                    <p className="text-app-text-secondary truncate">{track.artist}</p>
                  </div>
                  <div className="text-app-text-muted text-sm">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-app-surface rounded-2xl">
            <HistoryIcon className="h-12 w-12 text-app-text-muted mx-auto mb-4" />
            <p className="text-app-text-secondary text-lg">Nenhum histórico ainda</p>
            <p className="text-app-text-muted">Reproduza músicas para ver o histórico aqui</p>
          </div>
        )}
      </div>

      {/* User Profile Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/profile" className="bg-app-surface rounded-2xl p-6 hover:bg-app-surface-hover transition-colors group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-app-accent to-blue-500 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-app-text-primary font-semibold group-hover:text-app-accent transition-colors">
                Meu Perfil
              </h3>
              <p className="text-app-text-secondary text-sm">Ver e editar perfil</p>
            </div>
          </div>
        </Link>

        <Link to="/settings" className="bg-app-surface rounded-2xl p-6 hover:bg-app-surface-hover transition-colors group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-app-text-primary font-semibold group-hover:text-app-accent transition-colors">
                Configurações
              </h3>
              <p className="text-app-text-secondary text-sm">Personalizar app</p>
            </div>
          </div>
        </Link>

        <Link to="/upgrade" className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 hover:scale-105 transition-transform group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">
                Upgrade
              </h3>
              <p className="text-white/80 text-sm">Acesso premium</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default History;