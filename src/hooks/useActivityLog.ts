import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { TOOLS } from '@/lib/constants';
import { pushRecentTool } from '@/lib/recentTools';

/** Logs one activity row per user/day/type (deduped) and tracks recent tool visits. */
export const useActivityLog = (activityType: string) => {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    supabase
      .from('activity_log')
      .upsert(
        { user_id: user.id, activity_type: activityType, activity_date: new Date().toISOString().slice(0, 10) },
        { onConflict: 'user_id,activity_date,activity_type', ignoreDuplicates: true }
      )
      .then(() => {});

    const tool = TOOLS.find(t => t.key === activityType);
    if (tool) pushRecentTool({ key: tool.key, name: tool.name, path: tool.path, icon: tool.icon });
  }, [user, activityType]);
};
