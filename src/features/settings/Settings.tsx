import React, { useContext, useState } from "react";
import {
  Bell,
  Clock,
  Github,
  Heart,
  MessageCircle,
  Monitor,
  RefreshCcw,
  Shield,
} from "lucide-react";
import { PreviewContext } from "../../context/PreviewContext";
import alipayImg from "../../assets/alipay.jpg";
import qqImg from "../../assets/qq.png";
import { useTaskStore } from "../../store";

const SettingsPage: React.FC = () => {
  const setPreview = useContext(PreviewContext);
  const {
    configFocusMinutes,
    resetAppData,
    settings,
    setConfigFocusMinutes,
    updateSetting,
  } = useTaskStore();
  const [resetStep, setResetStep] = useState(0);

  const toggleItems = [
    {
      icon: <Shield size={18} color="#a855f7" />,
      label: "窗口置顶",
      active: settings.alwaysOnTop,
      onClick: () => updateSetting("alwaysOnTop", !settings.alwaysOnTop),
    },
    {
      icon: <Monitor size={18} color="#3b82f6" />,
      label: "开机自启",
      active: settings.autoStart,
      onClick: () => updateSetting("autoStart", !settings.autoStart),
    },
    {
      icon: <Bell size={18} color="#6366f1" />,
      label: "整点报时",
      active: settings.hourlyChime,
      onClick: () => updateSetting("hourlyChime", !settings.hourlyChime),
    },
    {
      icon: <Monitor size={18} color="#f59e0b" />,
      label: "任务栏图标",
      active: !settings.skipTaskbar,
      onClick: () => updateSetting("skipTaskbar", !settings.skipTaskbar),
    },
  ];

  const actionItems = [
    {
      icon: <MessageCircle size={18} color="#38bdf8" />,
      label: "问题反馈",
      actionLabel: "加群",
      onClick: () => setPreview(qqImg),
    },
    {
      icon: <Heart size={18} color="#f43f5e" />,
      label: "赞助支持",
      actionLabel: "支持",
      onClick: () => setPreview(alipayImg),
    },
    {
      icon: <Github size={18} color="#fff" />,
      label: "开源项目",
      actionLabel: "Star",
      onClick: () =>
        window.electronAPI?.openExternal("https://github.com/UniqueYu8988/YuToys"),
    },
  ];

  const handleReset = () => {
    if (resetStep < 2) {
      setResetStep(resetStep + 1);
      return;
    }

    resetAppData();
    useTaskStore.persist.clearStorage();
    window.location.reload();
  };

  return (
    <div className="page settings-page">
      <div className="settings-list">
        {toggleItems.map((item) => (
          <div className="settings-row" key={item.label}>
            <div className="settings-main">
              {item.icon}
              <span className="settings-label">{item.label}</span>
            </div>
            <div
              className={`native-toggle ${item.active ? "on" : ""}`}
              onClick={item.onClick}
            >
              <div className="thumb" />
            </div>
          </div>
        ))}

        <div className="settings-row">
          <div className="settings-main">
            <Clock size={18} color="#10b981" />
            <span className="settings-label">计时设置</span>
          </div>
          <div className="settings-inline">
            <input
              type="number"
              min="1"
              max="99"
              value={configFocusMinutes}
              onChange={(event) =>
                setConfigFocusMinutes(
                  Math.max(1, Math.min(99, parseInt(event.target.value) || 1)),
                )
              }
              className="seamless-num-input no-spinner"
            />
            <span className="settings-unit">MIN</span>
          </div>
        </div>

        {actionItems.map((item) => (
          <div className="settings-row" key={item.label}>
            <div className="settings-main">
              {item.icon}
              <span className="settings-label">{item.label}</span>
            </div>
            <button className="text-action-btn" onClick={item.onClick}>
              {item.actionLabel}
            </button>
          </div>
        ))}

        <div className="settings-row settings-row-danger">
          <div className="settings-main">
            <RefreshCcw size={18} />
            <span className="settings-label">重置数据</span>
          </div>
          <button
            className={`text-action-btn ${resetStep > 0 ? "danger-btn-inline" : ""}`}
            onClick={handleReset}
          >
            {resetStep === 0 ? "确认" : `确认 ${resetStep}/2`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
