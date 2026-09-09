import { useState, useEffect } from 'react'
import { companionTexts } from '../data/mockData'

export default function TopCompanionBar() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % companionTexts.length)
        setVisible(true)
      }, 300)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-9 flex items-center justify-center gap-2 bg-bg/80 backdrop-blur-sm">
      <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse-amber" />
      <span
        className={`text-sm text-text-muted tracking-wide transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        {companionTexts[index]}
      </span>
    </div>
  )
}
