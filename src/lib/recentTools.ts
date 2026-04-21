const KEY = 'lyceeai_recent_tools';
export interface RecentTool { key: string; name: string; path: string; icon: string; }

export const getRecentTools = (): RecentTool[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
};

export const pushRecentTool = (t: RecentTool) => {
  const list = getRecentTools().filter(x => x.key !== t.key);
  list.unshift(t);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 3)));
};
