import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  HelpCircle,
  Syringe,
  Heart,
  Brain,
  Baby,
  Bone,
  Sparkles,
  Eye,
  type LucideIcon,
} from "lucide-react";
import * as LucideIcons from "lucide-react";

/**
 * Icons explicitly imported so they are bundled and available for dynamic lookup.
 * Add icons here when using getIconComponent() - tree-shaking removes icons
 * that are never directly imported.
 */
const iconMap: Record<string, LucideIcon> = {
  Syringe,
  Heart,
  Brain,
  Baby,
  Bone,
  Sparkles,
  Eye,
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function toPascalCase(name: string): string {
  return name
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

export function getIconComponent(iconName: string): LucideIcon {
  if (!iconName) return HelpCircle;
  const key = toPascalCase(iconName);
  return (
    iconMap[key] ??
    (typeof (LucideIcons as Record<string, unknown>)[key] === "function"
      ? ((LucideIcons as Record<string, unknown>)[key] as LucideIcon)
      : HelpCircle)
  );
}
