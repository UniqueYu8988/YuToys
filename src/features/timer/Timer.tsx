import React from 'react'
import { motion } from 'framer-motion'
import { useTaskStore } from '../../store'
import { PinOff } from 'lucide-react'

const Timer: React.FC = () => {
  const {
    timeLeft,
    isActive,
    setIsActive,
    configFocusMinutes,
    focusTaskId,
    setFocusTask,
    tasks,
  } = useTaskStore()

  // 逻辑已提升至 App.tsx 进行全局监听，此处仅负责视觉展示

  const radius = 80
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (timeLeft / (configFocusMinutes * 60)) * circumference
  const focusTask = tasks.find(task => task.id === focusTaskId && !task.completed)

  return (
    <motion.div 
      className="page timer-page" 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="glass-card timer-focus-card">
        <div>
          <p className="today-section-eyebrow">专注目标</p>
          <p className="timer-focus-text">
            {focusTask ? focusTask.text : '还没有绑定专注目标，回到首页把当前重点带进来吧。'}
          </p>
          {focusTask?.focusPresetMinutes && (
            <p className="timer-focus-subtext">
              已套用任务预设时长 {focusTask.focusPresetMinutes} 分钟
            </p>
          )}
        </div>
        {focusTask && (
          <button className="timer-focus-clear" onClick={() => setFocusTask(null)} type="button">
            <PinOff size={14} />
            清除
          </button>
        )}
      </div>

      <div className="timer-interactive-wrapper" onClick={() => setIsActive(!isActive)}>
        <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="2.5" />
          <motion.circle 
            cx="100" cy="100" r={radius} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"
            strokeDasharray={circumference} animate={{ strokeDashoffset: offset }} transition={{ type: 'tween', ease: 'linear', duration: 1 }}
          />
        </svg>
        <div style={{ position: 'absolute', display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span className="timer-display">{Math.floor(timeLeft / 60).toString().padStart(2, '0')}</span>
          <span style={{ fontSize: '1.2rem', opacity: 0.2 }}>:</span>
          <span className="timer-display">{(timeLeft % 60).toString().padStart(2, '0')}</span>
        </div>
      </div>
      
      <p style={{ marginTop: 32, fontSize: '0.8rem', color: 'var(--text-dim)', letterSpacing: 3, opacity: 0.7, fontWeight: 700 }}>
        {isActive ? 'FOCUSING...' : 'TAP TO START'}
      </p>
    </motion.div>
  )
}

export default Timer
