-- Explicit deny UPDATE policy on user_roles to document and enforce no-update intent
CREATE POLICY "No one can update user_roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);