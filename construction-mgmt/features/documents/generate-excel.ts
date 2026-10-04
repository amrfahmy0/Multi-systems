"use server";

import ExcelJS from "exceljs";
import { type QuotationFormData } from "@/lib/validations";

// Brand Palette
const BRAND_BLUE_PRIMARY = "FF40A0E0";
const BRAND_BLUE_DARK = "FF1A6DA8";
const BRAND_BLUE_DARKER = "FF0D4F80";
const BRAND_BLUE_LIGHT = "FFA0C0E0";
const BRAND_BLUE_PALE = "FFE8F4FB";
const BRAND_BLUE_ICE = "FFD0E8F5";
const BRAND_BLUE_ACCENT = "FF2988C8";
const BRAND_BLACK = "FF1A1A1A";
const BRAND_WHITE = "FFFFFFFF";
const BRAND_GOLD = "FFB7953A";
const BRAND_GRAY_BORDER = "FFB8D4EA";

const FONT_FAMILY = "Segoe UI";

function font(size = 10, bold = false, color = BRAND_BLACK, italic = false) {
  return { name: FONT_FAMILY, size, bold, color: { argb: color }, italic };
}

function fill(hex: string): ExcelJS.FillPattern {
  return { type: "pattern", pattern: "solid", fgColor: { argb: hex } };
}

function align(h: "left" | "center" | "right" = "center", v: "top" | "middle" | "bottom" = "middle", wrap = false, rtl = false): Partial<ExcelJS.Alignment> {
  return { horizontal: h, vertical: v, wrapText: wrap, readingOrder: rtl ? "rtl" : "ltr" };
}

function border(color = BRAND_GRAY_BORDER, style: ExcelJS.BorderStyle = "thin"): Partial<ExcelJS.Borders> {
  return {
    top: { style, color: { argb: color } },
    left: { style, color: { argb: color } },
    bottom: { style, color: { argb: color } },
    right: { style, color: { argb: color } },
  };
}

export async function generateQuotationExcel(data: QuotationFormData): Promise<string> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("المقايسة التقديرية", {
    views: [{ rightToLeft: true, showGridLines: true }],
    pageSetup: {
      paperSize: 9, // A4
      orientation: "portrait",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 }
    }
  });

  // Columns Widths
  ws.getColumn("A").width = 2.5;
  ws.getColumn("B").width = 8;
  ws.getColumn("C").width = 62;
  ws.getColumn("D").width = 11;
  ws.getColumn("E").width = 13;
  ws.getColumn("F").width = 17;
  ws.getColumn("G").width = 19;

  // Row 1 - Brand top bar
  ws.getRow(1).height = 8;
  for (let i = 1; i <= 7; i++) {
    ws.getCell(1, i).fill = fill(BRAND_BLUE_DARKER);
  }
  ws.getCell("A1").fill = fill(BRAND_GOLD); // Gold marker

  // Row 2 - Logo + Company
  ws.getRow(2).height = 58;
  for (let i = 1; i <= 7; i++) {
    const c = ws.getCell(2, i);
    c.fill = fill(BRAND_WHITE);
    c.border = { bottom: { style: "medium", color: { argb: BRAND_BLUE_PRIMARY } } };
  }
  ws.mergeCells("D2:G2");
  const d2 = ws.getCell("D2");
  d2.value = data.company_name || "شركة مالتي سيستيمز للهندسة والتجارة";
  d2.font = font(17, true, BRAND_BLUE_DARKER);
  d2.alignment = align("right", "middle", false, true);

  // Row 3 - Subtitle
  ws.getRow(3).height = 20;
  ws.mergeCells("B3:G3");
  const b3 = ws.getCell("B3");
  b3.value = "Multi Systems for Engineering & Trading  |  أعمال المقاولات والتشطيبات المتكاملة  |  New Cairo, Egypt";
  b3.font = font(9, false, BRAND_BLUE_DARK, true);
  b3.alignment = align("center", "middle");
  b3.fill = fill(BRAND_BLUE_PALE);
  for (let i = 2; i <= 7; i++) {
    ws.getCell(3, i).border = { 
      top: { style: "thin", color: { argb: BRAND_BLUE_PRIMARY } },
      bottom: { style: "thin", color: { argb: BRAND_BLUE_PRIMARY } }
    };
  }

  // Row 4 - Spacer
  ws.getRow(4).height = 6;

  const INFO_FILL = fill(BRAND_BLUE_PALE);
  const INFO_BORDER = border(BRAND_GRAY_BORDER);

  // Row 5
  ws.getRow(5).height = 22;
  for (let i = 2; i <= 7; i++) {
    const cell = ws.getCell(5, i);
    cell.fill = INFO_FILL;
    cell.border = INFO_BORDER;
  }
  const b5 = ws.getCell("B5");
  b5.value = "العميل المحترم:";
  b5.font = font(9, true, BRAND_BLUE_DARK);
  b5.alignment = align("right", "middle", false, true);
  
  ws.mergeCells("C5:D5");
  const c5 = ws.getCell("C5");
  c5.value = `السيد / ${data.client_name}`;
  c5.font = font(9, true, BRAND_BLACK);
  c5.alignment = align("right", "middle", false, true);

  const e5 = ws.getCell("E5");
  e5.value = "المشروع:";
  e5.font = font(9, true, BRAND_BLUE_DARK);
  e5.alignment = align("right", "middle", false, true);

  ws.mergeCells("F5:G5");
  const f5 = ws.getCell("F5");
  f5.value = data.project_name;
  f5.font = font(9, true, BRAND_BLACK);
  f5.alignment = align("right", "middle", false, true);

  // Row 6
  ws.getRow(6).height = 22;
  for (let i = 2; i <= 7; i++) {
    const cell = ws.getCell(6, i);
    cell.fill = INFO_FILL;
    cell.border = INFO_BORDER;
  }
  const b6 = ws.getCell("B6");
  b6.value = "الموقع:";
  b6.font = font(9, true, BRAND_BLUE_DARK);
  b6.alignment = align("right", "middle", false, true);

  ws.mergeCells("C6:D6");
  const c6 = ws.getCell("C6");
  c6.value = data.location || "";
  c6.font = font(9, true, BRAND_BLACK);
  c6.alignment = align("right", "middle", false, true);

  const e6 = ws.getCell("E6");
  e6.value = "التاريخ:";
  e6.font = font(9, true, BRAND_BLUE_DARK);
  e6.alignment = align("right", "middle", false, true);

  ws.mergeCells("F6:G6");
  const f6 = ws.getCell("F6");
  const d = new Date(data.quotation_date || Date.now());
  f6.value = `${d.getDate().toString().padStart(2, "0")} / ${(d.getMonth() + 1).toString().padStart(2, "0")} / ${d.getFullYear()}`;
  f6.font = font(9, true, BRAND_BLACK);
  f6.alignment = align("center", "middle");

  // Row 7 - Spacer
  ws.getRow(7).height = 6;

  // Row 8 - Title Band
  ws.getRow(8).height = 28;
  ws.mergeCells("B8:G8");
  const b8 = ws.getCell("B8");
  b8.value = "عـرض الأسعـار  —  المقايسة التقديرية لأعمال التشطيب";
  b8.font = font(12, true, BRAND_WHITE);
  b8.alignment = align("center", "middle", false, true);
  b8.fill = fill(BRAND_BLUE_DARKER);

  // Row 9 - Headers
  ws.getRow(9).height = 30;
  const headers = ["م", "بيان الأعمال وتوصيف المواصفات", "الكمية", "الوحدة", "فئة السعر\n(ج.م.)", "الإجمالي\n(ج.م.)"];
  for (let i = 0; i < headers.length; i++) {
    const c = ws.getCell(9, i + 2);
    c.value = headers[i];
    c.font = font(10, true, BRAND_WHITE);
    c.fill = fill(BRAND_BLUE_DARK);
    c.alignment = align("center", "middle", true, true);
    c.border = { top: { style: "medium", color: { argb: BRAND_BLUE_PRIMARY } }, bottom: { style: "medium", color: { argb: BRAND_BLUE_PRIMARY } }, left: { style: "thin", color: { argb: BRAND_BLUE_PRIMARY } }, right: { style: "thin", color: { argb: BRAND_BLUE_PRIMARY } } };
  }

  // Items
  let startRow = 10;
  let subtotal = 0;
  data.items.forEach((item, idx) => {
    const row = startRow + idx;
    ws.getRow(row).height = item.description.includes("\n") || item.description.length > 80 ? 40 : 32;
    const rowFill = idx % 2 === 0 ? fill(BRAND_BLUE_PALE) : fill(BRAND_WHITE);
    const borderM = {
      left: { style: "medium" as any, color: { argb: BRAND_BLUE_DARK } },
      right: { style: "medium" as any, color: { argb: BRAND_BLUE_DARK } },
      top: { style: "thin" as any, color: { argb: BRAND_BLUE_DARK } },
      bottom: { style: "thin" as any, color: { argb: BRAND_BLUE_DARK } }
    };

    ws.getCell(row, 1).fill = fill(BRAND_WHITE); // margin

    const b = ws.getCell(row, 2);
    b.value = idx + 1;
    b.font = font(10, true, BRAND_BLUE_DARK);
    b.alignment = align("center", "middle");
    b.fill = rowFill;
    b.border = borderM;

    const c = ws.getCell(row, 3);
    c.value = item.description;
    c.font = font(9, false, BRAND_BLACK);
    c.alignment = align("right", "middle", true, true);
    c.fill = rowFill;
    c.border = border(BRAND_GRAY_BORDER);

    const dCell = ws.getCell(row, 4);
    if (item.quantity > 0) {
      dCell.value = item.quantity;
      dCell.numFmt = '#,##0';
      dCell.font = font(10, true, BRAND_BLACK);
    } else {
      dCell.value = "—";
      dCell.font = font(9, false, "FF92400E", true);
    }
    dCell.fill = item.quantity <= 0 ? fill("FFFFFBEB") : rowFill;
    dCell.alignment = align("center", "middle");
    dCell.border = border(BRAND_GRAY_BORDER);

    const e = ws.getCell(row, 5);
    e.value = item.unit;
    e.font = font(9, false, BRAND_BLUE_DARK);
    e.alignment = align("center", "middle", false, true);
    e.fill = rowFill;
    e.border = border(BRAND_GRAY_BORDER);

    const f = ws.getCell(row, 6);
    if (item.unit_price > 0) {
      f.value = item.unit_price;
      f.numFmt = '#,##0';
      f.font = font(10, true, "FF166534");
    } else {
      f.value = "يُحدد لاحقاً";
      f.font = font(9, false, "FF92400E", true);
    }
    f.fill = item.unit_price <= 0 ? fill("FFFFFBEB") : rowFill;
    f.alignment = align("center", "middle");
    f.border = border(BRAND_GRAY_BORDER);

    const g = ws.getCell(row, 7);
    const itemTotal = (item.quantity || 0) * (item.unit_price || 0);
    g.value = itemTotal > 0 ? itemTotal : 0;
    g.numFmt = '#,##0';
    g.font = font(10, true, BRAND_BLUE_DARKER);
    g.alignment = align("center", "middle");
    g.fill = rowFill;
    g.border = borderM;

    subtotal += itemTotal;
  });

  const totalRow = startRow + data.items.length;
  ws.getRow(totalRow).height = 32;
  ws.mergeCells(`B${totalRow}:F${totalRow}`);
  const tc = ws.getCell(`B${totalRow}`);
  tc.value = "الإجمالـــي العـــام   (غير شامل ضريبة القيمة المضافة إن وجدت)";
  tc.font = font(11, true, BRAND_BLUE_DARKER);
  tc.alignment = align("center", "middle", false, true);
  tc.fill = fill(BRAND_BLUE_ICE);

  for (let i = 2; i <= 6; i++) {
    const c = ws.getCell(totalRow, i);
    c.fill = fill(BRAND_BLUE_ICE);
    c.border = { top: { style: "medium", color: { argb: BRAND_BLUE_DARK } }, bottom: { style: "medium", color: { argb: BRAND_BLUE_DARK } } };
  }
  ws.getCell(totalRow, 2).border.left = { style: "medium", color: { argb: BRAND_BLUE_DARK } };

  const tg = ws.getCell(totalRow, 7);
  tg.value = subtotal;
  tg.numFmt = '#,##0" ج.م."';
  tg.font = font(12, true, BRAND_BLUE_DARKER);
  tg.alignment = align("center", "middle");
  tg.fill = fill(BRAND_BLUE_PRIMARY);
  tg.border = { top: { style: "medium", color: { argb: BRAND_BLUE_DARK } }, bottom: { style: "medium", color: { argb: BRAND_BLUE_DARK } }, left: { style: "medium", color: { argb: BRAND_BLUE_DARK } }, right: { style: "medium", color: { argb: BRAND_BLUE_DARK } } };

  // Terms and conditions
  const termsHdrRow = totalRow + 2;
  ws.getRow(termsHdrRow).height = 24;
  ws.mergeCells(`B${termsHdrRow}:D${termsHdrRow}`);
  const bTerms = ws.getCell(`B${termsHdrRow}`);
  bTerms.value = "💳  طريقة وجدول سداد الدفعات";
  bTerms.font = font(10, true, BRAND_WHITE);
  bTerms.alignment = align("center", "middle", false, true);
  bTerms.fill = fill(BRAND_BLUE_ACCENT);

  ws.mergeCells(`E${termsHdrRow}:G${termsHdrRow}`);
  const eTerms = ws.getCell(`E${termsHdrRow}`);
  eTerms.value = "📋  الشروط والالتزامات العامة";
  eTerms.font = font(10, true, BRAND_WHITE);
  eTerms.alignment = align("center", "middle", false, true);
  eTerms.fill = fill(BRAND_BLUE_ACCENT);

  const termsData = [
    ["•  50%  دفعة مقدمة عند التعاقد وتجهيز الموقع", "•  صلاحية هذا العرض: 7 أيام من تاريخه."],
    ["•  25%  دفعة تشوينات عند توريد الخامات الأساسية", "•  الكميات تقريبية والعبرة بما يُنفَّذ ويُقاس على الطبيعة."],
    ["•  25%  بعد انتهاء كافة الأعمال والتسليم النهائي", "•  مدة التنفيذ: 60 يوم عمل (غير شاملة الإجازات الرسمية)."]
  ];
  if (data.notes) termsData.push(["", `•  ${data.notes}`]);

  termsData.forEach((rowTexts, idx) => {
    const r = termsHdrRow + 1 + idx;
    ws.getRow(r).height = 20;
    
    ws.mergeCells(`B${r}:D${r}`);
    const cellL = ws.getCell(`B${r}`);
    cellL.value = rowTexts[0];
    cellL.font = font(9, false, BRAND_BLACK);
    cellL.alignment = align("right", "middle", false, true);
    cellL.fill = fill(BRAND_BLUE_PALE);
    for (let c = 2; c <= 4; c++) ws.getCell(r, c).border = border(BRAND_GRAY_BORDER);

    ws.mergeCells(`E${r}:G${r}`);
    const cellR = ws.getCell(`E${r}`);
    cellR.value = rowTexts[1];
    cellR.font = font(9, false, BRAND_BLACK);
    cellR.alignment = align("right", "middle", false, true);
    cellR.fill = fill(BRAND_BLUE_PALE);
    for (let c = 5; c <= 7; c++) ws.getCell(r, c).border = border(BRAND_GRAY_BORDER);
  });

  // Signatures
  const sigRow = termsHdrRow + termsData.length + 2;
  ws.getRow(sigRow).height = 24;
  ws.mergeCells(`B${sigRow}:G${sigRow}`);
  const sigHdr = ws.getCell(`B${sigRow}`);
  sigHdr.value = "التوقيع والاعتماد";
  sigHdr.font = font(10, true, BRAND_WHITE);
  sigHdr.alignment = align("center", "middle", false, true);
  sigHdr.fill = fill(BRAND_BLUE_DARK);

  const sigLabelsRow = sigRow + 1;
  ws.getRow(sigLabelsRow).height = 24;
  ws.mergeCells(`B${sigLabelsRow}:D${sigLabelsRow}`);
  ws.getCell(`B${sigLabelsRow}`).value = "الجهة المنفذة";
  ws.getCell(`B${sigLabelsRow}`).font = font(10, true, BRAND_BLACK);
  ws.getCell(`B${sigLabelsRow}`).alignment = align("center", "middle", false, true);
  ws.getCell(`B${sigLabelsRow}`).fill = fill("FFE2E8F0");

  ws.mergeCells(`E${sigLabelsRow}:G${sigLabelsRow}`);
  ws.getCell(`E${sigLabelsRow}`).value = "اعتماد وموافقة العميل";
  ws.getCell(`E${sigLabelsRow}`).font = font(10, true, BRAND_BLACK);
  ws.getCell(`E${sigLabelsRow}`).alignment = align("center", "middle", false, true);
  ws.getCell(`E${sigLabelsRow}`).fill = fill("FFE2E8F0");

  const sigNamesRow = sigLabelsRow + 1;
  ws.getRow(sigNamesRow).height = 30;
  ws.mergeCells(`B${sigNamesRow}:D${sigNamesRow}`);
  ws.getCell(`B${sigNamesRow}`).value = `${data.company_name} — م / محمد فهمي`;
  ws.getCell(`B${sigNamesRow}`).font = font(10, true, BRAND_BLACK);
  ws.getCell(`B${sigNamesRow}`).alignment = align("center", "middle", false, true);
  
  ws.mergeCells(`E${sigNamesRow}:G${sigNamesRow}`);
  ws.getCell(`E${sigNamesRow}`).value = `السيد / ${data.client_name}`;
  ws.getCell(`E${sigNamesRow}`).font = font(10, true, BRAND_BLACK);
  ws.getCell(`E${sigNamesRow}`).alignment = align("center", "middle", false, true);

  const sigLineRow = sigNamesRow + 1;
  ws.getRow(sigLineRow).height = 30;
  ws.mergeCells(`B${sigLineRow}:D${sigLineRow}`);
  ws.getCell(`B${sigLineRow}`).value = "التوقيع: ________________________";
  ws.getCell(`B${sigLineRow}`).font = font(10, false, "FF64748B");
  ws.getCell(`B${sigLineRow}`).alignment = align("center", "middle", false, true);

  ws.mergeCells(`E${sigLineRow}:G${sigLineRow}`);
  ws.getCell(`E${sigLineRow}`).value = "التوقيع: ________________________";
  ws.getCell(`E${sigLineRow}`).font = font(10, false, "FF64748B");
  ws.getCell(`E${sigLineRow}`).alignment = align("center", "middle", false, true);

  // Footer Row
  const footerRow = sigLineRow + 2;
  ws.getRow(footerRow).height = 16;
  
  // Footer Gold line
  for (let i = 1; i <= 7; i++) {
    ws.getCell(footerRow - 1, i).fill = fill(BRAND_BLUE_PRIMARY);
    ws.getRow(footerRow - 1).height = 4;
  }

  ws.mergeCells(`B${footerRow}:G${footerRow}`);
  const fCell = ws.getCell(`B${footerRow}`);
  fCell.value = "159 المستثمرين الجنوبية – التجمع الخامس – القاهرة  |  هاتف: 01220218181  —  01220218183  |  Multi Systems Engineering & Trading";
  fCell.font = font(8, false, BRAND_BLUE_DARK, true);
  fCell.alignment = align("center", "middle");
  fCell.fill = fill(BRAND_BLUE_PALE);

  // Freeze and print area
  ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 9, activeCell: 'C10', rightToLeft: true }];

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer).toString('base64');
}
