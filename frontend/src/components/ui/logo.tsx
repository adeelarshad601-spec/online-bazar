import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
}

export default function Logo({ size = "md", showSubtitle = false }: LogoProps) {
  const iconSizes = {
    sm: "h-8 w-12",
    md: "h-10 w-14",
    lg: "h-12 w-16",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link href="/" className="group inline-flex shrink-0 items-center gap-2.5 focus:outline-none">
      {/* Original Logo SVG with clean white backdrop pill for high visibility on dark backgrounds */}
      <div className={`relative flex shrink-0 items-center justify-center rounded-xl bg- p-1 shadow-xs   transition-transform duration-200 group-hover:scale-105 ${iconSizes[size]}`}>
        <Image
          src="/OnlineBazar-logo.svg"
          alt="Online Bazar logo"
          fill
          sizes="60px"
          className="object-contain p-0.5"
          priority
        />
      </div>
      <div className="flex flex-col text-left">
        <span className={`font-bold tracking-tight text-zinc-900 dark:text-white ${textSizes[size]}`}>Online -<span className="text-emerald-600 dark:text-emerald-400"> Bazar</span>
        </span>
      </div>
    </Link>
  );
}


