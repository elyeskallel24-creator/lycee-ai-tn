import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/** Logs one activity row per user/day/type (deduped). Call on tool page mount. */
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
  }, [user, activityType]);
};
