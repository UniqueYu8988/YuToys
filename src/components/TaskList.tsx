import React, { useState } from 'react'
import { useTaskStore, Task } from '../store'
import { Trash2, Circle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

const TaskList: React.FC = () => {
  const { tasks, addTask, toggleTask, updateTask, deleteTask } = useTaskStore()
  const [inputValue, setInputValue] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const activeTasks = tasks.filter(t => !t.completed)

  const handleToggle = (id: string, completed: boolean, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    toggleTask(id)
    if (!completed) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { x: (rect.left + 10) / window.innerWidth, y: (rect.top + 10) / window.innerHeight },
        colors: ['#a855f7', '#ffffff'],
        gravity: 1,
        startVelocity: 20,
      })
      setTimeout(() => {
        if (useTaskStore.getState().tasks.filter(t => !t.completed).length === 0) {
          triggerCelebration()
        }
      }, 500)
    }
  }

  const triggerCelebration = () => {
    [0.2, 0.5, 0.8].forEach(x => confetti({
      particleCount: 50, origin: { x, y: 0.9 }, colors: ['#a855f7', '#fff'], gravity: 0.6
    }))
  }

  return (
    <div className="page">
      <form style={{ marginBottom: 24 }} onSubmit={e => { e.preventDefault(); if(inputValue.trim()){ addTask(inputValue.trim()); setInputValue(''); } }}>
        <input 
          className="glass-card" 
          style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '14px 16px', outline: 'none', borderRadius: 16 }}
          placeholder="添加新任务..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
        />
        {/* 彻底移除添加按钮，回车即可添加 */}
      </form>

      <div className="task-list-viewport">
        <AnimatePresence>
          {activeTasks.map((task, index) => (
            <motion.div 
              key={task.id} 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1, 
                ease: "easeOut"
              }}
              className="task-item"
            >
              <button className="toggle-btn" onClick={e => handleToggle(task.id, task.completed, e)}>
                <Circle size={20} strokeWidth={2.5} />
              </button>
              {editingId === task.id ? (
                <input 
                  autoFocus 
                  className="seamless-input" 
                  value={editValue} 
                  onChange={e => setEditValue(e.target.value)}
                  onBlur={() => { if(editValue.trim()) updateTask(task.id, editValue.trim()); setEditingId(null); }}
                  onKeyDown={e => e.key === 'Enter' && (e.currentTarget.blur())}
                />
              ) : (
                <span className="task-text" onDoubleClick={() => { setEditingId(task.id); setEditValue(task.text); }}>{task.text}</span>
              )}
              {editingId === task.id && <Trash2 size={16} color="#ef4444" onMouseDown={(e) => { e.preventDefault(); deleteTask(task.id); }} style={{ cursor: 'pointer' }}/>}
            </motion.div>
          ))}
        </AnimatePresence>

        {activeTasks.length === 0 && tasks.length > 0 && (
          <motion.div className="mission-accomplished" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, background: 'linear-gradient(90deg, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MISSION ACCOMPLISHED</h2>
            <p style={{ fontSize: '0.8rem', opacity: 0.4, marginTop: 4 }}>所有目标已达成</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default TaskList
