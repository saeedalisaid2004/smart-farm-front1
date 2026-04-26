-- 1. Drop old admin-management policies on user_roles
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- 2. New policies: only super_admin can insert/delete roles
CREATE POLICY "Super admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- 3. Both admins and super_admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'super_admin')
);

-- 4. Update promote_to_admin to require super_admin and accept target role
CREATE OR REPLACE FUNCTION public.promote_to_admin(_email text, _target_role app_role DEFAULT 'admin')
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  _user_id UUID;
  _user_name TEXT;
BEGIN
  -- Only super_admin can promote
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RETURN json_build_object('success', false, 'message', 'Only super admins can promote users');
  END IF;

  -- Only allow admin or super_admin as target
  IF _target_role NOT IN ('admin', 'super_admin') THEN
    RETURN json_build_object('success', false, 'message', 'Invalid target role');
  END IF;

  -- Find user by email
  SELECT id, raw_user_meta_data->>'full_name'
  INTO _user_id, _user_name
  FROM auth.users
  WHERE email = _email;

  IF _user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not found');
  END IF;

  -- Check if already has this role
  IF public.has_role(_user_id, _target_role) THEN
    RETURN json_build_object('success', false, 'message', 'User already has this role');
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, _target_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN json_build_object(
    'success', true,
    'message', 'User promoted successfully',
    'user_name', COALESCE(_user_name, _email),
    'role', _target_role
  );
END;
$function$;