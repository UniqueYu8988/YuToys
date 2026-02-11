import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

const SplashScreen: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0a0a0f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        overflow: 'hidden'
      }}
    >
      {/* 背景光晕装饰 */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }}
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ position: 'relative' }}
      >
        <Sparkles size={64} color="#a855f7" style={{ filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))' }} />
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{ 
            fontSize: '1.5rem', 
            fontWeight: 700, 
            letterSpacing: '0.2em',
            background: 'linear-gradient(to right, #fff, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          YuToys
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 1.2, duration: 1 }}
          style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}
        >
          小羽助理正在就位喵...
        </motion.p>
      </div>

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 120 }}
        transition={{ delay: 1.5, duration: 1, ease: "easeInOut" }}
        style={{ height: 1, background: 'linear-gradient(to right, transparent, #a855f7, transparent)', opacity: 0.3 }}
      />
    </motion.div>
  )
}

export default SplashScreen
