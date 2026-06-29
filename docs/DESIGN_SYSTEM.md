# Lendly Frontend — Design System

## Direction
- All UI is RTL (`dir="rtl"`)
- Hebrew copy throughout

## Typography
- **Headings / bold labels:** `font-sans` (the project's primary black font)
- **Body / secondary / metadata:** `font-assistant`
- **Section titles:** `font-sans text-[48px] font-black leading-none tracking-[-2px] text-black` via `ScrollRevealTitle`
- **Card titles:** `font-sans text-[16px] font-black`
- **Body text:** `font-assistant text-[14px] text-[#888888] leading-relaxed`
- **Metadata / labels:** `font-assistant text-[11px] text-[#AAAAAA]`

## Colors
- **Brand green:** `#1A8C6A`
- **Brand green hover:** `#157A5A`
- **Page background:** `#FFFFFF`
- **Hero section background:** `#F7F6F3`
- **Muted text:** `#888888`
- **Very muted text:** `#AAAAAA`
- **Tile — olive:** `#C5CC7B` (light text: black)
- **Tile — green:** `#5CB87A` (light text: white)
- **Tile — dark:** `#2C2C2C` (light text: white)
- **Tile — brand:** `#1A8C6A` (light text: white)
- **Borders:** `border-black/10` default, `border-black/15` on hover
- **Shell border (Navbar / Footer):** `1px solid rgba(0,0,0,0.15)`
- **Shell divider:** `rgba(0,0,0,0.08)` (1px horizontal rule)

## Border Radius
- **Cards / tiles / inputs:** `rounded-[8px]`
- **Images inside cards:** `rounded-[10px]`
- **Pills / buttons / avatars / badges:** `rounded-full`
- **Section containers:** `rounded-[12px]`

## Shadows
- **Card hover:** `hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)]`
- **Elevated hover:** `hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]`
- **CTA button:** `shadow-[0_6px_24px_rgba(26,140,106,0.35)]` hover: `shadow-[0_10px_32px_rgba(26,140,106,0.45)]`

## Spacing & Layout
- **Section wrapper:** `mx-auto w-full max-w-[1420px] px-5`
- **Section vertical padding:** `py-16` to `py-24`
- **Grid gaps:** `gap-3` (tight), `gap-6` (default), `gap-10` (loose)
- **Card internal padding:** `p-4` to `p-6`

## Buttons
- **Primary CTA:** `rounded-full bg-[#1A8C6A] px-10 py-4 font-sans text-[17px] font-bold text-white shadow-[0_6px_24px_rgba(26,140,106,0.35)] hover:-translate-y-[3px] hover:shadow-[0_10px_32px_rgba(26,140,106,0.45)] transition-all duration-300`
- **Secondary / outline:** `rounded-full border border-black/15 bg-white px-6 py-2.5 font-sans text-[14px] font-bold text-black hover:bg-black/5 transition-colors duration-200`
- **Ghost link:** `font-sans text-[16px] font-bold text-[#1A8C6A]` with arrow

## Cards
- Base: `rounded-[8px] border border-transparent bg-white p-4`
- Hover: `hover:border-black/15 hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)] transition-[border-color,box-shadow] duration-300`

## Navbar & Footer shell
Shared floating-card language used by `Navbar` and `Footer`:
- **Outer wrapper:** white page background — no dark footer strip
- **Inner card:** `rounded-[8px] bg-white` with `border: 1px solid rgba(0,0,0,0.15)`
- **Logo:** Heebo 900, `36px`, `#1A8C6A`
- **Nav / footer links:** `font-assistant text-[16px] font-medium text-black` → `hover:text-[#1A8C6A]`, `py-1.5`
- **Column headings (footer):** `font-assistant text-[13px] font-medium text-[#999999]`
- **Promo block:** `rounded-lg bg-[#1A8C6A] p-4` — white Heebo 900 heading + white pill CTA (`13px` bold, green text)
- **Social icons:** `text-gray-400` → `hover:text-[#1A8C6A]`, `h-4 w-4`
- **Footer layout:** `max-w-[1420px] px-5`, inner card `px-8 py-10`, 5-column grid `grid-cols-[1.1fr_1fr_1fr_1fr_1.2fr] gap-x-14`, bottom bar `px-8 py-5`

## Animations
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` for entrances, `cubic-bezier(0.2, 0, 0, 1)` for interactions
- **Scroll reveal:** IntersectionObserver threshold `0.2`, fade + `translateY(20px → 0)`, duration `600ms`
- **Stagger:** `100ms` between siblings
- **Hover lift:** `hover:-translate-y-1 transition-transform duration-300`
- Use `ScrollRevealTitle` component for all section headings

## Existing Components (do not recreate)
- `ScrollRevealTitle` — scroll-triggered heading reveal
- `ProductCard` — listing card with hover CTA
- `HeroCategories` — physics-scroll category sidebar
- `TestimonialSlideshowCard` — auto-cycling testimonial
- `RecommendationsSection` — bento flip cards + testimonials
- `HowItWorks` — animated pill timeline
- `OwnerCTA` — gradient banner strip
- `TrustStrip` — 3 colored stat tiles
- `Footer` — bordered 5-column footer card (matches Navbar shell)
- `Navbar` — floating top navigation bar

## Do Not
- Use CSS variables (no `var(--*)`) — hardcode all values
- Use Tailwind's default `rounded-lg`, `rounded-xl` etc. — use `rounded-[8px]` / `rounded-full`
- Add background colors to section wrappers — page is white, sections sit on white
- Use `font-bold` for main headings — use `font-black`
