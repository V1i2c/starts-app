import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { App as CapacitorApp } from "@capacitor/app";
import { isNative } from "@/lib/platform";

/**
 * Maps the Android hardware/gesture back button onto normal in-app navigation:
 * on any screen deeper than the 4 root tabs it goes back one step; on a root
 * tab it exits the app instead of getting stuck (the default Capacitor
 * behaviour is to do nothing, which reads as a frozen app to most users).
 */
const ROOT_PATHS = ["/", "/todo", "/plan", "/errors"];

export function useAndroidBack() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isNative()) return;
    const handle = CapacitorApp.addListener("backButton", () => {
      if (ROOT_PATHS.includes(location.pathname)) {
        CapacitorApp.exitApp();
      } else {
        navigate(-1);
      }
    });
    return () => {
      handle.then((h) => h.remove());
    };
  }, [navigate, location.pathname]);
}
