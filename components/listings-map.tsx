"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { formatMoneyIls } from "@/lib/pricing";

type MapListing = {
  id: string;
  title: string;
  pricePerDay: number;
  lat: number | null;
  lng: number | null;
};

export default function ListingsMap({ items }: { items: MapListing[] }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const points = items.filter((x) => x.lat != null && x.lng != null);

  const center =
    points.length > 0
      ? { lat: points[0].lat as number, lng: points[0].lng as number }
      : { lat: 32.0853, lng: 34.7818 }; // Tel Aviv fallback

  if (!apiKey) {
    return (
      <div className="rounded-card border border-input bg-card p-5 text-sm shadow-soft">
        <p className="font-medium text-foreground">תצוגת מפה דורשת מפתח Google Maps</p>
        <p className="text-muted-foreground mt-2">
          הוסף את המשתנה{" "}
          <code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
          לקובץ <code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-xs">.env.local</code> והפעל מחדש את השרת.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[60vh] min-h-[280px] w-full overflow-hidden rounded-card border border-input bg-muted">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={center}
          defaultZoom={12}
          gestureHandling="greedy"
          disableDefaultUI
        >
          {points.map((x) => (
            <AdvancedMarker
              key={x.id}
              position={{ lat: x.lat as number, lng: x.lng as number }}
              title={`${x.title} — ${formatMoneyIls(x.pricePerDay)}/יום`}
            />
          ))}
        </Map>
      </APIProvider>
    </div>
  );
}
