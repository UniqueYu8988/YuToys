import React, { useState, useContext } from 'react'
import { Shield, Bell, Monitor, RefreshCcw, PlayCircle, Heart, MessageCircle, Clock } from 'lucide-react'
import { PreviewContext } from '../context/PreviewContext'
import alipayImg from '../assets/alipay.jpg'
import qqImg from '../assets/qq.png'
import chimeSound from '../assets/sounds/chime.mp3'
import { useTaskStore } from '../store'

const SettingsPage: React.FC = () => {
  const setPreview = useContext(PreviewContext)
  const { configFocusMinutes, setConfigFocusMinutes } = useTaskStore()
  
  const [alwaysOnTop, setAlwaysOnTop] = useState(() => JSON.parse(localStorage.getItem('setting_alwaysOnTop') || 'true'))
  const [autoStart, setAutoStart] = useState(() => JSON.parse(localStorage.getItem('setting_autoStart') || 'false'))
  const [hourlyChime, setHourlyChime] = useState(() => JSON.parse(localStorage.getItem('setting_hourlyChime') || 'true'))
  const [resetStep, setResetStep] = useState(0)

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

  const testHourly = () => {
    const now = new Date()
    const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
    
    // 使用本地音效测试
    const audio = new Audio(chimeSound)
    audio.play().catch(e => console.error('Audio play failed', e))

    window.electronAPI?.showNotification({ 
      title: 'YuToys 报时测试', 
      body: `当前系统时间: ${timeStr}` 
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
    <div className="page" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <SettingItem icon={<Shield size={18} color="#a855f7"/>} label="窗口置顶">
          <div className={`native-toggle ${alwaysOnTop ? 'on' : ''}`} onClick={toggleOnTop}><div className="thumb"/></div>
        </SettingItem>

        <SettingItem icon={<Monitor size={18} color="#3b82f6"/>} label="开机自启">
          <div className={`native-toggle ${autoStart ? 'on' : ''}`} onClick={toggleAutoStart}><div className="thumb"/></div>
        </SettingItem>

        <SettingItem icon={<Bell size={18} color="#6366f1"/>} label="整点报时">
          <div className={`native-toggle ${hourlyChime ? 'on' : ''}`} onClick={toggleHourly}><div className="thumb"/></div>
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
      </div>

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
    </div>
  )
}

export default SettingsPage
