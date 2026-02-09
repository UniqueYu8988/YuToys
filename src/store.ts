import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Task {
  id: string
  text: string
  completed: boolean
  createdAt: number
  completedAt?: number
}

interface TimerState {
  timeLeft: number
  isActive: boolean
  configFocusMinutes: number // 动态配置时长
  setTimeLeft: (time: number) => void
  setIsActive: (active: boolean) => void
  setConfigFocusMinutes: (minutes: number) => void
  tick: () => void
}

interface TaskState extends TimerState {
  tasks: Task[]
  focusTime: number
  waterIntake: number
  waterCups: number
  totalRunMinutes: number
  addTask: (text: string) => void
  toggleTask: (id: string) => void
  updateTask: (id: string, text: string) => void
  deleteTask: (id: string) => void
  addFocusTime: (minutes: number) => void
  addWater: () => void
  markAllCleared: () => void
  addRunTime: (minutes: number) => void
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      focusTime: 0,
      waterIntake: 0,
      waterCups: 0,
      totalRunMinutes: 0,
      configFocusMinutes: 30, // 初始默认 30 分钟
      timeLeft: 30 * 60,
      isActive: false,

      // Timer Actions
      setTimeLeft: (time) => set({ timeLeft: time }),
      setIsActive: (active) => set({ isActive: active }),
      setConfigFocusMinutes: (minutes) => set({ 
        configFocusMinutes: minutes,
        timeLeft: minutes * 60, // 设置时同步重置倒计时
        isActive: false // 调整时长时停止当前计时
      }),
      tick: () => {
        const { timeLeft, isActive, addFocusTime } = get()
        if (isActive && timeLeft > 0) {
          const nextTime = timeLeft - 1
          set({ timeLeft: nextTime })
          if (nextTime % 60 === 0) {
            addFocusTime(1)
          }
        }
      },

      // Global Actions
      addRunTime: (minutes) => set((state) => ({ totalRunMinutes: (state.totalRunMinutes || 0) + minutes })),

      // Task Actions
      addTask: (text) => set((state) => ({
        tasks: [{ id: Date.now().toString(), text, completed: false, createdAt: Date.now() }, ...state.tasks]
      })),
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : undefined } : t)
      })),
      updateTask: (id, text) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, text } : t)
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      })),
      addFocusTime: (minutes) => set((state) => ({ focusTime: (state.focusTime || 0) + minutes })),
      addWater: () => set((state) => {
        const nextCups = Math.min((state.waterCups || 0) + 1, 6)
        return { 
          waterCups: nextCups,
          waterIntake: (state.waterIntake || 0) + 250 
        }
      }),
      markAllCleared: () => set((state) => ({ tasks: state.tasks.filter(t => !t.completed) }))
    }),
    {
      name: 'yutoys-storage-v5'
    }
  )
)
