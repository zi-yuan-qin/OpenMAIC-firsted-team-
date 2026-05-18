import type { SettingsPreset } from './education';

export const DEMO_PRESET: Readonly<SettingsPreset> = Object.freeze({
  name: 'Demo',
  description: 'TTS/ASR off, sidebar expanded — ideal for screen sharing',
  settings: {
    ttsMuted: true,
    ttsEnabled: false,
    asrEnabled: false,
    sidebarCollapsed: false,
    chatAreaCollapsed: true,
    agentMode: 'preset' as const,
    autoAgentCount: 3,
  },
});
