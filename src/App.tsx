import React, { useState, useEffect } from 'react'
import { CheckCircle2, Clock, Droplets, BarChart3, Settings as SettingsIcon } from 'lucide-react'
import { useTaskStore } from './store'
import TaskList from './components/TaskList'
import Timer from './components/Timer'
import Reminders from './components/Reminders'
import Stats from './components/Stats'
import SettingsPage from './components/Settings'
import { motion, AnimatePresence } from 'framer-motion'
import { PreviewContext } from './context/PreviewContext'

// 导入本地音效资源
import chimeSound from './assets/sounds/chime.mp3'

declare global {
  interface Window {
    electronAPI: {
      minimize: () => void
      close: () => void
      setAlwaysOnTop: (flag: boolean) => void
      showNotification: (payload: { title: string; body: string }) => void
      setAutoStart: (flag: boolean) => void
      onHourlySound: (callback: () => void) => void
    }
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  
  const tick = useTaskStore(state => state.tick)
  const addRunTime = useTaskStore(state => state.addRunTime)

  useEffect(() => {
    let seconds = 0
    const timer = setInterval(() => {
      tick()
      seconds++
      if (seconds >= 60) {
        addRunTime(1)
        seconds = 0
      }

      const now = new Date()
      const hourlyEnabled = JSON.parse(localStorage.getItem('setting_hourlyChime') || 'true')
      
      if (now.getMinutes() === 0 && now.getSeconds() === 0 && hourlyEnabled) {
        const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
        
        // 播放本地音效 (离线可用)
        const audio = new Audio(chimeSound)
        audio.play().catch(e => console.error('Audio play failed', e))

        window.electronAPI?.showNotification({ 
          title: 'YuToys 整点报时', 
          body: `现在是 ${timeStr}` 
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [tick, addRunTime])

  return (
    <PreviewContext.Provider value={setPreviewSrc}>
      <div className="container">
        <header className="title-bar">
          <span style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.5 }}>YuToys</span>
          <div className="window-controls">
            <button onClick={() => window.electronAPI?.minimize()}>-</button>
            <button onClick={() => window.electronAPI?.close()}>×</button>
          </div>
        </header>
        
        <main className="content">
          <div className="page fade-in">
            {activeTab === 'home' && <TaskList />}
            {activeTab === 'timer' && <Timer />}
            {activeTab === 'remind' && <Reminders />}
            {activeTab === 'stats' && <Stats />}
            {activeTab === 'settings' && <SettingsPage />}
          </div>
        </main>

        <nav className="bottom-nav">
          {[
            { id: 'home', icon: <CheckCircle2 size={24} /> },
            { id: 'timer', icon: <Clock size={24} /> },
            { id: 'remind', icon: <Droplets size={24} /> },
            { id: 'stats', icon: <BarChart3 size={24} /> },
            { id: 'settings', icon: <SettingsIcon size={24} /> },
          ].map(tab => (
            <button 
              key={tab.id}
              className={activeTab === tab.id ? 'active' : ''} 
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
            </button>
          ))}
        </nav>

        <AnimatePresence>
          {previewSrc && (
            <motion.div 
              className="image-overlay"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setPreviewSrc(null)}
            >
              <motion.img 
                src={previewSrc} 
                initial={{ scale: 0.8, y: 20 }} 
                animate={{ scale: 1, y: 0 }} 
                exit={{ scale: 0.8, y: 20 }}
                style={{ maxWidth: '85%', maxHeight: '85%', borderRadius: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                onClick={(e) => e.stopPropagation()}
              />
              <p style={{ marginTop: 20, fontSize: '0.8rem', opacity: 0.6 }}>点击任意位置关闭</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PreviewContext.Provider>
  )
}

export default App
