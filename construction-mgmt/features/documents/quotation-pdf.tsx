import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Tajawal",
  fonts: [
    { src: "https://raw.githubusercontent.com/google/fonts/main/ofl/tajawal/Tajawal-Regular.ttf", fontWeight: 400 },
    { src: "https://raw.githubusercontent.com/google/fonts/main/ofl/tajawal/Tajawal-Bold.ttf", fontWeight: 700 },
  ],
});

const COLORS = {
  primary: "#1A6DA8",
  darker: "#0D4F80",
  pale: "#E8F4FB",
  white: "#FFFFFF",
  gray: "#E2E8F0",
  black: "#1A1A1A",
  gold: "#B7953A",
  red: "#FF0000",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Tajawal",
    fontSize: 8,
    direction: "rtl",
    backgroundColor: COLORS.white,
    padding: 20,
  },
  pageContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  // Top bar
  topBar: {
    flexDirection: "row-reverse",
    height: 8,
    backgroundColor: COLORS.darker,
    marginBottom: 5,
  },
  topBarGold: {
    width: 25,
    height: "100%",
    backgroundColor: COLORS.gold,
  },
  // Logo & Title
  logoRow: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
    minHeight: 40,
  },
  companyName: {
    fontSize: 14,
    fontWeight: 700,
    color: COLORS.darker,
    textAlign: "center",
  },
  logoPlaceholder: {
    position: "absolute",
    right: 0,
    width: 100,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  // Subtitle
  subtitleBox: {
    border: `1px solid ${COLORS.darker}`,
    backgroundColor: COLORS.pale,
    padding: 2,
    marginBottom: 8,
  },
  subtitleText: {
    color: COLORS.primary,
    fontSize: 8,
    textAlign: "center",
  },
  // Info Grid
  infoGrid: {
    border: `1px solid ${COLORS.primary}`,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row-reverse",
    backgroundColor: COLORS.pale,
    alignItems: "stretch",
  },
  infoRowBorder: {
    borderBottom: `1px solid ${COLORS.primary}`,
  },
  infoCellLabel: {
    width: "15%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    color: COLORS.primary,
    fontWeight: 700,
    textAlign: "right",
    borderLeft: `1px solid ${COLORS.primary}`,
    justifyContent: "center",
  },
  infoCellValue: {
    width: "35%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    color: COLORS.black,
    fontWeight: 700,
    textAlign: "right",
    justifyContent: "center",
  },
  infoCellValueBorder: {
    borderLeft: `1px solid ${COLORS.primary}`,
  },
  
  // Title Band
  titleBand: {
    backgroundColor: COLORS.darker,
    paddingVertical: 4,
    marginBottom: 0,
    border: `1px solid ${COLORS.darker}`,
  },
  titleBandText: {
    color: COLORS.white,
    fontWeight: 700,
    fontSize: 9,
    textAlign: "center",
  },
  
  // Table
  table: {
    borderLeft: `1px solid ${COLORS.primary}`,
    borderRight: `1px solid ${COLORS.primary}`,
    borderBottom: `1px solid ${COLORS.primary}`,
    borderTop: `1px solid ${COLORS.primary}`,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row-reverse",
    borderBottom: `1px solid ${COLORS.primary}`,
    alignItems: "stretch",
  },
  tableHeaderRow: {
    backgroundColor: COLORS.primary,
  },
  thText: { color: COLORS.white, fontSize: 8, fontWeight: 700, textAlign: "center" },
  tdText: { color: COLORS.black, fontSize: 8, textAlign: "center", paddingHorizontal: 2 },
  
  col1: { width: "5%", borderLeft: `1px solid ${COLORS.primary}`, justifyContent: "center", paddingVertical: 4 },
  col2: { width: "45%", borderLeft: `1px solid ${COLORS.primary}`, justifyContent: "center", paddingVertical: 4 },
  col3: { width: "12%", borderLeft: `1px solid ${COLORS.primary}`, justifyContent: "center", paddingVertical: 4 },
  col4: { width: "12%", borderLeft: `1px solid ${COLORS.primary}`, justifyContent: "center", paddingVertical: 4 },
  col5: { width: "13%", borderLeft: `1px solid ${COLORS.primary}`, justifyContent: "center", paddingVertical: 4 },
  col6: { width: "13%", justifyContent: "center", paddingVertical: 4 },

  // Total
  totalRow: {
    flexDirection: "row-reverse",
    backgroundColor: COLORS.pale,
    alignItems: "stretch",
  },
  totalLabelBox: {
    width: "87%",
    borderLeft: `1px solid ${COLORS.primary}`,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  totalLabelText: {
    color: COLORS.darker,
    fontWeight: 700,
    fontSize: 8,
  },
  totalValueBox: {
    width: "13%",
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  totalValueText: {
    color: COLORS.darker,
    fontWeight: 700,
    fontSize: 10,
  },

  // Terms Section
  termsWrapper: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 6,
    alignItems: "stretch",
  },
  termsCol: {
    width: "49%",
    border: `1px solid ${COLORS.primary}`,
  },
  termsHdr: {
    backgroundColor: COLORS.primary,
    paddingVertical: 2,
    borderBottom: `1px solid ${COLORS.primary}`,
  },
  termsHdrText: {
    color: COLORS.white,
    fontWeight: 700,
    fontSize: 7,
    textAlign: "center",
  },
  termsBody: {
    backgroundColor: COLORS.pale,
  },
  termsRow: {
    padding: 2,
    borderBottom: `1px dotted ${COLORS.primary}`,
  },
  termsText: {
    fontSize: 7,
    color: COLORS.black,
    textAlign: "right",
  },
  termsRowRed: {
    backgroundColor: COLORS.red,
    padding: 2,
    borderBottom: `1px dotted ${COLORS.primary}`,
  },
  termsTextWhite: {
    fontSize: 7,
    color: COLORS.white,
    textAlign: "right",
  },

  // Signature Block
  sigBox: {
    border: `1px solid ${COLORS.primary}`,
    marginBottom: 6,
  },
  sigHeader: {
    backgroundColor: COLORS.primary,
    paddingVertical: 2,
    borderBottom: `1px solid ${COLORS.primary}`,
  },
  sigHdrText: {
    color: COLORS.white,
    textAlign: "center",
    fontWeight: 700,
    fontSize: 7,
  },
  sigRoleRow: {
    flexDirection: "row-reverse",
    backgroundColor: COLORS.gray,
    borderBottom: `1px solid ${COLORS.primary}`,
    alignItems: "stretch",
  },
  sigRoleCell: {
    width: "50%",
    paddingVertical: 2,
    justifyContent: "center",
  },
  sigRoleText: {
    textAlign: "center",
    fontWeight: 700,
    fontSize: 7,
    color: COLORS.black,
  },
  sigNameRow: {
    flexDirection: "row-reverse",
    backgroundColor: COLORS.white,
    borderBottom: `1px solid ${COLORS.primary}`,
    alignItems: "stretch",
  },
  sigNameCell: {
    width: "50%",
    paddingVertical: 4,
    justifyContent: "center",
  },
  sigNameText: {
    textAlign: "center",
    fontWeight: 700,
    fontSize: 7,
    color: COLORS.black,
  },
  sigLineRow: {
    flexDirection: "row-reverse",
    backgroundColor: COLORS.white,
    alignItems: "stretch",
  },
  sigLineCell: {
    width: "50%",
    paddingVertical: 4,
    justifyContent: "center",
  },
  sigLineText: {
    textAlign: "center",
    fontSize: 7,
    color: "#64748B",
  },
  borderLeft: {
    borderLeft: `1px solid ${COLORS.primary}`,
  },

  // Footer
  footerBand: {
    height: 6,
    backgroundColor: COLORS.primary,
    marginBottom: 1,
  },
  footerTextBand: {
    backgroundColor: COLORS.pale,
    paddingVertical: 3,
  },
  footerText: {
    color: COLORS.primary,
    fontSize: 7,
    textAlign: "center",
  }
});

interface QuotationDocumentProps {
  quotation_date: string;
  company_name: string;
  client_name: string;
  project_name: string;
  location?: string;
  notes?: string;
  items: Array<{
    description: string;
    unit: string;
    quantity: number;
    unit_price: number;
  }>;
  total: number;
}

export function QuotationDocument(props: QuotationDocumentProps) {
  const { quotation_date, company_name, client_name, project_name, location, items, total } = props;

  const d = new Date(quotation_date || Date.now());
  const formattedDate = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;

  const fmtNum = (n: number) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.pageContainer}>
          <View>
            {/* Top Bar */}
            <View style={s.topBar}>
              <View style={s.topBarGold} />
            </View>

            {/* Logo & Company Name */}
            <View style={s.logoRow}>
              {/* Logo is 1st in RTL (Right side) */}
              <View style={s.logoPlaceholder}>
                <Image src="/logo.png" style={{ objectFit: "contain", width: "100%", height: "100%" }} />
              </View>
              {/* Company name is 2nd in RTL (Left side) */}
              <Text style={s.companyName}>{company_name || "شركة مالتي سيستيمز للهندسة والتجارة"}</Text>
            </View>

            {/* Subtitle */}
            <View style={s.subtitleBox}>
              <Text style={s.subtitleText}>Multi Systems for Engineering & Trading | أعمال المقاولات والتشطيبات المتكاملة | New Cairo, Egypt</Text>
            </View>

            {/* Info Grid */}
            <View style={s.infoGrid}>
              <View style={[s.infoRow, s.infoRowBorder]}>
                <View style={s.infoCellLabel}><Text style={{textAlign: 'right'}}>العميل</Text></View>
                <View style={[s.infoCellValue, s.infoCellValueBorder]}><Text style={{textAlign: 'right'}}>السيد الأستاذ / {client_name}</Text></View>
                <View style={s.infoCellLabel}><Text style={{textAlign: 'right'}}>المشروع</Text></View>
                <View style={s.infoCellValue}><Text style={{textAlign: 'right'}}>{project_name}</Text></View>
              </View>
              <View style={s.infoRow}>
                <View style={s.infoCellLabel}><Text style={{textAlign: 'right'}}>الموقع</Text></View>
                <View style={[s.infoCellValue, s.infoCellValueBorder]}><Text style={{textAlign: 'right'}}>{location}</Text></View>
                <View style={s.infoCellLabel}><Text style={{textAlign: 'right'}}>التاريخ</Text></View>
                <View style={s.infoCellValue}><Text style={{textAlign: 'right'}}>{formattedDate}</Text></View>
              </View>
            </View>

            {/* Title Band */}
            <View style={s.titleBand}>
              <Text style={s.titleBandText}>عـرض الأسعـار  —  المقايسة التقديرية لأعمال التشطيب</Text>
            </View>

            {/* Table */}
            <View style={s.table}>
              <View style={[s.tableRow, s.tableHeaderRow, { borderBottom: "none" }]}>
                <View style={s.col1}><Text style={s.thText}>م</Text></View>
                <View style={s.col2}><Text style={s.thText}>بيان الأعمال وتوصيف المواصفات</Text></View>
                <View style={s.col3}><Text style={s.thText}>الكمية</Text></View>
                <View style={s.col4}><Text style={s.thText}>الوحدة</Text></View>
                <View style={s.col5}><Text style={s.thText}>فئة السعر{"\n"}(ج.م.)</Text></View>
                <View style={s.col6}><Text style={s.thText}>الإجمالي{"\n"}(ج.م.)</Text></View>
              </View>

              {items.map((item, i) => {
                const isAlt = i % 2 === 0;
                return (
                  <View key={i} style={[s.tableRow, isAlt ? { backgroundColor: COLORS.pale } : {}]}>
                    <View style={s.col1}><Text style={s.tdText}>{i + 1}</Text></View>
                    <View style={s.col2}><Text style={[s.tdText, { textAlign: "right" }]}>{item.description}</Text></View>
                    <View style={s.col3}><Text style={s.tdText}>{item.quantity > 0 ? fmtNum(item.quantity) : "—"}</Text></View>
                    <View style={s.col4}><Text style={[s.tdText, { color: COLORS.primary }]}>{item.unit}</Text></View>
                    <View style={s.col5}><Text style={[s.tdText, { color: "#166534", fontWeight: 700 }]}>
                      {item.unit_price > 0 ? fmtNum(item.unit_price) : "يُحدد لاحقاً"}
                    </Text></View>
                    <View style={s.col6}><Text style={[s.tdText, { color: COLORS.darker, fontWeight: 700 }]}>
                      {item.quantity > 0 && item.unit_price > 0 ? fmtNum(item.quantity * item.unit_price) : "0"}
                    </Text></View>
                  </View>
                );
              })}

              {/* Total Row */}
              <View style={[s.totalRow, { borderBottom: "none" }]}>
                <View style={s.totalLabelBox}>
                  <Text style={s.totalLabelText}>الإجمالـــي العـــام</Text>
                </View>
                <View style={s.totalValueBox}>
                  <Text style={s.totalValueText}>{fmtNum(total)} ج.م.</Text>
                </View>
              </View>
            </View>

            {/* Terms Section */}
            <View style={s.termsWrapper}>
              {/* 1st child is on the Right */}
              <View style={s.termsCol}>
                <View style={s.termsHdr}>
                  <Text style={s.termsHdrText}>طريقة وجدول سداد الدفعات </Text>
                </View>
                <View style={s.termsBody}>
                  <View style={s.termsRow}><Text style={s.termsText}>50%  دفعة مقدمة عند التعاقد وتجهيز الموقع</Text></View>
                  <View style={s.termsRow}><Text style={s.termsText}>25%  دفعة تشوينات عند توريد الخامات الأساسية</Text></View>
                  <View style={[s.termsRow, { borderBottom: "none" }]}><Text style={s.termsText}>25%  بعد انتهاء كافة الأعمال والتسليم النهائي</Text></View>
                </View>
              </View>
              {/* 2nd child is on the Left */}
              <View style={s.termsCol}>
                <View style={s.termsHdr}>
                  <Text style={s.termsHdrText}>الشروط والالتزامات العامة</Text>
                </View>
                <View style={s.termsBody}>
                  <View style={s.termsRow}><Text style={s.termsText}> صلاحية هذا العرض: 7 أيام من تاريخه </Text></View>
                  <View style={s.termsRowRed}><Text style={s.termsTextWhite}> الكميات تقريبية والعبرة بما يُنفّذ ويُقاس على الطبيعة</Text></View>
                  <View style={s.termsRow}><Text style={s.termsText}>مدة التنفيذ: 60 يوم عمل (غير شاملة الإجازات الرسمية)</Text></View>
                  <View style={[s.termsRow, { borderBottom: "none" }]}><Text style={s.termsText}>  التصاريح والموافقات من إدارة الكومبوند مسؤولية العميل</Text></View>
                </View>
              </View>
            </View>

            {/* Signatures */}
            <View style={s.sigBox}>
              <View style={s.sigHeader}>
                <Text style={s.sigHdrText}>التوقيع والاعتماد</Text>
              </View>
              <View style={s.sigRoleRow}>
                {/* 1st child is Right */}
                <View style={[s.sigRoleCell, s.borderLeft]}>
                  <Text style={s.sigRoleText}>الجهة المنفذة</Text>
                </View>
                {/* 2nd child is Left */}
                <View style={s.sigRoleCell}>
                  <Text style={s.sigRoleText}>اعتماد وموافقة العميل</Text>
                </View>
              </View>
              <View style={s.sigNameRow}>
                {/* 1st child is Right */}
                <View style={[s.sigNameCell, s.borderLeft]}>
                  <Text style={s.sigNameText}>شركة مالتي سيستيمز — م / محمد فهمي</Text>
                </View>
                {/* 2nd child is Left */}
                <View style={s.sigNameCell}>
                  <Text style={s.sigNameText}>أ / {client_name}</Text>
                </View>
              </View>
              <View style={s.sigLineRow}>
                {/* 1st child is Right */}
                <View style={[s.sigLineCell, s.borderLeft]}>
                  <Text style={s.sigLineText}>التوقيع: ________________________</Text>
                </View>
                {/* 2nd child is Left */}
                <View style={s.sigLineCell}>
                  <Text style={s.sigLineText}>التوقيع: ________________________</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Footer (Pushed to bottom) */}
          <View>
            <View style={s.footerBand} />
            <View style={s.footerTextBand}>
              <Text style={s.footerText}> المستثمرين الجنوبية – التجمع الخامس – القاهرة  |  هاتف: 01220218181  —  01220218183  |  Multi Systems Engineering & Trading</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
