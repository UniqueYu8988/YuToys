import { useEffect } from "react";
import { useTaskStore } from "../store";

export const useDesktopSettingsSync = () => {
  const settings = useTaskStore((state) => state.settings);

  useEffect(() => {
    window.electronAPI?.setAlwaysOnTop(settings.alwaysOnTop);
  }, [settings.alwaysOnTop]);

  useEffect(() => {
    window.electronAPI?.setAutoStart(settings.autoStart);
  }, [settings.autoStart]);

  useEffect(() => {
    window.electronAPI?.setSkipTaskbar(settings.skipTaskbar);
  }, [settings.skipTaskbar]);
};
