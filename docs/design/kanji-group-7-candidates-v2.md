# Kanji Group 7 — candidates, re-scored on a repaired ledger

*Session 18, Aug 20 2026. The ledger turn came first, as the tracker row says it
always should. It turned up a broken parser before it turned up a candidate
list, so that comes first here too.*

## 1. The ledger was reading two thirds of itself

`build-word-ledger.py` locates lesson vocabulary with a regex that required
`cat:` and `bank:` to be adjacent lines. **Session 17's restaging inserted
`level:` between them.** From that commit onward the bank store matched nothing:

| run | total words | from lesson banks |
|-----|-------------|-------------------|
| Aug 15 | 351 | 95 |
| Aug 20, before the fix | 336 | **0** |
| Aug 20, after the fix | **471** | **265** |

The failure was silent, and worse than silent — the report's last section prints
the kanji words that have no recorded reading, and with the bank store empty it
printed **"None — every kanji word has a reading somewhere."** A parser reading
nothing and a codebase with nothing to report produce the identical sentence.
That is the "suspect a green result that arrives too easily" rule, live.

**Fixed two ways.** The bank store is now located structurally (find each `cat:`,
scan forward to its `bank:`, take balanced brackets) so field order can change
freely. And each of the three stores now takes a **census**: the number of blocks
the parser consumed must equal the number the file contains, or the script dies
instead of writing. A store that quietly reads nothing can no longer look like a
store with nothing to say.

The real gap the repaired run reports: **118 kanji-containing bank words carry no
reading anywhere** (事 is the commonest character among them, in 6 of the 118).
Those render as "not in dictionary" in the display
path. That is a KANJI_DICT scope job, not a Group 7 job, but it is now visible.

## 2. What that does to the Group 7 list

The tracker's stored demand list — 社館✓議猫緒図✓動魚駅頭面静降銀野遅 — predates the
Stage 9 and Stage 10 vocabulary that landed this week. Re-scored:

| char | demand | verdict |
|------|--------|---------|
| 館, 図 | — | **already taught** (the ✓s were right) |
| 議 | 9 | still the top of the whole list |
| 社 | 7 | still strong — 会社・社長・社会 |
| 野 | 4 | holds |
| 猫, 緒, 動, 面, 遅 | 3 | now mid-table |
| 魚, 駅, 頭, 静, 降, 銀 | 2 | now below a dozen newcomers |

**動 answered.** The tracker's "(metalang?)" was the right suspicion: 動 appears in
**zero** lesson banks. Its entire demand is 動詞 / 自動詞 / 他動詞 — the app's own
grammatical metalanguage, not anything a learner is being asked to read. It
should be scheduled as metalanguage or not at all, and either way not on word
demand.

Demand = how many places the app already puts that word in front of a learner
(one per lesson bank, plus KANJI_DICT and `w:` arrays). 議 scoring 9 off a single
word means 会議 sits in nine lesson banks with no way to read it.

## 3. The list now

`freq` is the Mainichi rank from KANJIDIC2; `steps` is how many distinct lesson
banks the character appears in.

| char | demand | freq | strokes | steps | words |
|------|--------|------|---------|-------|-------|
| 議 | 9 | 25 | 20 | 8 | 会議 |
| 事 | 8 | 18 | 8 | 7 | 仕事 用事 事故 事実 工事 記事 |
| 社 | 7 | 21 | 7 | 4 | 会社 社会 社長 |
| 合 | 6 | 41 | 6 | 4 | 場合 都合 試合 合 |
| 場 | 6 | 52 | 12 | 5 | 場合 場所 立場 |
| 最 | 6 | 82 | 12 | 5 | 最初 最後 最近 最低 |
| 予 | 6 | 180 | 4 | 5 | 予定 予約 予想 天気予報 |
| 字 | 6 | 485 | 6 | 3 | 漢字 字 |
| 理 | 5 | 86 | 11 | 3 | 料理 理由 |
| 説 | 5 | 326 | 14 | 4 | 説明 |
| 落 | 5 | 420 | 12 | 3 | 落ちる 落とす 段落 |
| 窓 | 5 | 1186 | 11 | 4 | 窓 窓口 |
| 後 | 4 | 26 | 9 | 3 | 最後 後悔 |
| 者 | 4 | 38 | 8 | 3 | 医者 若者 初心者 |
| 京 | 4 | 74 | 8 | 2 | 東京 京都 |
| 野 | 4 | 120 | 11 | 3 | 野菜 |
| 結 | 4 | 162 | 12 | 3 | 結果 結婚 |
| 由 | 4 | 325 | 5 | 3 | 理由 |

## 4. The constraint that decides the shape — and it isn't demand

Component policy is *nothing appears before its own components do*. Checking
depth-1 parts against the 128 taught characters:

**Clean or nearly clean**

- **合** — 人・一・口, every part already taught. The cheapest strong character here.
- **事, 業, 者, 京, 予, 由** — atomic or effectively so at depth 1.
- **社** — 土 taught, needs 礻 named. One new part, and 社 leads, as the row asks.
- **字** — 子 taught, needs 宀.
- **議, 説** — 言 taught, but 義 and 兌 are heavy new parts for one character each.

**Blocked on the 57-shape policy pass**

**落, 漢, 菜** all need 氵 or 艹, and **neither radical is a named part yet** —
they sit in the 57 unclassified shapes awaiting that ruling. 洗 has been taught
since Group 5 and its 氵 is still unnamed. Authoring these three now would mean
either teaching a component the module has no policy for, or breaking the
component rule in the group that most visibly depends on it.

**So the 57-shape pass is a prerequisite for part of Group 7, not a parallel
task.** That is new information; the two were listed as independent.

## 5. Proposed shape — for your ruling, not built

Prior groups run four kanji lessons of 4–5 characters, one skill builder, one
culture connection, one checkpoint. Group 7 has an obvious spine: **work,
appointments and the places they happen**, which is what the top of the demand
table is describing all by itself.

- **k-t26 · Work, and the company you keep** — 社 事 業 者
  社 leads. 者 does double duty: teaching it retro-names the part already sitting
  inside 暑, which is the exact move sb-saku made with 作/昨.
- **k-t27 · Where and when it happens** — 場 京 予 合
  場所・立場・場合・都合・東京・京都・予定・予約. 合's parts are all taught; 予 is
  atomic and unblocks 野 (里+予) for a later group.
- **k-t28 · Saying why** — 議 説 理 由
  会議・説明・理由. The heaviest lesson: three new components (義, 兌, 王/里).
  Worth it only because 議 is the single highest-demand character in the app.
- **k-t29 · Before and after** — 最 後 結 字
  最初・最後・最近・結果・結婚・漢字.
- **skill builder** — 者 as a component, or 礻 vs 衤 (the altar radical against
  the cloth one) if 社 is to be safe against 神/初 later.
- **checkpoint · cp-work**

That is 16 characters, in line with Group 6's 17.

**Three things I did not do, on purpose.** No module edits — applying an order to
lessons is an authoring decision, and this is a pipeline output. No stories: the
etymology claims are the highest-risk content in the module and already carry a
reviewer flag, so they get written once the character list is settled rather than
twice. And no stroke data pulled yet — `@madcat/kanjivg` is one npm fetch away
when the list is final.

**What I need from you:** confirm the 16, and say whether the 57-shape policy
pass goes first (which would let 落・漢・菜 in and probably reshuffle k-t29) or
whether Group 7 ships around the blockage and those three wait for Group 8.
