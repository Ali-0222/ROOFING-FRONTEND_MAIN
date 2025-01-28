import { NextRequest, NextResponse } from "next/server";

// Sample HTML content for PDF generation
const generateHTML = (imagePath?: string) => {
  return `
    <html>
      <head>
        <style>
          @page {
            margin: 0;
          }

          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          .header {
            text-align: left;
            padding: 20px;
          }

          .header img {
            height: 50px;
          }

          .content {
            padding: 40px;
            text-align: left;
          }

          .content h1 {
            color: #337ab7;
            font-size: 30px;
            font-weight: bold;
            margin: 0;
          }

          .content .details {
            font-size: 14px;
            color: #333;
            margin: 10px 0;
          }

          .content .image-container {
            margin: 20px 0;
            text-align: center;
          }

          .content .image-container img {
            width: 100%;
            height: auto;
            border: 1px solid #ccc;
          }

          .footer {
            text-align: center;
            padding: 10px 0;
            font-size: 12px;
            color: #999;
            position: absolute;
            bottom: 20px;
            width: 100%;
          }

          .footer small {
            font-size: 10px;
            color: #666;
          }

          .page-break {
            page-break-after: always;
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <img src="https://roofr.com/static/logo.svg" alt="Roofr Logo" />
        </div>

        <!-- Content Section for Page 1 -->
        <div class="content">
          <h1>Roof Report</h1>
          <div class="details">
            1407 Lexington Avenue, Greensboro, NC 27403<br />
            2358 sqft | 8 facets | Predominant pitch 10/12
          </div>

          // <div class="image-container">
          //   <img src="file://${imagePath}" alt="Roof Image" />
          // </div>

          <div class="details">Nearmap Feb 7, 2023</div>
        </div>

        <!-- Footer -->
        <div class="footer">
          This report was prepared by Roofr.<br />
          Copyright © 2024 Roofr.com | All rights reserved.<br />
          <small>1</small>
        </div>

        <div class="page-break"></div>

        <!-- Content Section for Page 2 -->
        <div class="content">
          <h1>Additional Information</h1>
          <p>This is the second page of the report, where additional roof inspection data can be provided.</p>
        </div>

        <!-- Footer (fixed at bottom) -->
        <div class="footer">
          This report was prepared by Roofr.<br />
          Copyright © 2024 Roofr.com | All rights reserved.<br />
          <small>2</small>
        </div>
      </body>
    </html>
  `;
};

export async function GET(req: NextRequest) {
  const imagePath = "/mnt/data/image.png"; // Path to the uploaded image

  // // Check if the image file exists
  // if (!fs.existsSync(imagePath)) {
  //   return new NextResponse("Image not found", { status: 404 });
  // }

  // Launch puppeteer in headless mode
  // const browser = await puppeteer.launch();
  // const page = await browser.newPage();

  // // Generate HTML content
  // const htmlContent = generateHTML(imagePath);

  // // Set the HTML content
  // await page.setContent(htmlContent);

  // // Create a PDF from the HTML content
  // const pdfBuffer = await page.pdf({
  //   format: "A4", // Use A4 paper size
  //   printBackground: true, // Include CSS background
  //   margin: { top: "20mm", bottom: "20mm" }, // Set margins to give space for header and footer
  // });

  // await browser.close();

  // Set headers to trigger file download
  const headers = new Headers();
  headers.set("Content-Type", "application/pdf");
  headers.set("Content-Disposition", 'attachment; filename="roof_report.pdf"');

  return new NextResponse("pdfBuffer", { headers });
}
