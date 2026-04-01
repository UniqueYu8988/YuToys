import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getLocalDateKey, getPreviousDateKey } from "./utils/date";

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  focusPresetMinutes?: number;
}

export interface DailyTaskTemplate {
  id: string;
  title: string;
  enabled: boolean;
  createdAt: number;
  sortOrder: number;
}

export interface DailyTaskItem {
  templateId: string;
  completed: boolean;
  completedAt?: number;
}

export interface AppSettings {
  alwaysOnTop: boolean;
  autoStart: boolean;
  hourlyChime: boolean;
  skipTaskbar: boolean;
}

interface TimerState {
  timeLeft: number;
  isActive: boolean;
  configFocusMinutes: number;
  setTimeLeft: (time: number) => void;
  setIsActive: (active: boolean) => void;
  setConfigFocusMinutes: (minutes: number) => void;
  tick: () => void;
}

interface TaskState extends TimerState {
  tasks: Task[];
  pinnedTaskId: string | null;
  focusTaskId: string | null;
  focusTime: number;
  totalRunMinutes: number;
  settings: AppSettings;
  dailyTaskTemplates: DailyTaskTemplate[];
  dailyTaskItems: DailyTaskItem[];
  dailyTaskDate: string;
  dailyTaskHistory: Record<string, boolean>;
  bestDailyTaskStreak: number;
  addTask: (text: string) => void;
  setPinnedTask: (id: string | null) => void;
  setFocusTask: (id: string | null) => void;
  setTaskFocusPreset: (id: string, minutes?: number) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, text: string) => void;
  deleteTask: (id: string) => void;
  addFocusTime: (minutes: number) => void;
  markAllCleared: () => void;
  addRunTime: (minutes: number) => void;
  checkDailyReset: () => void;
  addDailyTaskTemplate: (title: string) => void;
  deleteDailyTaskTemplate: (id: string) => void;
  toggleDailyTask: (templateId: string) => void;
  toggleDailyTaskTemplateEnabled: (id: string) => void;
  updateDailyTaskTemplate: (id: string, title: string) => void;
  moveDailyTaskTemplate: (id: string, direction: "up" | "down") => void;
  updateSetting: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => void;
  resetAppData: () => void;
}

const LEGACY_SETTING_KEYS = [
  "setting_alwaysOnTop",
  "setting_autoStart",
  "setting_hourlyChime",
  "setting_skipTaskbar",
  "setting_tickingSound",
] as const;

const readLegacyBoolean = (key: string, fallback: boolean) => {
  if (typeof window === "undefined") return fallback;

  const raw = window.localStorage.getItem(key);
  if (raw === null) return fallback;

  try {
    return JSON.parse(raw) as boolean;
  } catch {
    return fallback;
  }
};

export const createDefaultSettings = (): AppSettings => ({
  alwaysOnTop: readLegacyBoolean("setting_alwaysOnTop", true),
  autoStart: readLegacyBoolean("setting_autoStart", false),
  hourlyChime: readLegacyBoolean("setting_hourlyChime", true),
  skipTaskbar: readLegacyBoolean("setting_skipTaskbar", false),
});

const sortTemplates = (templates: DailyTaskTemplate[]) =>
  [...templates].sort((a, b) => a.sortOrder - b.sortOrder);

const normalizeTemplateOrder = (templates: DailyTaskTemplate[]) =>
  sortTemplates(templates).map((template, index) => ({
    ...template,
    sortOrder: index,
  }));

const createDailyItems = (templates: DailyTaskTemplate[]): DailyTaskItem[] =>
  sortTemplates(templates)
    .filter((template) => template.enabled)
    .map((template) => ({
      templateId: template.id,
      completed: false,
    }));

const isDailySuccess = (
  templates: DailyTaskTemplate[],
  items: DailyTaskItem[],
) => {
  const enabledTemplates = templates.filter((template) => template.enabled);
  if (enabledTemplates.length === 0) return false;

  return enabledTemplates.every((template) =>
    items.find((item) => item.templateId === template.id)?.completed,
  );
};

const calculateBestStreak = (history: Record<string, boolean>) => {
  const dates = Object.keys(history).sort();
  let best = 0;
  let current = 0;

  for (const date of dates) {
    if (history[date]) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }

  return best;
};

const calculateCurrentStreak = (history: Record<string, boolean>) => {
  let cursor = getLocalDateKey();
  if (!history[cursor]) {
    cursor = getPreviousDateKey(cursor);
  }

  let streak = 0;
  while (history[cursor]) {
    streak += 1;
    cursor = getPreviousDateKey(cursor);
  }

  return streak;
};

const upsertHistory = (
  history: Record<string, boolean>,
  dateKey: string,
  success: boolean,
) => ({
  ...history,
  [dateKey]: success,
});

const createInitialData = () => {
  const today = getLocalDateKey();
  return {
    tasks: [] as Task[],
    pinnedTaskId: null as string | null,
    focusTaskId: null as string | null,
    focusTime: 0,
    totalRunMinutes: 0,
    settings: createDefaultSettings(),
    dailyTaskTemplates: [] as DailyTaskTemplate[],
    dailyTaskItems: [] as DailyTaskItem[],
    dailyTaskDate: today,
    dailyTaskHistory: {} as Record<string, boolean>,
    bestDailyTaskStreak: 0,
    configFocusMinutes: 30,
    timeLeft: 30 * 60,
    isActive: false,
  };
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      ...createInitialData(),

      setTimeLeft: (time) => set({ timeLeft: time }),
      setIsActive: (active) => set({ isActive: active }),
      setConfigFocusMinutes: (minutes) =>
        set({
          configFocusMinutes: minutes,
          timeLeft: minutes * 60,
          isActive: false,
        }),
      tick: () => {
        const { timeLeft, isActive, addFocusTime } = get();
        if (isActive && timeLeft > 0) {
          const nextTime = timeLeft - 1;
          set({ timeLeft: nextTime });
          if (nextTime % 60 === 0) {
            addFocusTime(1);
          }
        }
      },

      addRunTime: (minutes) =>
        set((state) => ({
          totalRunMinutes: (state.totalRunMinutes || 0) + minutes,
        })),

      addTask: (text) =>
        set((state) => ({
          tasks: [
            {
              id: Date.now().toString(),
              text,
              completed: false,
              createdAt: Date.now(),
            },
            ...state.tasks,
          ],
        })),
      setPinnedTask: (id) => set({ pinnedTaskId: id }),
      setFocusTask: (id) => set({ focusTaskId: id }),
      setTaskFocusPreset: (id, minutes) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, focusPresetMinutes: minutes } : task,
          ),
        })),
      toggleTask: (id) =>
        set((state) => {
          const nextTasks = state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  completed: !task.completed,
                  completedAt: !task.completed ? Date.now() : undefined,
                }
              : task,
          );
          const toggledTask = nextTasks.find((task) => task.id === id);

          return {
            tasks: nextTasks,
            pinnedTaskId:
              toggledTask?.completed && state.pinnedTaskId === id
                ? null
                : state.pinnedTaskId,
            focusTaskId:
              toggledTask?.completed && state.focusTaskId === id
                ? null
                : state.focusTaskId,
          };
        }),
      updateTask: (id, text) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, text } : task,
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          pinnedTaskId: state.pinnedTaskId === id ? null : state.pinnedTaskId,
          focusTaskId: state.focusTaskId === id ? null : state.focusTaskId,
        })),
      addFocusTime: (minutes) =>
        set((state) => ({ focusTime: (state.focusTime || 0) + minutes })),
      markAllCleared: () =>
        set((state) => ({ tasks: state.tasks.filter((task) => !task.completed) })),

      checkDailyReset: () => {
        const today = getLocalDateKey();
        const state = get();
        if (state.dailyTaskDate === today) return;

        const history = upsertHistory(
          state.dailyTaskHistory,
          state.dailyTaskDate,
          isDailySuccess(state.dailyTaskTemplates, state.dailyTaskItems),
        );

        set({
          dailyTaskDate: today,
          dailyTaskItems: createDailyItems(state.dailyTaskTemplates),
          dailyTaskHistory: history,
          bestDailyTaskStreak: calculateBestStreak(history),
        });
      },

      addDailyTaskTemplate: (title) =>
        set((state) => {
          const nextTemplates = sortTemplates([
            ...state.dailyTaskTemplates,
            {
              id: Date.now().toString(),
              title,
              enabled: true,
              createdAt: Date.now(),
              sortOrder: state.dailyTaskTemplates.length,
            },
          ]);
          const nextItems = createDailyItems(nextTemplates).map((item) => {
            const existing = state.dailyTaskItems.find(
              (dailyItem) => dailyItem.templateId === item.templateId,
            );
            return existing ?? item;
          });
          const history = upsertHistory(
            state.dailyTaskHistory,
            state.dailyTaskDate,
            isDailySuccess(nextTemplates, nextItems),
          );

          return {
            dailyTaskTemplates: nextTemplates,
            dailyTaskItems: nextItems,
            dailyTaskHistory: history,
            bestDailyTaskStreak: calculateBestStreak(history),
          };
        }),
      deleteDailyTaskTemplate: (id) =>
        set((state) => {
          const nextTemplates = normalizeTemplateOrder(
            state.dailyTaskTemplates.filter((template) => template.id !== id),
          );
          const nextItems = state.dailyTaskItems.filter(
            (item) => item.templateId !== id,
          );
          const history = upsertHistory(
            state.dailyTaskHistory,
            state.dailyTaskDate,
            isDailySuccess(nextTemplates, nextItems),
          );

          return {
            dailyTaskTemplates: nextTemplates,
            dailyTaskItems: nextItems,
            dailyTaskHistory: history,
            bestDailyTaskStreak: calculateBestStreak(history),
          };
        }),
      toggleDailyTaskTemplateEnabled: (id) =>
        set((state) => {
          const nextTemplates = state.dailyTaskTemplates.map((template) =>
            template.id === id
              ? { ...template, enabled: !template.enabled }
              : template,
          );
          const activeTemplateIds = new Set(
            nextTemplates
              .filter((template) => template.enabled)
              .map((template) => template.id),
          );
          const nextItems = createDailyItems(nextTemplates).map((item) => {
            const existing = state.dailyTaskItems.find(
              (dailyItem) => dailyItem.templateId === item.templateId,
            );
            return existing ?? item;
          }).filter((item) => activeTemplateIds.has(item.templateId));
          const history = upsertHistory(
            state.dailyTaskHistory,
            state.dailyTaskDate,
            isDailySuccess(nextTemplates, nextItems),
          );

          return {
            dailyTaskTemplates: nextTemplates,
            dailyTaskItems: nextItems,
            dailyTaskHistory: history,
            bestDailyTaskStreak: calculateBestStreak(history),
          };
        }),
      updateDailyTaskTemplate: (id, title) =>
        set((state) => ({
          dailyTaskTemplates: state.dailyTaskTemplates.map((template) =>
            template.id === id ? { ...template, title } : template,
          ),
        })),
      moveDailyTaskTemplate: (id, direction) =>
        set((state) => {
          const templates = sortTemplates(state.dailyTaskTemplates);
          const index = templates.findIndex((template) => template.id === id);
          if (index === -1) return {};

          const targetIndex = direction === "up" ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= templates.length) return {};

          const reordered = [...templates];
          const [current] = reordered.splice(index, 1);
          reordered.splice(targetIndex, 0, current);

          return {
            dailyTaskTemplates: normalizeTemplateOrder(reordered),
          };
        }),
      toggleDailyTask: (templateId) =>
        set((state) => {
          const nextItems = state.dailyTaskItems.map((item) =>
            item.templateId === templateId
              ? {
                  ...item,
                  completed: !item.completed,
                  completedAt: !item.completed ? Date.now() : undefined,
                }
              : item,
          );
          const history = upsertHistory(
            state.dailyTaskHistory,
            state.dailyTaskDate,
            isDailySuccess(state.dailyTaskTemplates, nextItems),
          );

          return {
            dailyTaskItems: nextItems,
            dailyTaskHistory: history,
            bestDailyTaskStreak: calculateBestStreak(history),
          };
        }),

      updateSetting: (key, value) =>
        set((state) => ({
          settings: {
            ...state.settings,
            [key]: value,
          },
        })),
      resetAppData: () => {
        if (typeof window !== "undefined") {
          LEGACY_SETTING_KEYS.forEach((key) =>
            window.localStorage.removeItem(key),
          );
        }
        set(createInitialData());
      },
    }),
    {
      name: "yutoys-storage-v5",
      onRehydrateStorage: () => (state) => {
        if (typeof window !== "undefined") {
          LEGACY_SETTING_KEYS.forEach((key) =>
            window.localStorage.removeItem(key),
          );
        }

        state?.checkDailyReset();
      },
    },
  ),
);

export const selectCurrentDailyTaskStreak = (state: TaskState) =>
  calculateCurrentStreak(state.dailyTaskHistory);
