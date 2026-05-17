export function StatCards() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-lg bg-white p-4 shadow-sm"><div className="text-2xl font-bold text-[#4A90D9]">0</div><div className="text-sm text-gray-500">今日搜题</div></div>
      <div className="rounded-lg bg-white p-4 shadow-sm"><div className="text-2xl font-bold text-[#F59E0B]">0</div><div className="text-sm text-gray-500">错题待复习</div></div>
      <div className="rounded-lg bg-white p-4 shadow-sm"><div className="text-2xl font-bold text-[#10B981]">0%</div><div className="text-sm text-gray-500">知识掌握</div></div>
    </div>
  );
}

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {['📷 拍照搜题', '🎤 语音搜题', '📝 文字输入', '📖 生成幻灯片'].map((label) => (
        <div key={label} className="rounded-lg bg-white p-4 shadow-sm text-center text-gray-400">{label}（待实现）</div>
      ))}
    </div>
  );
}

export function ActivityTimeline() {
  return <div className="rounded-lg bg-white p-4 shadow-sm text-gray-400">最近活动（待实现）</div>;
}
