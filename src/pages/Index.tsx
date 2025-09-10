import React from 'react';

const Index = () => {
  return (
    <div className="min-h-screen bg-app-background dark">
      {/* Welcome screen - will be replaced with auth check when Supabase is connected */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-4xl">▶️🎵</span>
            <h1 className="text-4xl font-bold text-app-text-primary">PlaySong</h1>
          </div>
          <p className="text-app-text-secondary text-lg">Conecte-se para ouvir suas músicas favoritas</p>
          <div className="space-y-4">
            <a 
              href="/login" 
              className="inline-block bg-app-accent hover:bg-app-accent-hover text-app-accent-foreground px-8 py-3 rounded-2xl font-semibold transition-colors"
            >
              Fazer Login
            </a>
            <div>
              <p className="text-app-text-muted">
                Não tem conta?{' '}
                <a href="/register" className="text-app-accent hover:text-app-accent-hover">
                  Cadastre-se
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;