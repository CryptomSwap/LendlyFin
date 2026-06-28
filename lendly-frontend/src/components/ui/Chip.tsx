export interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  tone?: "default" | "hero";
}

const TONE_CLASSES = {
  default: {
    selected: "border-[#1A8C6A] bg-[#1A8C6A] text-white",
    unselected:
      "border-black/15 bg-white text-black hover:border-black/30",
  },
  hero: {
    selected: "border-[#1A8C6A] bg-[#1A8C6A] text-white",
    unselected:
      "border-white/20 bg-white/8 text-white/80 hover:border-white/30",
  },
} as const;

export default function Chip({
  label,
  selected = false,
  onClick,
  tone = "default",
}: ChipProps) {
  const colors = TONE_CLASSES[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "inline-flex shrink-0 cursor-pointer items-center rounded-full border px-4 py-1.5 font-sans text-[13px] font-bold transition-all duration-200",
        selected ? colors.selected : colors.unselected,
      ].join(" ")}
    >
      {label}
    </button>
  );
}
