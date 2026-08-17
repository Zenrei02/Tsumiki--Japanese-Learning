# Lesson settings — the mapping

*Session 17. Which fact opens which lesson, after the 2-per-step cap. Design in
`lesson-setting-design-v1.md`. **This file is the queue** — four lessons are authored, the
rest are mapped and waiting.*

Source material: `micro-anecdotes-v1.json` (33 sourced facts) and `grammar-scenes-v1.json`
(26 authored situations). 59 items, 6 of which turned out to be **the same lesson from two
directions** — those are the merges, and they are the best evidence the merge was right.

## Status key

`✍` authored in `lesson-settings-v1.json` · `▢` mapped, not yet authored ·
`⇄` merge: a scene and an anecdote landing on one point

| Step | Point | Setting comes from | |
|---|---|---|---|
| 0 | `prim-drop` | sc-drop (tomatoes from the neighbour) | ▢ |
| 1 | `sb-yone` | sc-yone (station, August, one of you air-conditioned) | ▢ |
| 1 | `sb-negq` | sc-negq (pharmacist, allergies) | ▢ |
| 2 | `sb-waga` | sc-waga (staffroom, someone at the door) | ▢ |
| 3 | `shika` | ⇄ sc-shika + mca-ginkou — cash, 42.8% cashless 2024 | ✍ |
| 3 | `sb-counters` | sc-counters (bakery queue, no counter for bread) | ▢ |
| 4 | `teiru2` | ⇄ sc-teiru2 + mca-ie — 9.0m vacant homes, 誰も住んでいません | ▢ |
| 4 | `sb-transitive` | sc-transitive (window open, nobody near it) | ▢ |
| 5 | `sb-must` | sc-must (parents' evening, optional practice) | ▢ |
| 5 | `tewaikemasen` | mca-getsuyoubi (rubbish: municipal rules, Kamikatsu's 45) | ▢ |
| 6 | `masenka` | ⇄ sc-masenka + mca-natsu — the summer festival invitation | ▢ |
| 6 | `tsumori` | mca-natsuyasumi (Obon, 13–16 Aug, the two rushes) | ▢ |
| 7 | `toki` | sc-toki (the suitcase, bought in which country) | ▢ |
| 7 | `tekara` | mca-basu (整理券, board, ride, then pay) | ▢ |
| 8 | `arimasu` | mca-eki (4,776 unstaffed stations, 50.9% FY2022) | ▢ |
| 8 | `location` | mca-kouen (the park is also an evacuation site) | ▢ |
| 9 | `narimasu` | mca-samui (no central heating; insulation mandatory Apr 2025) | ▢ |
| 10 | `potential` | mca-mizu (tap water, 51 regulated substances) | ▢ |
| 10 | `sb-ganotwo` | sc-ganotwo (welcome dinner, what music do you like) | ▢ |
| 11 | `node` | mca-okureru (遅延証明書 at the gate) | ▢ |
| 12 | `tara` | mca-ame (梅雨, declared region by region) | ▢ |
| 12 | `sb-omou` | sc-omou (is the new place by the station expensive) | ▢ |
| 13 | `teikutekuru` | ⇄ sc-teikutekuru + mca-kusuri — お薬手帳, 持ってきてください | ✍ |
| 13 | `teshimau` | ⇄ sc-teshimau + mca-mise — シャッター通り, 閉まってしまいました | ▢ |
| 14 | `sb-kuremorau` | sc-kuremorau (the neighbour on the stairs) | ▢ |
| 14 | `teageru` | mca-omiyage (Edo pilgrimage, 餞別, the station box) | ▢ |
| 15 | `souda-denbun` | mca-tenki (桜前線; JMA forecast 1951–2010) | ▢ |
| 15 | `rashii` | sc-rashii (the bakery shut a week, three stories) | ▢ |
| 16 | `nara` | mca-denki (50/60 Hz, German and American generators) | ✍ |
| 16 | `sb-if4` | sc-if4 (the pond every winter; Kyoto at the weekend) | ▢ |
| 17 | `kotoninaru` | mca-namae (seals cut from 14,747 procedures to 83) | ▢ |
| 18 | `kotogadekiru` | mca-kanji (常用漢字 2,136, set 2010) | ▢ |
| 18 | `takotogaaru` | mca-sushi (Osaka, 1958, the brewery conveyor) | ▢ |
| 19 | `madeni` | mca-juusho (14 days to register, 住民票) | ▢ |
| 19 | `bakari` | sc-bakari (six weeks in, someone asks about your Japanese) | ▢ |
| 20 | `saserareru` | ⇄ sc-saserareru + mca-jugyou — 掃除の時間, and the caretakers | ✍ |
| 21 | `temo` | mca-atsui (クールビズ, 2005, 28°C) — **moved off obligation** | ▢ |
| 21 | `noni` | sc-noni (four hours cooking, three shop-bought on the table) | ▢ |
| 22 | `koto-no` | sc-kotono (your brother through the wall / what he's like) | ▢ |
| 23 | `sb-minds` | sc-minds (the boy at the window) | ▢ |
| 25 | `sb-uchisoto` | sc-uchisoto (the office phone, your own section head) | ▢ |
| 26 | `sb-keigo-map` | sc-keigomap (is she in, asked three times) | ▢ |

**42 lessons, 4 authored.** Every step at or under the cap.

## Parked — 11 items with nowhere good to land

Not dropped. The research stands and the JSON entries stay where they are; these simply
did not earn a lesson at the cap, and forcing them would have produced a lesson whose
reason for existing is that a fact needed a home.

| Item | Fact | Why parked | Where it could go |
|---|---|---|---|
| `mca-kuruma` | 車庫証明, Garage Act 1962; kei 38% | Step 5 full; it is the cleanest legal "must" in the set and lost to `sb-must` | swap with `sb-must` if Lloyd prefers a fact-led Step 5 |
| `mca-inu` | Rabies Act 1950, annual vaccination | obligation magnet | 〜ことになっています, if that point ever gets a lesson |
| `mca-isha` | Universal coverage 1961; 30% came later | Step 5 and Step 16 both full | `nakutemoii` — no referral needed |
| `mca-ocha` | Free water and おしぼり; Edo inns | Step 5 full | `nakutemoii` — you don't have to ask |
| `mca-tabako` | Indoor ban Apr 2020; street bans are municipal | Step 5 full | `tewaikemasen`, if the rubbish setting moves |
| `mca-shashin` | Shutter sound is a carrier agreement, **not a law** | Step 5 full | `naidekudasai`; too good to leave parked long |
| `mca-heya` | 京間 0.95×1.91 vs 江戸間 0.88×1.76 | Step 10 full | `hou` — a six-mat room in Osaka *is* bigger |
| `mca-mainichi` | ラジオ体操, 1928, copied from MetLife | `teiru2` went to the vacant houses | `teiru3` (Step 18, the third pass at habit) |
| `mca-kaeru` | The 5pm chime tests the disaster speakers | Step 7 full | `maeni` — home before dark |
| `mca-toukyou` | Addresses have no street names; 1962 Act | Step 7 full | `kata` — how to find a place |
| `sc-taritari` | (invented: Monday small talk) | weakest situation of three at Step 7 | keep for `taritari` when a real fact arrives |

Three of these — `mca-shashin`, `mca-heya`, `mca-isha` — are strong enough that the right
answer may be to raise the cap to 3 for a few steps rather than leave them out. That is a
judgement about lesson length, which needs a rendered lesson to make. Not made here.

## What the merges show

Six points were reached independently from both directions, and in every case the invented
situation and the researched fact were converging on the same lesson:

- `shika` — I invented a rural station at night with no cash. The anecdote had already
  established, with a METI figure, *why* that situation is real.
- `saserareru` — the scene invented 毎日そうじをさせられました. The anecdote was about
  掃除の時間 being in the national curriculum. Same lesson, written twice.
- `teikutekuru` — the scene used the weather. The anecdote had a pharmacist handing you a
  booklet and telling you to bring it back, which is a better 持ってくる than the weather
  ever was.

That is the argument for the merge, made by the material rather than by me.
