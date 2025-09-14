import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.6b809e1bc75c4e6183089220b80517af',
  appName: 'playsong-sync',
  webDir: 'dist',
  server: {
    url: "https://6b809e1b-c75c-4e61-8308-9220b80517af.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0a0a0a",
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: "#0a0a0a"
    },
    BackgroundMode: {
      enabled: true,
      title: 'PlaySong reproduzindo música',
      text: 'Reprodução em segundo plano ativa',
      icon: 'icon'
    },
    MediaSession: {
      enabled: true
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: false
  }
};

export default config;