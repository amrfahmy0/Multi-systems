# -*- coding: utf-8 -*-
"""
Professional Excel Quotation Generator
Project: Celia Compound – Villa Fit-Out
Company: Multi Systems Engineering & Trading
Author: Senior Project Controls & Contracts Engineer
"""

import openpyxl
from openpyxl.styles import (
    Font, PatternFill, Alignment, Border, Side, GradientFill
)
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.page import PageMargins
from openpyxl.worksheet.views import SheetView
from datetime import date
import os

# ─────────────────────────────────────────────
#  COLOUR PALETTE
# ─────────────────────────────────────────────
C_NAVY_DARK   = "0F172A"   # Title text / Grand total text
C_NAVY_MID    = "1E293B"   # Table header background
C_NAVY_LIGHT  = "334155"   # Sub-header / label text
C_SLATE       = "64748B"   # Sub-title text
C_ICE         = "E2E8F0"   # Total row / Terms background
C_WHITE       = "FFFFFF"
C_GOLD        = "B7953A"   # Accent separator line
C_ALT_ROW     = "F8FAFC"   # Alternating row tint
C_BORDER_THIN = "CBD5E1"   # Light border lines
C_BORDER_MED  = "94A3B8"   # Medium border lines
C_GREEN_FILL  = "ECFDF5"   # Priced item highlight (not used for blank)

# ─────────────────────────────────────────────
#  FONT HELPERS
# ─────────────────────────────────────────────
FONT_FAMILY = "Segoe UI"

def font(size=10, bold=False, color=C_NAVY_DARK, italic=False, name=FONT_FAMILY):
    return Font(name=name, size=size, bold=bold, color=color, italic=italic)

def fill(hex_color):
    return PatternFill("solid", fgColor=hex_color)

def align(h="center", v="center", wrap=False, rtl=False):
    return Alignment(
        horizontal=h, vertical=v, wrap_text=wrap,
        readingOrder=2 if rtl else 1
    )

def border(
    left_style="thin", right_style="thin",
    top_style="thin", bottom_style="thin",
    color=C_BORDER_THIN
):
    s = lambda style: Side(style=style, color=color)
    return Border(
        left=s(left_style), right=s(right_style),
        top=s(top_style), bottom=s(bottom_style)
    )

def thick_border(color=C_NAVY_MID):
    s = lambda: Side(style="medium", color=color)
    return Border(left=s(), right=s(), top=s(), bottom=s())

def outer_border(color=C_NAVY_MID):
    med  = lambda: Side(style="medium", color=color)
    none = Side(style=None)
    return Border(left=med(), right=med(), top=med(), bottom=med())

# ─────────────────────────────────────────────
#  WORKBOOK SETUP
# ─────────────────────────────────────────────
wb = openpyxl.Workbook()
ws = wb.active
ws.title = "المقايسة التقديرية"

# RTL reading order
ws.sheet_view.rightToLeft = True
ws.sheet_view.showGridLines = True

# Page setup – A4 portrait, fit to width
ws.page_setup.paperSize  = ws.PAPERSIZE_A4
ws.page_setup.orientation = ws.ORIENTATION_PORTRAIT
ws.page_setup.fitToWidth  = 1
ws.page_setup.fitToHeight = 0
ws.sheet_properties.pageSetUpPr.fitToPage = True

# Page margins (cm → inches: 1 cm = 0.394 in)
ws.page_margins = PageMargins(
    left=0.5, right=0.5, top=0.75, bottom=0.75,
    header=0.3, footer=0.3
)

# ─────────────────────────────────────────────
#  COLUMN WIDTHS  (A B C D E F G)
# ─────────────────────────────────────────────
ws.column_dimensions["A"].width = 2.5     # Margin
ws.column_dimensions["B"].width = 8       # م
ws.column_dimensions["C"].width = 62      # Description
ws.column_dimensions["D"].width = 11      # Qty
ws.column_dimensions["E"].width = 13      # Unit
ws.column_dimensions["F"].width = 17      # Unit Price
ws.column_dimensions["G"].width = 19      # Total

# ─────────────────────────────────────────────
#  HELPER: apply to merged range
# ─────────────────────────────────────────────
def style_range(ws, cell_range, font_=None, fill_=None, align_=None, border_=None):
    """Apply style to every cell in a range (for merged cells, apply to anchor too)."""
    from openpyxl.utils import range_boundaries
    min_col, min_row, max_col, max_row = range_boundaries(cell_range)
    for row in ws.iter_rows(min_row=min_row, max_row=max_row,
                            min_col=min_col, max_col=max_col):
        for cell in row:
            if font_:  cell.font      = font_
            if fill_:  cell.fill      = fill_
            if align_: cell.alignment = align_
            if border_: cell.border   = border_

# ─────────────────────────────────────────────
#  LOGO / DECORATION  ROW 1
# ─────────────────────────────────────────────
# Gold accent bar – Row 1 Col A (thin, decorative)
ws.row_dimensions[1].height = 8
for col in "ABCDEFG":
    ws[f"{col}1"].fill = fill(C_GOLD)

# ─────────────────────────────────────────────
#  ROW 2 – Company Name
# ─────────────────────────────────────────────
ws.row_dimensions[2].height = 36
ws.merge_cells("B2:G2")
ws["B2"].value     = "شركة مالتي سيستيمز للهندسة والتجارة"
ws["B2"].font      = font(size=18, bold=True, color=C_NAVY_DARK)
ws["B2"].alignment = align("center", "center", rtl=True)
ws["B2"].fill      = fill(C_WHITE)

# ─────────────────────────────────────────────
#  ROW 3 – Sub-title
# ─────────────────────────────────────────────
ws.row_dimensions[3].height = 20
ws.merge_cells("B3:G3")
ws["B3"].value     = "Multi Systems for Engineering & Trading  |  أعمال المقاولات والتشطيبات المتكاملة"
ws["B3"].font      = font(size=9, color=C_SLATE, italic=True)
ws["B3"].alignment = align("center", "center")
ws["B3"].fill      = fill(C_WHITE)

# Light divider below row 3
for col in range(2, 8):
    ws.cell(row=3, column=col).border = Border(
        bottom=Side(style="thin", color=C_GOLD)
    )

# ─────────────────────────────────────────────
#  ROW 4 – Thin spacer
# ─────────────────────────────────────────────
ws.row_dimensions[4].height = 6

# ─────────────────────────────────────────────
#  ROW 5 – Project Info Block  (labels + values)
# ─────────────────────────────────────────────
ws.row_dimensions[5].height = 22
INFO_LABEL_FONT  = font(size=9, bold=True, color=C_NAVY_MID)
INFO_VALUE_FONT  = font(size=9, bold=False, color=C_NAVY_DARK)
INFO_FILL        = fill("EFF6FF")
INFO_BORDER      = border(color=C_BORDER_MED)
INFO_ALIGN_L     = align("right", "center", rtl=True)
INFO_ALIGN_V     = align("right", "center", rtl=True)

for col in range(2, 8):
    ws.cell(row=5, column=col).fill   = INFO_FILL
    ws.cell(row=5, column=col).border = INFO_BORDER

ws["B5"].value     = "العميل المحترم:"
ws["B5"].font      = INFO_LABEL_FONT
ws["B5"].alignment = INFO_ALIGN_L

ws.merge_cells("C5:D5")
ws["C5"].value     = "السيد الأستاذ / طارق صبحي"
ws["C5"].font      = font(size=9, bold=True, color=C_NAVY_DARK)
ws["C5"].alignment = INFO_ALIGN_V

ws["E5"].value     = "المشروع:"
ws["E5"].font      = INFO_LABEL_FONT
ws["E5"].alignment = INFO_ALIGN_L

ws.merge_cells("F5:G5")
ws["F5"].value     = "تشطيب فيلا سكنية – كمبوند سيليا"
ws["F5"].font      = font(size=9, bold=True, color=C_NAVY_DARK)
ws["F5"].alignment = INFO_ALIGN_V

# ─────────────────────────────────────────────
#  ROW 6 – Second info row
# ─────────────────────────────────────────────
ws.row_dimensions[6].height = 22

for col in range(2, 8):
    ws.cell(row=6, column=col).fill   = INFO_FILL
    ws.cell(row=6, column=col).border = INFO_BORDER

ws["B6"].value     = "الموقع:"
ws["B6"].font      = INFO_LABEL_FONT
ws["B6"].alignment = INFO_ALIGN_L

ws.merge_cells("C6:D6")
ws["C6"].value     = "سيليا – العاصمة الإدارية الجديدة"
ws["C6"].font      = INFO_VALUE_FONT
ws["C6"].alignment = INFO_ALIGN_V

ws["E6"].value     = "التاريخ:"
ws["E6"].font      = INFO_LABEL_FONT
ws["E6"].alignment = INFO_ALIGN_L

ws.merge_cells("F6:G6")
ws["F6"].value     = "08 / 09 / 2025"
ws["F6"].font      = font(size=9, color=C_NAVY_DARK)
ws["F6"].alignment = align("center", "center")

# ─────────────────────────────────────────────
#  ROW 7 – Thin spacer
# ─────────────────────────────────────────────
ws.row_dimensions[7].height = 6

# ─────────────────────────────────────────────
#  ROW 8 – Document Title Band
# ─────────────────────────────────────────────
ws.row_dimensions[8].height = 26
ws.merge_cells("B8:G8")
ws["B8"].value     = "عـرض الأسعـار  —  المقايسة التقديرية لأعمال التشطيب"
ws["B8"].font      = font(size=12, bold=True, color=C_WHITE)
ws["B8"].alignment = align("center", "center", rtl=True)
ws["B8"].fill      = fill(C_NAVY_DARK)

# ─────────────────────────────────────────────
#  ROW 9 – Table Column Headers
# ─────────────────────────────────────────────
ws.row_dimensions[9].height = 30
HEADER_FONT   = font(size=10, bold=True, color=C_WHITE)
HEADER_FILL   = fill(C_NAVY_MID)
HEADER_ALIGN  = align("center", "center", rtl=True)
HEADER_BORDER = border(color=C_WHITE, left_style="thin", right_style="thin",
                        top_style="thin", bottom_style="medium")

HEADERS = {
    "B": "م",
    "C": "بيان الأعمال وتوصيف المواصفات",
    "D": "الكمية",
    "E": "الوحدة",
    "F": "فئة السعر\n(ج.م.)",
    "G": "الإجمالي\n(ج.م.)",
}
for col_letter, header_text in HEADERS.items():
    cell = ws[f"{col_letter}9"]
    cell.value     = header_text
    cell.font      = HEADER_FONT
    cell.fill      = HEADER_FILL
    cell.alignment = align("center", "center", wrap=True, rtl=True)
    cell.border    = HEADER_BORDER

# ─────────────────────────────────────────────
#  BOQ DATA
# ─────────────────────────────────────────────
boq_items = [
    # (description, qty, unit, price)  — None = leave blank
    (
        "أعمال مصنعيات تشطيب السباكة للحمامات والمطبخ شامل أعمال المراجعة "
        "والاختبار للأعمال المنفذة\n(غير شامل الخامات)",
        1, "مقطوعية", 75000
    ),
    (
        "أعمال مصنعيات تشطيب الكهرباء ولوحة الكهرباء شامل أعمال المراجعة "
        "والاختبار للأعمال المنفذة\n(غير شامل الخامات)",
        1, "مقطوعية", 60000
    ),
    (
        "أعمال تركيب سيراميك أرضيات غرف النوم شامل خامات التركيب والتشوينات "
        "والسقية من مادة Tile Grout مقاومة للفطريات",
        30, "م²", 800
    ),
    (
        "أعمال توريد ما يلزم لتركيب بورسلين الحمامات والمطبخ شامل خامات التركيب "
        "والتشوينات والسقية من مادة Tile Grout مقاومة للفطريات\n(غير شامل البورسلين)",
        154, "م²", 1000
    ),
    (
        "أعمال توريد وتركيب أسقف من الجبسوم بورد الأخضر المقاوم للرطوبة (Knauf) "
        "وقطاعات صاج ثقيل 4 مم شامل المعجون وقطاع Shadow Gap\n(الحمامات والمطبخ)",
        27, "م²", 950
    ),
    (
        "أعمال توريد وتنفيذ دهانات للحوائط والأسقف: وجه تحضيري + 3 سكينة معجون "
        "+ 3 وجوه تشطيب من إنتاج شركة Sipes أو GLC\n(بدون ألوان خاصة)",
        450, "م²", 750
    ),
    (
        "توريد وتركيب أبواب خشب طبقاً للتصميم المطلوب\n(غير شامل الأكسسوار)",
        8, "عدد", 25000
    ),
    (
        "معجون فواصل أسقف الجبس المنفذة",
        100, "م²", 300
    ),
    (
        "توريد وتركيب باب الفيلا الرئيسي (يُحدد المواصفات والسعر لاحقاً)",
        1, "عدد", None
    ),
    (
        "أعمال تشطيب رخام الأرضيات (نوع الرخام والمواصفات يُتفق عليها)",
        60, "م²", None
    ),
    (
        "توريد وتركيب تجاليد خشبية (يُحدد النطاق والتصميم لاحقاً)",
        None, "مقطوعية", None
    ),
    (
        "توريد وتركيب شفاط سقف (عدد ومواصفات يُتفق عليها)",
        None, "عدد", None
    ),
    (
        "أعمال استكمال تركيبات وتشطيب السلم الرئيسي",
        None, "مقطوعية", None
    ),
    (
        "أعمال توريد وتركيب شاتر (المساحة والمواصفات يُتفق عليها)",
        None, "عدد / م²", None
    ),
    (
        "أعمال توريد وتركيب هاندريل (حديد / ستيل مقاوم للصدأ)",
        None, "م.ط", None
    ),
    (
        "أعمال خارجية ولاندسكيب (يُحدد النطاق التفصيلي لاحقاً)",
        None, "مقطوعية", None
    ),
    (
        "وحدات الحمام (سيراميك + إكسسوار صحي — المواصفات يُتفق عليها)",
        None, "عدد", None
    ),
    (
        "وحدة مطبخ (تصميم وخامات يُتفق عليها مع العميل)",
        None, "مقطوعية", None
    ),
    (
        "سفرة (تصميم وخامات يُتفق عليها مع العميل)",
        None, "مقطوعية", None
    ),
]

# ─────────────────────────────────────────────
#  WRITE BOQ ROWS  (rows 10 to 28)
# ─────────────────────────────────────────────
PRICED_FILL = fill(C_WHITE)
BLANK_FILL  = fill("FFFBEB")   # Light amber for TBD cells
ALT_FILL    = fill(C_ALT_ROW)

DATA_BORDER    = border(color=C_BORDER_THIN)
DATA_BORDER_MED= border(color=C_BORDER_MED)

NUM_FMT_COMMA = '#,##0'
NUM_FMT_PRICE = '#,##0" ج.م."'

START_ROW = 10

for idx, (desc, qty, unit, price) in enumerate(boq_items):
    row = START_ROW + idx
    ws.row_dimensions[row].height = 40 if "\n" in desc else 32

    row_fill = ALT_FILL if idx % 2 == 0 else PRICED_FILL

    # Col A – margin (no style)
    ws.cell(row=row, column=1).fill = fill(C_WHITE)

    # Col B – Item number
    b = ws.cell(row=row, column=2)
    b.value     = idx + 1
    b.font      = font(size=10, bold=True, color=C_NAVY_MID)
    b.alignment = align("center", "center")
    b.fill      = row_fill
    b.border    = DATA_BORDER_MED

    # Col C – Description
    c = ws.cell(row=row, column=3)
    c.value     = desc
    c.font      = font(size=9, color=C_NAVY_DARK)
    c.alignment = align("right", "center", wrap=True, rtl=True)
    c.fill      = row_fill
    c.border    = DATA_BORDER

    # Col D – Quantity
    d = ws.cell(row=row, column=4)
    if qty is not None:
        d.value        = qty
        d.number_format = NUM_FMT_COMMA
        d.font         = font(size=10, bold=True, color=C_NAVY_DARK)
        d.fill         = row_fill
    else:
        d.fill = BLANK_FILL
        d.font = font(size=9, color=C_SLATE, italic=True)
        d.value = "—"
    d.alignment = align("center", "center")
    d.border    = DATA_BORDER

    # Col E – Unit
    e = ws.cell(row=row, column=5)
    e.value     = unit
    e.font      = font(size=9, color=C_NAVY_LIGHT)
    e.alignment = align("center", "center", rtl=True)
    e.fill      = row_fill
    e.border    = DATA_BORDER

    # Col F – Unit Price
    f = ws.cell(row=row, column=6)
    if price is not None:
        f.value         = price
        f.number_format = NUM_FMT_COMMA
        f.font          = font(size=10, bold=True, color="166534")   # dark green
        f.fill          = row_fill
    else:
        f.fill  = BLANK_FILL
        f.font  = font(size=9, color=C_SLATE, italic=True)
        f.value = "يُحدد لاحقاً"
    f.alignment = align("center", "center")
    f.border    = DATA_BORDER

    # Col G – Total formula
    g = ws.cell(row=row, column=7)
    g.value         = f'=IF(OR(D{row}="",F{row}="",D{row}="—",F{row}="يُحدد لاحقاً"),0,D{row}*F{row})'
    g.number_format = '#,##0'
    g.font          = font(size=10, bold=True, color=C_NAVY_DARK)
    g.alignment     = align("center", "center")
    g.fill          = row_fill
    g.border        = DATA_BORDER_MED

# ─────────────────────────────────────────────
#  ROW 29 – Sub-total Separator Label
# ─────────────────────────────────────────────
TOTAL_ROW = START_ROW + len(boq_items)  # = 29

ws.row_dimensions[TOTAL_ROW].height = 30
ws.merge_cells(f"B{TOTAL_ROW}:F{TOTAL_ROW}")

tc = ws[f"B{TOTAL_ROW}"]
tc.value     = "الإجمالـــي العـــام   (غير شامل ضريبة القيمة المضافة إن وجدت)"
tc.font      = font(size=11, bold=True, color=C_NAVY_DARK)
tc.alignment = align("center", "center", rtl=True)
tc.fill      = fill(C_ICE)

style_range(ws, f"B{TOTAL_ROW}:F{TOTAL_ROW}",
            fill_=fill(C_ICE),
            border_=border(color=C_NAVY_MID, left_style="medium",
                            right_style="medium", top_style="medium",
                            bottom_style="medium"))

gt = ws.cell(row=TOTAL_ROW, column=7)
gt.value         = f"=SUM(G{START_ROW}:G{TOTAL_ROW-1})"
gt.number_format = '#,##0" ج.م."'
gt.font          = font(size=12, bold=True, color=C_NAVY_DARK)
gt.alignment     = align("center", "center")
gt.fill          = fill("DBEAFE")   # light blue for grand total
gt.border        = border(color=C_NAVY_MID, left_style="medium",
                           right_style="medium", top_style="medium",
                           bottom_style="medium")

# ─────────────────────────────────────────────
#  ROWS 31-32 – Thin separator spacer
# ─────────────────────────────────────────────
TERMS_START = TOTAL_ROW + 2   # 31

ws.row_dimensions[TERMS_START - 1].height = 6

# ─────────────────────────────────────────────
#  TERMS & CONDITIONS BLOCKS
# ─────────────────────────────────────────────
# Block headers
ws.row_dimensions[TERMS_START].height = 24
ws.merge_cells(f"B{TERMS_START}:D{TERMS_START}")
ws[f"B{TERMS_START}"].value     = "💳  طريقة وجدول سداد الدفعات"
ws[f"B{TERMS_START}"].font      = font(size=10, bold=True, color=C_WHITE)
ws[f"B{TERMS_START}"].alignment = align("center", "center", rtl=True)
ws[f"B{TERMS_START}"].fill      = fill(C_NAVY_MID)

style_range(ws, f"B{TERMS_START}:D{TERMS_START}", fill_=fill(C_NAVY_MID))

ws.merge_cells(f"E{TERMS_START}:G{TERMS_START}")
ws[f"E{TERMS_START}"].value     = "📋  الشروط والالتزامات العامة"
ws[f"E{TERMS_START}"].font      = font(size=10, bold=True, color=C_WHITE)
ws[f"E{TERMS_START}"].alignment = align("center", "center", rtl=True)
ws[f"E{TERMS_START}"].fill      = fill(C_NAVY_MID)

style_range(ws, f"E{TERMS_START}:G{TERMS_START}", fill_=fill(C_NAVY_MID))

# Payment terms rows
payment_terms = [
    "•  50%  دفعة مقدمة عند التعاقد وتجهيز الموقع",
    "•  25%  دفعة تشوينات عند توريد الخامات الأساسية",
    "•  25%  بعد انتهاء كافة الأعمال والتسليم النهائي",
    "",  # spacer
    "🏦  يُرجى إصدار الشيكات باسم:",
    "      شركة مالتي سيستيمز للهندسة والتجارة",
]

general_terms = [
    "•  صلاحية هذا العرض: 7 أيام من تاريخه.",
    "•  الكميات تقريبية والعبرة بما يُنفَّذ ويُقاس على الطبيعة.",
    "•  مدة التنفيذ: 60 يوم عمل (غير شاملة الإجازات الرسمية).",
    "•  التصاريح والموافقات من إدارة الكومبوند مسؤولية العميل.",
    "•  أي أعمال إضافية خارج النطاق تستوجب أمر تغيير موقّع.",
    "•  ضريبة القيمة المضافة تُضاف وفقاً للتشريعات النافذة.",
]

# Ensure equal length
max_t = max(len(payment_terms), len(general_terms))
payment_terms += [""] * (max_t - len(payment_terms))
general_terms  += [""] * (max_t - len(general_terms))

TERMS_FILL  = fill("F0F9FF")
TERMS_FONT  = font(size=9, color=C_NAVY_DARK)
TERMS_ALIGN = align("right", "center", wrap=True, rtl=True)

for i, (pt, gt_t) in enumerate(zip(payment_terms, general_terms)):
    r = TERMS_START + 1 + i
    ws.row_dimensions[r].height = 18 if pt or gt_t else 4

    ws.merge_cells(f"B{r}:D{r}")
    cell_p = ws[f"B{r}"]
    cell_p.value     = pt
    cell_p.font      = TERMS_FONT
    cell_p.alignment = TERMS_ALIGN
    cell_p.fill      = TERMS_FILL
    cell_p.border    = border(color=C_BORDER_THIN)
    style_range(ws, f"B{r}:D{r}", fill_=TERMS_FILL, border_=border(color=C_BORDER_THIN))

    ws.merge_cells(f"E{r}:G{r}")
    cell_g = ws[f"E{r}"]
    cell_g.value     = gt_t
    cell_g.font      = TERMS_FONT
    cell_g.alignment = TERMS_ALIGN
    cell_g.fill      = TERMS_FILL
    cell_g.border    = border(color=C_BORDER_THIN)
    style_range(ws, f"E{r}:G{r}", fill_=TERMS_FILL, border_=border(color=C_BORDER_THIN))

# ─────────────────────────────────────────────
#  SIGN-OFF SECTION
# ─────────────────────────────────────────────
SIGN_ROW = TERMS_START + 1 + max_t + 2

ws.row_dimensions[SIGN_ROW].height = 6
ws.row_dimensions[SIGN_ROW + 1].height = 24
ws.row_dimensions[SIGN_ROW + 2].height = 22
ws.row_dimensions[SIGN_ROW + 3].height = 26
ws.row_dimensions[SIGN_ROW + 4].height = 22

# Sign-off header
ws.merge_cells(f"B{SIGN_ROW+1}:G{SIGN_ROW+1}")
ws[f"B{SIGN_ROW+1}"].value     = "التوقيع والاعتماد"
ws[f"B{SIGN_ROW+1}"].font      = font(size=10, bold=True, color=C_WHITE)
ws[f"B{SIGN_ROW+1}"].alignment = align("center", "center", rtl=True)
ws[f"B{SIGN_ROW+1}"].fill      = fill(C_NAVY_DARK)
style_range(ws, f"B{SIGN_ROW+1}:G{SIGN_ROW+1}", fill_=fill(C_NAVY_DARK))

# Executor block
ws.merge_cells(f"B{SIGN_ROW+2}:D{SIGN_ROW+2}")
ws[f"B{SIGN_ROW+2}"].value     = "الجهة المنفذة"
ws[f"B{SIGN_ROW+2}"].font      = font(size=9, bold=True, color=C_NAVY_MID)
ws[f"B{SIGN_ROW+2}"].alignment = align("center", "center", rtl=True)
ws[f"B{SIGN_ROW+2}"].fill      = fill(C_ICE)
ws[f"B{SIGN_ROW+2}"].border    = border(color=C_BORDER_MED)
style_range(ws, f"B{SIGN_ROW+2}:D{SIGN_ROW+2}", fill_=fill(C_ICE), border_=border(color=C_BORDER_MED))

ws.merge_cells(f"E{SIGN_ROW+2}:G{SIGN_ROW+2}")
ws[f"E{SIGN_ROW+2}"].value     = "اعتماد وموافقة العميل"
ws[f"E{SIGN_ROW+2}"].font      = font(size=9, bold=True, color=C_NAVY_MID)
ws[f"E{SIGN_ROW+2}"].alignment = align("center", "center", rtl=True)
ws[f"E{SIGN_ROW+2}"].fill      = fill(C_ICE)
ws[f"E{SIGN_ROW+2}"].border    = border(color=C_BORDER_MED)
style_range(ws, f"E{SIGN_ROW+2}:G{SIGN_ROW+2}", fill_=fill(C_ICE), border_=border(color=C_BORDER_MED))

# Names
ws.merge_cells(f"B{SIGN_ROW+3}:D{SIGN_ROW+3}")
ws[f"B{SIGN_ROW+3}"].value     = "شركة مالتي سيستيمز  —  م / محمد فهمي"
ws[f"B{SIGN_ROW+3}"].font      = font(size=10, bold=True, color=C_NAVY_DARK)
ws[f"B{SIGN_ROW+3}"].alignment = align("center", "center", rtl=True)
ws[f"B{SIGN_ROW+3}"].fill      = fill(C_WHITE)
ws[f"B{SIGN_ROW+3}"].border    = border(color=C_BORDER_MED)
style_range(ws, f"B{SIGN_ROW+3}:D{SIGN_ROW+3}", fill_=fill(C_WHITE), border_=border(color=C_BORDER_MED))

ws.merge_cells(f"E{SIGN_ROW+3}:G{SIGN_ROW+3}")
ws[f"E{SIGN_ROW+3}"].value     = "أ / طارق صبحي"
ws[f"E{SIGN_ROW+3}"].font      = font(size=10, bold=True, color=C_NAVY_DARK)
ws[f"E{SIGN_ROW+3}"].alignment = align("center", "center", rtl=True)
ws[f"E{SIGN_ROW+3}"].fill      = fill(C_WHITE)
ws[f"E{SIGN_ROW+3}"].border    = border(color=C_BORDER_MED)
style_range(ws, f"E{SIGN_ROW+3}:G{SIGN_ROW+3}", fill_=fill(C_WHITE), border_=border(color=C_BORDER_MED))

# Signature lines row
# sign-off signature row
ws.merge_cells(f"B{SIGN_ROW+4}:D{SIGN_ROW+4}")
ws[f"B{SIGN_ROW+4}"].value     = "التوقيع: ________________________"
ws[f"B{SIGN_ROW+4}"].font      = font(size=9, color=C_SLATE, italic=True)
ws[f"B{SIGN_ROW+4}"].alignment = align("center", "center")
ws[f"B{SIGN_ROW+4}"].fill      = fill(C_WHITE)
ws[f"B{SIGN_ROW+4}"].border    = border(color=C_BORDER_THIN)
style_range(ws, f"B{SIGN_ROW+4}:D{SIGN_ROW+4}", fill_=fill(C_WHITE), border_=border(color=C_BORDER_THIN))

ws.merge_cells(f"E{SIGN_ROW+4}:G{SIGN_ROW+4}")
ws[f"E{SIGN_ROW+4}"].value     = "التوقيع: ________________________"
ws[f"E{SIGN_ROW+4}"].font      = font(size=9, color=C_SLATE, italic=True)
ws[f"E{SIGN_ROW+4}"].alignment = align("center", "center")
ws[f"E{SIGN_ROW+4}"].fill      = fill(C_WHITE)
ws[f"E{SIGN_ROW+4}"].border    = border(color=C_BORDER_THIN)
style_range(ws, f"E{SIGN_ROW+4}:G{SIGN_ROW+4}", fill_=fill(C_WHITE), border_=border(color=C_BORDER_THIN))

# ─────────────────────────────────────────────
#  FOOTER
# ─────────────────────────────────────────────
FOOTER_ROW = SIGN_ROW + 7

ws.row_dimensions[FOOTER_ROW - 1].height = 8
ws.row_dimensions[FOOTER_ROW].height     = 14

# Gold separator
for col in range(2, 8):
    ws.cell(row=FOOTER_ROW - 1, column=col).fill = fill(C_GOLD)

ws.merge_cells(f"B{FOOTER_ROW}:G{FOOTER_ROW}")
ws[f"B{FOOTER_ROW}"].value = (
    "159 المستثمرين الجنوبية – التجمع الخامس – القاهرة  |  "
    "هاتف: 01220218181  —  01220218183"
)
ws[f"B{FOOTER_ROW}"].font      = font(size=8, color=C_SLATE, italic=True)
ws[f"B{FOOTER_ROW}"].alignment = align("center", "center")

# ─────────────────────────────────────────────
#  FREEZE PANES at header row
# ─────────────────────────────────────────────
ws.freeze_panes = "C10"

# ─────────────────────────────────────────────
#  PRINT AREA
# ─────────────────────────────────────────────
ws.print_area = f"A1:G{FOOTER_ROW}"
ws.print_title_rows = "9:9"   # Repeat header row on every printed page

# ─────────────────────────────────────────────
#  SAVE
# ─────────────────────────────────────────────
output_path = r"d:\hp 2023\Fahmy University\Celia Quotation\quotation_celia_clean.xlsx"
wb.save(output_path)
print("[OK] File saved successfully:")
print("     " + output_path)
print(f"     BOQ rows: {len(boq_items)} items (rows {START_ROW}-{START_ROW+len(boq_items)-1})")
print(f"     Grand total row: {TOTAL_ROW}")
print(f"     Terms start row: {TERMS_START}")
print(f"     Sign-off row:    {SIGN_ROW+1}")
print(f"     Footer row:      {FOOTER_ROW}")
