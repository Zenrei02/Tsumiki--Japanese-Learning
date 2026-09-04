#!/usr/bin/env python3
"""
build-reviewer-pdf.py — render reviewer-informal-sheet-v1.md to PDF.

WHY THIS IS NOT A ONE-LINER. The sheet is mostly Japanese, and the obvious
routes all fail here:

  • weasyprint / wkhtmltopdf: not installed, no root to install them.
  • reportlab + Noto Sans CJK: refuses the .ttc — "postscript outlines are not
    supported". Noto CJK ships CFF outlines; reportlab's TTFont only embeds
    TrueType `glyf` outlines.
  • DroidSansFallbackFull.ttf IS TrueType and does cover the kana and kanji —
    but it is a Simplified-Chinese-first fallback, so a chunk of characters
    render with Chinese glyph shapes. Sending a Japanese speaker a document in
    Chinese letterforms to ask whether our Japanese looks natural would be a
    bad opening move. Rejected deliberately, not overlooked.

So: subset Noto Sans CJK JP to the characters this document actually uses
(~250 rather than ~65,000), convert those glyphs from cubic CFF curves to
quadratic TrueType curves with cu2qu, and embed the result. Fast because of the
subsetting, and correct because it is the JP face of the collection.

Output: reviewer-informal-sheet-v1.pdf
"""

import re, sys
from pathlib import Path

HERE = Path(__file__).parent
# Takes a .md path; defaults to the English sheet. The Japanese sheet is the
# same document and goes through the same renderer:
#     python3 build-reviewer-pdf.py reviewer-informal-sheet-ja-v1.md
MD = HERE / (sys.argv[1] if len(sys.argv) > 1 else "reviewer-informal-sheet-v1.md")
PDF = MD.with_suffix(".pdf")
TTC = Path("/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc")
JP_INDEX = 0  # Noto Sans CJK JP — confirmed by reading the TTC name table

# ── palette, from the app's own tokens ──────────────────────────────────────
INK, SUB, RULE = "#22252B", "#6B6F76", "#DDDCD8"
SHU = "#C7351B"   # 朱 — the app's FIX colour, used here only for "answer this one"
PAPER = "#FBFAF7"


def build_font():
    """Subset Noto Sans CJK JP to this document's characters, CFF -> glyf."""
    from fontTools.ttLib import TTFont as FTFont
    from fontTools import subset
    from fontTools.pens.ttGlyphPen import TTGlyphPen
    from fontTools.pens.cu2quPen import Cu2QuPen
    from fontTools.ttLib.tables._g_l_y_f import table__g_l_y_f

    chars = set(MD.read_text(encoding="utf-8"))
    chars |= set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                 "abcdefghijklmnopqrstuvwxyz .,:;!?'\"()[]—–-…/|「」『』、。〜"
                 "\u2022\u2013\u2014\u2026\u201c\u201d\u2018\u2019")  # bullets + smart quotes

    out = []
    for weight, path, idx in (("R", TTC, JP_INDEX),
                              ("B", Path(str(TTC).replace("Regular", "Bold")), JP_INDEX)):
        f = FTFont(str(path), fontNumber=idx, lazy=False)

        opts = subset.Options()
        opts.glyph_names = True
        opts.notdef_outline = True
        opts.drop_tables += ["DSIG"]
        opts.layout_features = []
        s = subset.Subsetter(options=opts)
        s.populate(unicodes={ord(c) for c in chars})
        s.subset(f)

        # CFF -> glyf. reportlab embeds TrueType outlines only.
        glyf = table__g_l_y_f()
        glyf.glyphs = {}
        gs = f.getGlyphSet()
        order = f.getGlyphOrder()
        for name in order:
            pen = TTGlyphPen(gs)
            try:
                gs[name].draw(Cu2QuPen(pen, max_err=1.0, reverse_direction=True))
            except Exception:
                pass
            glyf.glyphs[name] = pen.glyph()
        glyf.glyphOrder = order

        for t in ("CFF ", "CFF2", "VORG"):
            if t in f:
                del f[t]
        f["glyf"] = glyf

        from fontTools.ttLib.tables._l_o_c_a import table__l_o_c_a
        f["loca"] = table__l_o_c_a()
        f["maxp"].numGlyphs = len(order)
        f["maxp"].tableVersion = 0x00010000
        for attr, val in (("maxPoints", 0), ("maxContours", 0),
                          ("maxCompositePoints", 0), ("maxCompositeContours", 0),
                          ("maxZones", 2), ("maxTwilightPoints", 0), ("maxStorage", 0),
                          ("maxFunctionDefs", 0), ("maxInstructionDefs", 0),
                          ("maxStackElements", 0), ("maxSizeOfInstructions", 0),
                          ("maxComponentElements", 0), ("maxComponentDepth", 0)):
            if not hasattr(f["maxp"], attr):
                setattr(f["maxp"], attr, val)
        f["head"].indexToLocFormat = 0
        f.sfntVersion = "\x00\x01\x00\x00"

        dest = Path("/tmp") / f"naoshi-jp-{weight}.ttf"
        f.save(str(dest))
        out.append(dest)
    return out


def register(paths):
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    pdfmetrics.registerFont(TTFont("JP", str(paths[0])))
    pdfmetrics.registerFont(TTFont("JP-B", str(paths[1])))
    pdfmetrics.registerFontFamily("JP", normal="JP", bold="JP-B",
                                  italic="JP", boldItalic="JP-B")


def esc(t):
    return (t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def inline(t):
    """Markdown inline -> reportlab markup. Bold only; the sheet uses nothing else."""
    t = esc(t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"(?<!\*)\*([^*]+?)\*(?!\*)", r"<i>\1</i>", t)
    t = re.sub(r"`(.+?)`", r"\1", t)
    return t


def main():
    if not TTC.exists():
        print("Noto Sans CJK not found — cannot render Japanese. Aborting.")
        return 1

    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.lib import colors
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                    TableStyle, HRFlowable, KeepTogether)

    register(build_font())

    # ⚠️ CJK LINE BREAKING. ReportLab breaks lines at spaces. Japanese has none,
    # so a long Japanese paragraph is treated as ONE word and runs straight off
    # the right margin — silently, with no warning. wordWrap="CJK" switches to
    # per-character breaking. Applied to every style, because the English sheet
    # also carries Japanese inline and those runs can be long enough to overflow.
    src_text = MD.read_text(encoding="utf-8")
    jp_ratio = sum(1 for c in src_text if "\u3040" <= c <= "\u30ff" or "\u4e00" <= c <= "\u9fff") / max(1, len(src_text))

    def st(name, size, leading, **kw):
        kw.setdefault("wordWrap", "CJK")
        kw.setdefault("textColor", colors.HexColor(INK))
        # bulletFontName defaults to Helvetica, which leaves an unembedded font
        # in the file. Everything must come from the embedded subset.
        kw.setdefault("bulletFontName", "JP")
        return ParagraphStyle(name, fontName="JP", fontSize=size, leading=leading, **kw)

    S = {
        "title": st("title", 20, 26, spaceAfter=2),
        "sub":   st("sub", 10, 14, textColor=colors.HexColor(SUB), spaceAfter=14),
        "h2":    st("h2", 13.5, 18, spaceBefore=16, spaceAfter=7),
        "body":  st("body", 10.5, 18 if jp_ratio > 0.2 else 16.5, spaceAfter=7),
        "jp":    st("jp", 12, 20, leftIndent=12, spaceAfter=3,
                    textColor=colors.HexColor("#1B1E23")),
        "note":  st("note", 9.5, 14, textColor=colors.HexColor(SUB), spaceAfter=6),
        "bullet": st("bullet", 10.5, 16, leftIndent=14, bulletIndent=3, spaceAfter=5),
        "bullet2": st("bullet2", 10.5, 16, leftIndent=28, bulletIndent=16, spaceAfter=4),
        "cell":  st("cell", 9.5, 13.5),
        "celljp": st("celljp", 11, 15),
    }

    story, lines = [], MD.read_text(encoding="utf-8").split("\n")
    i = 0
    table_buf = []

    def flush_table():
        if not table_buf:
            return
        rows = [[c.strip() for c in r.strip().strip("|").split("|")] for r in table_buf]
        rows = [r for r in rows if not all(set(c) <= set("-: ") for c in r)]
        data = [[Paragraph(inline(c), S["celljp"] if n == 1 else S["cell"])
                 for n, c in enumerate(r)] for r in rows]
        t = Table(data, colWidths=[18*mm, 62*mm, 74*mm], hAlign="LEFT")
        t.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (-1, -1), "JP"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F2F0EB")),
            ("LINEBELOW", (0, 0), (-1, -2), 0.4, colors.HexColor(RULE)),
            ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor(RULE)),
        ]))
        story.append(Spacer(1, 4))
        story.append(t)
        story.append(Spacer(1, 10))
        table_buf.clear()

    while i < len(lines):
        ln = lines[i].rstrip()

        if ln.startswith("|"):
            table_buf.append(ln); i += 1; continue
        flush_table()

        if ln.startswith("# "):
            story.append(Paragraph(inline(ln[2:]), S["title"]))
        elif ln.startswith("## "):
            story.append(HRFlowable(width="100%", thickness=0.6,
                                    color=colors.HexColor(RULE),
                                    spaceBefore=14, spaceAfter=2))
            story.append(Paragraph(inline(ln[3:]), S["h2"]))
        elif ln.startswith("*") and ln.endswith("*") and not ln.startswith("**") and len(ln) > 2:
            story.append(Paragraph(inline(ln.strip("*")), S["sub"]))
        elif ln.startswith(">"):
            # Quoted Japanese examples — the thing the reviewer is judging.
            block = []
            while i < len(lines) and lines[i].startswith(">"):
                block.append(lines[i].lstrip("> ").rstrip()); i += 1
            for b in block:
                story.append(Paragraph(inline(b), S["jp"] if re.search(r"[ぁ-んァ-ン一-龯]", b) else S["note"]))
            story.append(Spacer(1, 6))
            continue
        elif re.match(r"^\s*-\s", ln):
            # Bullets wrap across source lines too. Without this, a wrapped
            # bullet's second line fell out of the indent and rendered as a
            # stray body paragraph under the list.
            indent = len(ln) - len(ln.lstrip())
            buf = [re.sub(r"^\s*-\s+", "", ln)]
            i += 1
            while (i < len(lines) and lines[i].strip()
                   and not re.match(r"^\s*-\s|^#|^\||^>|^\*\*", lines[i])):
                buf.append(lines[i].strip()); i += 1
            story.append(Paragraph(inline(" ".join(buf)),
                                   S["bullet2"] if indent >= 2 else S["bullet"],
                                   bulletText="–" if indent >= 2 else "•"))
            continue
        elif ln.strip() == "---":
            pass
        elif ln.strip():
            # The .md is hard-wrapped at ~80 columns. Treating each source line
            # as its own Paragraph gave every line its own spaceAfter, which
            # read as double-spacing. Gather the whole block first.
            buf = []
            while i < len(lines) and lines[i].strip() and not re.match(
                    r"^(\||#|>|-\s|\s+-\s|---$)", lines[i]):
                buf.append(lines[i].strip()); i += 1
            story.append(Paragraph(inline(" ".join(buf)), S["body"]))
            continue
        i += 1
    flush_table()

    def page(c, d):
        c.saveState()
        c.setFillColor(colors.HexColor(PAPER))
        c.rect(0, 0, A4[0], A4[1], stroke=0, fill=1)
        c.setFont("JP", 8)
        c.setFillColor(colors.HexColor(SUB))
        c.drawString(20*mm, 12*mm, "Naoshi ・ 日本語についての質問" if jp_ratio > 0.2
                                   else "Naoshi — informal questions")
        c.drawRightString(A4[0]-20*mm, 12*mm, str(d.page))
        c.restoreState()

    SimpleDocTemplate(str(PDF), pagesize=A4,
                      leftMargin=20*mm, rightMargin=20*mm,
                      topMargin=18*mm, bottomMargin=20*mm,
                      title="Naoshi — a few questions about Japanese",
                      author="Naoshi").build(story, onFirstPage=page, onLaterPages=page)

    print(f"wrote {PDF.name}  ({PDF.stat().st_size:,} bytes)  "
          f"[{jp_ratio:.0%} Japanese, CJK wrapping on]")
    return 0


if __name__ == "__main__":
    sys.exit(main())
