CREATE POLICY "Clients cannot read chatbot session titles directly"
ON public.chatbot_session_titles
FOR SELECT
TO authenticated
USING (false);

CREATE POLICY "Clients cannot create chatbot session titles directly"
ON public.chatbot_session_titles
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Clients cannot edit chatbot session titles directly"
ON public.chatbot_session_titles
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "Clients cannot delete chatbot session titles directly"
ON public.chatbot_session_titles
FOR DELETE
TO authenticated
USING (false);