ALTER TABLE public.activity_log
  ADD CONSTRAINT activity_log_unique_daily UNIQUE (user_id, activity_date, activity_type);

ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

CREATE INDEX IF NOT EXISTS idx_flashcards_user_due ON public.flashcards(user_id, next_review);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_planner_user_start ON public.planner_events(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_chat_room_created ON public.chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_user_date ON public.activity_log(user_id, activity_date DESC);