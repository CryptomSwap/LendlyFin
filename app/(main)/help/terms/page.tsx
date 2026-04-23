import { promises as fs } from "fs";
import path from "path";
import { FileText } from "lucide-react";

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
    <div className="min-h-screen w-full app-page-bg space-y-6 pb-24 max-w-4xl mx-auto" dir="rtl">
      <div className="text-center mb-8">
        <FileText className="h-16 w-16 mx-auto mb-4 text-primary" />
        <h1 className="page-title mb-2">תנאי שימוש</h1>
        <p className="text-sm text-muted-foreground">Lendly</p>
      </div>

      <article className="rounded-xl border border-border bg-card p-5 sm:p-8 shadow-soft">
        <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground font-sans">
          {terms}
        </pre>
      </article>
    </div>
  );
}
