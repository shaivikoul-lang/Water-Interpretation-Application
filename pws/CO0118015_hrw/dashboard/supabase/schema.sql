create table if not exists public.waterlens_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  page text,
  flow text,
  question_answered text,
  ease_rating integer,
  next_step text,
  comment text,
  constraint waterlens_feedback_answered_check
    check (question_answered in ('Yes', 'Partly', 'No')),
  constraint waterlens_feedback_ease_check
    check (ease_rating is null or (ease_rating >= 1 and ease_rating <= 5)),
  constraint waterlens_feedback_next_check
    check (
      next_step is null
      or next_step in ('Yes', 'Somewhat', 'No', 'No action needed')
    ),
  constraint waterlens_feedback_comment_check
    check (comment is null or char_length(comment) <= 1000)
);

alter table public.waterlens_feedback enable row level security;

create policy "anon_insert_waterlens_feedback"
  on public.waterlens_feedback
  for insert
  to anon
  with check (true);
