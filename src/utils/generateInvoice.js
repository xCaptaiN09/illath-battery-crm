import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoice = (sale, settings) => {
  const doc = new jsPDF();
  const invoiceNo = `INV-${sale.id.substring(0, 8).toUpperCase()}`;
  const date = sale.sale_date
    ? new Date(sale.sale_date).toLocaleDateString()
    : new Date().toLocaleDateString();

  // Shop Details (Seller)
  doc.setFontSize(20);
  doc.setFont(undefined, "bold");
  doc.text(settings.shop_name || "Battery Shop", 14, 20);

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(settings.shop_address || "", 14, 27);
  doc.text(`Phone: ${settings.shop_phone || ""}`, 14, 33);
  doc.text(`GSTIN: ${settings.shop_gstin || ""}`, 14, 39);
  doc.text(`State: ${settings.shop_state || ""}`, 14, 45);

  // Invoice Title
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text("TAX INVOICE", 150, 20);

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Invoice No: ${invoiceNo}`, 150, 27);
  doc.text(`Date: ${date}`, 150, 33);

  // Bill To (Buyer)
  doc.setFont(undefined, "bold");
  doc.text("Buyer (Bill to)", 14, 60);
  doc.setFont(undefined, "normal");
  doc.text(sale.customer_name || "", 14, 67);
  doc.text(sale.customer_address || "", 14, 73);
  doc.text(`Phone: ${sale.phone || ""}`, 14, 79);
  doc.text(`GSTIN: ${sale.customer_gstin || ""}`, 14, 85);
  doc.text(`State: ${sale.customer_state || ""}`, 14, 91);

  // Table Calculations (Assuming 18% GST inclusive in the final price)
  const totalAmount = sale.price || 0;
  const taxableValue = totalAmount / 1.18;
  const cgst = taxableValue * 0.09;
  const sgst = taxableValue * 0.09;

  // Items Table
  autoTable(doc, {
    startY: 100,
    head: [
      ["Sl No", "Description of Goods", "HSN/SAC", "Rate", "Qty", "Amount"],
    ],
    body: [
      [
        "1",
        `${sale.battery_brand} ${sale.battery_model}\nS/N: ${sale.serial_number || "N/A"}`,
        "85071000", // Standard HSN for Lead-Acid Batteries
        taxableValue.toFixed(2),
        "1",
        taxableValue.toFixed(2),
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [30, 30, 30], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 3 },
  });

  let finalY = doc.lastAutoTable.finalY;

  // Tax Summary Table
  autoTable(doc, {
    startY: finalY + 5,
    head: [["HSN/SAC", "Taxable Value", "CGST (9%)", "SGST (9%)", "Total Tax"]],
    body: [
      [
        "85071000",
        taxableValue.toFixed(2),
        cgst.toFixed(2),
        sgst.toFixed(2),
        (cgst + sgst).toFixed(2),
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [240, 240, 240], textColor: 0 },
    styles: { fontSize: 10, cellPadding: 3 },
  });

  finalY = doc.lastAutoTable.finalY;

  // Grand Total
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text(`Grand Total: Rs. ${totalAmount.toFixed(2)}`, 140, finalY + 15);

  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.text("Amount Chargeable (in words):", 14, finalY + 15);
  doc.text("INR " + numberToWords(totalAmount) + " Only", 14, finalY + 21);

  // Footer
  doc.setFontSize(8);
  doc.text(
    "Declaration: We declare that this invoice shows the actual price of the",
    14,
    finalY + 35,
  );
  doc.text(
    "goods described and that all particulars are true and correct.",
    14,
    finalY + 40,
  );

  doc.text("for " + (settings.shop_name || "Battery Shop"), 150, finalY + 45);
  doc.text("Authorised Signatory", 150, finalY + 55);

  doc.save(`Invoice_${sale.customer_name || "Customer"}.pdf`);
};

// Helper function to convert numbers to words (Basic implementation for INR)
function numberToWords(num) {
  if (num === 0) return "Zero";
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const inWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " : "") + a[n % 10];
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " : "") +
        inWords(n % 100)
      );
    if (n < 100000)
      return (
        inWords(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000 ? " " : "") +
        inWords(n % 1000)
      );
    return (
      inWords(Math.floor(n / 100000)) +
      " Lakh" +
      (n % 100000 ? " " : "") +
      inWords(n % 100000)
    );
  };
  let rupees = Math.floor(num);
  let paise = Math.round((num - rupees) * 100);
  let words = inWords(rupees);
  if (paise > 0) words += " and " + inWords(paise) + " Paise";
  return words;
}
