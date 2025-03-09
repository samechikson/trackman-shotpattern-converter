import { parseHtmlToShotPattern } from "@/lib/parser";
import { type NextRequest, NextResponse } from "next/server";
const scrapingbee = require("scrapingbee");

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

    // Use ScrapingBee to fetch the HTML content
    const client = new scrapingbee.ScrapingBeeClient(
      "M14514UZ2TBE85ERSTHY1FPSSLKUZTMJ3KJPHAUS5RDU33926RAWVJXVDWGR5HMJCLN8OE3LARCWY3C5"
    );
    const response = await client.get({
      url: url,
      params: {
        wait: 10000,
        wait_for: ".player-name",
      },
    });

    if (response.status !== 200) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.statusText}` },
        { status: response.status }
      );
    }

    const decoder = new TextDecoder();
    const html = decoder.decode(response.data);

    const { csv, shotCount } = await parseHtmlToShotPattern(html, columnNames);

    return NextResponse.json({ csv, shotCount });
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
