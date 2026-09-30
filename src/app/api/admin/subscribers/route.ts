import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      count: subscribers.length,
      subscribers,
    });
  } catch (error: any) {
    console.error("Admin Subscribers API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch newsletter subscribers." },
      { status: 500 }
    );
  }
}
