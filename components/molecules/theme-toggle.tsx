"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="text-text-body hover:bg-transparent"
        aria-label="Toggle theme"
      >
        <span className="relative size-5">
          <Sun className="size-5" />
        </span>
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="group text-text-body hover:bg-transparent overflow-visible"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <span className="relative size-5 block rounded-full transition-all duration-200">
        <span
          className={`absolute inset-0 flex items-center justify-center transition-[color,transform] duration-200 text-text-body group-hover:text-orange-500 ${
            isDark ? "scale-0" : "scale-100"
          }`}
        >
          <Sun className="size-5" />
        </span>
        <span
          className={`absolute inset-0 flex items-center justify-center transition-[color,transform] duration-200 text-text-body group-hover:text-orange-500 ${
            isDark ? "scale-100" : "scale-0"
          }`}
        >
          <Moon className="size-5" />
        </span>
      </span>
    </Button>
  );
}
