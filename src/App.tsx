import React, { useState, useEffect } from 'react'
import { CheckCircle2, Clock, Droplets, BarChart3, Settings as SettingsIcon } from 'lucide-react'
import { useTaskStore } from './store'
import { motion, AnimatePresence } from 'framer-motion'
import { PreviewContext } from './context/PreviewContext'

// 导入本地音效资源
import chimeSound from './assets/sounds/chime.mp3'
import successSound from './assets/sounds/success.mp3'
import confetti from 'canvas-confetti'

declare global {
  interface Window {
    electronAPI: {
      minimize: () => void
      close: () => void
      setAlwaysOnTop: (flag: boolean) => void
      showNotification: (payload: { title: string; body: string }) => void
      setAutoStart: (flag: boolean) => void
      setSkipTaskbar: (flag: boolean) => void
      openExternal: (url: string) => void
      onHourlySound: (callback: () => void) => void
    }
  }
}

import TaskList from './components/TaskList'
import Timer from './components/Timer'
import Reminders from './components/Reminders'
import Stats from './components/Stats'
import SettingsPage from './components/Settings'
import SplashScreen from './components/SplashScreen'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const [showSplash, setShowSplash] = useState(true)
  
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500)
    return () => clearTimeout(timer)
  }, [])

  const { timeLeft, isActive, setIsActive, setTimeLeft, configFocusMinutes, totalRunMinutes } = useTaskStore()
  const tick = useTaskStore(state => state.tick)
  const addRunTime = useTaskStore(state => state.addRunTime)
  const checkDailyReset = useTaskStore(state => state.checkDailyReset)

  // 跨天数据重置检测 (V2.0.2)
  useEffect(() => {
    checkDailyReset()
  }, [checkDailyReset])

  // 音频引擎单例化 (V1.4.1 性能优化)
  const successAudio = React.useMemo(() => new Audio(successSound), [])
  const chimeAudio = React.useMemo(() => new Audio(chimeSound), [])
  const tickAudioRef = React.useRef<HTMLAudioElement | null>(null)
  const audioContextRef = React.useRef<AudioContext | null>(null)
  
  // 模拟时钟滴答音合成引擎
  const playTick = React.useCallback(() => {
    try {
      // 优先重用已加载的资源，避免内存溢出
      if (!tickAudioRef.current) {
        tickAudioRef.current = new Audio('/src/assets/sounds/tick.mp3')
      }
      
      tickAudioRef.current.play().catch(() => {
        // Fallback: Web Audio API 合成 (重用 Context)
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        }
        const ctx = audioContextRef.current
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = 1500
        gain.gain.setValueAtTime(0.02, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05)
        osc.start()
        osc.stop(ctx.currentTime + 0.05)
      })
    } catch (e) {}
  }, [])

  // 全局计时器与整点报时
  useEffect(() => {
    let seconds = 0
    const timer = setInterval(() => {
      tick()
      checkDailyReset() // 持续检测，支持跨天不关机自动重置
      seconds++

      // 滴答音效 (V1.4 修复闭包同步)
      const tickingEnabled = JSON.parse(localStorage.getItem('setting_tickingSound') || 'false')
      const currentIsActive = useTaskStore.getState().isActive // 实时获取状态，解决闭包问题
      if (currentIsActive && tickingEnabled) {
        playTick()
      }
      
      if (seconds >= 60) {
        const nextTotal = (totalRunMinutes || 0) + 1
        addRunTime(1)
        seconds = 0
        
        // 动态饮水提醒：每运行 60 分钟提醒一次 (V1.4.3 精准逻辑)
        if (nextTotal > 0 && nextTotal % 60 === 0) {
          window.electronAPI?.showNotification({ 
            title: 'YuToys 呵护提醒', 
            body: `主人已经持续努力 ${nextTotal/60} 小时了喵，快喝杯温水休息一下吧 💧` 
          })
        }
      }

      const now = new Date()
      const hourlyEnabled = JSON.parse(localStorage.getItem('setting_hourlyChime') || 'true')
      
      if (now.getMinutes() === 0 && now.getSeconds() === 0 && hourlyEnabled) {
        const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
        chimeAudio.currentTime = 0
        chimeAudio.play().catch(e => console.error('Audio fail', e))
        window.electronAPI?.showNotification({ 
          title: 'YuToys 整点报时', 
          body: `主人，现在是 ${timeStr} 喵，辛苦了~` 
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [tick, addRunTime, totalRunMinutes])

  // 全局番茄钟结束处理器
  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      setIsActive(false)
      successAudio.currentTime = 0
      successAudio.play().catch(e => console.error('Audio fail', e))
      
      window.electronAPI?.showNotification({ 
        title: 'YuToys 专注结束', 
        body: `太棒了！主人完成了 ${configFocusMinutes} 分钟的专注喵，快让小羽抱抱 💜` 
      })

      // 全局烟花礼赞
      const duration = 3 * 1000
      const end = Date.now() + duration
      const frame = () => {
        confetti({ particleCount: 3, angle: 90, spread: 55, origin: { x: 0.5, y: 1 }, colors: ['#a855f7', '#6366f1', '#ffffff'] })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()

      setTimeLeft(configFocusMinutes * 60)
    }
  }, [timeLeft, isActive, setIsActive, setTimeLeft, configFocusMinutes])

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
              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.1 }}
                  style={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column' 
                  }}
                >
                    {activeTab === 'home' && <TaskList />}
                    {activeTab === 'timer' && <Timer />}
                    {activeTab === 'remind' && <Reminders />}
                    {activeTab === 'stats' && <Stats />}
                    {activeTab === 'settings' && <SettingsPage />}
                </motion.div>
              </AnimatePresence>
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
          </motion.div>
        )}
      </AnimatePresence>
    </PreviewContext.Provider>
  )
}

export default App
