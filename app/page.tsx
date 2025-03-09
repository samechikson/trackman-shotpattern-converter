import { FileUploader } from "@/components/file-uploader";
import { UrlUploader } from "@/components/url-uploader";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="w-full max-w-3xl mx-auto">
        <PageHeader />

        <FileUploader />
        {/* <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="file">Upload File</TabsTrigger>
            <TabsTrigger value="url">Enter URL</TabsTrigger>
          </TabsList>
          <TabsContent value="file">
          </TabsContent>
          <TabsContent value="url">
            <UrlUploader />
          </TabsContent>
        </Tabs> */}
      </div>
    </main>
  );
}
