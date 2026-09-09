import { cn } from '../lib/utils'

function ProgressBar({ score, label, note }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-medium text-text">{label}</span>
        <span className="text-sm text-text-muted">{score}%</span>
      </div>
      <div className="h-2 rounded-full bg-bg overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            score >= 80 ? 'bg-green' : score >= 60 ? 'bg-accent' : 'bg-red'
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-xs text-text-muted">{note}</p>
    </div>
  )
}

export default function Step2Result({ data, onNext }) {
  const { overallScore, items, gapAnalysis, advantages } = data

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-sm text-accent font-medium tracking-wider">
        Step 2 · 匹配诊断
      </div>

      {/* 总分概览 */}
      <div className="bg-card border border-border rounded-card p-6 md:p-8 shadow-sm text-center">
        <p className="text-text-muted text-sm mb-2">综合匹配度</p>
        <div className="relative inline-flex items-center justify-center w-28 h-28">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#E8E2D6" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="#C8863A"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${overallScore * 2.64} 264`}
            />
          </svg>
          <span className="font-heading text-3xl font-bold text-text">{overallScore}%</span>
        </div>
        <p className="text-text-muted text-sm mt-2">
          {overallScore >= 80 ? '匹配度较高，可以放心投递' : '有一定匹配基础，值得准备后尝试'}
        </p>
      </div>

      {/* 逐条匹配 */}
      <div className="bg-card border border-border rounded-card p-6 md:p-8 shadow-sm space-y-5">
        <h3 className="font-heading text-lg font-semibold text-text">逐项分析</h3>
        {items.map((item) => (
          <ProgressBar key={item.label} {...item} />
        ))}
      </div>

      {/* Gap 分析 */}
      <div className="bg-card border border-border rounded-card p-6 md:p-8 shadow-sm">
        <h3 className="font-heading text-lg font-semibold text-text mb-3">差距分析</h3>
        <p className="text-text leading-relaxed">{gapAnalysis}</p>
      </div>

      {/* 你的优势 */}
      <div className="bg-accent/5 border border-accent/15 rounded-card p-6 md:p-8 shadow-sm">
        <h3 className="font-heading text-lg font-semibold text-text mb-3">你的优势</h3>
        <ul className="space-y-2.5">
          {advantages.map((adv, i) => (
            <li key={i} className="flex items-start gap-2.5 text-text text-sm leading-relaxed">
              <span className="text-accent mt-0.5 flex-shrink-0">✦</span>
              {adv}
            </li>
          ))}
        </ul>
      </div>

      {/* 停顿卡片 */}
      <div className="border-2 border-dashed border-border rounded-card p-6 text-center space-y-4">
        <p className="text-text-muted text-sm">
          知己知彼之后，是行动的时刻。准备好让简历和话术为你加分了吗？
        </p>
        <button
          onClick={onNext}
          className="px-8 py-3 rounded-btn bg-text text-bg font-medium hover:bg-text/90 transition-all cursor-pointer active:scale-[0.99]"
        >
          拿材料 →
        </button>
      </div>
    </div>
  )
}
