import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, CheckCircle2, Circle, Pause, Pencil, Play, Plus, Trash2, X } from "lucide-react";
import confetti from "canvas-confetti";
import {
  selectCurrentDailyTaskStreak,
  useTaskStore,
} from "../../store";

const DailyTasks: React.FC = () => {
  const addDailyTaskTemplate = useTaskStore((state) => state.addDailyTaskTemplate);
  const dailyTaskItems = useTaskStore((state) => state.dailyTaskItems);
  const dailyTaskTemplates = useTaskStore((state) => state.dailyTaskTemplates);
  const deleteDailyTaskTemplate = useTaskStore((state) => state.deleteDailyTaskTemplate);
  const moveDailyTaskTemplate = useTaskStore((state) => state.moveDailyTaskTemplate);
  const toggleDailyTask = useTaskStore((state) => state.toggleDailyTask);
  const toggleDailyTaskTemplateEnabled = useTaskStore((state) => state.toggleDailyTaskTemplateEnabled);
  const updateDailyTaskTemplate = useTaskStore((state) => state.updateDailyTaskTemplate);
  const streak = useTaskStore(selectCurrentDailyTaskStreak);
  const bestStreak = useTaskStore((state) => state.bestDailyTaskStreak);
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [expandedActionId, setExpandedActionId] = useState<string | null>(null);
  const completedCountRef = useRef(0);

  const activeTemplates = useMemo(
    () => dailyTaskTemplates.filter((template) => template.enabled),
    [dailyTaskTemplates],
  );
  const pausedTemplates = useMemo(
    () => dailyTaskTemplates.filter((template) => !template.enabled),
    [dailyTaskTemplates],
  );
  const completedCount = dailyTaskItems.filter((item) => item.completed).length;
  const totalCount = activeTemplates.length;
  const allDone = totalCount > 0 && completedCount === totalCount;

  useEffect(() => {
    if (allDone && completedCountRef.current !== totalCount) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { x: 0.5, y: 0.85 },
        colors: ["#a855f7", "#ffffff", "#f59e0b"],
      });
    }
    completedCountRef.current = completedCount;
  }, [allDone, completedCount, totalCount]);

  return (
    <div className="page">
      <div className="glass-card daily-card">
        <div className="daily-summary">
          <div>
            <p className="daily-caption">今日任务</p>
            <h2 className="daily-value">
              {completedCount} / {totalCount || 0}
            </h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <p className="daily-caption">当前连胜</p>
            <h2 className="daily-value">{streak} 天</h2>
          </div>
        </div>
        <div className="daily-summary-footer">
          <span className="daily-caption">最佳连胜 {bestStreak} 天</span>
          {allDone && <span className="daily-done-pill">今日全完成</span>}
        </div>
      </div>

      <form
        className="daily-add-form"
        onSubmit={(event) => {
          event.preventDefault();
          const value = inputValue.trim();
          if (!value) return;
          addDailyTaskTemplate(value);
          setInputValue("");
        }}
      >
        <input
          className="glass-card daily-add-input"
          placeholder="添加固定每日任务..."
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
        />
      </form>

      <div className="task-list-viewport">
        {activeTemplates.length === 0 ? (
          <div className="glass-card daily-empty">
            还没有固定任务，先添加一个开始培养节奏吧。
          </div>
        ) : (
          activeTemplates.map((template, index) => {
            const item = dailyTaskItems.find(
              (dailyItem) => dailyItem.templateId === template.id,
            );
            const completed = item?.completed ?? false;

            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="task-item"
              >
                <button
                  className="toggle-btn"
                  onClick={() => toggleDailyTask(template.id)}
                >
                  {completed ? (
                    <CheckCircle2 size={20} strokeWidth={2.5} />
                  ) : (
                    <Circle size={20} strokeWidth={2.5} />
                  )}
                </button>
                <span
                  className="task-text"
                  style={{
                    textDecoration: completed ? "line-through" : "none",
                    opacity: completed ? 0.45 : 0.95,
                  }}
                >
                  {editingId === template.id ? (
                    <input
                      autoFocus
                      className="seamless-input"
                      value={editingValue}
                      onChange={(event) => setEditingValue(event.target.value)}
                      onBlur={() => {
                        const value = editingValue.trim();
                        if (value) {
                          updateDailyTaskTemplate(template.id, value);
                        }
                        setEditingId(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.currentTarget.blur();
                        }
                      }}
                    />
                  ) : (
                    template.title
                  )}
                </span>
                <div className="daily-actions-shell">
                  <AnimatePresence initial={false}>
                    {expandedActionId === template.id && (
                      <motion.div
                        className="daily-actions"
                        initial={{ opacity: 0, width: 0, x: 6 }}
                        animate={{ opacity: 1, width: "auto", x: 0 }}
                        exit={{ opacity: 0, width: 0, x: 6 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <button
                          className="daily-icon-btn"
                          onClick={() => {
                            setEditingId(template.id);
                            setEditingValue(template.title);
                            setExpandedActionId(null);
                          }}
                          type="button"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="daily-icon-btn"
                          onClick={() => moveDailyTaskTemplate(template.id, "up")}
                          type="button"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          className="daily-icon-btn"
                          onClick={() => moveDailyTaskTemplate(template.id, "down")}
                          type="button"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          className="daily-icon-btn"
                          onClick={() => toggleDailyTaskTemplateEnabled(template.id)}
                          type="button"
                        >
                          <Pause size={14} />
                        </button>
                        <button
                          className="daily-icon-btn"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            setExpandedActionId(null);
                            deleteDailyTaskTemplate(template.id);
                          }}
                          type="button"
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button
                    className={`daily-icon-btn daily-actions-toggle ${expandedActionId === template.id ? "open" : ""}`}
                    onClick={() => {
                      setExpandedActionId((current) =>
                        current === template.id ? null : template.id,
                      );
                    }}
                    type="button"
                    aria-label={expandedActionId === template.id ? "收起操作" : "展开操作"}
                  >
                    {expandedActionId === template.id ? <X size={14} /> : <Plus size={14} />}
                  </button>
                </div>
              </motion.div>
            );
          })
        )}

        {pausedTemplates.length > 0 && (
          <div className="daily-paused-section">
            <p className="daily-caption">已暂停</p>
            {pausedTemplates.map((template) => (
              <div key={template.id} className="task-item daily-paused-item">
                <span className="task-text" style={{ opacity: 0.5 }}>
                  {template.title}
                </span>
                <button
                  className="daily-icon-btn"
                  onClick={() => toggleDailyTaskTemplateEnabled(template.id)}
                  type="button"
                >
                  <Play size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyTasks;
