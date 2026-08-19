import { BookOpen, Heart, Map, Settings, Swords } from "lucide-react";
import type { RouteId } from "../domain/models";
import { useGameStore } from "../store/gameStore";

const NAV_ITEMS: Array<{ route: RouteId; label: string; icon: typeof Heart }> = [
  { route: "home", label: "伙伴", icon: Heart },
  { route: "explore", label: "探索", icon: Map },
  { route: "battle", label: "战斗", icon: Swords },
  { route: "collection", label: "图鉴", icon: BookOpen },
  { route: "settings", label: "设置", icon: Settings }
];

export function BottomNav() {
  const currentRoute = useGameStore((state) => state.currentRoute);
  const setRoute = useGameStore((state) => state.setRoute);
  const activeBattle = useGameStore((state) => state.activeBattle);

  return (
    <nav className="bottom-nav" aria-label="游戏导航">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isBattleDisabled = item.route === "battle" && !activeBattle;
        return (
          <button
            key={item.route}
            className={currentRoute === item.route ? "nav-item active" : "nav-item"}
            disabled={isBattleDisabled}
            title={item.label}
            type="button"
            onClick={() => setRoute(item.route)}
          >
            <Icon size={20} aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
