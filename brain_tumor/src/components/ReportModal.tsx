import React from 'react';
import { X, Printer, Activity, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { PredictionResult } from '../types';
import { TUMOR_INFO } from '../constants/tumorData';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: PredictionResult;
  imageSrc: string;
  fileName?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  result,
  imageSrc,
  fileName,
}) => {
  if (!isOpen) return null;

  const normKey = result.prediction.toLowerCase().replace(/\s+/g, '');
  const tumorKey = Object.keys(TUMOR_INFO).find(k => k === normKey || normKey.includes(k)) || 'glioma';
  const tumorMeta = TUMOR_INFO[tumorKey] || TUMOR_INFO.notumor;
  const isHealthy = tumorKey === 'notumor';
  const confidencePercent = (result.confidence * 100).toFixed(2);
  const reportId = `CAD-${Math.floor(100000 + Math.random() * 900000)}`;
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container report-modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header no-print">
          <div className="modal-title-group">
            <Activity size={20} className="modal-icon" />
            <h3>Radiological Diagnostic Report</h3>
          </div>
          <div className="report-header-actions">
            <button className="btn-print-action" onClick={handlePrint}>
              <Printer size={16} />
              <span>Print Report</span>
            </button>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Medical Sheet */}
        <div className="report-printable-area" id="printable-report">
          <div className="report-sheet">
            {/* Clinical Letterhead */}
            <div className="report-letterhead">
              <div className="clinic-info">
                <div className="report-brand">
                  <Activity size={24} className="report-brand-icon" />
                  <span className="report-brand-name">NEUROSCAN AI DIAGNOSTICS</span>
                </div>
                <span className="clinic-sub">Computer-Aided Detection (CAD) Neural Radiography Suite</span>
                <span className="clinic-address">Automated MRI Neuro-Oncology Triage Protocol</span>
              </div>
              <div className="report-id-badge">
                <span className="rep-label">REPORT ID</span>
                <span className="rep-value">{reportId}</span>
                <span className="rep-date">{currentDate}</span>
              </div>
            </div>

            <div className="report-divider"></div>

            {/* Patient / Scan Metadata Grid */}
            <div className="report-metadata-grid">
              <div className="meta-cell">
                <span className="meta-key">Specimen / Scan File:</span>
                <span className="meta-val">{fileName || 'Axial-Brain-MRI-01.dcm'}</span>
              </div>
              <div className="meta-cell">
                <span className="meta-key">Modality & Sequence:</span>
                <span className="meta-val">Axial MRI (T1-Gd / T2 Contrast)</span>
              </div>
              <div className="meta-cell">
                <span className="meta-key">Inference Latency:</span>
                <span className="meta-val">{result.inferenceTimeMs || 42} ms</span>
              </div>
              <div className="meta-cell">
                <span className="meta-key">Pipeline Model:</span>
                <span className="meta-val">Multi-Class NeuroNet CNN v2</span>
              </div>
            </div>

            {/* Split Scan View & Primary Diagnosis */}
            <div className="report-body-split">
              <div className="report-image-col">
                <div className="report-scan-frame">
                  <img src={imageSrc} alt="MRI Scan Reference" className="report-mri-img" />
                  <span className="report-img-caption">Figure 1: Axial Brain MRI Presentation</span>
                </div>
              </div>

              <div className="report-diagnosis-col">
                <div className={`report-diagnosis-box ${isHealthy ? 'rep-healthy' : 'rep-anomaly'}`}>
                  <span className="rep-box-label">PRIMARY CAD DIAGNOSIS</span>
                  <div className="rep-box-title-row">
                    {isHealthy ? <ShieldCheck size={24} /> : <AlertTriangle size={24} />}
                    <h4>{tumorMeta.name}</h4>
                  </div>
                  <span className="rep-category-tag">{tumorMeta.category}</span>

                  <div className="rep-metrics-row">
                    <div className="rep-metric-item">
                      <span className="rep-metric-lbl">CONFIDENCE SCORE</span>
                      <span className="rep-metric-num">{confidencePercent}%</span>
                    </div>
                    <div className="rep-metric-item">
                      <span className="rep-metric-lbl">TRIAGE SEVERITY</span>
                      <span className="rep-metric-num">{tumorMeta.severity.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="report-text-block">
                  <h5>Radiological Interpretation Summary</h5>
                  <p>{tumorMeta.description}</p>
                </div>
              </div>
            </div>

            {/* Multi-Class Softmax Breakdown */}
            {result.probabilities && (
              <div className="report-section">
                <h5>Softmax Probability Distribution</h5>
                <div className="report-prob-grid">
                  {Object.entries(result.probabilities).map(([key, val]) => {
                    const info = TUMOR_INFO[key] || { name: key };
                    const pct = (val * 100).toFixed(1);
                    return (
                      <div key={key} className="report-prob-item">
                        <div className="rep-prob-head">
                          <span>{info.name}</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="rep-prob-track">
                          <div className="rep-prob-fill" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommended Clinical Next Steps */}
            <div className="report-section">
              <h5>Recommended Clinical Actions & Protocol</h5>
              <ul className="report-bullets">
                {tumorMeta.clinicalSteps.map((step, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={13} className="rep-check" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sign-off & Verification */}
            <div className="report-signatures">
              <div className="sig-block">
                <div className="sig-line"></div>
                <span className="sig-title">Automated CAD Verification System</span>
                <span className="sig-sub">NeuroScan Neural Core v2.4</span>
              </div>
              <div className="sig-block">
                <div className="sig-line"></div>
                <span className="sig-title">Attending Radiologist Review & Signature</span>
                <span className="sig-sub">MD, Radiologist / Neuro-Oncologist</span>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="report-footer-disclaimer">
              <p>
                CONFIDENTIAL MEDICAL CAD RECORD • For professional clinical decision-support only. Must be interpreted in conjunction with complete clinical patient history and multi-planar cross-sectional imaging.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer no-print">
          <button className="modal-btn-cancel" onClick={onClose}>
            Close
          </button>
          <button className="btn-print-action" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
