-- Trigger functions live in the `public` schema, which PostgREST exposes, so
-- both of the functions added by the previous migration were callable as RPC
-- endpoints by anonymous and signed-in users. Calling a trigger function
-- directly errors, but a SECURITY DEFINER function should never be reachable
-- from the API surface at all.

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
