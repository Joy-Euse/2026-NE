import { createWriteStream, mkdirSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import PDFDocument from "pdfkit";
import { env } from "../config/env.js";

const exportRoot = () => {
  const root = resolve(env.exportDir);
  mkdirSync(root, { recursive: true });
  return root;
};

const flattenRows = (report) => {
  if (Array.isArray(report.rows)) return report.rows;
  if (Array.isArray(report.recent)) return report.recent;
  if (Array.isArray(report.expired)) return report.expired;
  if (Array.isArray(report.recentMaintenance)) return report.recentMaintenance;
  return [];
};

const csvEscape = (value) => {
  if (value === null || value === undefined) return "";
  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  return `"${text.replaceAll("\"", "\"\"")}"`;
};

export const writeCsvExport = ({ exportId, reportType, report }) => {
  const rows = flattenRows(report);
  const headers = rows.length ? Object.keys(rows[0]) : ["summary"];
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ];

  if (!rows.length) lines.push(csvEscape(report.summary || report));

  const fileName = `${exportId}-${reportType.toLowerCase()}.csv`;
  const filePath = join(exportRoot(), fileName);
  writeFileSync(filePath, lines.join("\n"), "utf8");
  return { fileName, filePath };
};

export const writePdfExport = ({ exportId, reportType, report, filters }) =>
  new Promise((resolvePromise, reject) => {
    const fileName = `${exportId}-${reportType.toLowerCase()}.pdf`;
    const filePath = join(exportRoot(), fileName);
    const doc = new PDFDocument({ margin: 48 });
    const stream = createWriteStream(filePath);

    stream.on("finish", () => resolvePromise({ fileName, filePath }));
    stream.on("error", reject);
    doc.on("error", reject);
    doc.pipe(stream);

    doc.fontSize(18).text(`${reportType} Report`, { underline: true });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toISOString()}`);
    doc.text(`Filters: ${JSON.stringify(filters || {})}`);
    doc.moveDown();

    doc.fontSize(13).text("Summary");
    doc.fontSize(10).text(JSON.stringify(report.summary || report, null, 2));
    doc.moveDown();

    const rows = flattenRows(report).slice(0, 50);
    doc.fontSize(13).text("Rows");
    rows.forEach((row, index) => {
      doc.fontSize(9).text(`${index + 1}. ${JSON.stringify(row)}`);
      if (doc.y > 720) doc.addPage();
    });

    doc.end();
  });
