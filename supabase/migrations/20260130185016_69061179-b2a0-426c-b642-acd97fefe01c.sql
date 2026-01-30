-- Create table to track edge function executions for rate limiting
CREATE TABLE public.function_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name TEXT NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  executed_by TEXT, -- 'cron' or user_id
  success BOOLEAN NOT NULL DEFAULT true,
  summary JSONB
);

-- Create index for fast lookups by function name
CREATE INDEX idx_function_executions_name_time ON public.function_executions (function_name, executed_at DESC);

-- Enable RLS
ALTER TABLE public.function_executions ENABLE ROW LEVEL SECURITY;

-- Only admins and the service role can manage execution records
CREATE POLICY "Admins can view execution logs"
ON public.function_executions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert execution logs"
ON public.function_executions
FOR INSERT
WITH CHECK (true);

-- Add comment explaining purpose
COMMENT ON TABLE public.function_executions IS 'Tracks edge function executions for rate limiting and audit purposes';