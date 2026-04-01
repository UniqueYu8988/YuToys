import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTaskStore } from "../../store";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Flame,
  Keyboard,
  ListTodo,
  Pin,
  PinOff,
  Sparkles,
  TimerReset,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const TaskList: React.FC = () => {
  const focusPresets = [15, 25, 45, 60];
  const {
    tasks,
    addTask,
    configFocusMinutes,
    focusTaskId,
    pinnedTaskId,
    setFocusTask,
    setPinnedTask,
    setConfigFocusMinutes,
    setTaskFocusPreset,
    toggleTask,
    updateTask,
    deleteTask,
    dailyTaskTemplates,
    dailyTaskItems,
    timeLeft,
    isActive,
  } = useTaskStore();
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const activeTasks = useMemo(() => {
    const uncompleted = tasks.filter((task) => !task.completed);
    return [...uncompleted].sort((a, b) => {
      if (a.id === pinnedTaskId) return -1;
      if (b.id === pinnedTaskId) return 1;
      return b.createdAt - a.createdAt;
    });
  }, [pinnedTaskId, tasks]);
  const completedTasks = tasks.length - activeTasks.length;
  const activeDailyTemplates = useMemo(
    () => dailyTaskTemplates.filter((template) => template.enabled),
    [dailyTaskTemplates],
  );
  const completedDailyCount = dailyTaskItems.filter((item) => item.completed).length;
  const focusMinutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");
  const focusSeconds = (timeLeft % 60).toString().padStart(2, "0");
  const pinnedTask = activeTasks.find((task) => task.id === pinnedTaskId);
  const nextTask = pinnedTask ?? activeTasks[0];
  const focusTask = activeTasks.find((task) => task.id === focusTaskId);

  useEffect(() => {
    const handleQuickCapture = (event: KeyboardEvent) => {
      const isModifierK =
        event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);
      const isSlash =
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey;

      if (!isModifierK && !isSlash) return;

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName ?? "";
      const isTypingTarget =
        target?.isContentEditable ||
        tagName === "INPUT" ||
        tagName === "TEXTAREA";

      if (isTypingTarget) return;

      event.preventDefault();
      inputRef.current?.focus();
    };

    window.addEventListener("keydown", handleQuickCapture);
    return () => window.removeEventListener("keydown", handleQuickCapture);
  }, []);

  const handleToggle = (id: string, completed: boolean, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    toggleTask(id);
    if (!completed) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: {
          x: (rect.left + 10) / window.innerWidth,
          y: (rect.top + 10) / window.innerHeight,
        },
        colors: ["#a855f7", "#ffffff"],
        gravity: 1,
        startVelocity: 20,
      });
      window.setTimeout(() => {
        if (useTaskStore.getState().tasks.filter((task) => !task.completed).length === 0) {
          triggerCelebration();
        }
      }, 500);
    }
  };

  const triggerCelebration = () => {
    [0.2, 0.5, 0.8].forEach((x) =>
      confetti({
        particleCount: 50,
        origin: { x, y: 0.9 },
        colors: ["#a855f7", "#fff"],
        gravity: 0.6,
      }),
    );
  };

  return (
    <div className="page">
      <div className="glass-card today-hero">
        <div className="today-chip-row">
          <div className="today-chip">
            <ListTodo size={14} />
            <span>{activeTasks.length} 个待办</span>
          </div>
          <div className="today-chip">
            <Flame size={14} />
            <span>
              每日任务 {completedDailyCount}/{activeDailyTemplates.length}
            </span>
          </div>
          <div className="today-chip">
            <TimerReset size={14} />
            <span>{isActive ? `${focusMinutes}:${focusSeconds}` : "专注待启动"}</span>
          </div>
        </div>
      </div>

      <form
        className="task-capture-form"
        onSubmit={(event) => {
          event.preventDefault();
          const value = inputValue.trim();
          if (!value) return;
          addTask(value);
          setInputValue("");
        }}
      >
        <div className="glass-card task-capture-card">
          <Sparkles size={16} className="task-capture-icon" />
          <input
            ref={inputRef}
            className="task-capture-input"
            placeholder="快速捕获"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.currentTarget.blur();
              }
            }}
          />
          <span className="task-capture-hint">
            <Keyboard size={13} />
            Ctrl/⌘+K
          </span>
        </div>
      </form>

      <div className="today-focus-card">
        <div>
          <p className="today-section-eyebrow">当前重点</p>
          <p className="today-focus-text">
            {nextTask ? nextTask.text : "没有未完成任务了，补一条新的也很顺手。"}
          </p>
          {focusTask && (
            <span className="today-focus-linked">{focusTask.text}</span>
          )}
          {nextTask && (
            <div className="today-preset-row">
              {focusPresets.map((minutes) => (
                <button
                  key={minutes}
                  className={`today-preset-chip ${nextTask.focusPresetMinutes === minutes ? "active" : ""}`}
                  onClick={() =>
                    setTaskFocusPreset(
                      nextTask.id,
                      nextTask.focusPresetMinutes === minutes ? undefined : minutes,
                    )
                  }
                  type="button"
                >
                  {minutes} 分钟
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="today-focus-actions">
          {nextTask && (
            <button
              className={`today-focus-link-btn ${focusTaskId === nextTask.id ? "active" : ""}`}
              onClick={() => {
                setConfigFocusMinutes(nextTask.focusPresetMinutes ?? configFocusMinutes)
                setFocusTask(nextTask.id)
                window.dispatchEvent(
                  new CustomEvent("yutoys:navigate", { detail: "timer" }),
                )
              }}
              type="button"
            >
              <ArrowRight size={14} />
              带入专注
            </button>
          )}
          {nextTask && (
            <button
              className={`today-pin-btn ${pinnedTask ? "active" : ""}`}
              onClick={() => setPinnedTask(pinnedTask ? null : nextTask.id)}
              type="button"
            >
              {pinnedTask ? <PinOff size={14} /> : <Pin size={14} />}
              {pinnedTask ? "取消置顶" : "设为当前重点"}
            </button>
          )}
          {completedTasks > 0 && (
            <span className="today-focus-badge">已完成 {completedTasks} 项</span>
          )}
        </div>
      </div>

      <div className="today-section-header">
        <div>
          <p className="today-section-eyebrow">待办</p>
        </div>
        <span className="today-section-meta">{activeTasks.length} 项未完成</span>
      </div>

      <div className="task-list-viewport">
        <AnimatePresence>
          {activeTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{
                duration: 0.28,
                delay: index * 0.04,
                ease: "easeOut",
              }}
              className="task-item today-task-item"
            >
              <button
                className="toggle-btn"
                onClick={(event) => handleToggle(task.id, task.completed, event)}
                type="button"
              >
                <Circle size={20} strokeWidth={2.5} />
              </button>
              {editingId === task.id ? (
                <input
                  autoFocus
                  className="seamless-input"
                  value={editValue}
                  onChange={(event) => setEditValue(event.target.value)}
                  onBlur={() => {
                    if (editValue.trim()) updateTask(task.id, editValue.trim());
                    setEditingId(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.currentTarget.blur();
                    }
                  }}
                />
              ) : (
                <div className="today-task-copy">
                  <span
                    className="task-text"
                    onDoubleClick={() => {
                      setEditingId(task.id);
                      setEditValue(task.text);
                    }}
                  >
                    {task.text}
                  </span>
                  {task.id === pinnedTaskId && (
                    <span className="today-task-pin-tag">
                      <Pin size={11} />
                      当前重点
                    </span>
                  )}
                  {task.focusPresetMinutes && (
                    <span className="today-task-time-tag">
                      {task.focusPresetMinutes} 分钟
                    </span>
                  )}
                </div>
              )}
              <div className="today-task-actions">
                {editingId !== task.id && (
                  <button
                    className={`today-task-icon-btn ${task.id === pinnedTaskId ? "active" : ""}`}
                    onClick={() =>
                      setPinnedTask(task.id === pinnedTaskId ? null : task.id)
                    }
                    type="button"
                    aria-label={task.id === pinnedTaskId ? "取消置顶" : "设为当前重点"}
                  >
                    <Pin size={14} />
                  </button>
                )}
                {editingId === task.id && (
                  <Trash2
                    size={16}
                    color="#ef4444"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      deleteTask(task.id);
                    }}
                    style={{ cursor: "pointer" }}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {activeTasks.length === 0 && (
          <motion.div
            className="glass-card today-empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <CheckCircle2 size={22} />
            <div>
              <h3>今天的待办已经清空</h3>
              <p>可以继续快速捕获新想法，或者切去每日任务把固定节奏也顺手完成。</p>
            </div>
          </motion.div>
        )}

        {activeTasks.length === 0 && tasks.length > 0 && (
          <motion.div className="mission-accomplished" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2
              style={{
                fontSize: "1.2rem",
                fontWeight: 900,
                background: "linear-gradient(90deg, #a855f7, #6366f1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              MISSION ACCOMPLISHED
            </h2>
            <p style={{ fontSize: "0.8rem", opacity: 0.4, marginTop: 4 }}>所有目标已达成</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
