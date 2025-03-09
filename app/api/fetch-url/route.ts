import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
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

    // Fetch the HTML content
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.statusText}` },
        { status: response.status }
      );
    }

    const html = await response.text();

    return NextResponse.json({ html, columnNames });
  } catch (error) {
    console.error("Error fetching URL:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while fetching the URL",
      },
      { status: 500 }
    );
  }
}
