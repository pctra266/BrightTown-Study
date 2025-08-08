import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext.tsx";
const today = new Date().toISOString().split("T")[0];
if (sessionStorage.getItem("visitedToday") !== today) {
  sessionStorage.setItem("visitedToday", today);
  fetch("http://localhost:9000/siteStats")
    .then(res => res.json())
    .then(stats => {
      const todayStat = stats.find((s: any) => s.date === today);
      if (todayStat) {
        return fetch(`http://localhost:9000/siteStats/${todayStat.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visits: todayStat.visits + 1 })
        });
      } else {
        return fetch("http://localhost:9000/siteStats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: today,
            visits: 1,
            flashcardsStudied: 0
          })
        });
      }
    })
    .catch(err => console.error("Lỗi cập nhật visits:", err));
}

createRoot(document.getElementById("root")!).render(
    <ThemeProvider>
      <App />
    </ThemeProvider>

);
