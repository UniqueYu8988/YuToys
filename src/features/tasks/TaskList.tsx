import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTaskStore } from "../../store";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Circle,
  Flame,
  Keyboard,
  Pin,
  PinOff,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";

const TaskList: React.FC = () => {
  const {
    tasks,
    addTask,
    configFocusMinutes,
    focusTaskId,
    pinnedTaskId,
    setFocusTask,
    setPinnedTask,
    setConfigFocusMinutes,
    toggleTask,
    updateTask,
    deleteTask,
  } = useTaskStore();
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isQuickPanelOpen, setIsQuickPanelOpen] = useState(false);
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
      setIsQuickPanelOpen(true);
      window.setTimeout(() => inputRef.current?.focus(), 10);
    };

    window.addEventListener("keydown", handleQuickCapture);
    return () => window.removeEventListener("keydown", handleQuickCapture);
  }, []);

  useEffect(() => {
    if (selectedTaskId && activeTasks.some((task) => task.id === selectedTaskId)) {
      return;
    }

    setSelectedTaskId(activeTasks[0]?.id ?? null);
  }, [activeTasks, selectedTaskId]);

  const selectedTask =
    activeTasks.find((task) => task.id === selectedTaskId) ?? activeTasks[0] ?? null;

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

  const navigateTo = (tab: "timer" | "daily" | "stats") => {
    window.dispatchEvent(new CustomEvent("yutoys:navigate", { detail: tab }));
    setIsQuickPanelOpen(false);
  };

  return (
    <div className="page task-home-page">
      <div className="todo-header home-header-refined">
        <div>
          <p className="today-section-eyebrow">Today</p>
          <h2 className="todo-title">待办清单</h2>
        </div>
        <div className="todo-counter-card">
          <span className="todo-counter">{activeTasks.length}</span>
          <span className="todo-counter-sub">未完成</span>
        </div>
      </div>

      <div className="task-list-viewport task-list-viewport-home">
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
              className={`task-item today-task-item home-task-row ${task.id === selectedTask?.id ? "selected" : ""}`}
              onClick={() => setSelectedTaskId(task.id)}
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
                    className="task-text home-task-text"
                    onDoubleClick={() => {
                      setEditingId(task.id);
                      setEditValue(task.text);
                    }}
                  >
                    {task.text}
                  </span>
                  {task.id === pinnedTaskId && (
                    <span className="today-task-pin-tag home-task-pin-tag">
                      <Pin size={10} />
                    </span>
                  )}
                </div>
              )}
              {editingId === task.id && (
                <div className="today-task-actions">
                  <Trash2
                    size={16}
                    color="#ef4444"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      deleteTask(task.id);
                    }}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {activeTasks.length === 0 && (
          <motion.div
            className="glass-card today-empty-state home-empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <CheckCircle2 size={22} />
            <div>
              <h3>今天的待办已经清空</h3>
              <p>按右下角的加号继续补充，主页就只留给你真正要做的事。</p>
            </div>
          </motion.div>
        )}

        {activeTasks.length === 0 && tasks.length > 0 && (
          <motion.div
            className="mission-accomplished"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
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
            <p style={{ fontSize: "0.8rem", opacity: 0.4, marginTop: 4 }}>
              所有目标已达成
            </p>
          </motion.div>
        )}
      </div>

      <div className="todo-floating-shell">
        <AnimatePresence>
          {isQuickPanelOpen && (
            <motion.div
              className="glass-card todo-quick-panel refined-panel"
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="todo-quick-head">
                <Sparkles size={14} />
                <span>{selectedTask ? "围绕当前待办操作" : "新增待办"}</span>
              </div>

              <form
                className="todo-quick-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  const value = inputValue.trim();
                  if (!value) return;
                  addTask(value);
                  setInputValue("");
                  setIsQuickPanelOpen(false);
                }}
              >
                <input
                  ref={inputRef}
                  className="task-capture-input"
                  placeholder="新增待办"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setIsQuickPanelOpen(false);
                    }
                  }}
                />
                <span className="task-capture-hint">
                  <Keyboard size={13} />
                  Enter
                </span>
              </form>

              <div className="todo-quick-actions">
                <button
                  className="todo-quick-btn"
                  disabled={!selectedTask}
                  onClick={() => {
                    if (!selectedTask) return;
                    setPinnedTask(selectedTask.id === pinnedTaskId ? null : selectedTask.id);
                  }}
                  type="button"
                >
                  {selectedTask?.id === pinnedTaskId ? <PinOff size={14} /> : <Pin size={14} />}
                  <span>{selectedTask?.id === pinnedTaskId ? "取消重点" : "设为重点"}</span>
                </button>
                <button
                  className="todo-quick-btn primary"
                  disabled={!selectedTask}
                  onClick={() => {
                    if (!selectedTask) return;
                    setConfigFocusMinutes(
                      selectedTask.focusPresetMinutes ?? configFocusMinutes,
                    );
                    setFocusTask(selectedTask.id);
                    navigateTo("timer");
                  }}
                  type="button"
                >
                  <ArrowRight size={14} />
                  <span>带入专注</span>
                </button>
              </div>

              <div className="todo-quick-links">
                <button
                  className="todo-mini-link"
                  onClick={() => navigateTo("timer")}
                  type="button"
                >
                  <ArrowRight size={14} />
                </button>
                <button
                  className="todo-mini-link"
                  onClick={() => navigateTo("daily")}
                  type="button"
                >
                  <Flame size={14} />
                </button>
                <button
                  className="todo-mini-link"
                  onClick={() => navigateTo("stats")}
                  type="button"
                >
                  <BarChart3 size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          className={`todo-floating-button ${isQuickPanelOpen ? "open" : ""}`}
          onClick={() => {
            const next = !isQuickPanelOpen;
            setIsQuickPanelOpen(next);
            if (next) {
              window.setTimeout(() => inputRef.current?.focus(), 10);
            }
          }}
          type="button"
          aria-label="展开待办操作"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
};

export default TaskList;
