# Micro-anecdotes — wave 2 scope

*Session 18, Aug 20 2026. The Session 17 brief listed "the cultural-anecdote
design pass" as parallel work still to do. It isn't: the design pass was done on
Aug 17 in Session 17 itself, and `mca-design-v1.md` answers all six open
questions. What follows is what is actually next.*

## The design still holds — verified, not assumed

`check-mca.py` is green against today's `grammar-module.jsx`, which matters more
than it sounds: every anecdote anchors to a **specific word in a specific step's
bank**, and Session 17 restaged the whole curriculum this week. Had the
restaging moved step names or reshuffled banks, all 33 anchors would have gone
stale silently.

They didn't — the restaging changed stage boundaries, not step contents, exactly
as `LEVELS` claims ("No step numbers moved"). **All 33 anchors resolve.** Word
counts 69–82 (cap 110), 126 claims, 21 items carrying `flags[]`, zero items
without a source.

## What the week's content did to the surface

| | wave 1 (Aug 17) | now |
|---|---|---|
| steps with a lesson bank | 25 | **46** |
| steps carrying an anecdote | 21 | 21 |
| steps with words and no anecdote | 4 | **25** |
| items | 33 | 33 |

Stages 9 and 10 added **16 uncovered steps** in four days — Steps 28–43, the
whole N3 argument layer. Headroom at the agreed density cap of 2 per step is
**73 further items**, against 33 written.

That reframes wave 2. It was scoped as a coverage top-up plus the known
countryside imbalance (8 of 33 lead rural). It is now mostly **new ground**, and
the new ground is a different kind of vocabulary: Steps 28–43 carry 事故, 保険証,
受付, 手続き, 責任 — administrative, workplace and institutional words. That is
squarely the "first-months visible, changes what you'd notice" test, and it is
also the tag family where wave 1 is thinnest (`admin` 10, `work` 3, `health` 2).

So wave 2 should lead with Steps 28–43 rather than backfilling Stage 1, and the
countryside imbalance is likelier to correct itself there than in the N5 steps —
rural administrative reality (one clinic, a bus twice a day, the ward office
that closes at five) is where city and countryside actually diverge.

## The blocking constraint is reviewer load, not authoring

Wave 1 is **33 items, 126 claims, batch J, entirely unreviewed**. Wave 2 at
similar density would roughly double that before a single claim has been
checked, on a reviewer who has just agreed to nine grading batches.

**Recommendation: do not author wave 2 until batch J comes back.** Not a
capacity argument — an accuracy one. The J review is the only instrument that
can tell you whether the accuracy rules (numbers carry a year; no claims about
what Japanese people think; "often" earns a source) actually produce checkable
prose, and writing 40 more items in the same voice before finding out doubles
whatever is wrong with the voice.

`mca-jugyou` (school cleaning) is the one Lloyd can check himself, and is worth
checking now as a cheap early read on the whole batch.

## The genuinely open item is rendering

Marked NOT DONE deliberately in wave 1, still not done: nothing renders. The
data file exists and validates; no module consumes it. Both agreed surfaces —
the grammar module's tap-to-expand word popup and the vocabulary module's word
card as a fifth block — need module edits, and per standing practice those ship
as whole-file deliverables.

That is a better use of a session than more anecdotes: it is verifiable by
looking at it, it does not add reviewer load, and it turns 33 finished items
from a JSON file into something a learner sees.
