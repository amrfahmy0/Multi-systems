# -*- coding: utf-8 -*-
"""
Update Script: Inject official Multi Systems logo + brand colors
into the existing quotation_celia_clean.xlsx

Brand palette extracted from logo:
  Primary Blue  : #40A0E0  (dominant crescent color)
  Dark Blue     : #1E6FA0  (deeper blue tones in icon)
  Light Blue    : #A0C0E0  (highlight/shimmer in crescent)
  Black/Charcoal: #1A1A1A  (company text color)
  White         : #FFFFFF

Strategy:
  1. Load existing workbook
  2. Convert / clean logo to PNG (already done)
  3. Replace old navy color palette with brand blues
  4. Insert logo image at B2, resize header rows to make space
  5. Update company title row to use brand blue colors
  6. Add a branded color band accent
  7. Update header row, total row, terms headers with brand colors
  8. Save as updated file (overwrite clean file)
"""

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.drawing.image import Image as XLImage
from openpyxl.utils import get_column_letter

# ─────────────────────────────────────────────
#  BRAND COLOUR PALETTE  (from logo extraction)
# ─────────────────────────────────────────────
BRAND_BLUE_PRIMARY  = "40A0E0"   # Main crescent blue
BRAND_BLUE_DARK     = "1A6DA8"   # Deeper shade for headers
BRAND_BLUE_DARKER   = "0D4F80"   # Darkest shade for top bar
BRAND_BLUE_LIGHT    = "A0C0E0"   # Light shimmer from logo
BRAND_BLUE_PALE     = "E8F4FB"   # Very pale blue for alternating rows
BRAND_BLUE_ICE      = "D0E8F5"   # Total row / terms bg
BRAND_BLUE_ACCENT   = "2988C8"   # Mid-tone for sub-headers
BRAND_BLACK         = "1A1A1A"   # Logo text color
BRAND_WHITE         = "FFFFFF"
BRAND_GOLD          = "B7953A"   # Keep gold accent
BRAND_GRAY_LIGHT    = "F1F5F9"   # Alternating row light
BRAND_GRAY_BORDER   = "B8D4EA"   # Border lines (blue-tinted)

FONT_FAMILY = "Segoe UI"

# ─────────────────────────────────────────────
#  HELPERS
# ─────────────────────────────────────────────
def font(size=10, bold=False, color=BRAND_BLACK, italic=False):
    return Font(name=FONT_FAMILY, size=size, bold=bold,
                color=color, italic=italic)

def fill(hex_color):
    return PatternFill("solid", fgColor=hex_color)

def align(h="center", v="center", wrap=False, rtl=False):
    return Alignment(
        horizontal=h, vertical=v, wrap_text=wrap,
        readingOrder=2 if rtl else 1
    )

def border(color=BRAND_GRAY_BORDER,
           left_s="thin", right_s="thin",
           top_s="thin", bottom_s="thin"):
    s = lambda st: Side(style=st, color=color)
    return Border(left=s(left_s), right=s(right_s),
                  top=s(top_s), bottom=s(bottom_s))

def med_border(color=BRAND_BLUE_DARK):
    s = lambda: Side(style="medium", color=color)
    return Border(left=s(), right=s(), top=s(), bottom=s())

def style_range(ws, cell_range, font_=None, fill_=None, align_=None, border_=None):
    from openpyxl.utils import range_boundaries
    min_col, min_row, max_col, max_row = range_boundaries(cell_range)
    for row in ws.iter_rows(min_row=min_row, max_row=max_row,
                            min_col=min_col, max_col=max_col):
        for cell in row:
            if font_:   cell.font      = font_
            if fill_:   cell.fill      = fill_
            if align_:  cell.alignment = align_
            if border_: cell.border   = border_

# ─────────────────────────────────────────────
#  LOAD WORKBOOK
# ─────────────────────────────────────────────
XLSX_PATH = r"d:\hp 2023\Fahmy University\Celia Quotation\quotation_celia_clean.xlsx"
LOGO_PATH = r"d:\hp 2023\Fahmy University\Celia Quotation\multi_systems_logo.png"

wb = openpyxl.load_workbook(XLSX_PATH)
ws = wb.active

# ─────────────────────────────────────────────
#  SECTION 1: HEADER AREA RESTRUCTURE
#  New layout:
#    Row 1  : Gold/brand accent top bar (height 8)
#    Row 2  : LOGO left (B2) + Company name right (D2:G2) — height 45
#    Row 3  : Sub-title band (B3:G3) — height 20
#    Row 4  : Thin spacer (height 5)
#    Row 5-6: Project Info (unchanged)
#    Row 7  : Spacer
#    Row 8  : Document title band
#    Row 9  : BOQ column headers
#    Row 10+: BOQ items
# ─────────────────────────────────────────────

# --- ROW 1: Brand top bar (gold accent) ---
ws.row_dimensions[1].height = 8
for col in range(1, 8):  # A–G
    c = ws.cell(row=1, column=col)
    c.fill = fill(BRAND_BLUE_DARKER)  # Brand dark blue instead of gold
    c.border = Border()

# Add gold accent stripe at very top (col A only as a marker)
ws.cell(row=1, column=1).fill = fill(BRAND_GOLD)

# --- ROW 2: Logo + Company name ---
ws.row_dimensions[2].height = 58

# Clear existing B2:G2 merged cells and content
for merged in list(ws.merged_cells.ranges):
    if "2" in str(merged) and str(merged).startswith("B2"):
        ws.unmerge_cells(str(merged))
        break

# Fill row 2 background (white for logo area, brand dark for title area)
for col in range(1, 8):
    c = ws.cell(row=2, column=col)
    c.fill = fill(BRAND_WHITE)

# Company name: columns D2:G2 (logo will sit in B2:C2)
ws.merge_cells("D2:G2")
ws["D2"].value     = "شركة مالتي سيستيمز للهندسة والتجارة"
ws["D2"].font      = font(size=17, bold=True, color=BRAND_BLUE_DARKER)
ws["D2"].alignment = align("right", "center", rtl=True)
ws["D2"].fill      = fill(BRAND_WHITE)

# Style B2:C2 cells as logo placeholder background
for col in [2, 3]:
    ws.cell(row=2, column=col).fill = fill(BRAND_WHITE)

# Bottom border for row 2
for col in range(2, 8):
    ws.cell(row=2, column=col).border = Border(
        bottom=Side(style="medium", color=BRAND_BLUE_PRIMARY)
    )

# --- ROW 3: Sub-title ---
ws.row_dimensions[3].height = 20

# Unmerge if needed
for merged in list(ws.merged_cells.ranges):
    rng = str(merged)
    if rng == "B3:G3":
        ws.unmerge_cells(rng)
        break

ws.merge_cells("B3:G3")
ws["B3"].value     = (
    "Multi Systems for Engineering & Trading  "
    "|  أعمال المقاولات والتشطيبات المتكاملة  "
    "|  New Cairo, Egypt"
)
ws["B3"].font      = font(size=9, color=BRAND_BLUE_DARK, italic=True)
ws["B3"].alignment = align("center", "center")
ws["B3"].fill      = fill(BRAND_BLUE_PALE)
style_range(ws, "B3:G3", fill_=fill(BRAND_BLUE_PALE))

# Border on row 3
for col in range(2, 8):
    ws.cell(row=3, column=col).border = Border(
        top=Side(style="thin", color=BRAND_BLUE_PRIMARY),
        bottom=Side(style="thin", color=BRAND_BLUE_PRIMARY)
    )

# ─────────────────────────────────────────────
#  SECTION 2: INSERT LOGO IMAGE
# ─────────────────────────────────────────────
img = XLImage(LOGO_PATH)

# Set dimensions — maintain ~1.82:1 ratio (215x118 original)
img.height = 50   # pts
img.width  = 120  # pts (50 * 215/118 = ~91 — scale up slightly)

# Anchor to B2
img.anchor = "B2"
ws.add_image(img)

# ─────────────────────────────────────────────
#  SECTION 3: PROJECT INFO ROWS (5-6) — brand blue re-color
# ─────────────────────────────────────────────
INFO_LABEL_FONT  = font(size=9, bold=True, color=BRAND_BLUE_DARK)
INFO_VALUE_FONT  = font(size=9, bold=True, color=BRAND_BLACK)
INFO_FILL        = fill(BRAND_BLUE_PALE)
INFO_BORDER      = border(color=BRAND_GRAY_BORDER)

for row in [5, 6]:
    ws.row_dimensions[row].height = 22
    for col in range(2, 8):
        c = ws.cell(row=row, column=col)
        c.fill   = INFO_FILL
        c.border = INFO_BORDER

# Apply fonts
for cell_addr, val_type in [
    ("B5", "label"), ("C5", "value"), ("E5", "label"), ("F5", "value"),
    ("B6", "label"), ("C6", "value"), ("E6", "label"), ("F6", "value"),
]:
    c = ws[cell_addr]
    c.font = INFO_LABEL_FONT if val_type == "label" else INFO_VALUE_FONT
    c.alignment = align("right", "center", rtl=True)

# ─────────────────────────────────────────────
#  SECTION 4: DOCUMENT TITLE BAND (Row 8) — brand blue
# ─────────────────────────────────────────────
ws.row_dimensions[8].height = 28

for merged in list(ws.merged_cells.ranges):
    if str(merged) == "B8:G8":
        ws.unmerge_cells("B8:G8")
        break

ws.merge_cells("B8:G8")
ws["B8"].value     = "عـرض الأسعـار  —  المقايسة التقديرية لأعمال التشطيب"
ws["B8"].font      = font(size=12, bold=True, color=BRAND_WHITE)
ws["B8"].alignment = align("center", "center", rtl=True)
ws["B8"].fill      = fill(BRAND_BLUE_DARKER)
style_range(ws, "B8:G8", fill_=fill(BRAND_BLUE_DARKER))

# ─────────────────────────────────────────────
#  SECTION 5: TABLE HEADER ROW (Row 9) — brand blue
# ─────────────────────────────────────────────
ws.row_dimensions[9].height = 30
HEADER_FONT   = font(size=10, bold=True, color=BRAND_WHITE)
HEADER_FILL   = fill(BRAND_BLUE_DARK)
HEADER_BORDER = border(color=BRAND_BLUE_PRIMARY,
                        left_s="thin", right_s="thin",
                        top_s="medium", bottom_s="medium")

for col in range(2, 8):
    c = ws.cell(row=9, column=col)
    c.font      = HEADER_FONT
    c.fill      = HEADER_FILL
    c.border    = HEADER_BORDER
    c.alignment = align("center", "center", wrap=True, rtl=True)

# ─────────────────────────────────────────────
#  SECTION 6: BOQ DATA ROWS (10-28) — re-brand alternating fill
# ─────────────────────────────────────────────
ALT_FILL_1    = fill(BRAND_WHITE)       # even rows
ALT_FILL_2    = fill(BRAND_BLUE_PALE)   # odd rows — brand-blue tint
TBD_FILL      = fill("FFFBEB")          # amber for TBD (keep)
DATA_BORDER   = border(color=BRAND_GRAY_BORDER)
DATA_BORDER_M = border(color=BRAND_BLUE_DARK,
                         left_s="medium", right_s="medium",
                         top_s="thin", bottom_s="thin")

for row in range(10, 29):
    idx = row - 10
    rf  = ALT_FILL_2 if idx % 2 == 0 else ALT_FILL_1

    for col in range(2, 8):
        c = ws.cell(row=row, column=col)
        # Don't overwrite TBD amber cells in col F
        if col == 6 and c.value == "يُحدد لاحقاً":
            c.fill = TBD_FILL
            c.font = font(size=9, color="92400E", italic=True)
        elif col == 4 and c.value == "—":
            c.fill = TBD_FILL
            c.font = font(size=9, color="92400E", italic=True)
        else:
            # Keep existing numeric formatting / formula, just recolor fill
            c.fill = rf

        # Re-style specific columns
        if col == 2:   # Item number
            c.font   = font(size=10, bold=True, color=BRAND_BLUE_DARK)
            c.border = DATA_BORDER_M
        elif col == 3:  # Description
            c.font   = font(size=9, color=BRAND_BLACK)
            c.border = DATA_BORDER
        elif col == 4:  # Qty
            if c.value != "—":
                c.font = font(size=10, bold=True, color=BRAND_BLACK)
            c.border = DATA_BORDER
        elif col == 5:  # Unit
            c.font   = font(size=9, color=BRAND_BLUE_DARK)
            c.border = DATA_BORDER
        elif col == 6:  # Unit Price
            if c.value != "يُحدد لاحقاً":
                c.font = font(size=10, bold=True, color="166534")
            c.border = DATA_BORDER
        elif col == 7:  # Total
            c.font   = font(size=10, bold=True, color=BRAND_BLUE_DARKER)
            c.border = DATA_BORDER_M

# ─────────────────────────────────────────────
#  SECTION 7: GRAND TOTAL ROW (Row 29) — brand blue
# ─────────────────────────────────────────────
ws.row_dimensions[29].height = 32

for merged in list(ws.merged_cells.ranges):
    if str(merged) == "B29:F29":
        ws.unmerge_cells("B29:F29")
        break

ws.merge_cells("B29:F29")
ws["B29"].value     = "الإجمالـــي العـــام   (غير شامل ضريبة القيمة المضافة إن وجدت)"
ws["B29"].font      = font(size=11, bold=True, color=BRAND_BLUE_DARKER)
ws["B29"].alignment = align("center", "center", rtl=True)
ws["B29"].fill      = fill(BRAND_BLUE_ICE)
ws["B29"].border    = med_border(BRAND_BLUE_DARK)
style_range(ws, "B29:F29",
            fill_=fill(BRAND_BLUE_ICE),
            border_=med_border(BRAND_BLUE_DARK))

gt = ws["G29"]
gt.font      = font(size=12, bold=True, color=BRAND_BLUE_DARKER)
gt.fill      = fill(BRAND_BLUE_PRIMARY)
gt.alignment = align("center", "center")
gt.border    = med_border(BRAND_BLUE_DARK)
gt.number_format = '#,##0" ج.م."'

# ─────────────────────────────────────────────
#  SECTION 8: TERMS BLOCK HEADERS — brand blue
# ─────────────────────────────────────────────
# Find terms start rows by scanning for header content
TERMS_HDR_ROW = None
for r in range(29, 50):
    val = ws.cell(row=r, column=2).value or ""
    if "طريقة" in str(val) or "سداد" in str(val):
        TERMS_HDR_ROW = r
        break

if TERMS_HDR_ROW:
    ws.row_dimensions[TERMS_HDR_ROW].height = 24

    for merged in list(ws.merged_cells.ranges):
        rng = str(merged)
        if rng == f"B{TERMS_HDR_ROW}:D{TERMS_HDR_ROW}":
            ws.unmerge_cells(rng)
        if rng == f"E{TERMS_HDR_ROW}:G{TERMS_HDR_ROW}":
            ws.unmerge_cells(rng)

    ws.merge_cells(f"B{TERMS_HDR_ROW}:D{TERMS_HDR_ROW}")
    ws[f"B{TERMS_HDR_ROW}"].value     = "💳  طريقة وجدول سداد الدفعات"
    ws[f"B{TERMS_HDR_ROW}"].font      = font(size=10, bold=True, color=BRAND_WHITE)
    ws[f"B{TERMS_HDR_ROW}"].alignment = align("center", "center", rtl=True)
    ws[f"B{TERMS_HDR_ROW}"].fill      = fill(BRAND_BLUE_ACCENT)
    style_range(ws, f"B{TERMS_HDR_ROW}:D{TERMS_HDR_ROW}",
                fill_=fill(BRAND_BLUE_ACCENT))

    ws.merge_cells(f"E{TERMS_HDR_ROW}:G{TERMS_HDR_ROW}")
    ws[f"E{TERMS_HDR_ROW}"].value     = "📋  الشروط والالتزامات العامة"
    ws[f"E{TERMS_HDR_ROW}"].font      = font(size=10, bold=True, color=BRAND_WHITE)
    ws[f"E{TERMS_HDR_ROW}"].alignment = align("center", "center", rtl=True)
    ws[f"E{TERMS_HDR_ROW}"].fill      = fill(BRAND_BLUE_ACCENT)
    style_range(ws, f"E{TERMS_HDR_ROW}:G{TERMS_HDR_ROW}",
                fill_=fill(BRAND_BLUE_ACCENT))

    # Re-color terms body rows (7 rows below header)
    for r in range(TERMS_HDR_ROW + 1, TERMS_HDR_ROW + 8):
        for col in range(2, 8):
            c = ws.cell(row=r, column=col)
            if c.value is not None or True:
                c.fill   = fill(BRAND_BLUE_PALE)
                c.border = border(color=BRAND_GRAY_BORDER)
                if c.value:
                    c.font = font(size=9, color=BRAND_BLACK)
                    c.alignment = align("right", "center", wrap=True, rtl=True)

# ─────────────────────────────────────────────
#  SECTION 9: SIGN-OFF HEADER — brand blue
# ─────────────────────────────────────────────
SIGNOFF_HDR_ROW = None
for r in range(35, 55):
    val = ws.cell(row=r, column=2).value or ""
    if "التوقيع والاعتماد" in str(val):
        SIGNOFF_HDR_ROW = r
        break

if SIGNOFF_HDR_ROW:
    ws.row_dimensions[SIGNOFF_HDR_ROW].height = 24

    for merged in list(ws.merged_cells.ranges):
        if str(merged) == f"B{SIGNOFF_HDR_ROW}:G{SIGNOFF_HDR_ROW}":
            ws.unmerge_cells(f"B{SIGNOFF_HDR_ROW}:G{SIGNOFF_HDR_ROW}")
            break

    ws.merge_cells(f"B{SIGNOFF_HDR_ROW}:G{SIGNOFF_HDR_ROW}")
    c = ws[f"B{SIGNOFF_HDR_ROW}"]
    c.value     = "التوقيع والاعتماد"
    c.font      = font(size=10, bold=True, color=BRAND_WHITE)
    c.alignment = align("center", "center", rtl=True)
    c.fill      = fill(BRAND_BLUE_DARK)
    style_range(ws, f"B{SIGNOFF_HDR_ROW}:G{SIGNOFF_HDR_ROW}",
                fill_=fill(BRAND_BLUE_DARK))

# ─────────────────────────────────────────────
#  SECTION 10: FOOTER ROW — brand blue accent bar
# ─────────────────────────────────────────────
FOOTER_ROW = None
for r in range(40, 60):
    val = ws.cell(row=r, column=2).value or ""
    if "المستثمرين" in str(val) or "هاتف" in str(val):
        FOOTER_ROW = r
        break

if FOOTER_ROW:
    # Gold bar above footer
    prev = FOOTER_ROW - 1
    for col in range(1, 8):
        ws.cell(row=prev, column=col).fill = fill(BRAND_BLUE_PRIMARY)

    ws.row_dimensions[FOOTER_ROW].height = 16
    for merged in list(ws.merged_cells.ranges):
        if str(merged) == f"B{FOOTER_ROW}:G{FOOTER_ROW}":
            ws.unmerge_cells(f"B{FOOTER_ROW}:G{FOOTER_ROW}")
            break

    ws.merge_cells(f"B{FOOTER_ROW}:G{FOOTER_ROW}")
    fc = ws[f"B{FOOTER_ROW}"]
    fc.value     = (
        "159 المستثمرين الجنوبية – التجمع الخامس – القاهرة  |  "
        "هاتف: 01220218181  —  01220218183  |  Multi Systems Engineering & Trading"
    )
    fc.font      = font(size=8, color=BRAND_BLUE_DARK, italic=True)
    fc.alignment = align("center", "center")
    fc.fill      = fill(BRAND_BLUE_PALE)

# ─────────────────────────────────────────────
#  SECTION 11: Print + freeze — unchanged but confirmed
# ─────────────────────────────────────────────
ws.freeze_panes = "C10"
ws.print_area   = f"A1:G{FOOTER_ROW or 47}"

# ─────────────────────────────────────────────
#  SAVE
# ─────────────────────────────────────────────
wb.save(XLSX_PATH)
print("[OK] Workbook updated and saved.")
print("[OK] Logo inserted at B2 (120x50 pt)")
print("[OK] Brand colors applied:")
print("     Primary Blue  : #40A0E0")
print("     Dark Blue     : #1A6DA8")
print("     Darker Blue   : #0D4F80")
print("     Light Blue    : #A0C0E0")
print("     Pale Blue     : #E8F4FB")
if TERMS_HDR_ROW:
    print(f"[OK] Terms header at row {TERMS_HDR_ROW}")
if SIGNOFF_HDR_ROW:
    print(f"[OK] Sign-off header at row {SIGNOFF_HDR_ROW}")
if FOOTER_ROW:
    print(f"[OK] Footer at row {FOOTER_ROW}")
