import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LifeBuoy, MessageSquare, Book, HelpCircle, Shield, Mail } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="space-y-6 pb-24">
      <div className="text-center mb-8">
        <LifeBuoy className="h-16 w-16 mx-auto mb-4 text-primary" />
        <h1 className="page-title mb-2">מרכז עזרה</h1>
        <p className="text-sm text-muted-foreground">
          מצא תשובות לשאלות נפוצות וקבל תמיכה
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Book className="h-5 w-5" />
              התחלה
            </CardTitle>
            <CardDescription>
              למד איך להשתמש בפלטפורמה
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/help/getting-started" className="block text-sm text-primary hover:underline">
              איך ליצור מודעה
            </Link>
            <Link href="/help/getting-started" className="block text-sm text-primary hover:underline">
              איך להזמין פריט
            </Link>
            <Link href="/help/getting-started" className="block text-sm text-primary hover:underline">
              הבנת פיקדונות
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HelpCircle className="h-5 w-5" />
              שאלות נפוצות
            </CardTitle>
            <CardDescription>
              תשובות לשאלות שכיחות
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/help/faq" className="block text-sm text-primary hover:underline">
              מהו פיקדון הביטחון?
            </Link>
            <Link href="/help/faq" className="block text-sm text-primary hover:underline">
              איך עובד הביטוח?
            </Link>
            <Link href="/help/faq" className="block text-sm text-primary hover:underline">
              מה אם משהו נשבר?
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5" />
              יצירת קשר
            </CardTitle>
            <CardDescription>
              צריך עזרה? פנה אלינו
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/help">
              <Button variant="outline" className="w-full">
                דיווח על בעיה
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a href="mailto:support@lendly.com" className="hover:underline">support@lendly.com</a>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              בטיחות ואמון
            </CardTitle>
            <CardDescription>
              למד על אמצעי הבטיחות שלנו
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/help/safety" className="block text-sm text-primary hover:underline">
              תהליך אימות
            </Link>
            <Link href="/help/safety" className="block text-sm text-primary hover:underline">
              ציון אמון
            </Link>
            <Link href="/help/safety" className="block text-sm text-primary hover:underline">
              יישוב מחלוקות
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
