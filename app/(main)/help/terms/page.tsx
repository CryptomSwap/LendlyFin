import { promises as fs } from "fs";
import path from "path";
import { FileText } from "lucide-react";
import { PageContainer } from "@/components/layout";

async function readTerms() {
  const filePath = path.join(process.cwd(), "docs", "legal", "terms-of-service-he.md");
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "תנאי השימוש אינם זמינים כרגע. נסו שוב מאוחר יותר או פנו לתמיכה.";
  }
}

export default async function TermsPage() {
  const terms = await readTerms();

  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="narrow" className="space-y-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F0FAF6]">
            <FileText className="h-7 w-7 text-[#1A8C6A]" />
          </div>
          <h1 className="font-sans text-[28px] font-black tracking-[-1px] text-black md:text-[36px]">
            תנאי שימוש
          </h1>
          <p className="mt-2 font-assistant text-[15px] text-[#888888]">Lendly</p>
        </div>

        <article className="rounded-[8px] border border-black/10 bg-white p-5 sm:p-8">
          <pre className="whitespace-pre-wrap break-words font-assistant text-[14px] leading-7 text-black">
            {terms}
          </pre>
        </article>
      </PageContainer>
    </div>
  );
}
