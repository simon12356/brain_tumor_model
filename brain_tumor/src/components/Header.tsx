import React from 'react';
import { Activity, Settings, History, Info, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface HeaderProps {
  isServerOnline: boolean | null;
  isSimulationMode: boolean;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenInfo: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isServerOnline,
  isSimulationMode,
  onOpenSettings,
  onOpenHistory,
  onOpenInfo,
  historyCount,
}) => {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-logo-container">
          <div className="pulse-halo"></div>
          <div className="logo-icon-wrapper">
            <Activity className="brand-icon" />
          </div>
        </div>
        <div className="brand-text">
          <div className="brand-title-row">
            <span className="brand-title">NeuroScan</span>
            <span className="brand-badge">AI CAD v2.4</span>
          </div>
          <span className="brand-subtitle">Deep Learning MRI Brain Tumor Diagnostic Suite</span>
        </div>
      </div>

      <div className="header-actions">
        {/* Status Indicator Badge */}
        <div
          className={`status-pill ${
            isSimulationMode
              ? 'status-sim'
              : isServerOnline === true
              ? 'status-online'
              : isServerOnline === false
              ? 'status-offline'
              : 'status-checking'
          }`}
          onClick={onOpenSettings}
          title="Click to configure API connection"
        >
          {isSimulationMode ? (
            <>
              <Sparkles className="status-icon" size={14} />
              <span>Simulation Mode</span>
            </>
          ) : isServerOnline === true ? (
            <>
              <CheckCircle2 className="status-icon" size={14} />
              <span>Backend Connected</span>
            </>
          ) : isServerOnline === false ? (
            <>
              <AlertCircle className="status-icon" size={14} />
              <span>Backend Offline</span>
            </>
          ) : (
            <>
              <span className="status-dot-pulse"></span>
              <span>Checking Server...</span>
            </>
          )}
        </div>

        {/* History Button */}
        <button
          className="header-btn"
          onClick={onOpenHistory}
          aria-label="Scan History"
          title="Scan History & Past Diagnostics"
        >
          <History size={18} />
          <span className="btn-label">History</span>
          {historyCount > 0 && <span className="counter-badge">{historyCount}</span>}
        </button>

        {/* Info / Guide Button */}
        <button
          className="header-btn"
          onClick={onOpenInfo}
          aria-label="Clinical Guide"
          title="Tumor Guide & Model Architecture"
        >
          <Info size={18} />
          <span className="btn-label">Guide</span>
        </button>

        {/* Settings Button */}
        <button
          className="header-btn"
          onClick={onOpenSettings}
          aria-label="Settings"
          title="API Endpoint & System Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};
