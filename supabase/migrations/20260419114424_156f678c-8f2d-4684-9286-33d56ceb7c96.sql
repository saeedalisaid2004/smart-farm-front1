CREATE TABLE public.chatbot_session_titles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT chatbot_session_titles_external_user_session_key UNIQUE (external_user_id, session_id)
);

CREATE INDEX idx_chatbot_session_titles_external_user_id
ON public.chatbot_session_titles (external_user_id);

ALTER TABLE public.chatbot_session_titles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_chatbot_session_titles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_chatbot_session_titles_updated_at
BEFORE UPDATE ON public.chatbot_session_titles
FOR EACH ROW
EXECUTE FUNCTION public.update_chatbot_session_titles_updated_at();