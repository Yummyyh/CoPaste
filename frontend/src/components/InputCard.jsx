import { cn } from '../lib/utils'

export default function InputCard({ value, onChange, onSubmit, activeTab, onTabChange }) {
  return (
    <div className="w-full max-w-2xl bg-card border border-border rounded-card shadow-sm p-6 md:p-8 animate-slide-up">
      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-bg rounded-lg p-1">
        {['粘贴JD文本', '输入JD链接'].map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={cn(
              'flex-1 py-2.5 text-sm font-medium rounded-md transition-colors',
              activeTab === tab
                ? 'bg-card text-text shadow-sm'
                : 'text-text-muted hover:text-text'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          activeTab === '粘贴JD文本'
            ? '把JD内容粘贴到这里…'
            : '输入职位链接…（暂用mock数据演示）'
        }
        rows={8}
        className="w-full resize-none rounded-lg border border-border bg-bg px-4 py-3.5 text-text placeholder-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all text-sm leading-relaxed"
      />

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={!value.trim()}
        className={cn(
          'mt-5 w-full py-3.5 rounded-btn font-medium text-base transition-all',
          value.trim()
            ? 'bg-text text-bg hover:bg-text/90 cursor-pointer active:scale-[0.99]'
            : 'bg-pill-pending/30 text-text-muted cursor-not-allowed'
        )}
      >
        开始解读 →
      </button>
    </div>
  )
}
