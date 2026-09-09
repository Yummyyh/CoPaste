function getVerdictStyle(v) {
  if (v.includes('值得投')) return { label: '值得投', bg: 'bg-green/10', text: 'text-green', border: 'border-green/20' }
  if (v.includes('谨慎投')) return { label: '谨慎投', bg: 'bg-yellow/10', text: 'text-yellow', border: 'border-yellow/20' }
  if (v.includes('不建议')) return { label: '不建议', bg: 'bg-red/10', text: 'text-red', border: 'border-red/20' }
  return { label: '投递建议', bg: 'bg-pill-pending/10', text: 'text-text-muted', border: 'border-pill-pending/20' }
}

export default function Step1Result({ data, onNext }) {

  const { jobTitle, company, what, hardReq = [], bonus = [], subtext = [], verdict = '' } = data
  const subtextList = Array.isArray(subtext) ? subtext : []

  const vs = getVerdictStyle(verdict)

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-sm text-accent font-medium tracking-wider">
        Step 1 · 岗位解读
      </div>

      {/* 卡片1：工作解读 */}
      <div className="bg-card border border-border rounded-card p-6 md:p-8 space-y-5 shadow-sm">
        {jobTitle && (
          <h2 className="font-heading text-2xl font-semibold text-text">
            {jobTitle}
            {company && (
              <span className="text-text-muted font-body text-base font-normal ml-2">
                @ {company}
              </span>
            )}
          </h2>
        )}

        <div>
          <h3 className="text-sm font-medium text-text-muted mb-2">实际工作内容</h3>
          <p className="text-text leading-relaxed">{what}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-text-muted mb-2">硬性门槛</h3>
          <div className="flex flex-wrap gap-2">
            {hardReq.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border border-border text-text-muted"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-text-muted mb-2">加分项</h3>
          <div className="flex flex-wrap gap-2">
            {bonus.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border border-border text-text-muted"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {subtextList.length > 0 && (
          <div className="bg-bg rounded-lg p-4 border-l-3 border-accent space-y-2">
            <h3 className="text-sm font-medium text-accent mb-2">潜台词</h3>
            {subtextList.map((item, index) => (
              <div key={index}>
                <span className="text-text text-sm">「{item.keyword}」</span>
                <span className="text-text-muted text-sm">{item.meaning}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 卡片2：投递建议 */}
      <div className={`${vs.bg} ${vs.border} border rounded-card p-6 md:p-8 shadow-sm`}>
        <div className="flex items-center gap-3 mb-3">
          <span className={`text-lg font-semibold font-heading ${vs.text}`}>
            {vs.label}
          </span>
          <span className={`text-sm px-2.5 py-0.5 rounded-full ${vs.bg} ${vs.text} border ${vs.border}`}>
            投递建议
          </span>
        </div>
        <p className="text-text leading-relaxed">{verdict}</p>
      </div>

      {/* 停顿卡片 + 按钮 */}
      <div className="border-2 border-dashed border-border rounded-card p-6 text-center space-y-4">
        <p className="text-text-muted text-sm">
          以上是基于JD的客观解读。接下来，看看你和这个岗位的匹配度。
        </p>
        <button
          onClick={onNext}
          className="px-8 py-3 rounded-btn bg-text text-bg font-medium hover:bg-text/90 transition-all cursor-pointer active:scale-[0.99]"
        >
          看胜算 →
        </button>
      </div>
    </div>
  )
}
