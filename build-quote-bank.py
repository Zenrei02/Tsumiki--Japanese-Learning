#!/usr/bin/env python3
"""
build-quote-bank.py — authored quote bank for the login card.

CONVENTION NOTE: this is AUTHORED content, like earned-lines-v1.json, not
derived data. The script exists to validate structure and to cross-check
glosses against word-ledger-v1.json so the quote card and the vocabulary
module never disagree about what a word means. Re-run after editing DATA.

── The stance (Lloyd, Session 21) ──────────────────────────────────────────
The card does NOT tell the learner what a proverb means. It offers ONE
possible reading and asks them to check the Japanese themselves. This is why
there is no `meaning` field anywhere in the output — the field is called
`one_reading`, and it is always paired with `invite`, the question handing
judgment back to the learner.

Consequence, stated plainly: this removes the reviewer from INTERPRETATION.
It does not remove them from FACT. Readings and glosses are still assertions —
a wrong reading teaches a wrong reading — but those are *sourced* from a
dictionary rather than *authored*, which is a verification problem a script can
help with and a human does not have to sit through. Attribution and biography
remain factual claims and stay out of v1 entirely.

Output: quote-bank-v1.json
"""

import json, sys, unicodedata
from pathlib import Path
from datetime import date

HERE = Path(__file__).parent
LEDGER = HERE / "word-ledger-v1.json"
OUT = HERE / "quote-bank-v1.json"

# ---------------------------------------------------------------------------
# DATA
# Each entry: (id, theme, tokens, literal, one_reading, invite)
#   tokens: list of (surface, reading|None, gloss|None)
#     reading None  -> kana already, no furigana needed
#     gloss   None  -> grammatical particle/ending; the UI shows `note` instead
# `literal` is a word-order-preserving crib, NOT idiomatic English. It is the
# scaffold the learner builds their own reading on top of.
# ---------------------------------------------------------------------------

P = None  # particle / grammatical — no dictionary gloss

DATA = [
    ("q01", "persistence",
     [("七","なな","seven"),("転","ころ","fall, tumble"),("び",None,P),("八","や","eight"),("起","お","rise, get up"),("き",None,P)],
     "seven fall, eight rise",
     "The counts don't match — and that may be the point. If the eighth rise is real, one of them came before any fall.",
     "Count them yourself. Why eight and not seven?"),

    ("q02", "persistence",
     [("石","いし","stone"),("の",None,P),("上","うえ","top, above"),("に",None,P),("も",None,P),("三年","さんねん","three years")],
     "on top of a stone, even — three years",
     "There is no verb here at all. Something about sitting, or enduring, is left for you to supply.",
     "What verb would you put at the end?"),

    ("q03", "beginning",
     [("千里","せんり","a thousand ri (~3,900 km)"),("の",None,P),("道","みち","road, way"),("も",None,P),("一歩","いっぽ","one step"),("から",None,P)],
     "a thousand-ri road, too, from one step",
     "も is doing quiet work: even THIS road. The scale is the argument.",
     "Would it land differently as 千里の道は? What does も add?"),

    ("q04", "accumulation",
     [("塵","ちり","dust, specks"),("も",None,P),("積","つ","pile up, accumulate"),("もれば",None,P),("山","やま","mountain"),("となる",None,P)],
     "dust, too, if it piles — becomes a mountain",
     "積もれば is conditional: IF it piles. The proverb doesn't promise the mountain, it states a condition.",
     "Is this encouragement or a warning? Both readings are available."),

    ("q05", "persistence",
     [("継続","けいぞく","continuation, keeping on"),("は",None,P),("力","ちから","strength, power"),("なり",None,P)],
     "continuing is strength",
     "なり is the old copula, the ancestor of だ. The archaic ending makes it sound carved rather than said.",
     "Try it as 継続は力だ. What changes?"),

    ("q06", "patience",
     [("急","いそ","hurry"),("がば",None,P),("回","まわ","go around, detour"),("れ",None,P)],
     "if hurrying — go around",
     "An order, not advice: 回れ is imperative. The hurry is granted, then redirected.",
     "Who is being spoken to here — and how sharply?"),

    ("q07", "practice",
     [("習","なら","learn, be taught"),("うより",None,P),("慣","な","get used to, grow accustomed"),("れろ",None,P)],
     "rather than being taught — get used to it",
     "Two different verbs for what English lumps together as 'learn'. The proverb picks a side.",
     "Which one describes how you are studying right now?"),

    ("q08", "caution",
     [("石橋","いしばし","stone bridge"),("を",None,P),("叩","たた","tap, strike"),("いて",None,P),("渡","わた","cross"),("る",None,P)],
     "tapping the stone bridge, crossing",
     "A stone bridge is already the safe one. Testing it says something about the person, not the bridge.",
     "Is this praise or teasing? Japanese speakers use it both ways."),

    ("q09", "humility",
     [("猿","さる","monkey"),("も",None,P),("木","き","tree"),("から",None,P),("落","お","fall"),("ちる",None,P)],
     "monkeys, too, fall from trees",
     "も again — even the one built for this. Expertise is not the same as never failing.",
     "Who is the monkey when someone says this to you?"),

    ("q10", "acceptance",
     [("明日","あした","tomorrow"),("は",None,P),("明日","あした","tomorrow"),("の",None,P),("風","かぜ","wind"),("が",None,P),("吹","ふ","blow"),("く",None,P)],
     "as for tomorrow — tomorrow's wind blows",
     "The same word twice, once marked は and once の. The repetition does the whole job.",
     "は and の are both attached to 明日. What is each one doing?"),

    ("q11", "courage",
     [("案","あん","worry, ponder"),("ずるより",None,P),("産","う","give birth, produce"),("むが",None,P),("易","やす","easy"),("し",None,P)],
     "than worrying — birthing is easy",
     "易し is the classical form of 易しい. A comparison between dreading a thing and doing it.",
     "Does 'easy' feel like the right word here, or is something stronger meant?"),

    ("q12", "practice",
     [("好","す","like, love"),("きこそ",None,P),("物","もの","thing"),("の",None,P),("上手","じょうず","skilled, good at"),("なれ",None,P)],
     "what is liked, precisely — becomes the skilled thing",
     "こそ marks emphasis and なれ answers it — a classical pair. The liking comes first, the skill follows.",
     "The proverb puts liking before skill. Does your experience agree?"),

    ("q13", "presence",
     [("一期","いちご","one lifetime"),("一会","いちえ","one meeting")],
     "one lifetime, one meeting",
     "Four characters, no grammar at all. Whether it means 'treasure this' or 'this will not return' is left open.",
     "Two nouns side by side. What relationship do you read between them?"),

    ("q14", "resilience",
     [("雨","あめ","rain"),("降","ふ","fall (of rain)"),("って",None,P),("地","じ","ground, earth"),("固","かた","harden, firm up"),("まる",None,P)],
     "rain falling, the ground hardens",
     "って links the two with no 'because' stated. The causation is implied, not claimed.",
     "Is the rain the cause, or just what came first?"),

    ("q15", "pragmatism",
     [("花","はな","flower, blossom"),("より",None,P),("団子","だんご","dumpling")],
     "than flowers — dumplings",
     "Three words, no verb. It can be a confession or an accusation depending on who says it.",
     "Which are you, at a cherry blossom picnic?"),

    ("q16", "presence",
     [("一寸","いっすん","one sun (~3 cm)"),("先","さき","ahead, beyond"),("は",None,P),("闇","やみ","darkness")],
     "one sun ahead is darkness",
     "Could be despair. Could be an argument for acting today. The Japanese does not choose.",
     "Read it twice — once as gloomy, once as urgent. Which fits better?"),

    ("q17", "caution",
     [("転","ころ","fall over"),("ばぬ",None,P),("先","さき","before, ahead of"),("の",None,P),("杖","つえ","walking stick, cane")],
     "the not-falling-yet stick",
     "ぬ is classical negation — 転ばぬ is 転ばない. The stick exists before the fall does.",
     "Compare with 七転び八起き. Do the two proverbs agree?"),

    ("q18", "persistence",
     [("三日","みっか","three days"),("坊主","ぼうず","monk, novice")],
     "three-day monk",
     "Someone who took vows on Monday and left by Thursday. Said of yourself, it is usually rueful.",
     "Worth knowing the name for the thing you are trying not to be."),

    ("q19", "time",
     [("光陰","こういん","light and shade; time"),("矢","や","arrow"),("の",None,P),("如","ごと","like, as"),("し",None,P)],
     "light-and-shade is like an arrow",
     "光陰 is literally 'light-dark' — day and night alternating, used as a word for time itself.",
     "Why an arrow, and not a river?"),

    ("q20", "courage",
     [("聞","き","ask, hear"),("くは",None,P),("一時","いっとき","a moment"),("の",None,P),("恥","はじ","shame"),("、",None,P),
      ("聞","き","ask, hear"),("かぬは",None,P),("一生","いっしょう","a lifetime"),("の",None,P),("恥","はじ","shame")],
     "asking is a moment's shame; not-asking is a life's shame",
     "One verb in two forms, one noun repeated. The whole sentence turns on 一時 against 一生.",
     "Find the two forms of 聞く. What single letter separates them?"),

    ("q21", "value",
     [("猫","ねこ","cat"),("に",None,P),("小判","こばん","koban (Edo gold coin)")],
     "to a cat, a koban",
     "Gold given where it cannot be valued. The same coin the maneki-neko holds — and the one in your wallet here.",
     "Who is the cat in this picture? The answer is not always someone else."),

    ("q22", "acceptance",
     [("塞翁","さいおう","the old man of the frontier"),("が",None,P),("馬","うま","horse")],
     "the frontier old man's horse",
     "が here is an old possessive, today's の. The story behind it runs long: every turn of luck reverses.",
     "Three words carrying a whole parable. What does that tell you about how proverbs work?"),

    ("q23", "humility",
     [("井","い","well"),("の",None,P),("中","なか","inside"),("の",None,P),("蛙","かわず","frog"),("大海","たいかい","the great ocean"),("を",None,P),("知","し","know"),("らず",None,P)],
     "the frog inside the well does not know the great ocean",
     "蛙 is read かわず here, not かえる — the older poetic reading, kept alive inside the proverb.",
     "Is the frog to be pitied or laughed at? The Japanese leaves room for both."),

    ("q24", "focus",
     [("二兎","にと","two rabbits"),("を",None,P),("追","お","chase, pursue"),("う",None,P),("者","もの","person, one who"),("は",None,P),
      ("一兎","いっと","one rabbit"),("を",None,P),("も",None,P),("得","え","obtain, get"),("ず",None,P)],
     "the one who chases two rabbits does not get even one",
     "をも stacks two particles — 'not even one'. The failure is stated at its most extreme.",
     "Would 一兎を得ず be weaker? What does も add?"),

    ("q25", "distinction",
     [("出","で","stick out, emerge"),("る",None,P),("杭","くい","stake, post"),("は",None,P),("打","う","hit, hammer"),("たれる",None,P)],
     "the stake that sticks out is hammered",
     "打たれる is passive — the stake does not choose. Often quoted as a warning, sometimes as a complaint about the warning.",
     "Is this describing how things are, or how they should be?"),

    ("q26", "acceptance",
     [("覆水","ふくすい","spilled water"),("盆","ぼん","tray"),("に",None,P),("返","かえ","return"),("らず",None,P)],
     "spilled water does not return to the tray",
     "らず is classical negation. A statement of physics standing in for a statement about regret.",
     "English has a version of this. Does the Japanese carry the same feeling?"),

    ("q27", "practice",
     [("百聞","ひゃくぶん","a hundred hearings"),("は",None,P),("一見","いっけん","one look"),("に",None,P),("如","し","equal, match"),("かず",None,P)],
     "a hundred hearings do not equal one look",
     "A ratio argument: 100 of one thing against 1 of another. The numbers are the rhetoric.",
     "Where in your own studying does this apply?"),

    ("q28", "humility",
     [("弘法","こうぼう","Kōbō (a master calligrapher of legend)"),("に",None,P),("も",None,P),("筆","ふで","brush"),("の",None,P),("誤","あやま","error, mistake"),("り",None,P)],
     "even for Kōbō, a slip of the brush",
     "も once more: even the master. Japanese has several proverbs making this one point, which suggests it needed saying.",
     "Compare with 猿も木から落ちる. Why might a language need both?"),

    ("q29", "humility",
     [("河童","かっぱ","kappa (a water spirit)"),("の",None,P),("川流","かわなが","being swept down a river"),("れ",None,P)],
     "the kappa, swept downriver",
     "A kappa lives in water. Drowning is the one thing it should not be able to do.",
     "Three proverbs now for the same idea. Does the kappa version feel different?"),

    ("q30", "adversity",
     [("泣","な","cry, weep"),("きっ",None,P),("面","つら","face"),("に",None,P),("蜂","はち","bee, wasp"),],
     "on a crying face, a bee",
     "No verb, no comment. The image is left to do everything.",
     "English says 'when it rains, it pours.' Which picture is worse?"),

    ("q31", "difference",
     [("十人","じゅうにん","ten people"),("十色","といろ","ten colours")],
     "ten people, ten colours",
     "The reading shifts: 十 is じゅう then と. Four characters, perfectly balanced.",
     "Say it aloud. What does the rhythm do that the meaning does not?"),

    ("q32", "learning",
     [("温","おん","warm, revisit"),("故","こ","the old"),("知","ち","know"),("新","しん","the new")],
     "warm the old, know the new",
     "Four characters, four verbs-and-objects compressed. Revisiting is presented as the route to what is new.",
     "This describes review. Does that match how review feels to you?"),

    ("q33", "efficiency",
     [("一石","いっせき","one stone"),("二鳥","にちょう","two birds")],
     "one stone, two birds",
     "English has the same image. Whether it arrived from Japanese or into it is worth wondering about.",
     "Does knowing the English version help you, or get in the way?"),

    ("q34", "patience",
     [("大器","たいき","a great vessel"),("晩成","ばんせい","late completion")],
     "the great vessel completes late",
     "A big pot takes longer to fire. Said of people who arrive at their ability slowly.",
     "Encouraging or condescending? It gets used both ways."),

    ("q35", "patience",
     [("果報","かほう","good fortune"),("は",None,P),("寝","ね","sleep"),("て",None,P),("待","ま","wait"),("て",None,P)],
     "good fortune — sleep and wait",
     "待て is an imperative. Being told to sleep is unusual advice for a proverb.",
     "Does this contradict 継続は力なり, or sit beside it?"),

    ("q36", "balance",
     [("楽","らく","ease, comfort"),("あれば",None,P),("苦","く","hardship"),("あり",None,P)],
     "if there is ease, there is hardship",
     "Classical throughout: あれば, あり. A statement of alternation rather than of fairness.",
     "Reverse it — 苦あれば楽あり. Both are said. Which do you prefer?"),

    ("q37", "generosity",
     [("情","なさ","kindness, compassion"),("けは",None,P),("人","ひと","person, others"),("の",None,P),("為","ため","for the sake of"),("ならず",None,P)],
     "kindness is not for the other person's sake",
     "Widely misread even in Japan as 'kindness spoils people'. The classical ならず is what trips it.",
     "Two opposite readings circulate. Which does the grammar actually support?"),

    ("q38", "adaptation",
     [("郷","ごう","a village, a region"),("に",None,P),("入","い","enter"),("っては",None,P),("郷","ごう","the village"),("に",None,P),("従","したが","follow, obey"),("え",None,P)],
     "entering the village, follow the village",
     "The same word twice, once entered and once obeyed. 従え is an order.",
     "Is this about respect, or about survival?"),

    ("q39", "restraint",
     [("能","のう","ability, talent"),("ある",None,P),("鷹","たか","hawk"),("は",None,P),("爪","つめ","talon, claw"),("を",None,P),("隠","かく","hide, conceal"),("す",None,P)],
     "the able hawk hides its talons",
     "The hawk still has them. Hiding is presented as a mark of ability, not a lack of it.",
     "Does this sit comfortably with 出る杭は打たれる?"),

    ("q40", "humility",
     [("実","みの","ripen, bear fruit"),("るほど",None,P),("頭","こうべ","head"),("を",None,P),("垂","た","bow, hang down"),("れる",None,P),("稲穂","いなほ","ear of rice"),("かな",None,P)],
     "the riper it grows, the lower it bows — the ear of rice",
     "かな is a poetic exclamation. This one is shaped like a haiku fragment, and the image carries the argument.",
     "Rice bows because it is heavy. What is the person heavy with?"),

    ("q41", "risk",
     [("虎穴","こけつ","tiger's den"),("に",None,P),("入","い","enter"),("らずんば",None,P),("虎子","こじ","tiger cub"),("を",None,P),("得","え","obtain"),("ず",None,P)],
     "not entering the tiger's den, one does not get the cub",
     "らずんば is a double-negative conditional — dense classical grammar for a simple, dangerous idea.",
     "The proverb assumes you want the cub. Do you?"),

    ("q42", "haste",
     [("急","せ","hurry, be impatient"),("いては",None,P),("事","こと","matter, affair"),("を",None,P),("仕損","しそん","botch, bungle"),("じる",None,P)],
     "hurrying, one botches the matter",
     "Note the reading: 急 is せ here, not いそ. The same character, a different verb.",
     "Compare 急がば回れ. Same character, same warning — different grammar."),

    ("q43", "chance",
     [("犬","いぬ","dog"),("も",None,P),("歩","ある","walk"),("けば",None,P),("棒","ぼう","stick, pole"),("に",None,P),("当","あ","hit, strike against"),("たる",None,P)],
     "if even a dog walks, it hits a stick",
     "Read as bad luck for centuries, then as good luck — go out and something will happen. Both survive.",
     "Two opposite meanings, same words. Which do you read?"),

    ("q44", "evidence",
     [("論","ろん","argument, theory"),("より",None,P),("証拠","しょうこ","proof, evidence")],
     "than argument — proof",
     "The same より structure as 花より団子. A pattern worth collecting.",
     "You have now met より three times. What does it always do?"),

    ("q45", "action",
     [("善","ぜん","good, a good thing"),("は",None,P),("急","いそ","hurry"),("げ",None,P)],
     "as for good — hurry",
     "Two words and an imperative. The shortest argument in this collection.",
     "急げ here, 回れ in 急がば回れ. When does Japanese hurry you?"),

    ("q46", "diligence",
     [("切磋","せっさ","cutting and polishing"),("琢磨","たくま","grinding and burnishing")],
     "cut, file, grind, polish",
     "Four characters, four things done to stone or jade. Applied to people, it usually means improving alongside others.",
     "All four are about friction. Is that the point?"),

    ("q47", "progress",
     [("日進","にっしん","daily advance"),("月歩","げっぽ","monthly step")],
     "advancing by the day, stepping by the month",
     "Two time-words, two motion-words, perfectly parallel. The structure is the meaning.",
     "Which unit describes your studying better — days or months?"),

    ("q48", "futility",
     [("馬","うま","horse"),("の",None,P),("耳","みみ","ear"),("に",None,P),("念仏","ねんぶつ","Buddhist chant")],
     "to a horse's ear, a sutra",
     "Compare 猫に小判 — same shape, different animal, different wasted thing.",
     "Three of these now. Why so many proverbs about wasted value?"),

    ("q49", "belonging",
     [("住","す","live, reside"),("めば",None,P),("都","みやこ","the capital")],
     "if you live there — the capital",
     "Two words. 都 was Kyoto, the best place there was. Living somewhere is what makes it that.",
     "Is this comforting or resigned?"),

    ("q50", "proximity",
     [("灯台","とうだい","lampstand"),("下","もと","the base, underneath"),("暗","くら","dark"),("し",None,P)],
     "beneath the lampstand, dark",
     "Not a lighthouse — an old oil lamp, which lights the room and leaves its own base in shadow.",
     "What is directly beneath your lamp?"),

    ("q51", "taste",
     [("蓼","たで","smartweed (a bitter herb)"),("食","く","eat"),("う",None,P),("虫","むし","insect, bug"),("も",None,P),("好","す","like, prefer"),("き好","ずき",None)],
     "even the bug that eats bitter herb has its preference",
     "も yet again. The bug is not being corrected — it is being allowed.",
     "Count how many proverbs here use も. What is it for?"),

    ("q52", "support",
     [("縁","えん","veranda, engawa"),("の",None,P),("下","した","under, beneath"),("の",None,P),("力持","ちからも","strong one, one who bears weight"),("ち",None,P)],
     "the strong one beneath the veranda",
     "The engawa is the raised walkway around a house. Someone is holding it up, unseen.",
     "You will meet 縁 again when your room grows an engawa."),
]

# ---------------------------------------------------------------------------
# BUILD + VALIDATE
# ---------------------------------------------------------------------------

def is_kana(s):
    return all(
        "HIRAGANA" in unicodedata.name(c, "") or "KATAKANA" in unicodedata.name(c, "")
        or c in "、。ー"
        for c in s
    )

def main():
    ledger = {}
    if LEDGER.exists():
        raw = json.loads(LEDGER.read_text(encoding="utf-8"))
        for w in raw.get("words", []):
            ledger[w["written"]] = w

    quotes, problems, reused, asserted = [], [], 0, 0
    seen_ids = set()

    for qid, theme, tokens, literal, one_reading, invite in DATA:
        if qid in seen_ids:
            problems.append(f"{qid}: duplicate id")
        seen_ids.add(qid)

        out_tokens = []
        for surface, reading, gloss in tokens:
            # a token that is already kana must not carry furigana
            if reading and is_kana(surface):
                problems.append(f"{qid}: '{surface}' is kana but has reading '{reading}'")
            # a token with kanji and a gloss should have a reading
            if gloss and not reading and not is_kana(surface):
                problems.append(f"{qid}: '{surface}' has kanji + gloss but no reading")

            tok = {"t": surface}
            if reading:
                tok["r"] = reading
            if gloss:
                tok["g"] = gloss
                # cross-check against the vocabulary module's own ledger
                if surface in ledger:
                    tok["ledger"] = ledger[surface]["meanings"][0]
                    reused += 1
            # An ASSERTION is any token carrying a reading or a gloss. Bare tokens
            # (okurigana, particles) assert nothing and must not pad the denominator
            # — counting them would make the sourced fraction look twice as good.
            if reading or gloss:
                asserted += 1
            out_tokens.append(tok)

        quotes.append({
            "id": qid,
            "theme": theme,
            "tokens": out_tokens,
            "literal": literal,
            "one_reading": one_reading,
            "invite": invite,
        })

    themes = sorted({q["theme"] for q in quotes})

    doc = {
        "version": 1,
        "generated": f"{date.today().isoformat()} · Session 21",
        "status": (
            f"NO REVIEWER GATE ON INTERPRETATION; {asserted - reused} OF {asserted} "
            f"READING/GLOSS ASSERTIONS ARE UNSOURCED. Read both halves — the earlier "
            "version of this field opened with the word READY and qualified itself "
            "two clauses later, which is how a scope note gets read as a clearance. "
            "WHAT IS CLEARED: nothing here asserts what a proverb MEANS. "
            "`one_reading` is offered as one possible reading and `invite` hands "
            "judgment back to the learner, so interpretation needs no reviewer. "
            "No attribution, no biography, no claims about any named person — that "
            "material would need verification and was deliberately cut from v1. "
            f"WHAT IS NOT CLEARED: readings and glosses ARE assertions, and a wrong "
            f"reading teaches a wrong reading. {reused} of {asserted} are cross-checked "
            "against word-ledger-v1.json; the remainder have no independent source and "
            "are queued as Batch X in reviewer-content-batches-v1.md. They are "
            "dictionary facts rather than judgement calls, which is why they belong in "
            "the official batch queue and NOT on the informal reviewer sheet."
        ),
        "display_rules": [
            "Shown on entering the app. NOT a reward, never earned, never withheld.",
            "One per local day, deterministic per date, no repeat within 12 days.",
            "Tapping a token shows its reading and gloss — the learner checks the "
            "Japanese themselves rather than taking the reading on trust.",
            "`one_reading` must always be phrased as a possibility, never as the "
            "definition. If a line reads as authoritative, rewrite it.",
            "No koban. The card is content the learner is given, not a payout.",
        ],
        "themes": themes,
        "count": len(quotes),
        "quotes": quotes,
    }

    OUT.write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8")

    # ES module twin, same convention as vocab-data-v1.js — this is what the
    # module imports; the JSON is the reviewable/diffable source of record.
    js = HERE / "quote-bank-v1.js"
    js.write_text(
        "// GENERATED by build-quote-bank.py — do not edit by hand.\n"
        "// Edit DATA in build-quote-bank.py and re-run.\n"
        f"export const QUOTE_BANK_VERSION = {doc['version']};\n"
        f"export const QUOTES = {json.dumps(quotes, ensure_ascii=False, indent=1)};\n"
        "export default QUOTES;\n",
        encoding="utf-8",
    )

    print(f"quotes:        {len(quotes)}")
    print(f"themes:        {len(themes)}  {', '.join(themes)}")
    # A COUNT WITHOUT ITS DENOMINATOR IS THE PROJECT'S RECURRING FAILURE SHAPE.
    # This line used to print `39` alone, which reads as reassurance; the number
    # that matters is that 39 of 156 reading/gloss assertions have a source and
    # 117 do not. Print the ratio, always.
    print(f"reading/gloss assertions:  {asserted}")
    print(f"  cross-checked vs ledger: {reused}/{asserted} "
          f"({reused * 100 // max(asserted, 1)}%)")
    print(f"  UNSOURCED:               {asserted - reused}/{asserted} "
          f"— queued for the reviewer, see reviewer-content-batches-v1.md Batch X")
    print(f"wrote:         {OUT.name}")
    if problems:
        print(f"\n!! {len(problems)} STRUCTURAL PROBLEMS")
        for p in problems:
            print("  -", p)
        return 1
    print("\nno structural problems")
    return 0

if __name__ == "__main__":
    sys.exit(main())
