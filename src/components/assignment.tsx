import { MagicCard } from "./ui/magic-card";
import { useTheme } from "next-themes";

export default function Assignment({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const { theme } = useTheme();
  return (
    <MagicCard
      className="min-w-[300px] max-w-[300px] max-h-full h-[200px] rounded-lg border border-b-foreground/10 p-5 cursor-pointer"
      gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
    >
      <h2 className="text-3xl font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </MagicCard>
  );
}
