import React from 'react';
import { X, ShieldAlert, Cpu, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { TUMOR_INFO } from '../constants/tumorData';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container info-modal-size" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <BookOpen size={20} className="modal-icon" />
            <h3>Clinical Knowledge Base & Neural Architecture</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body modal-scrollable">
          {/* Medical Disclaimer Alert */}
          <div className="clinical-disclaimer-banner">
            <ShieldAlert size={20} className="disclaimer-icon" />
            <div>
              <strong>Investigational CAD Notice:</strong>
              <p>
                This system is a deep-learning Computer-Aided Detection (CAD) tool engineered for research, educational, and clinical triage assistance. Outputs do not constitute a definitive medical diagnosis and must be corroborated by a board-certified radiologist.
              </p>
            </div>
          </div>

          {/* Model Architecture Overview */}
          <div className="info-card-block">
            <div className="info-block-header">
              <Cpu size={18} />
              <h4>Deep Learning Classification Architecture</h4>
            </div>
            <div className="arch-specs-grid">
              <div className="arch-spec-item">
                <span className="spec-label">Base Architecture</span>
                <span className="spec-val">ResNet50 / ConvNeXt Backbone</span>
              </div>
              <div className="arch-spec-item">
                <span className="spec-label">Input Dimensions</span>
                <span className="spec-val">224 x 224 x 3 MRI Tensor</span>
              </div>
              <div className="arch-spec-item">
                <span className="spec-label">Loss Function</span>
                <span className="spec-val">Focal Categorical Cross-Entropy</span>
              </div>
              <div className="arch-spec-item">
                <span className="spec-label">Target Classes</span>
                <span className="spec-val">4 (Glioma, Meningioma, Pituitary, Normal)</span>
              </div>
            </div>
          </div>

          {/* Tumor Taxonomy Guide */}
          <div className="taxonomy-section">
            <div className="info-block-header">
              <Layers size={18} />
              <h4>Classification Classes Reference</h4>
            </div>

            <div className="taxonomy-grid">
              {Object.entries(TUMOR_INFO).map(([key, info]) => (
                <div key={key} className="taxonomy-card">
                  <div className="tax-head">
                    <span className="tax-dot" style={{ backgroundColor: info.badgeColor }}></span>
                    <h5 className="tax-title">{info.name}</h5>
                    <span className="tax-category">{info.category}</span>
                  </div>
                  <p className="tax-desc">{info.description}</p>
                  <div className="tax-features">
                    <span className="tax-feat-label">Key Radiologic Markers:</span>
                    <ul>
                      {info.characteristics.slice(0, 2).map((char, i) => (
                        <li key={i}>
                          <CheckCircle2 size={12} className="inline-tax-check" />
                          <span>{char}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn-save" onClick={onClose}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
