import { NextRequest, NextResponse } from "next/server";
import { parseHtmlToShotPattern } from "@/lib/parser";

export async function POST(req: NextRequest) {
  try {
    const { fileContent, url } = await req.json();

    // Validate URL
    const parsedUrl = new URL(url); // This will throw if the URL is invalid

    // Check if the URL is a Trackman URL
    if (!parsedUrl.hostname.includes("trackmangolf.com")) {
      return NextResponse.json(
        { error: "Invalid Trackman URL" },
        { status: 400 }
      );
    }

    // Extract column names from the URL
    const columnNames = parsedUrl.searchParams.getAll("mp[]");

    if (!fileContent) {
      return NextResponse.json(
        { error: "No file content provided" },
        { status: 400 }
      );
    }

    const { csv, shotCount } = await parseHtmlToShotPattern(
      fileContent,
      columnNames
    );
    return NextResponse.json({ csv, shotCount });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to parse the file" },
      { status: 500 }
    );
  }
}
