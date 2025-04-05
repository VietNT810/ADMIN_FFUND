import { useEffect, useState } from "react";
import { themeChange } from "theme-change";

export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || (
      window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    );
  });

  useEffect(() => {
    themeChange(false);
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme };
}
