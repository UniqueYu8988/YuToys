import { useEffect, useMemo } from "react";
import { useTaskStore } from "../store";
import chimeSound from "../assets/sounds/chime.mp3";

export const useGlobalTicker = () => {
  const addRunTime = useTaskStore((state) => state.addRunTime);
  const checkDailyReset = useTaskStore((state) => state.checkDailyReset);
  const settings = useTaskStore((state) => state.settings);
  const tick = useTaskStore((state) => state.tick);
  const chimeAudio = useMemo(() => new Audio(chimeSound), []);

  useEffect(() => {
    let seconds = 0;

    const timer = window.setInterval(() => {
      tick();
      seconds += 1;
      const { totalRunMinutes } = useTaskStore.getState();

      if (seconds >= 60) {
        const nextTotal = (totalRunMinutes || 0) + 1;
        addRunTime(1);
        checkDailyReset();
        seconds = 0;

        if (nextTotal > 0 && nextTotal % 60 === 0) {
          window.electronAPI?.showNotification({
            title: "YuToys 节奏提醒",
            body: `主人已经持续努力 ${nextTotal / 60} 小时了喵，记得活动一下肩颈，稍微休息片刻吧。`,
          });
        }
      }

      const now = new Date();
      if (
        now.getMinutes() === 0 &&
        now.getSeconds() === 0 &&
        settings.hourlyChime
      ) {
        const timeStr = now.toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        chimeAudio.currentTime = 0;
        chimeAudio.play().catch(() => {
          // Ignore autoplay failures.
        });
        window.electronAPI?.showNotification({
          title: "YuToys 整点报时",
          body: `主人，现在是 ${timeStr} 喵，辛苦了~`,
        });
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [addRunTime, checkDailyReset, chimeAudio, settings.hourlyChime, tick]);
};
