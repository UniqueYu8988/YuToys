import React, { useState, useEffect } from 'react'
import { CheckCircle2, Clock, ListTodo, BarChart3, Settings as SettingsIcon } from 'lucide-react'
import { useTaskStore } from './store'
import { motion, AnimatePresence } from 'framer-motion'
import { PreviewContext } from './context/PreviewContext'
import { useDesktopSettingsSync } from './hooks/useDesktopSettingsSync'
import { useFocusCompletion } from './hooks/useFocusCompletion'
import { useGlobalTicker } from './hooks/useGlobalTicker'

import TaskList from './features/tasks/TaskList'
import Timer from './features/timer/Timer'
import DailyTasks from './features/dailyTasks/DailyTasks'
import Stats from './features/stats/Stats'
import SettingsPage from './features/settings/Settings'
import SplashScreen from './components/SplashScreen'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const [showSplash, setShowSplash] = useState(true)
  const checkDailyReset = useTaskStore(state => state.checkDailyReset)

  useDesktopSettingsSync()
  useGlobalTicker()
  useFocusCompletion()
  
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleNavigate = (event: Event) => {
      const customEvent = event as CustomEvent<string>
      if (customEvent.detail) {
        setActiveTab(customEvent.detail)
      }
    }

    window.addEventListener('yutoys:navigate', handleNavigate)
    return () => window.removeEventListener('yutoys:navigate', handleNavigate)
  }, [])

  // 跨天数据重置检测 (V2.0.2)
  useEffect(() => {
    checkDailyReset()
  }, [checkDailyReset])

  return (
    <PreviewContext.Provider value={setPreviewSrc}>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" />
        ) : (
          <motion.div 
            key="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="container"
          >
            <header className="title-bar">
              <span style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.5 }}>YuToys</span>
              <div className="window-controls">
                <button onClick={() => window.electronAPI?.minimize()}>-</button>
                <button onClick={() => window.electronAPI?.close()}>×</button>
              </div>
            </header>
            
            <main className="content">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0.92 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.16 }}
                style={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column' 
                }}
              >
                  {activeTab === 'home' && <TaskList />}
                  {activeTab === 'timer' && <Timer />}
                  {activeTab === 'daily' && <DailyTasks />}
                  {activeTab === 'stats' && <Stats />}
                  {activeTab === 'settings' && <SettingsPage />}
              </motion.div>
            </main>

            <nav className="bottom-nav">
              {[
                { id: 'home', icon: <CheckCircle2 size={24} /> },
                { id: 'timer', icon: <Clock size={24} /> },
                { id: 'daily', icon: <ListTodo size={24} /> },
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
          </motion.div>
        )}
      </AnimatePresence>
    </PreviewContext.Provider>
  )
}

export default App
