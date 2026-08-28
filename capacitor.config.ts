import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.starts.artstudent",
  appName: "Starts",
  webDir: "dist",
  // No `server.url`/`hostname` on purpose: leaving Capacitor on its default
  // https://localhost origin keeps the WebView a "secure context", which
  // getUserMedia (camera/mic for voice notes) requires to work at all.
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 400,
      backgroundColor: "#fbf7f1",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_starts",
      iconColor: "#ef5a2e",
    },
  },
};

export default config;
