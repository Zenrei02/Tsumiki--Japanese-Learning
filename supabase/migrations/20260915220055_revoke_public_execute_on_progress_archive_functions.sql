-- Revoke public EXECUTE on the two progress-archive trigger functions.
--
-- WHY THIS EXISTS AGAIN. 20260906000100 already did exactly this, for
-- naoshi_progress_archive_prev(). The advisors flagged BOTH functions on
-- 2026-09-15, right after the retention migration landed, so that revoke did
-- not survive the rename: prev() was publicly executable again, alongside the
-- newly added prune(). The lesson is the one this project keeps relearning —
-- a privilege is not carried across a rename, and an advisor is the only thing
-- that notices.
--
-- Neither function is meant to be called by anyone. They are trigger bodies.
-- Firing a trigger does not check EXECUTE on its function, so revoking here
-- closes the /rest/v1/rpc/ surface without touching the archive behaviour —
-- but per 20260906000100, the trigger must still be EXERCISED afterwards,
-- because advisors answer "can the wrong role reach this" and never "does the
-- right thing still happen". NOT YET EXERCISED as of writing: that needs a
-- signed-in save, which had not happened.
--
-- Applied to the live project 2026-09-15 as migration 20260915220055; security
-- advisors re-read immediately afterwards and both 0028 and 0029 were clear.

revoke execute on function public.tsumiki_progress_archive_prev()  from public, anon, authenticated;
revoke execute on function public.tsumiki_progress_archive_prune() from public, anon, authenticated;
