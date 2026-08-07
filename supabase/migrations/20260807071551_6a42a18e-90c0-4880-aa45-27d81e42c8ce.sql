SELECT cron.unschedule('femtechdb-update-7am-edt');
SELECT cron.unschedule('femtechdb-update-7am-est');
SELECT cron.unschedule('update-companies-daily-7am-et');

SELECT cron.schedule(
  'femtechdb-update-7am-edt',
  '0 11 * * *',
  $command$
    WITH invocation AS (
      INSERT INTO public.cron_invocation_tokens DEFAULT VALUES
      RETURNING token
    )
    SELECT net.http_post(
      url := 'https://hkmmytwlgdxlhadlskiv.supabase.co/functions/v1/update-companies',
      headers := '{"Content-Type":"application/json"}'::jsonb,
      body := jsonb_build_object('timezone_check', 'EDT', 'cron_token', invocation.token)
    )
    FROM invocation;
  $command$
);

SELECT cron.schedule(
  'femtechdb-update-7am-est',
  '0 12 * * *',
  $command$
    WITH invocation AS (
      INSERT INTO public.cron_invocation_tokens DEFAULT VALUES
      RETURNING token
    )
    SELECT net.http_post(
      url := 'https://hkmmytwlgdxlhadlskiv.supabase.co/functions/v1/update-companies',
      headers := '{"Content-Type":"application/json"}'::jsonb,
      body := jsonb_build_object('timezone_check', 'EST', 'cron_token', invocation.token)
    )
    FROM invocation;
  $command$
);