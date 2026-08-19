import { RotateCcw } from "lucide-react";
import { PrimaryButton } from "../components/PrimaryButton";
import { useGameStore } from "../store/gameStore";

export function SettingsPage() {
  const resetSave = useGameStore((state) => state.resetSave);

  return (
    <div className="page settings-page">
      <header className="page-hero compact">
        <p className="eyebrow">设置</p>
        <h1>Seer Web MVP v0.1</h1>
        <p>当前版本使用本地浏览器存档，不连接服务器。</p>
      </header>

      <section className="panel">
        <h2>存档</h2>
        <p>重置会清除本游戏的 LocalStorage 存档，并返回初始精灵选择。</p>
        <PrimaryButton variant="danger" icon={<RotateCcw size={18} />} onClick={resetSave}>
          重置存档
        </PrimaryButton>
      </section>

      <section className="panel">
        <h2>MVP 边界</h2>
        <p>纯前端、本地存档、竖屏体验。没有登录、交易、PvP、充值或后端服务。</p>
      </section>
    </div>
  );
}
