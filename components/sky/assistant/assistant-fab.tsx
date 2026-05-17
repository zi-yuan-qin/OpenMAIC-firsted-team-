'use client';

import { useState } from 'react';

export function AssistantFab() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#4A90D9] text-2xl text-white shadow-lg transition-transform hover:scale-110"
      >
        💡
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 rounded-xl border border-gray-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-gray-200 p-3">
        <span className="font-semibold text-gray-900">AI 助手</span>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
      </div>
      <div className="flex h-72 items-center justify-center text-gray-400">助手面板（待实现）</div>
    </div>
  );
}
