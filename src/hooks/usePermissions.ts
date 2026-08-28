import { useCallback, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { checkNotificationPermission, requestNotificationPermission } from "@/lib/notifications";
import type { PermissionState } from "@/types";

async function checkCameraOrMic(name: "camera" | "microphone"): Promise<PermissionState> {
  if (!("permissions" in navigator)) return "prompt";
  try {
    // TS lib DOM doesn't type "camera"/"microphone" as PermissionName in all versions.
    const status = await navigator.permissions.query({ name: name as PermissionName });
    return status.state as PermissionState;
  } catch {
    return "prompt";
  }
}

export function usePermissions() {
  const permissions = useStore((s) => s.permissions);
  const setPermission = useStore((s) => s.setPermission);

  const refresh = useCallback(async () => {
    const [camera, microphone, notifications] = await Promise.all([
      checkCameraOrMic("camera"),
      checkCameraOrMic("microphone"),
      checkNotificationPermission(),
    ]);
    setPermission("camera", camera);
    setPermission("microphone", microphone);
    setPermission("notifications", notifications);
  }, [setPermission]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const requestCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      setPermission("camera", "granted");
      return "granted" as const;
    } catch {
      setPermission("camera", "denied");
      return "denied" as const;
    }
  }, [setPermission]);

  const requestMicrophone = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setPermission("microphone", "granted");
      return "granted" as const;
    } catch {
      setPermission("microphone", "denied");
      return "denied" as const;
    }
  }, [setPermission]);

  const requestNotifications = useCallback(async () => {
    const result = await requestNotificationPermission();
    setPermission("notifications", result);
    return result;
  }, [setPermission]);

  return { permissions, refresh, requestCamera, requestMicrophone, requestNotifications };
}
