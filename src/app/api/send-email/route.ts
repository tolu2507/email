import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: Request) {
  // Define CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const { email, message, name, service,companyemail } = await request.json();

    if (!email || !message || !name||!companyemail) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: email, message, and name are required",
        },
        { status: 400, headers }
      );
    }

    const { data, error } = await resend.emails.send({
      from: `${name}'s Service enquiry <onboarding@resend.dev>`,
      to: [companyemail,"tolulopebamisile@gmail.com", "info@nuroverseas.com"],
      replyTo: email,
      subject: "Enquiry Regarding Services",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Service Enquiry</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">
            Dear Team,
          </p>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">
            I hope this message finds you well. My name is <strong>${name}</strong>, and I am reaching out to enquire about your services${service ? `, specifically regarding ${service}` : ""}. Below are the details of my enquiry:
          </p>
          <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-size: 16px; color: #333; font-weight: bold; width: 30%;">Name:</td>
              <td style="padding: 8px; font-size: 16px; color: #555;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-size: 16px; color: #333; font-weight: bold;">Email:</td>
              <td style="padding: 8px; font-size: 16px; color: #555;">${email}</td>
            </tr>
            ${
              service
                ? `
            <tr>
              <td style="padding: 8px; font-size: 16px; color: #333; font-weight: bold;">Service:</td>
              <td style="padding: 8px; font-size: 16px; color: #555;">${service}</td>
            </tr>
            `
                : ""
            }
            <tr>
              <td style="padding: 8px; font-size: 16px; color: #333; font-weight: bold;">Message:</td>
              <td style="padding: 8px; font-size: 16px; color: #555;">${message}</td>
            </tr>
          </table>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">
            I would appreciate a prompt response to discuss this matter further. Please feel free to contact me at the provided email address.
          </p>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">
            Thank you for your time and consideration.
          </p>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">
            Best regards,<br>
            ${name}
          </p>
          <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #888; font-size: 12px; text-align: center;">
            This email was sent via your website's enquiry form.
          </p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500, headers }
      );
    }

    console.log({ data });
    return NextResponse.json(
      {
        success: true,
        message: `Message with id ${data.id} is successfully sent`,
      },
      { headers }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500, headers }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3001",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}
