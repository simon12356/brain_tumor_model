import React, { useEffect } from 'react';
import type { PredictionResult } from '../types';
import { TUMOR_INFO } from '../constants/tumorData';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  AlertTriangle,
  FileText,
  RotateCcw,
  Zap,
  Activity,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface DiagnosticCardProps {
  result: PredictionResult;
  onReset: () => void;
  onOpenReport: () => void;
  fileName?: string;
}

export const DiagnosticCard: React.FC<DiagnosticCardProps> = ({
  result,
  onReset,
  onOpenReport,
  fileName,
}) => {
  const normKey = result.prediction.toLowerCase().replace(/\s+/g, '');
  // Match key against TUMOR_INFO
  const tumorKey = Object.keys(TUMOR_INFO).find(k => k === normKey || normKey.includes(k)) || 'glioma';
  const tumorMeta = TUMOR_INFO[tumorKey] || TUMOR_INFO.notumor;
  const isHealthy = tumorKey === 'notumor';

  const confidencePercent = (result.confidence * 100).toFixed(1);

  // Trigger celebration confetti if healthy or high confidence
  useEffect(() => {
    if (isHealthy) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7']
      });
    }
  }, [isHealthy]);

  // Probabilities breakdown list
  const probs = result.probabilities || {
    [tumorKey]: result.confidence,
  };

  const classOrder = ['notumor', 'glioma', 'meningioma', 'pituitary'];

  return (
    <div className={`diagnostic-card-wrapper ${isHealthy ? 'theme-healthy' : 'theme-anomaly'}`}>
      {/* Top Banner */}
      <div className="card-top-header">
        <div className="diagnostic-badge-row">
          <div className={`triage-pill ${isHealthy ? 'triage-safe' : 'triage-danger'}`}>
            {isHealthy ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />}
            <span>{isHealthy ? 'NORMAL / NEGATIVE' : `ELEVATED RISK: ${tumorMeta.severity.toUpperCase()}`}</span>
          </div>
          {result.source === 'simulation' && (
            <span className="source-sim-tag" title="Demonstration mode simulated inference">
              <Cpu size={12} /> Simulated AI
            </span>
          )}
        </div>
        <span className="timestamp-tag">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>

      {/* Main Diagnosis Result Hero */}
      <div className="diagnosis-hero-box">
        <div className="diagnosis-meta">
          <span className="hero-subheading">PRIMARY NEURAL CLASSIFICATION</span>
          <h2 className="hero-heading">
            {tumorMeta.name}
          </h2>
          <p className="hero-category">{tumorMeta.category}</p>
        </div>

        {/* Circular Confidence Meter */}
        <div className="confidence-meter-container">
          <svg className="circular-chart" viewBox="0 0 36 36">
            <path
              className="circle-bg"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="circle-fill"
              strokeDasharray={`${confidencePercent}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="confidence-meter-text">
            <span className="confidence-value">{confidencePercent}%</span>
            <span className="confidence-label">CONFIDENCE</span>
          </div>
        </div>
      </div>

      {/* Probability Distribution Bar Matrix */}
      <div className="distribution-section">
        <div className="distribution-header">
          <div className="dist-title">
            <TrendingUp size={14} />
            <span>Multi-Class Softmax Distribution</span>
          </div>
          {result.inferenceTimeMs && (
            <span className="inference-speed">
              <Zap size={12} /> {result.inferenceTimeMs}ms inference
            </span>
          )}
        </div>

        <div className="dist-bar-list">
          {classOrder.map(cKey => {
            const prob = probs[cKey] ?? (cKey === tumorKey ? result.confidence : 0.01);
            const probPct = (prob * 100).toFixed(1);
            const isSelected = cKey === tumorKey;
            const info = TUMOR_INFO[cKey] || { name: cKey, badgeColor: '#6366f1' };

            return (
              <div key={cKey} className={`dist-bar-item ${isSelected ? 'is-selected' : ''}`}>
                <div className="dist-label-row">
                  <span className="dist-class-name">
                    {info.name} {isSelected && <CheckCircle size={12} className="inline-check" />}
                  </span>
                  <span className="dist-val">{probPct}%</span>
                </div>
                <div className="dist-track">
                  <div
                    className="dist-fill"
                    style={{
                      width: `${Math.max(Number(probPct), 2)}%`,
                      backgroundColor: info.badgeColor,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clinical Context & CAD Findings */}
      <div className="clinical-findings-box">
        <div className="findings-header">
          <Activity size={15} />
          <h4>Diagnostic Criteria & Findings</h4>
        </div>
        <p className="findings-summary">{tumorMeta.description}</p>

        <div className="findings-list">
          <div className="findings-col">
            <span className="col-subtitle">Key Biomarkers / Features:</span>
            <ul>
              {tumorMeta.characteristics.slice(0, 3).map((feat, i) => (
                <li key={i}>
                  <ChevronRight size={13} className="list-arrow" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="findings-col">
            <span className="col-subtitle">Recommended Clinical Next Steps:</span>
            <ul>
              {tumorMeta.clinicalSteps.slice(0, 3).map((step, i) => (
                <li key={i}>
                  <ChevronRight size={13} className="list-arrow" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="card-actions-footer">
        <button className="btn-primary-action" onClick={onOpenReport}>
          <FileText size={16} />
          <span>Export Clinical Report</span>
        </button>

        <button className="btn-secondary-action" onClick={onReset}>
          <RotateCcw size={16} />
          <span>Scan Another Image</span>
        </button>
      </div>

      {fileName && (
        <div className="file-origin-footer">
          <span>Source Scan: {fileName}</span>
        </div>
      )}
    </div>
  );
};
