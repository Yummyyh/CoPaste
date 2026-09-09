import { useState } from 'react'
import { cn } from '../lib/utils'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'px-3 py-1.5 text-xs rounded-md border transition-all cursor-pointer',
        copied
          ? 'bg-green/10 text-green border-green/20'
          : 'bg-bg text-text-muted border-border hover:text-text hover:border-text/20'
      )}
    >
      {copied ? '已复制 ✓' : '一键复制'}
    </button>
  )
}

export default function Step3Result({ data }) {
  const { resumeTips, greetingMessages, interviewQuestions, encouragement } = data

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-sm text-accent font-medium tracking-wider">
        Step 3 · 行动包
      </div>

      {/* 简历建议 */}
      <div className="bg-card border border-border rounded-card p-6 md:p-8 shadow-sm">
        <h3 className="font-heading text-lg font-semibold text-text mb-4">简历改写建议</h3>
        <ul className="space-y-3">
          {resumeTips.map((tip, i) => (
            <li key={i} className="flex items-start gap-3 text-text text-sm leading-relaxed">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-medium mt-0.5">
                {i + 1}
              </span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Boss打招呼话术 */}
      <div className="bg-card border border-border rounded-card p-6 md:p-8 shadow-sm">
        <h3 className="font-heading text-lg font-semibold text-text mb-4">Boss打招呼话术</h3>
        <div className="space-y-3">
          {greetingMessages.map((msg, i) => (
            <div key={i} className="bg-bg rounded-lg p-4 group">
              <div className="flex justify-between items-start gap-3 mb-2">
                <span className="text-xs text-text-muted font-medium">话术 {i + 1}</span>
                <CopyButton text={msg} />
              </div>
              <p className="text-text text-sm leading-relaxed">{msg}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 高频面试问题 */}
      <div className="bg-card border border-border rounded-card p-6 md:p-8 shadow-sm">
        <h3 className="font-heading text-lg font-semibold text-text mb-4">
          面试高频问题 & 回答思路
        </h3>
        <div className="space-y-4">
          {interviewQuestions.map((item, i) => (
            <details key={i} className="group bg-bg rounded-lg">
              <summary className="cursor-pointer p-4 font-medium text-text text-sm list-none flex items-center justify-between">
                <span>
                  <span className="text-accent mr-2">Q{i + 1}.</span>
                  {item.q}
                </span>
                <svg
                  className="w-4 h-4 text-text-muted transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <div className="px-4 pb-4 text-text-muted text-sm leading-relaxed border-t border-border pt-3 mx-4">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* 鼓励语 */}
      <div className="text-center py-8 px-6 space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
          <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
          </svg>
        </div>
        <p className="font-heading text-lg text-text font-medium italic leading-relaxed">
          {encouragement}
        </p>
        <p className="text-text-muted text-sm">祝你顺利 🤞</p>
      </div>
    </div>
  )
}
