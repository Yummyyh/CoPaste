export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg/90 backdrop-blur-sm animate-fade-in">
      {/* Spinner */}
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-3 border-border" />
        <div className="absolute inset-0 rounded-full border-3 border-accent border-t-transparent animate-spin" />
      </div>
      <p className="text-text-muted text-base animate-pulse-amber tracking-wide">
        正在读懂这个岗位的潜台词…
      </p>
      <p className="text-text-muted/50 text-sm mt-2">这大约需要3秒</p>
    </div>
  )
}
