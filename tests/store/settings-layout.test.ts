/**
 * tests/store/settings-layout.test.ts
 * 测试 UI 布局相关的设置 — 侧边栏、聊天区域的折叠/展开和宽度
 *
 * 涉及的 store：useSettingsStore
 * 状态字段：sidebarCollapsed, chatAreaCollapsed, chatAreaWidth
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupStoreMocks, clearStorage, getStore } from './mocks';

setupStoreMocks();

describe('settings-layout — 布局设置', () => {
  beforeEach(async () => {
    vi.resetModules();
    clearStorage();
  });

  // ================================================================
  // setSidebarCollapsed — 侧边栏折叠
  // ================================================================
  describe('setSidebarCollapsed', () => {
    it('折叠侧边栏', async () => {
      const store = await getStore();
      store.getState().setSidebarCollapsed(true);
      expect(store.getState().sidebarCollapsed).toBe(true);
    });

    it('展开侧边栏', async () => {
      const store = await getStore();
      store.getState().setSidebarCollapsed(true); // 先折叠
      store.getState().setSidebarCollapsed(false); // 再展开
      expect(store.getState().sidebarCollapsed).toBe(false);
    });
  });

  // ================================================================
  // setChatAreaCollapsed — 聊天区域折叠
  // ================================================================
  describe('setChatAreaCollapsed', () => {
    it('折叠聊天区域时，不影响侧边栏状态', async () => {
      const store = await getStore();
      store.getState().setChatAreaCollapsed(true);

      expect(store.getState().chatAreaCollapsed).toBe(true);
      // sidebar 保持初始值
      expect(store.getState().sidebarCollapsed).toBeDefined();
    });

    it('展开聊天区域后侧边栏状态不变', async () => {
      const store = await getStore();
      store.getState().setSidebarCollapsed(false);
      store.getState().setChatAreaCollapsed(false);

      expect(store.getState().chatAreaCollapsed).toBe(false);
      expect(store.getState().sidebarCollapsed).toBe(false);
    });
  });

  // ================================================================
  // setChatAreaWidth — 聊天区域宽度
  // ================================================================
  describe('setChatAreaWidth', () => {
    it('设置聊天区域宽度', async () => {
      const store = await getStore();
      store.getState().setChatAreaWidth(400);
      expect(store.getState().chatAreaWidth).toBe(400);
    });

    it('设置为极小宽度', async () => {
      const store = await getStore();
      store.getState().setChatAreaWidth(100);
      expect(store.getState().chatAreaWidth).toBe(100);
    });
  });

  // ================================================================
  // 连续操作测试 — 确保多次切换状态正确
  // ================================================================
  describe('连续切换', () => {
    it('sidebar 折叠 → 展开 → 再折叠 → 宽度不变', async () => {
      const store = await getStore();
      store.getState().setChatAreaWidth(350);

      store.getState().setSidebarCollapsed(true);
      store.getState().setSidebarCollapsed(false);
      store.getState().setSidebarCollapsed(true);

      expect(store.getState().sidebarCollapsed).toBe(true);
      expect(store.getState().chatAreaWidth).toBe(350);
    });

    it('chat area 折叠 → 展开 → 再折叠 → 宽度不变', async () => {
      const store = await getStore();
      store.getState().setChatAreaWidth(280);

      store.getState().setChatAreaCollapsed(true);
      store.getState().setChatAreaCollapsed(false);
      store.getState().setChatAreaCollapsed(true);

      expect(store.getState().chatAreaCollapsed).toBe(true);
      expect(store.getState().chatAreaWidth).toBe(280);
    });
  });
});
