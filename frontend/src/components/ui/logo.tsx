import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
}

export default function Logo({ size = "md", showSubtitle = false }: LogoProps) {
  const iconSizes = {
    sm: "h-8 w-12",
    md: "h-10 w-15",
    lg: "h-12 w-18",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link href="/" className="group inline-flex shrink-0 items-center gap-2.5 focus:outline-none">
      <div className={`relative flex shrink-0 items-center justify-center overflow-visible bg-transparent transition-transform duration-200 group-hover:scale-105 ${iconSizes[size]}`}>
        <Image
          src="/OnlineBazar-logo.svg"
          alt="Online Bazar logo"
          fill
          sizes="48px"
          className="object-contain mix-blend-multiply"
        />
      </div>
      <div className="flex flex-col text-left">
        <span className={`font-bold tracking-tight text-zinc-900 dark:text-white ${textSizes[size]}`}>
          Online<span className="text-emerald-600 dark:text-emerald-400">-Bazar</span>
        </span>
        {/* {showSubtitle && (
          <span className="text-[10px] font-medium tracking-widest text-zinc-400 uppercase">
            Multi-Vendor Market
          </span>
        )} */}
      </div>
    </Link>
  );
}
