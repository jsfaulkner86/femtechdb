CREATE OR REPLACE FUNCTION public.get_last_cron_update()
RETURNS timestamptz
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, cron
AS $$
  SELECT max(r.end_time)
  FROM cron.job_run_details r
  JOIN cron.job j ON j.jobid = r.jobid
  WHERE j.jobname IN ('update-companies-daily-7am-et','femtechdb-update-7am-est','femtechdb-update-7am-edt')
    AND r.status = 'succeeded';
$$;

REVOKE ALL ON FUNCTION public.get_last_cron_update() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_last_cron_update() TO anon, authenticated;