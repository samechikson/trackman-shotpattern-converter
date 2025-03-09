import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface CsvPreviewProps {
  csvData: string
  maxRows?: number
}

export function CsvPreview({ csvData, maxRows = 5 }: CsvPreviewProps) {
  // Parse CSV data into rows and columns
  const rows = csvData.split("\n").filter((row) => row.trim() !== "")
  const headers = rows[0].split(",")

  // Get data rows (limited to maxRows)
  const dataRows = rows.slice(1, maxRows + 1).map((row) => row.split(","))

  return (
    <div className="mt-4 border rounded-md overflow-hidden">
      <div className="p-3 bg-muted">
        <h3 className="text-sm font-medium">Data Preview (First {dataRows.length} rows)</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header, index) => (
                <TableHead key={index}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataRows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="p-2 text-xs text-muted-foreground text-center border-t">
        {rows.length > maxRows + 1 ? `+ ${rows.length - maxRows - 1} more rows` : "All rows shown"}
      </div>
    </div>
  )
}

