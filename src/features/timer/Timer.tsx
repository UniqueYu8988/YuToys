import React from "react";
import { motion } from "framer-motion";
import { PinOff } from "lucide-react";
import { useTaskStore } from "../../store";

const focusPresets = [15, 25, 45, 60];

const Timer: React.FC = () => {
  const {
    timeLeft,
    isActive,
    setIsActive,
    configFocusMinutes,
    setConfigFocusMinutes,
    focusTaskId,
    setFocusTask,
    setTaskFocusPreset,
    tasks,
  } = useTaskStore();

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (timeLeft / (configFocusMinutes * 60)) * circumference;
  const focusTask = tasks.find((task) => task.id === focusTaskId && !task.completed);

  const applyPreset = (minutes: number) => {
    setConfigFocusMinutes(minutes);
    if (focusTask) {
      setTaskFocusPreset(focusTask.id, minutes);
    }
  };

  return (
    <motion.div
      className="page timer-page"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="glass-card timer-focus-card refined-panel">
        <div className="timer-focus-copy">
          <p className="today-section-eyebrow">Focus</p>
          <p className="timer-focus-text refined-title">
            {focusTask ? focusTask.text : "还没有绑定专注目标，回到首页把当前重点带进来吧。"}
          </p>
        </div>
        {focusTask && (
          <button
            className="timer-focus-clear refined-ghost-btn"
            onClick={() => setFocusTask(null)}
            type="button"
          >
            <PinOff size={14} />
            清除
          </button>
        )}
      </div>

      <div className="glass-card timer-preset-card refined-panel">
        <div className="timer-preset-head">
          <p className="today-section-eyebrow">Duration</p>
          <span className="timer-preset-current">{configFocusMinutes} 分钟</span>
        </div>
        <div className="timer-preset-row">
          {focusPresets.map((minutes) => (
            <button
              key={minutes}
              className={`timer-preset-chip ${configFocusMinutes === minutes ? "active" : ""}`}
              onClick={() => applyPreset(minutes)}
              type="button"
            >
              {minutes}
            </button>
          ))}
        </div>
      </div>

      <div className="timer-stage">
        <div
          className="timer-interactive-wrapper refined-timer-dial"
          onClick={() => setIsActive(!isActive)}
        >
          <svg width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="3"
          />
          <motion.circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ type: "tween", ease: "linear", duration: 1 }}
          />
        </svg>
        <div
          className="timer-center"
        >
          <span className="timer-display">
            {Math.floor(timeLeft / 60)
              .toString()
              .padStart(2, "0")}
          </span>
          <span style={{ fontSize: "1.2rem", opacity: 0.2 }}>:</span>
          <span className="timer-display">
            {(timeLeft % 60).toString().padStart(2, "0")}
          </span>
        </div>
        </div>

        <div className="timer-status-row">
          <span className={`timer-status-chip ${isActive ? "active" : ""}`}>
            {isActive ? "专注中" : "待开始"}
          </span>
        </div>
      </div>

      <p className="timer-stage-caption">
        {isActive ? "FOCUSING..." : "TAP TO START"}
      </p>
    </motion.div>
  );
};

export default Timer;
