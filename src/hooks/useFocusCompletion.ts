import { useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import successSound from "../assets/sounds/success.mp3";
import { useTaskStore } from "../store";

export const useFocusCompletion = () => {
  const configFocusMinutes = useTaskStore((state) => state.configFocusMinutes);
  const isActive = useTaskStore((state) => state.isActive);
  const setIsActive = useTaskStore((state) => state.setIsActive);
  const setTimeLeft = useTaskStore((state) => state.setTimeLeft);
  const timeLeft = useTaskStore((state) => state.timeLeft);
  const successAudio = useMemo(() => new Audio(successSound), []);

  useEffect(() => {
    if (timeLeft !== 0 || !isActive) return;

    setIsActive(false);
    successAudio.currentTime = 0;
    successAudio.play().catch(() => {
      // Ignore autoplay failures.
    });

    window.electronAPI?.showNotification({
      title: "YuToys 专注结束",
      body: `太棒了！主人完成了 ${configFocusMinutes} 分钟的专注喵，快让小羽抱抱 💜`,
    });

    const duration = 3 * 1000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 90,
        spread: 55,
        origin: { x: 0.5, y: 1 },
        colors: ["#a855f7", "#6366f1", "#ffffff"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
    setTimeLeft(configFocusMinutes * 60);
  }, [
    configFocusMinutes,
    isActive,
    setIsActive,
    setTimeLeft,
    successAudio,
    timeLeft,
  ]);
};
