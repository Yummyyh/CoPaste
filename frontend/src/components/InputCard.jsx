import { cn } from '../lib/utils'

export default function InputCard({
  value,
  onChange,
  onSubmit,
  resumeName,
  resumeContent,
  onResumeNameChange,
  onResumeContentChange,
  onSaveResume,
  resumeStatus,
}) {
  return (
    <div className="w-full max-w-2xl bg-card border border-border rounded-card shadow-sm p-6 md:p-8 animate-slide-up">
      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="把JD内容粘贴到这里…"
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

      <div className="mt-8 border-t border-border pt-6 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-heading text-base font-semibold text-text">我的简历</h3>
            <p className="text-xs text-text-muted mt-1">保存后可用于后续真实匹配分析</p>
          </div>
          {resumeStatus && <span className="text-xs text-text-muted">{resumeStatus}</span>}
        </div>
        <input
          value={resumeName}
          onChange={(e) => onResumeNameChange(e.target.value)}
          placeholder="简历名称，例如：前端开发版"
          className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-sm text-text placeholder-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40"
        />
        <textarea
          value={resumeContent}
          onChange={(e) => onResumeContentChange(e.target.value)}
          placeholder="粘贴你的简历内容…"
          rows={7}
          className="w-full resize-none rounded-lg border border-border bg-bg px-4 py-3.5 text-text placeholder-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all text-sm leading-relaxed"
        />
        <button
          type="button"
          onClick={onSaveResume}
          disabled={!resumeName.trim() || !resumeContent.trim()}
          className={cn(
            'w-full py-3 rounded-btn font-medium text-sm transition-all',
            resumeName.trim() && resumeContent.trim()
              ? 'border border-text text-text hover:bg-text hover:text-bg cursor-pointer'
              : 'border border-border text-text-muted cursor-not-allowed'
          )}
        >
          保存简历
        </button>
      </div>
    </div>
  )
}
