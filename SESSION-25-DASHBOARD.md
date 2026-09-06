# The rename's dashboard half — not reachable from this repo

The Netlify site is **`tsumiki-jp.netlify.app`** (renamed Sep 6 2026). Three
settings live in dashboards and no repo edit, migration or push touches them.
Two of them fail *silently*, which is why they are written down rather than
left to be noticed.

Do these **before** the next push. Production currently serves the pre-rename
build, so nothing here is user-visible yet — that changes the moment the build
goes out.

---

## 1. ⚠️ Supabase → Authentication → URL Configuration

| Field | Set to |
| --- | --- |
| Site URL | `https://tsumiki-jp.netlify.app` |
| Redirect URLs | add `https://tsumiki-jp.netlify.app/**` |

Leave `http://localhost:3000` in the redirect list for local work.

**Why it cannot be skipped, and why nothing will tell you:** an origin that is
not on the list does not error. The magic link falls back to the project's Site
URL, which from the learner's side is indistinguishable from "the email never
arrived" and from the app's side is invisible, because they never reach the app.
This cost Session 23 a day.

**It is worse than it was then.** The Site URL is still
`https://naoshi.netlify.app`, and that subdomain no longer resolves — the
rename released it. So the fallback now lands on a dead host rather than the
wrong live one. Fix the Site URL, not only the redirect list.

## 2. ⚠️ Supabase → Edge Functions → Secrets — `ALLOWED_ORIGIN`

`HANDOVER-from-claude-code.md` records the deployed function answering
`access-control-allow-origin: https://naoshi.netlify.app`, so this **is**
pinned to the old host. The checker on `tsumiki-jp.netlify.app` is therefore
CORS-blocked right now, in the build that is live.

Set `TSUMIKI_ALLOWED_ORIGIN` (the function reads the new name first and falls
back to `NAOSHI_*`, so either works) to:

```
https://tsumiki-jp.netlify.app
```

Then check it, because a browser reports this as a network error and the
function's own logs will show nothing wrong:

```
curl -i -X OPTIONS https://llkazgmhsuonhwrubwjw.supabase.co/functions/v1/check \
  -H "Origin: https://tsumiki-jp.netlify.app" \
  -H "Access-Control-Request-Method: POST" | grep -i access-control-allow-origin
```

The header must echo the new origin. If it echoes the old one, the secret did
not take.

While you are on that page, the other `NAOSHI_*` secrets — `MODEL`,
`DAILY_CAP`, `MAX_CHARS`, `CAP_SALT` — can be renamed to `TSUMIKI_*` whenever
convenient. **Copy `CAP_SALT`'s value across rather than generating a new one**:
a changed salt silently resets every daily-cap counter, and the fallback exists
so this is never urgent.

## 3. The Edge Function has not been redeployed

It still calls `rpc/naoshi_reserve_check`. The migration left those names as
wrappers over the renamed functions, so it keeps working — but the wrappers
should be dropped once `supabase functions deploy check` has gone out and been
verified.

---

## Also worth knowing

`naoshi.netlify.app` is released and can be claimed by anyone. Nothing depends
on it once §1 and §2 are done, but any old link — including anything already
sent to Keiko — now points at a host outside your control.

## Order

1. Supabase URL Configuration (§1)
2. `ALLOWED_ORIGIN` secret, and verify the header (§2)
3. Push — one Netlify build for the whole rename
4. `supabase functions deploy check`, verify, then drop the wrappers (§3)
5. Open the site and actually sign in. Nothing this session or last has been
   seen in a real browser.
