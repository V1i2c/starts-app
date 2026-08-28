import { useEffect } from "react";
import { isNative } from "@/lib/platform";

/** Sets the native status bar to match the app's warm paper theme and dismisses the splash screen once mounted. */
export function useNativeChrome() {
  useEffect(() => {
    if (!isNative()) return;
    (async () => {
      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: "#fbf7f1" });
      } catch {
        // status bar plugin not available on this platform build — non-fatal
      }
      try {
        const { SplashScreen } = await import("@capacitor/splash-screen");
        await SplashScreen.hide();
      } catch {
        // splash screen already hidden or plugin unavailable — non-fatal
      }
    })();
  }, []);
}
