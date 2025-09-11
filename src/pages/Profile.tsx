import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, LogOut, Edit } from 'lucide-react';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setDisplayName(data.display_name || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: displayName
        });

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso"
      });
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso"
    });
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-24 h-24 bg-app-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-12 w-12 text-app-accent-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-app-text-primary">Meu Perfil</h1>
      </div>

      <div className="bg-app-surface rounded-2xl p-6 shadow-card max-w-md mx-auto">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-app-text-primary">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email || ''}
              disabled
              className="bg-app-surface-hover border-app-surface-hover text-app-text-secondary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-app-text-primary">Nome de Exibição</Label>
            <div className="flex gap-2">
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={!editing}
                placeholder="Seu nome"
                className="bg-app-surface-hover border-app-surface-hover text-app-text-primary"
              />
              {!editing ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setEditing(true)}
                  className="border-app-accent text-app-accent hover:bg-app-accent hover:text-app-accent-foreground"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>

          {editing && (
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-app-accent hover:bg-app-accent-hover text-app-accent-foreground"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  loadProfile();
                }}
                className="border-app-surface-hover text-app-text-secondary hover:bg-app-surface-hover"
              >
                Cancelar
              </Button>
            </div>
          )}
        </form>

        <div className="mt-6 pt-6 border-t border-app-surface-hover">
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair da Conta
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;