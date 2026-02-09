import React from 'react'
import { useTaskStore } from '../store'
import { Target, Clock, Droplets, Activity } from 'lucide-react'
import { motion } from 'framer-motion'

const Stats: React.FC = () => {
  const { tasks, focusTime, totalRunMinutes, waterIntake } = useTaskStore()

  // 计算累计饮水杯数 (基于每 250ml 一杯)
  const cumulativeCups = Math.floor((waterIntake || 0) / 250)

  const items = [
    { className: 'tasks', icon: <Target size={22}/>, label: '达成目标', val: tasks.filter(t => t.completed).length, unit: '项' },
    { className: 'focus', icon: <Clock size={22}/>, label: '专注时长', val: focusTime || 0, unit: '分' },
    { className: 'water', icon: <Droplets size={22}/>, label: '累计饮水', val: cumulativeCups, unit: '杯' },
    { className: 'run', icon: <Activity size={22}/>, label: '软件运行', val: totalRunMinutes || 0, unit: '分' },
  ]

  return (
    <div className="page" style={{ padding: '4px 0' }}>
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
      <div className="glass-card" style={{ marginTop: 16, padding: '14px', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 20 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
        <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>YuToys持续陪伴中，感谢您的使用~</span>
      </div>
    </div>
  )
}

export default Stats
