import { UrlUploader } from "@/components/url-uploader";
import { PageHeader } from "@/components/page-header";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="w-full max-w-3xl mx-auto">
        <PageHeader />

        <UrlUploader />
      </div>
    </main>
  );
}
