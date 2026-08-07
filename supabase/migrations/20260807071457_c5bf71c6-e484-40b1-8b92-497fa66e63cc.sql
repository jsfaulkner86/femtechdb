CREATE TABLE public.cron_invocation_tokens (
  token uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '5 minutes'),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.cron_invocation_tokens TO service_role;

ALTER TABLE public.cron_invocation_tokens ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.consume_cron_invocation_token(_token uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  token_was_valid boolean;
BEGIN
  DELETE FROM public.cron_invocation_tokens
  WHERE token = _token
    AND expires_at >= now();

  GET DIAGNOSTICS token_was_valid = ROW_COUNT;

  DELETE FROM public.cron_invocation_tokens
  WHERE expires_at < now();

  RETURN token_was_valid;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_cron_invocation_token(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_cron_invocation_token(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.get_last_cron_update()
RETURNS timestamp with time zone
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT max(executed_at)
  FROM public.function_executions
  WHERE function_name = 'update-companies'
    AND success = true;
$$;

REVOKE ALL ON FUNCTION public.get_last_cron_update() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_last_cron_update() TO anon, authenticated;