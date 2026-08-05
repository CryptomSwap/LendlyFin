import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-6 pb-24">
      <div className="h-6 w-32 rounded bg-muted animate-pulse" />

      <Card>
        <CardContent className="py-6">
          <div className="space-y-3">
            <div className="h-5 w-2/3 rounded bg-muted animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
            <div className="h-16 w-full rounded bg-muted animate-pulse" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-6">
          <div className="space-y-2">
            <div className="h-4 w-40 rounded bg-muted animate-pulse" />
            <div className="h-4 w-56 rounded bg-muted animate-pulse" />
            <div className="h-4 w-48 rounded bg-muted animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
