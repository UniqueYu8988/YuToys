import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTaskStore } from '../store'
import confetti from 'canvas-confetti'
import successSound from '../assets/sounds/success.mp3'

const Timer: React.FC = () => {
  const { timeLeft, isActive, setIsActive, setTimeLeft, configFocusMinutes } = useTaskStore()

  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      setIsActive(false)
      
      // 播放本地成功的音效 (离线可用)
      const audio = new Audio(successSound)
      audio.play().catch(e => console.error('Audio play failed', e))

      window.electronAPI?.showNotification({ 
        title: 'YuToys 专注结束', 
        body: `${configFocusMinutes} 分钟专注已完成，休息一下吧！` 
      })
      
      const duration = 3 * 1000
      const end = Date.now() + duration

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 90,
          spread: 55,
          origin: { x: 0.5, y: 1 },
          colors: ['#a855f7', '#6366f1', '#ffffff']
        })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()

      setTimeLeft(configFocusMinutes * 60)
    }
  }, [timeLeft, isActive, setIsActive, setTimeLeft, configFocusMinutes])

  const radius = 80
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (timeLeft / (configFocusMinutes * 60)) * circumference

  return (
    <motion.div 
      className="page" 
      style={{ alignItems: 'center', justifyContent: 'center' }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
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
