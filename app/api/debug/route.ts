import { NextResponse } from "next/server";

export async function GET() {
  const mongodbUriDefined = Boolean(process.env.MONGODB_URI);
  const mongodbDb = process.env.MONGODB_DB || "newsportal";

  if (!mongodbUriDefined) {
    return NextResponse.json(
      {
        ok: false,
        environment: {
          mongodbUriDefined,
          mongodbDb,
        },
        mongodb: {
          connected: false,
          message: "MONGODB_URI environment variable is not defined.",
        },
      },
      { status: 500 },
    );
  }

  try {
    const { connectToMongo } = await import("@/lib/prisma");
    const client = await connectToMongo();
    await client.db(mongodbDb).command({ ping: 1 });

    return NextResponse.json({
      ok: true,
      environment: {
        mongodbUriDefined,
        mongodbDb,
      },
      mongodb: {
        connected: true,
        message: "MongoDB connected successfully.",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isDnsIssue =
      /ECONNREFUSED|ENOTFOUND|querySrv|queryA|ENOTFOUND|timed out/i.test(
        message,
      );

    return NextResponse.json(
      {
        ok: false,
        environment: {
          mongodbUriDefined,
          mongodbDb,
        },
        mongodb: {
          connected: false,
          message: isDnsIssue
            ? "MongoDB DNS lookup failed. Your Atlas host could not be resolved from this environment. Check the URI, network access, and DNS settings."
            : message,
        },
      },
      { status: 500 },
    );
  }
}
