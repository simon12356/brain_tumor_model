import React from 'react';
import type { ScanHistoryItem } from '../types';
import { TUMOR_INFO } from '../constants/tumorData';
import { X, Trash2, Clock, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: ScanHistoryItem[];
  onSelectHistoryItem: (item: ScanHistoryItem) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onClearHistory,
  onDeleteItem,
}) => {
  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-row">
            <Clock size={18} className="drawer-icon" />
            <h3>Diagnostic Scan History</h3>
            <span className="drawer-badge">{history.length} scans</span>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-content">
          {history.length === 0 ? (
            <div className="drawer-empty-state">
              <Clock size={40} className="empty-icon" />
              <h4>No scan history yet</h4>
              <p>Uploaded scans and diagnostic predictions will be stored here automatically for rapid review.</p>
            </div>
          ) : (
            <div className="history-list">
              {history.map(item => {
                const normKey = item.prediction.toLowerCase().replace(/\s+/g, '');
                const tumorKey = Object.keys(TUMOR_INFO).find(k => k === normKey || normKey.includes(k)) || 'glioma';
                const isHealthy = tumorKey === 'notumor';
                const info = TUMOR_INFO[tumorKey] || TUMOR_INFO.notumor;
                const formattedTime = new Date(item.timestamp).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div key={item.id} className="history-item-card">
                    <div
                      className="history-main-click"
                      onClick={() => {
                        onSelectHistoryItem(item);
                        onClose();
                      }}
                    >
                      <img src={item.imageUrl} alt={item.fileName} className="history-thumb" />
                      <div className="history-details">
                        <div className="history-pred-row">
                          <span className={`history-label ${isHealthy ? 'label-safe' : 'label-alert'}`}>
                            {isHealthy ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                            {info.name}
                          </span>
                          <span className="history-conf">{(item.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <span className="history-filename" title={item.fileName}>{item.fileName}</span>
                        <span className="history-time">{formattedTime}</span>
                      </div>
                      <ChevronRight size={16} className="history-arrow" />
                    </div>

                    <button
                      className="history-delete-btn"
                      onClick={e => {
                        e.stopPropagation();
                        onDeleteItem(item.id);
                      }}
                      title="Delete record"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="drawer-footer">
            <button className="clear-history-btn" onClick={onClearHistory}>
              <Trash2 size={14} />
              <span>Clear All History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
