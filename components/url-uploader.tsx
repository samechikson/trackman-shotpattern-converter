"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Download, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CsvPreview } from "./csv-preview";

export function UrlUploader() {
  const [url, setUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [csvData, setCsvData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shotCount, setShotCount] = useState(0);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setCsvData(null);
    setError(null);
    setShotCount(0);
  };

  const processUrl = async () => {
    if (!url) return;

    setIsProcessing(true);
    setProgress(10);
    setError(null);

    try {
      const parseHtmlResponse = await fetch("/api/fetch-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });
      setProgress(60);

      if (!parseHtmlResponse.ok) {
        throw new Error("Failed to parse the HTML");
      }

      const { csv, shotCount } = await parseHtmlResponse.json();

      setProgress(80);

      setCsvData(csv);
      setShotCount(shotCount);
      setProgress(100);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while processing the URL"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCsv = () => {
    if (!csvData) return;

    const blob = new Blob([csvData], { type: "text/csv" });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "ShotPatternData.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Enter TrackMan Report URL</CardTitle>
        <CardDescription>
          Provide a URL to a TrackMan golf shot data report. Note: it must be
          the full URL and the page must have the following data columns:
          <ul className="list-disc list-inside">
            <li>Total</li>
            <li>Side</li>
          </ul>
        </CardDescription>
        <img
          src="/trackman-report-example.png"
          alt="TrackMan Report Example"
          className="w-64 h-auto"
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="url-input" className="text-sm font-medium">
              TrackMan Report URL
            </label>
            <div className="flex w-full items-center space-x-2">
              <Input
                id="url-input"
                type="url"
                placeholder="https://web-dynamic-reports.trackmangolf.com/..."
                value={url}
                onChange={handleUrlChange}
                className="flex-1"
              />
              <Button
                onClick={processUrl}
                disabled={!url || isProcessing}
                className="whitespace-nowrap"
              >
                Process URL
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Enter the full URL to a TrackMan HTML report
            </p>
          </div>

          {isProcessing && (
            <div className="space-2 flex items-center">
              <svg
                className="animate-spin h-5 w-5 text-gray-500 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-sm text-gray-500">Processing URL...</p>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {csvData && (
            <>
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Extracted {shotCount} shots from the TrackMan report. Click
                  the download button below to save the CSV file.
                </AlertDescription>
              </Alert>
              <CsvPreview csvData={csvData} />
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            setUrl("");
            setCsvData(null);
            setError(null);
            setShotCount(0);
          }}
        >
          Clear
        </Button>
        <Button
          variant="secondary"
          onClick={downloadCsv}
          disabled={!csvData}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download CSV
        </Button>
      </CardFooter>
    </Card>
  );
}
