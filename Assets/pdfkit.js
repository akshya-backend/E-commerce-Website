const PDFDocument = require('pdfkit');


const generateInvoicePDF = (order) => {
    // Create PDF document
    const doc = new PDFDocument();

    // Set title font and size
    doc.font('Helvetica-Bold').fontSize(36);

    // Add title
    doc.text('Daily Need Store', { align: 'center' });
    doc.moveDown();

    // Set font and size for other content
    doc.font('Helvetica').fontSize(12);

    // Add company details
    doc.text('Daily Need Store', { align: 'center' });
    doc.text('AdG/15-Jamnidas Park near Fowara Chowk', { align: 'center' });
    doc.text('Kapurthala, 144601', { align: 'center' });
    doc.text('+91 0987654321,DailyneedStore@gmail.com ', { align: 'center' });
    doc.moveDown();

    // Add customer details
    doc.fontSize(14).text('Invoice To:', { underline: true });
    doc.fontSize(12).text(`Customer Name: ${order.user.name}`);
    doc.text(`Address: ${order.user.address}`);
    doc.text(`Phone: ${order.user.telephone}`);
    doc.text(`Email: ${order.user.email}`);
    doc.moveDown();

    // Add order details table
    doc.fontSize(14).text('Order Details:', { underline: true });
    doc.moveDown();
    doc.font('Helvetica-Bold').text('Product Name', { continued: true, width: 220, align: 'left' });
    doc.text('Quantity', { continued: true, width: 100, align: 'center' });
    doc.text('Price', { width: 100, align: 'right' });
    doc.moveDown();
    let totalPrice = 0;
    order.items.forEach(item => {
        doc.font('Helvetica').text(item.productName, { continued: true, width: 220, align: 'left' });
        doc.text(item.quantity.toString(), { continued: true, width: 100, align: 'center' });
        doc.text(item.price.toFixed(2), { width: 100, align: 'right' });
        totalPrice += item.price * item.quantity;
    });
    doc.moveDown();
    doc.text(`Total Price: ${totalPrice.toFixed(2)}`, { align: 'right' });

    // Finalize the PDF
    return doc;
};

module.exports = generateInvoicePDF;
