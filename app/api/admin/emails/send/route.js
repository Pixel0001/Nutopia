import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superAdminAuth";
import nodemailer from "nodemailer";

// POST - Send emails to recipients
export async function POST(request) {
  try {
    const auth = await requireSuperAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { recipientType, subject, content, templateId, selectedEmails } = await request.json();

    if (!subject || !content) {
      return NextResponse.json({ error: "Subiect și conținut obligatorii" }, { status: 400 });
    }

    let recipients = [];
    
    // If specific emails are selected, use those
    if (selectedEmails && selectedEmails.length > 0) {
      recipients = selectedEmails;
    } else if (recipientType) {
      // Get recipients based on type
      switch (recipientType) {
        case "admins":
          const admins = await prisma.user.findMany({
            where: { role: "admin" },
            select: { email: true }
          });
          recipients = admins.map(u => u.email);
          break;
          
        case "moderators":
          const moderators = await prisma.user.findMany({
            where: { role: "moderator" },
            select: { email: true }
          });
          recipients = moderators.map(u => u.email);
          break;
          
        case "users":
          const users = await prisma.user.findMany({
            where: { role: "user", isBlocked: false },
            select: { email: true }
          });
          recipients = users.map(u => u.email);
          break;
          
        case "subscribers":
          const subscribers = await prisma.newsletterSubscriber.findMany({
            where: { isActive: true },
            select: { email: true }
          });
          recipients = subscribers.map(s => s.email);
          break;
          
        case "all":
          const allUsers = await prisma.user.findMany({
            where: { isBlocked: false },
            select: { email: true }
          });
          const allSubscribers = await prisma.newsletterSubscriber.findMany({
            where: { isActive: true },
            select: { email: true }
          });
          const allEmails = [...allUsers.map(u => u.email), ...allSubscribers.map(s => s.email)];
          recipients = [...new Set(allEmails)];
          break;
      }
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: "Nu există destinatari selectați" }, { status: 400 });
    }

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    let sentCount = 0;
    let failedCount = 0;
    const errors = [];

    // Send emails
    for (const email of recipients) {
      try {
        await transporter.sendMail({
          from: `"Nutopia" <${process.env.SMTP_USER || "noreply@nutopia.md"}>`,
          to: email,
          subject: subject,
          html: content
        });
        sentCount++;
      } catch (err) {
        console.error(`Failed to send to ${email}:`, err.message);
        errors.push({ email, error: err.message });
        failedCount++;
      }
    }

    // Log the email send
    await prisma.emailLog.create({
      data: {
        subject,
        recipients,
        recipientType: selectedEmails?.length > 0 ? "custom" : recipientType,
        templateId: templateId || null,
        content,
        sentBy: auth.user.email,
        status: failedCount === 0 ? "sent" : failedCount === recipients.length ? "failed" : "partial",
        sentCount
      }
    });

    return NextResponse.json({ 
      message: `Email-uri trimise cu succes`,
      sentCount,
      failedCount,
      totalRecipients: recipients.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("Send emails error:", error);
    return NextResponse.json({ error: error.message || "A apărut o eroare la trimiterea email-urilor" }, { status: 500 });
  }
}

// GET - Get email logs, stats, and recipients for selection
export async function GET(request) {
  try {
    const auth = await requireSuperAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const logs = await prisma.emailLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50
    });

    // Get all users grouped by role
    const allUsers = await prisma.user.findMany({
      where: { isBlocked: false },
      select: { id: true, email: true, name: true, role: true, image: true },
      orderBy: { createdAt: "desc" }
    });

    // Get all subscribers
    const allSubscribers = await prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { id: true, email: true, name: true },
      orderBy: { createdAt: "desc" }
    });

    // Group users by role
    const users = allUsers.filter(u => u.role === "user");
    const admins = allUsers.filter(u => u.role === "admin");
    const moderators = allUsers.filter(u => u.role === "moderator");

    // Get stats
    const stats = {
      totalSent: await prisma.emailLog.count(),
      subscribers: allSubscribers.length,
      users: users.length,
      admins: admins.length,
      moderators: moderators.length
    };

    return NextResponse.json({ 
      logs, 
      stats,
      recipients: {
        users,
        admins,
        moderators,
        subscribers: allSubscribers
      }
    });
  } catch (error) {
    console.error("Get email logs error:", error);
    return NextResponse.json({ error: "A apărut o eroare" }, { status: 500 });
  }
}
