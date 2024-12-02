import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../contexts/theme-context'

interface SpinningWheelProps {
  isSpinning: boolean
  onSpinComplete: () => void
}

export function SpinningWheel({ isSpinning, onSpinComplete }: SpinningWheelProps) {
  const { theme } = useTheme()

  useEffect(() => {
    if (isSpinning) {
      const timer = setTimeout(() => {
        onSpinComplete()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isSpinning, onSpinComplete])

  const wheelVariants = {
    spinning: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: 3,
        ease: "linear"
      }
    }
  }

  const dotVariants = {
    spinning: (i: number) => ({
      scale: [1, 1.5, 1],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        delay: i * 0.1
      }
    })
  }

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      <motion.div
        className={`w-full h-full rounded-full border-8 border-t-transparent ${
          theme === 'dark' ? 'border-blue-400' : 'border-blue-500'
        }`}
        animate={isSpinning ? "spinning" : "static"}
        variants={wheelVariants}
      />
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-4 h-4 rounded-full ${
            theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
          }`}
          style={{
            top: `${50 + 40 * Math.sin(i * Math.PI / 4)}%`,
            left: `${50 + 40 * Math.cos(i * Math.PI / 4)}%`,
          }}
          animate={isSpinning ? "spinning" : "static"}
          variants={dotVariants}
          custom={i}
        />
      ))}
      {isSpinning && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
          }`}>
            Sorteando...
          </p>
        </div>
      )}
    </div>
  )
}

