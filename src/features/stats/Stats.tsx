import React from 'react'
import { selectCurrentDailyTaskStreak, useTaskStore } from '../../store'
import { Target, Clock, Flame, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import { getRandomQuote } from './data/quotes'

const Stats: React.FC = () => {
  const { tasks, focusTime, totalRunMinutes } = useTaskStore()
  const streak = useTaskStore(selectCurrentDailyTaskStreak)
  const runHours = Math.floor((totalRunMinutes || 0) / 60)

  // 使用 useState 锁定本次入场时的对话，解决频繁跳变问题 (V1.5.1 重命名变量)
  const [xiaoYuQuote] = React.useState(() => {
    const tc = tasks.filter(t => t.completed).length
    const rt = totalRunMinutes || 0
    return getRandomQuote(tc, rt, streak)
  })

  // V1.4.8: 动态计算时长，确保文字无论长短语速一致 (约为 4 字符/秒)
  const marqueeDuration = React.useMemo(() => {
    return Math.max(8, xiaoYuQuote.length * 0.25) 
  }, [xiaoYuQuote])

  const items = [
    { className: 'tasks', icon: <Target size={22}/>, label: '达成目标', val: tasks.filter(t => t.completed).length, unit: '项' },
    { className: 'focus', icon: <Clock size={22}/>, label: '专注时长', val: focusTime || 0, unit: '分' },
    { className: 'streak', icon: <Flame size={22}/>, label: '每日任务连胜', val: streak, unit: '天' },
    { className: 'run', icon: <Activity size={22}/>, label: '软件运行', val: runHours, unit: '小时' },
  ]

  return (
    <div className="page no-scroll">
      <div className="stats-grid">
        {items.map((it, i) => (
          <motion.div 
            key={i} 
            className={`stat-card ${it.className}`} 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: i * 0.05 }}
          >
            <div className="stat-icon">{it.icon}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span className="stat-val">{it.val} <span style={{ fontSize: '0.8rem', fontWeight: 400, opacity: 0.6 }}>{it.unit}</span></span>
              <span className="stat-label">{it.label}</span>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="glass-card" style={{ marginTop: 16, padding: '14px', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 20, overflow: 'hidden', position: 'relative' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#a855f7', boxShadow: '0 0 10px #a855f7', flexShrink: 0, zIndex: 10, position: 'relative' }} />
        
        <div className="marquee-container" style={{ flex: 1, overflow: 'hidden', position: 'relative', height: '1.25rem' }}>
          <motion.div
            key={xiaoYuQuote}
            // V1.4.8: 动态等速循环逻辑
            animate={{ x: [0, "-50%"] }}
            transition={{ 
              duration: marqueeDuration, 
              ease: "linear",
              repeat: Infinity,
            }}
            style={{ 
              position: 'absolute',
              whiteSpace: 'nowrap',
              fontSize: '0.75rem', 
              opacity: 0.8,
              display: 'flex',
              paddingLeft: '0'
            }}
          >
            <span style={{ paddingRight: '100px' }}>{xiaoYuQuote}</span>
            <span style={{ paddingRight: '100px' }}>{xiaoYuQuote}</span>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Stats
