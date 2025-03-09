import { JSDOM } from "jsdom";

interface ShotData {
  club: string;
  type: string;
  target: string;
  total: string;
  side: string;
}

export async function parseHtmlToShotPattern(
  htmlContent: string,
  htmlColumnNames?: string[]
): Promise<{ csv: string; shotCount: number }> {
  try {
    const columnIndexes = {} as any;
    if (htmlColumnNames) {
      htmlColumnNames.forEach((name, index) => {
        columnIndexes[name] = index + 4; // +4 because the first 4 columns are not needed
      });
    }

    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // Extract player name for reference
    const playerNameElement = document.querySelector(".player-name");
    const playerName = playerNameElement
      ? playerNameElement.textContent || "Unknown"
      : "Unknown";

    // Find all the shot tables
    const tables = document.querySelectorAll(".table-with-shots");

    if (!tables || tables.length === 0) {
      throw new Error("No shot data tables found in the HTML file");
    }

    const shotData: ShotData[] = [];

    // Process each table (each club type)
    tables.forEach((table) => {
      // Get the club type from the header
      const clubTypeElement =
        table.querySelector(".abbreviatedClubTypeText") ||
        table.querySelector(".group-tag");
      if (!clubTypeElement) return;
      const clubType = clubTypeElement.textContent || "Unknown";

      // Get all shot rows
      const shotRows = table.querySelectorAll(
        ".row-with-shot-details:not(.deselected-shot)"
      );

      shotRows.forEach((row) => {
        // Extract the data we need
        const cells = row.querySelectorAll("td");
        if (cells.length < 10) return;

        // Get the total distance (column 6)
        const totalDistance =
          cells[columnIndexes["Total"] ?? 5].textContent?.trim() || "";
        const side =
          cells[columnIndexes["Side"] ?? 0].textContent?.trim() || "";

        shotData.push({
          club: clubType,
          type: clubType === "Dr" ? "Tee" : "Approach", // Default type
          target: totalDistance, // Using total as target for simplicity
          total: totalDistance,
          side: side,
        });
      });
    });

    // Convert to CSV
    const headers = ["Club", "Type", "Target", "Total", "Side"];
    const csvRows = [headers.join(",")];

    shotData.forEach((shot) => {
      csvRows.push(
        [shot.club, shot.type, shot.target, shot.total, shot.side].join(",")
      );
    });

    return {
      csv: csvRows.join("\n"),
      shotCount: shotData.length,
    };
  } catch (error) {
    console.error("Error parsing HTML:", error);
    throw new Error("Failed to parse the TrackMan report HTML");
  }
}
