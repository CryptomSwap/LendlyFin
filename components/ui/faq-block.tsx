"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";

export type FAQBlockItem = { question: string; answer: string };

export interface FAQBlockProps {
  title: string;
  items: FAQBlockItem[];
  moreLink?: { href: string; label: string };
  /** Optional icon (default HelpCircle) */
  icon?: React.ReactNode;
  className?: string;
}

export function FAQBlock({ title, items, moreLink, icon, className }: FAQBlockProps) {
  if (items.length === 0) return null;

  return (
    <Card className={cn("py-4", className)}>
      <CardHeader className="py-0 pb-2">
        <CardTitle className="text-base inline-flex items-center gap-2">
          {icon ?? <HelpCircle className="h-4 w-4 text-muted-foreground" aria-hidden />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Accordion type="single" collapsible className="w-full" dir="rtl">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-right py-3">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        {moreLink && (
          <p className="mt-3 pt-2 border-t border-border">
            <Link
              href={moreLink.href}
              className="text-sm font-medium text-primary hover:underline"
            >
              {moreLink.label}
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
