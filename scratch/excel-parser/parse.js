const ExcelJS = require('exceljs');

async function parse() {
  const workbook = new ExcelJS.Workbook();
  const filePath = "D:\\hp 2023\\Fahmy University\\Multi systems system\\Documents templates\\celia quotation.xlsx";
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  
  console.log("== Merged Cells ==");
  const merges = sheet.model.merges;
  if (merges) {
    merges.forEach(m => console.log(m));
  }

  console.log("\n== Cells ==");
  for (let r = 1; r <= 30; r++) {
    const row = sheet.getRow(r);
    for (let c = 1; c <= 10; c++) {
      const cell = row.getCell(c);
      if (cell.value) {
        let valStr = "";
        if (typeof cell.value === "object") {
          if (cell.value.richText) {
            valStr = cell.value.richText.map(rt => rt.text).join("");
          } else if (cell.value.formula) {
            valStr = "FORMULA: " + cell.value.formula + " RESULT: " + cell.value.result;
          } else {
            valStr = JSON.stringify(cell.value);
          }
        } else {
          valStr = cell.value;
        }

        const bg = cell.fill ? (cell.fill.fgColor ? cell.fill.fgColor.argb : "none") : "none";
        const font = cell.font ? `${cell.font.name} ${cell.font.size} ${cell.font.bold ? 'bold' : ''} ${cell.font.color ? cell.font.color.argb : ''}` : "none";
        const alignment = cell.alignment ? `${cell.alignment.horizontal || 'none'} ${cell.alignment.vertical || 'none'}` : "none";

        console.log(`[R${r}C${c}] (${cell.address}): ${valStr}`);
        console.log(`      BG: ${bg} | FONT: ${font} | ALIGN: ${alignment}`);
      }
    }
  }
}

parse().catch(console.error);
