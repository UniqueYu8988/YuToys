import React, { useEffect, useRef } from 'react'
import { useTaskStore } from '../store'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

const Reminders: React.FC = () => {
  const { waterCups, addWater } = useTaskStore()
  const level = (waterCups / 6) * 100
  
  // 增加引用以检测杯数变化，防止切换页面重复触发动画
  const prevCupsRef = useRef(waterCups)

  useEffect(() => {
    // 仅在杯数处于 6 且是从之前较小的数值增长上来时触发
    if (waterCups === 6 && prevCupsRef.current < 6) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { x: 0.5, y: 1 },
        colors: ['#3b82f6', '#60a5fa', '#ffffff'],
        gravity: 0.8,
        scalar: 1.2
      })
    }
    // 同步旧值
    prevCupsRef.current = waterCups
  }, [waterCups])

  return (
    <div className="page center-layout" style={{ alignItems: 'center' }}>
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="cup-wrapper">
          <motion.div className="water-fill" initial={{ height: 0 }} animate={{ height: `${level}%` }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        <AnimatePresence mode="wait">
          {waterCups < 6 ? (
            <motion.button 
              key="btn" className="confirm-btn" onClick={addWater}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              style={{ width: 'auto', padding: '12px 36px', borderRadius: 30 }}
            >
              喝一杯水
            </motion.button>
          ) : (
            <motion.div 
              key="txt" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} 
              className="cup-target-met" style={{ textAlign: 'center' }}
            >
              今日饮水目标已达成
            </motion.div>
          )}
        </AnimatePresence>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 2 }}>
          {waterCups} / 6 CUPS
        </span>
      </div>
    </div>
  )
}

export default Reminders
