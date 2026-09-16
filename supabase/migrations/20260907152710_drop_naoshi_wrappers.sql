-- Session 25 close-out: remove the compatibility wrappers.
--
-- 20260906140000 renamed fifteen objects and deliberately left
-- naoshi_reserve_check and naoshi_release_check behind as thin wrappers over
-- the renamed functions, because the Edge Function deployed at that moment
-- still called the old names over REST. Renaming out from under it would have
-- turned every check into `upstream-error` — which reaches the learner as
-- "The checker could not be reached just now", polite and indistinguishable
-- from a blip.
--
-- That gap is closed. The function was redeployed on 2026-09-07 (version 8,
-- all four files SHA-256 identical to the repo) and a real check was put
-- through it: tsumiki_check_usage gained a row for 2026-09-07 via
-- tsumiki_reserve_check, and the reservation was not released, so the upstream
-- call genuinely happened.
--
-- Verified by traffic, not by reading the code. The wrappers have no callers.

begin;

drop function if exists public.naoshi_reserve_check(text, date);
drop function if exists public.naoshi_release_check(text, date);

commit;
