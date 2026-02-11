import React, { useState, useContext, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Bell, Monitor, RefreshCcw, PlayCircle, Heart, MessageCircle, Clock, Github, Sparkles } from 'lucide-react'
import { PreviewContext } from '../context/PreviewContext'
import alipayImg from '../assets/alipay.jpg'
import qqImg from '../assets/qq.png'
import chimeSound from '../assets/sounds/chime.mp3'
import { useTaskStore } from '../store'

const FORTUNES = [
  "【上上签】小羽预感到主人今天运气爆棚喵！抽卡必出虹光，心想事必成喵~ (适宜: 抽卡/表白)",
  "【大吉】万物可爱喵！今天适合出门走走，或者开启一段新的学习计划喵~ (适宜: 出行/阅读)",
  "【中吉】平稳即是大福喵。小羽建议主人今天适合喝杯热茶，整理一下桌面喵~ (适宜: 收纳/冥想)",
  "【吉】猫铃铛响了，是好运在靠近喵！小羽觉得今天宜奖励自己一顿大餐喵~ (适宜: 美食/休息)",
  "【上吉】锦鲤翻身喵！今天适合向喜欢的人打个招呼，或者开始一项新挑战喵~ (适宜: 沟通/尝试)"
]

const SettingsPage: React.FC = () => {
  const setPreview = useContext(PreviewContext)
  const { 
    configFocusMinutes, setConfigFocusMinutes, 
    lastFortuneDate, lastFortuneResult, setFortune 
  } = useTaskStore()
  
  const [alwaysOnTop, setAlwaysOnTop] = useState(() => JSON.parse(localStorage.getItem('setting_alwaysOnTop') || 'true'))
  const [autoStart, setAutoStart] = useState(() => JSON.parse(localStorage.getItem('setting_autoStart') || 'false'))
  const [hourlyChime, setHourlyChime] = useState(() => JSON.parse(localStorage.getItem('setting_hourlyChime') || 'true'))
  const [skipTaskbar, setSkipTaskbar] = useState(() => JSON.parse(localStorage.getItem('setting_skipTaskbar') || 'false'))
  const [tickingSound, setTickingSound] = useState(() => JSON.parse(localStorage.getItem('setting_tickingSound') || 'false'))
  const [resetStep, setResetStep] = useState(0)

  const isFortuneDrawnToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return lastFortuneDate === today
  }, [lastFortuneDate])

  const handleDrawFortune = () => {
    if (isFortuneDrawnToday) {
      window.electronAPI?.showNotification({ 
        title: '小羽的温馨提示', 
        body: '主人今天已经抽过签了喵，贪心的话好运会溜走喔~' 
      })
      return
    }
    const result = FORTUNES[Math.floor(Math.random() * FORTUNES.length)]
    setFortune(result)
    window.electronAPI?.showNotification({ 
      title: '🎋 新春测运势', 
      body: result 
    })
  }

  const toggleOnTop = () => {
    const newVal = !alwaysOnTop
    setAlwaysOnTop(newVal)
    localStorage.setItem('setting_alwaysOnTop', JSON.stringify(newVal))
    window.electronAPI?.setAlwaysOnTop(newVal)
  }

  const toggleAutoStart = () => {
    const newVal = !autoStart
    setAutoStart(newVal)
    localStorage.setItem('setting_autoStart', JSON.stringify(newVal))
    window.electronAPI?.setAutoStart(newVal)
  }

  const toggleHourly = () => {
    const newVal = !hourlyChime
    setHourlyChime(newVal)
    localStorage.setItem('setting_hourlyChime', JSON.stringify(newVal))
  }

  const toggleSkipTaskbar = () => {
    const newVal = !skipTaskbar
    setSkipTaskbar(newVal)
    localStorage.setItem('setting_skipTaskbar', JSON.stringify(newVal))
    window.electronAPI?.setSkipTaskbar(newVal)
  }

  const toggleTicking = () => {
    const newVal = !tickingSound
    setTickingSound(newVal)
    localStorage.setItem('setting_tickingSound', JSON.stringify(newVal))
  }

  const testHourly = () => {
    const now = new Date()
    const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
    const audio = new Audio(chimeSound)
    audio.play().catch(e => console.error('Audio play failed', e))

    window.electronAPI?.showNotification({ 
      title: 'YuToys 报时测试', 
      body: `主人，现在是 ${timeStr} 喵，YuToys 运行正常~` 
    })
  }

  const handleReset = () => {
    if (resetStep < 2) setResetStep(resetStep + 1)
    else { localStorage.clear(); window.location.reload(); }
  }

  const SettingItem = ({ icon, label, children }: { icon: React.ReactNode, label: string, children: React.ReactNode }) => (
    <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {icon}
        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{label}</span>
      </div>
      {children}
    </div>
  )

  return (
    <div className="page">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <SettingItem icon={<Sparkles size={18} color="#facc15"/>} label="新春测运势">
          <button 
            className="text-action-btn" 
            onClick={handleDrawFortune}
            style={{ opacity: isFortuneDrawnToday ? 0.5 : 1 }}
          >
            {isFortuneDrawnToday ? '已抽签' : '抽签'}
          </button>
        </SettingItem>

        <SettingItem icon={<Shield size={18} color="#a855f7"/>} label="窗口置顶">
          <div className={`native-toggle ${alwaysOnTop ? 'on' : ''}`} onClick={toggleOnTop}><div className="thumb"/></div>
        </SettingItem>

        <SettingItem icon={<Monitor size={18} color="#3b82f6"/>} label="开机自启">
          <div className={`native-toggle ${autoStart ? 'on' : ''}`} onClick={toggleAutoStart}><div className="thumb"/></div>
        </SettingItem>

        <SettingItem icon={<Bell size={18} color="#6366f1"/>} label="整点报时">
          <div className={`native-toggle ${hourlyChime ? 'on' : ''}`} onClick={toggleHourly}><div className="thumb"/></div>
        </SettingItem>

        <SettingItem icon={<Monitor size={18} color="#f59e0b"/>} label="任务栏图标">
          <div className={`native-toggle ${!skipTaskbar ? 'on' : ''}`} onClick={toggleSkipTaskbar}><div className="thumb"/></div>
        </SettingItem>

        <SettingItem icon={<Clock size={18} color="#ec4899"/>} label="时钟滴答">
          <div className={`native-toggle ${tickingSound ? 'on' : ''}`} onClick={toggleTicking}><div className="thumb"/></div>
        </SettingItem>

        <SettingItem icon={<Clock size={18} color="#10b981"/>} label="计时设置">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input 
              type="number" min="1" max="99" 
              value={configFocusMinutes}
              onChange={(e) => setConfigFocusMinutes(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
              className="seamless-num-input no-spinner"
            />
            <span style={{ fontSize: '0.65rem', opacity: 0.3, fontWeight: 700 }}>MIN</span>
          </div>
        </SettingItem>

        <SettingItem icon={<PlayCircle size={18} color="rgba(255,255,255,0.4)"/>} label="报时测试">
          <button className="text-action-btn" onClick={testHourly}>触发</button>
        </SettingItem>

        <SettingItem icon={<MessageCircle size={18} color="#38bdf8"/>} label="问题反馈">
          <button className="text-action-btn" onClick={() => setPreview(qqImg)}>加群</button>
        </SettingItem>

        <SettingItem icon={<Heart size={18} color="#f43f5e"/>} label="赞助支持">
          <button className="text-action-btn" onClick={() => setPreview(alipayImg)}>支持</button>
        </SettingItem>

        <SettingItem icon={<Github size={18} color="#fff"/>} label="开源项目">
          <button className="text-action-btn" onClick={() => window.electronAPI?.openExternal('https://github.com/UniqueYu8988/YuToys')}>Star</button>
        </SettingItem>
      </div>

      {isFortuneDrawnToday && lastFortuneResult && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            marginTop: 12, padding: '10px 14px', borderRadius: 12, 
            background: 'rgba(250, 204, 21, 0.1)', border: '1px solid rgba(250, 204, 21, 0.2)',
            fontSize: '0.75rem', color: '#fef08a', lineHeight: 1.5
          }}
        >
          {lastFortuneResult}
        </motion.div>
      )}

      <div style={{ marginTop: 'auto', paddingBottom: 2 }}>
        <div className="glass-card danger-btn" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <RefreshCcw size={18}/>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>重置数据</span>
          </div>
          <button 
            onClick={handleReset}
            style={{ 
              background: resetStep > 0 ? '#ef4444' : 'rgba(255, 255, 255, 0.05)', 
              color: 'white', 
              border: 'none', 
              padding: '6px 12px', 
              borderRadius: 8, 
              cursor: 'pointer', 
              fontSize: '0.75rem',
              transition: '0.3s'
            }}
          >
            {resetStep === 0 ? '确认' : `确认 ${resetStep}/2`}
          </button>
        </div>
      </div>
      {/* 底部安全占位符 (V1.4.7) */}
      <div style={{ height: 40, flexShrink: 0 }} />
    </div>
  )
}

export default SettingsPage
