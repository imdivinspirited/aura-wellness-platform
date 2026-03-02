-- Sample data for local/testing. Run after schema.sql

insert into users (id, session_id, last_active, preferences)
values
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'session-sample-001', now() - interval '2 hours', '{"theme":"light","fontSize":"M","defaultMode":"platform"}'::jsonb)
on conflict (session_id) do nothing;

insert into conversations (id, user_id, started_at, mode, message_count, language_detected, title)
select gen_random_uuid(), id, now() - interval '1 day', 'platform', 4, 'en', 'Course schedule'
from users where session_id = 'session-sample-001' limit 1;
insert into conversations (id, user_id, started_at, mode, message_count, language_detected, title)
select gen_random_uuid(), id, now() - interval '3 hours', 'global', 2, 'hi', 'Meditation benefits'
from users where session_id = 'session-sample-001' limit 1;
