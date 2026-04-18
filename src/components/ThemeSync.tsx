import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { syncThemeForPath } from "@/lib/theme";

const ThemeSync = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    syncThemeForPath(pathname);
  }, [pathname]);
  return null;
};

export default ThemeSync;
