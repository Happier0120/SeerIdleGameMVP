import { useEffect } from "react";
import { AppShell } from "../components/AppShell";
import { BattlePage } from "../pages/BattlePage";
import { CollectionPage } from "../pages/CollectionPage";
import { ExplorePage } from "../pages/ExplorePage";
import { HomePage } from "../pages/HomePage";
import { SettingsPage } from "../pages/SettingsPage";
import { StarterPage } from "../pages/StarterPage";
import { useGameStore } from "../store/gameStore";

export function App() {
  const hasChosenStarter = useGameStore((state) => state.hasChosenStarter);
  const currentRoute = useGameStore((state) => state.currentRoute);
  const refreshExploreTask = useGameStore((state) => state.refreshExploreTask);

  useEffect(() => {
    refreshExploreTask();

    const handleFocus = () => refreshExploreTask();
    window.addEventListener("focus", handleFocus);

    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshExploreTask]);

  if (!hasChosenStarter) {
    return (
      <AppShell>
        <StarterPage />
      </AppShell>
    );
  }

  const page = (() => {
    switch (currentRoute) {
      case "explore":
        return <ExplorePage />;
      case "battle":
        return <BattlePage />;
      case "collection":
        return <CollectionPage />;
      case "settings":
        return <SettingsPage />;
      case "home":
      case "starter":
      default:
        return <HomePage />;
    }
  })();

  return <AppShell showNav>{page}</AppShell>;
}
