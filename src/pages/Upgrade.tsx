import React from 'react';
import { Crown, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Upgrade = () => {
  const plans = [
    {
      name: '1 Mês',
      price: 'R$ 9,90',
      period: '/mês',
      popular: false,
      features: [
        'Sem anúncios',
        'Download de músicas',
        'Qualidade de áudio superior',
        'Modo offline'
      ]
    },
    {
      name: '3 Meses',
      price: 'R$ 24,90',
      period: '/trimestre',
      popular: true,
      originalPrice: 'R$ 29,70',
      features: [
        'Sem anúncios',
        'Download de músicas',
        'Qualidade de áudio superior',
        'Modo offline',
        'Playlists ilimitadas'
      ]
    },
    {
      name: '6 Meses',
      price: 'R$ 44,90',
      period: '/semestre',
      popular: false,
      originalPrice: 'R$ 59,40',
      features: [
        'Sem anúncios',
        'Download de músicas',
        'Qualidade de áudio superior',
        'Modo offline',
        'Playlists ilimitadas',
        'Suporte prioritário'
      ]
    },
    {
      name: '1 Ano',
      price: 'R$ 79,90',
      period: '/ano',
      popular: false,
      originalPrice: 'R$ 118,80',
      features: [
        'Todos os recursos Premium',
        'Acesso antecipado a novidades',
        'Suporte VIP',
        'Backup na nuvem',
        'Sem limites'
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown className="h-8 w-8 text-yellow-500" />
          <h1 className="text-4xl font-bold text-app-text-primary">PlaySong Premium</h1>
        </div>
        <p className="text-app-text-secondary text-lg">
          Desbloqueie todo o potencial da sua experiência musical
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-app-surface rounded-2xl p-6 border border-app-surface-hover">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-app-text-primary font-semibold text-lg">Plano Atual</h3>
            <p className="text-app-text-secondary">Gratuito</p>
          </div>
          <div className="text-right">
            <p className="text-app-text-primary font-semibold">R$ 0,00</p>
            <p className="text-app-text-secondary text-sm">Com anúncios</p>
          </div>
        </div>
      </div>

      {/* Premium Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative bg-app-surface rounded-2xl p-6 transition-all duration-200 hover:scale-105 ${
              plan.popular 
                ? 'border-2 border-app-accent shadow-lg' 
                : 'border border-app-surface-hover hover:border-app-accent'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-app-accent text-app-accent-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Mais Popular
                </div>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-app-text-primary font-bold text-xl mb-2">{plan.name}</h3>
              <div className="mb-2">
                {plan.originalPrice && (
                  <p className="text-app-text-muted line-through text-sm">{plan.originalPrice}</p>
                )}
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-app-accent">{plan.price}</span>
                  <span className="text-app-text-secondary text-sm">{plan.period}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-app-text-secondary text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <Button 
              className={`w-full ${
                plan.popular 
                  ? 'bg-app-accent hover:bg-app-accent-hover text-app-accent-foreground' 
                  : 'bg-app-surface-hover hover:bg-app-accent hover:text-app-accent-foreground text-app-text-primary'
              }`}
            >
              Escolher Plano
            </Button>
          </div>
        ))}
      </div>

      {/* Benefits */}
      <div className="bg-gradient-to-br from-app-accent/10 to-blue-500/10 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-app-text-primary mb-6 text-center">
          Por que escolher o Premium?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-app-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-app-text-primary font-semibold mb-2">Sem Anúncios</h3>
            <p className="text-app-text-secondary text-sm">
              Desfrute de música ininterrupta sem pausas para anúncios
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-app-text-primary font-semibold mb-2">Qualidade Superior</h3>
            <p className="text-app-text-secondary text-sm">
              Áudio de alta qualidade para a melhor experiência musical
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-app-text-primary font-semibold mb-2">Modo Offline</h3>
            <p className="text-app-text-secondary text-sm">
              Baixe suas músicas favoritas e ouça sem internet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;