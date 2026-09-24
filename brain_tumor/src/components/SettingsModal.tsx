import React, { useState } from 'react';
import {
  X,
  Server,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { checkServerHealth, DEFAULT_API_URL } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiUrl: string;
  onSaveApiUrl: (url: string) => void;
  isSimulationMode: boolean;
  onToggleSimulationMode: (enabled: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiUrl,
  onSaveApiUrl,
  isSimulationMode,
  onToggleSimulationMode,
}) => {
  const [urlInput, setUrlInput] = useState(apiUrl);
  const [testingStatus, setTestingStatus] = useState<'idle' | 'testing' | 'online' | 'offline'>('idle');

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestingStatus('testing');
    const isOnline = await checkServerHealth(urlInput);
    setTestingStatus(isOnline ? 'online' : 'offline');
  };

  const handleSave = () => {
    onSaveApiUrl(urlInput);
    onClose();
  };

  const handleResetDefault = () => {
    setUrlInput(DEFAULT_API_URL);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Sliders size={20} className="modal-icon" />
            <h3>System & API Configuration</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Simulation / Demo Mode Toggle */}
          <div className="setting-section">
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-title-with-icon">
                  <Sparkles size={16} className="icon-sim" />
                  <strong>Demo / Simulation Mode</strong>
                </div>
                <p className="setting-desc">
                  Run high-fidelity neural inference simulations directly in the browser. Useful for UI demonstrations, testing, or when the Python backend is offline.
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isSimulationMode}
                  onChange={e => onToggleSimulationMode(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          {/* Backend API Endpoint */}
          <div className="setting-section">
            <label className="input-label">
              <Server size={15} />
              <span>FastAPI / PyTorch Backend Endpoint URL</span>
            </label>
            <div className="input-group">
              <input
                type="text"
                className="text-input"
                placeholder="http://127.0.0.1:8000/predict"
                value={urlInput}
                onChange={e => {
                  setUrlInput(e.target.value);
                  setTestingStatus('idle');
                }}
              />
              <button
                type="button"
                className="btn-test-conn"
                onClick={handleTestConnection}
                disabled={testingStatus === 'testing'}
              >
                {testingStatus === 'testing' ? (
                  <RefreshCw size={14} className="spin" />
                ) : (
                  'Test Ping'
                )}
              </button>
            </div>

            {/* Test connection result banner */}
            {testingStatus === 'online' && (
              <div className="status-box status-online">
                <CheckCircle2 size={16} />
                <span>Backend reachable and responding!</span>
              </div>
            )}
            {testingStatus === 'offline' && (
              <div className="status-box status-offline">
                <AlertCircle size={16} />
                <span>Could not reach backend at this address. Check if your FastAPI/Uvicorn server is running on port 8000.</span>
              </div>
            )}

            <div className="setting-actions-sub">
              <button className="btn-text-link" onClick={handleResetDefault}>
                <RotateCcw size={13} />
                <span>Reset to Default ({DEFAULT_API_URL})</span>
              </button>
            </div>
          </div>

          {/* Diagnostics Guide Box */}
          <div className="info-callout">
            <strong>Expected FastAPI API Contract:</strong>
            <code>POST /predict (multipart/form-data with 'file')</code>
            <p>Returns JSON: <code>&#123; "prediction": "glioma", "confidence": 0.98 &#125;</code></p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-btn-save" onClick={handleSave}>
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
