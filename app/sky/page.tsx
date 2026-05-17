import { SkyAppShell } from '@/components/sky/layout/app-shell';

export default function SkyHomePage() {
  return (
    <SkyAppShell>
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold text-gray-900">早上好，同学！ ☀️</h2>
        <p className="mt-4 text-sm text-gray-500">首页仪表盘（待实现）</p>
      </div>
    </SkyAppShell>
  );
}
