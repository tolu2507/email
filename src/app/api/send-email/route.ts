// app/api/contact/route.ts
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

function getResendKey(companyName: string) {
  console.log("Selected company:", companyName);
  const keys: Record<string, { key: string; email: string }> = {
    argenta: { key: process.env.RESEND_API_KEY!, email: "site@argentatek.com" },
    nur: { key: process.env.NUR!, email: "site@nuroverseas.com" },
    melisa: { key: process.env.MELISA!, email: "site@melisa.net.tr" },
    atlas: { key: process.env.ATLAS!, email: "site@atlastrade.com.tr" },
    megavolt: { key: process.env.MEGAVOLT!, email: "site@megavolt.com.tr" },
    alfa: { key: process.env.ALFA!, email: "site@alfa-trend.com.tr" },
    aegis: { key: process.env.AEGIS!, email: "site@aegisoverseas.ae" },
    // Add more companies here as needed
  };

  const company = keys[companyName.toLowerCase()] || {
    key: process.env.RESEND_API_KEY!,
    email: "site@nuroverseas.com", // fallback
  };

  console.log("Using Resend key for:", companyName, company);
  const resend = new Resend(company.key);
  return { resend, email: company.email };
}

export async function POST(request: NextRequest) {
  // CORS Headers
  const origin = request.headers.get("origin") || "";
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3003",
    "https://yourdomain.com", // ← replace with your actual domain
  ];

  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin)
      ? origin
      : "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle OPTIONS preflight request
  if (request.method === "OPTIONS") {
    return NextResponse.json({}, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await request.json();
    const { email, message, name, service, companyname } = body;

    if (!email || !message || !name || !companyname) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400, headers: corsHeaders },
      );
    }

    const { resend, email: receiveEmail } = getResendKey(companyname);

    const { data, error } = await resend.emails.send({
      from: `Contact Form - ${companyname} <onboarding@resend.dev>`,
      to: [receiveEmail, "tolulopebamisile@gmail.com", "info@nuroverseas.com"],
      replyTo: email,
      subject: `New Enquiry from ${name} - ${companyname}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 12px;">
          <h2 style="color: #111; font-size: 24px; margin-bottom: 20px;">New Service Enquiry</h2>
          <p style="color: #444; font-size: 16px; line-height: 1.6;">
            Dear Team,
          </p>
          <p style="color: #444; font-size: 16px; line-height: 1.6;">
            You have received a new enquiry from <strong>${name}</strong>:
          </p>
          <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; font-weight: bold; width: 30%; color: #333;">Name:</td>
              <td style="padding: 10px; color: #444;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #333;">Email:</td>
              <td style="padding: 10px; color: #444;">${email}</td>
            </tr>
            ${
              service
                ? `<tr>
                    <td style="padding: 10px; font-weight: bold; color: #333;">Service:</td>
                    <td style="padding: 10px; color: #444;">${service}</td>
                  </tr>`
                : ""
            }
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #333;">Company:</td>
              <td style="padding: 10px; color: #444;">${companyname}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #333; vertical-align: top;">Message:</td>
              <td style="padding: 10px; color: #444; white-space: pre-wrap;">${message.replace(/\n/g, "<br>")}</td>
            </tr>
          </table>
          <p style="color: #444; font-size: 16px; line-height: 1.6;">
            Please respond at your earliest convenience.
          </p>
          <hr style="border-top: 1px solid #e0e0e0; margin: 24px 0;" />
          <p style="color: #888; font-size: 12px; text-align: center;">
            Sent via website contact form • ${new Date().toISOString().split("T")[0]}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to send email" },
        { status: 500, headers: corsHeaders },
      );
    }

    return NextResponse.json(
      { success: true, message: "Message sent successfully" },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500, headers: corsHeaders },
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    },
  );
}
