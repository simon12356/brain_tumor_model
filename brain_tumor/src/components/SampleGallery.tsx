import React from 'react';
import { SAMPLE_CASES } from '../constants/tumorData';
import type { SampleCase } from '../types';
import { Sparkles, ArrowRight } from 'lucide-react';

interface SampleGalleryProps {
  onSelectSample: (sample: SampleCase) => void;
  disabled?: boolean;
}

export const SampleGallery: React.FC<SampleGalleryProps> = ({
  onSelectSample,
  disabled = false,
}) => {
  return (
    <div className="sample-gallery-container">
      <div className="sample-gallery-header">
        <div className="title-with-icon">
          <Sparkles className="icon-gold" size={16} />
          <h3>Quick-Test Sample MRI Scans</h3>
        </div>
        <span className="sample-hint">Click any case to test instant diagnosis</span>
      </div>

      <div className="sample-grid">
        {SAMPLE_CASES.map(sample => {
          const isNormal = sample.label === 'notumor';
          return (
            <button
              key={sample.id}
              className={`sample-card ${isNormal ? 'sample-normal' : 'sample-tumor'}`}
              onClick={() => onSelectSample(sample)}
              disabled={disabled}
              title={`Load ${sample.title}`}
            >
              <div className="sample-thumb-wrapper">
                <img src={sample.imageSrc} alt={sample.title} className="sample-thumb" />
                <span className={`sample-badge ${isNormal ? 'badge-safe' : 'badge-alert'}`}>
                  {sample.label.toUpperCase()}
                </span>
              </div>
              <div className="sample-info">
                <h4 className="sample-title">{sample.title}</h4>
                <p className="sample-desc">{sample.description}</p>
                <div className="sample-action-row">
                  <span className="sample-cta">
                    Load Scan <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
