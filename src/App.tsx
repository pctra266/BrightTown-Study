import { AuthProvider } from './contexts/AuthContext';
import { RouterProvider } from 'react-router-dom';
import router from "./route/routers";
import { useEffect, useState} from 'react';

const App = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
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
        .finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []);

  if (!ready) return <div className="loading">Loading...</div>;

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
