#!/usr/bin/env bash
# Removes the eight old-numbered migration files, now superseded by copies named
# with the versions actually recorded in supabase_migrations.schema_migrations.
# Contents are byte-identical — only the filenames change.
set -euo pipefail
cd "$HOME/Projects/Naoshi - Japanese Learning/supabase/migrations"

git rm -- \
  20260814190000_check_usage_grant_service_role.sql \
  20260825000000_keepalive.sql \
  20260825000100_keepalive_grant_select.sql \
  20260906000000_progress_sync.sql \
  20260906000100_revoke_public_execute_on_progress_trigger.sql \
  20260906140000_rename_naoshi_to_tsumiki.sql \
  20260907153000_drop_naoshi_wrappers.sql \
  20260916000000_progress_archive_retention.sql

git add -- \
  20260814185956_check_usage_grant_service_role.sql \
  20260829160356_keepalive.sql \
  20260829160546_keepalive_grant_select.sql \
  20260905175155_progress_sync.sql \
  20260905175443_revoke_public_execute_on_progress_trigger.sql \
  20260906142411_rename_naoshi_to_tsumiki.sql \
  20260907152710_drop_naoshi_wrappers.sql \
  20260915220005_progress_archive_retention.sql \
  20260915220055_revoke_public_execute_on_progress_archive_functions.sql

echo
echo "Staged. Expect eight renames (R100) plus one new file. Check with:"
echo "  git status --short"
echo "  supabase migration list      # local and remote columns should now match"
