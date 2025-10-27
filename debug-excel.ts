import XLSX from "xlsx";
import path from "path";

const excelPath = path.join(__dirname, "data", "RP_Software_Aprobado.xlsx");
const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log(`=== Todas las filas del Excel (${data.length} filas) ===\n`);
for (let i = 0; i < data.length; i++) {
  const row = data[i];
  console.log(
    `Fila ${i + 1}: A="${row[0] || ""}" | B="${row[1] || ""}" | C="${row[2] || ""}"`,
  );
}
