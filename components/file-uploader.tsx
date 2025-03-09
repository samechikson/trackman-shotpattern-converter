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
import { parseHtmlToShotPattern } from "@/lib/parser";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileUp, Download, CheckCircle2 } from "lucide-react";
import { Input } from "./ui/input";
import { CsvPreview } from "./csv-preview";

export function FileUploader() {
  const [url, setUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [csvData, setCsvData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shotCount, setShotCount] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setCsvData(null);
      setError(null);
      setShotCount(0);
    }
  };

  const processFile = async () => {
    if (!file || !url) return;

    setIsProcessing(true);
    setProgress(10);
    setError(null);

    try {
      // Read the file
      const text = await file.text();
      setProgress(30);

      // Send the file content to the backend for parsing
      const response = await fetch("/api/parse-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileContent: text, url }),
      });

      if (!response.ok) {
        throw new Error("Failed to parse the file");
      }

      const { csv, shotCount } = await response.json();
      setProgress(90);

      setCsvData(csv);
      setShotCount(shotCount);
      setProgress(100);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while processing the file"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCsv = () => {
    if (!csvData) return;

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ShotPatternData.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload TrackMan Report</CardTitle>
        <CardDescription>
          Select an HTML file containing TrackMan golf shot data and the URL
          where it was downloaded from.
        </CardDescription>
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
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-gray-500">
              Enter the full URL to a TrackMan HTML report
            </p>
          </div>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileUp className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500">
                  TrackMan HTML report file
                </p>
                {file && (
                  <p className="mt-2 text-sm font-medium text-gray-900">
                    Selected: {file.name}
                  </p>
                )}
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".html,.htm"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Processing file...</p>
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
            setFile(null);
            setCsvData(null);
            setError(null);
            setShotCount(0);
            const input = document.getElementById(
              "file-upload"
            ) as HTMLInputElement;
            if (input) input.value = "";
          }}
        >
          Clear
        </Button>
        <div className="space-x-2">
          <Button onClick={processFile} disabled={!file || isProcessing}>
            Process File
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
        </div>
      </CardFooter>
    </Card>
  );
}
