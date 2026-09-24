import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Contrast,
  Flame,
  Crosshair,
  Maximize2,
  Minimize2,
  Sliders,
  Sun
} from 'lucide-react';

interface MRIViewerProps {
  imageSrc: string;
  isAnalyzing: boolean;
  predictionLabel?: string;
}

export const MRIViewer: React.FC<MRIViewerProps> = ({
  imageSrc,
  isAnalyzing,
  predictionLabel,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrastVal, setContrastVal] = useState<number>(100);
  const [isInverted, setIsInverted] = useState<boolean>(false);
  const [isHeatmap, setIsHeatmap] = useState<boolean>(false);
  const [showCrosshairs, setShowCrosshairs] = useState<boolean>(true);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.75));

  const handleResetFilters = () => {
    setZoom(1);
    setBrightness(100);
    setContrastVal(100);
    setIsInverted(false);
    setIsHeatmap(false);
  };

  const getImageFilterStyle = () => {
    let filter = `brightness(${brightness}%) contrast(${contrastVal}%)`;
    if (isInverted) filter += ' invert(1)';
    if (isHeatmap) {
      filter += ' hue-rotate(180deg) saturate(200%) contrast(140%)';
    }
    return filter;
  };

  return (
    <div className={`dicom-viewer-container ${isFullscreen ? 'viewer-fullscreen' : ''}`}>
      {/* Top HUD bar */}
      <div className="dicom-hud-top">
        <div className="dicom-metadata">
          <span className="hud-badge">DICOM AXIAL 2D</span>
          <span className="hud-text">FOV: 240mm</span>
          <span className="hud-text">TE: 85ms | TR: 4200ms</span>
        </div>
        <div className="dicom-actions-quick">
          <button
            className={`hud-icon-btn ${showControls ? 'active' : ''}`}
            onClick={() => setShowControls(!showControls)}
            title="Image Tuning Sliders"
          >
            <Sliders size={15} />
          </button>
          <button
            className={`hud-icon-btn ${isHeatmap ? 'active' : ''}`}
            onClick={() => setIsHeatmap(!isHeatmap)}
            title="Toggle Neural Activation Heatmap"
          >
            <Flame size={15} />
          </button>
          <button
            className={`hud-icon-btn ${isInverted ? 'active' : ''}`}
            onClick={() => setIsInverted(!isInverted)}
            title="Invert Grayscale"
          >
            <Contrast size={15} />
          </button>
          <button
            className={`hud-icon-btn ${showCrosshairs ? 'active' : ''}`}
            onClick={() => setShowCrosshairs(!showCrosshairs)}
            title="Toggle Crosshairs"
          >
            <Crosshair size={15} />
          </button>
          <button
            className="hud-icon-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle Expanded View"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="dicom-viewport">
        {/* Anatomical Orientation Markers */}
        <div className="marker marker-a">A</div>
        <div className="marker marker-p">P</div>
        <div className="marker marker-l">L</div>
        <div className="marker marker-r">R</div>

        {/* Crosshair Overlay */}
        {showCrosshairs && (
          <div className="crosshairs-overlay">
            <div className="crosshair-h"></div>
            <div className="crosshair-v"></div>
            <div className="crosshair-center"></div>
          </div>
        )}

        {/* Laser Scanline on Analyzing */}
        {isAnalyzing && (
          <div className="scanner-beam-wrapper">
            <div className="laser-beam"></div>
            <div className="scanner-grid-overlay"></div>
            <div className="scanner-pulse-tag">
              <span className="dot-pulse"></span>
              DEEP NEURAL INFERENCE IN PROGRESS
            </div>
          </div>
        )}

        {/* Image wrapper */}
        <div
          className="mri-image-wrapper"
          style={{
            transform: `scale(${zoom})`,
            transition: 'transform 0.2s ease-out',
          }}
        >
          <img
            src={imageSrc}
            alt="MRI Scan View"
            className="mri-img"
            style={{
              filter: getImageFilterStyle(),
            }}
          />
        </div>

        {/* Zoom & Adjustment Overlay Float */}
        <div className="zoom-controls-floating">
          <button onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut size={16} />
          </button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn} title="Zoom In">
            <ZoomIn size={16} />
          </button>
          <button onClick={handleResetFilters} title="Reset View">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Expanded Controls Drawer */}
      {showControls && (
        <div className="viewer-sliders-drawer">
          <div className="slider-item">
            <div className="slider-label">
              <Sun size={14} />
              <span>Brightness</span>
              <span className="slider-val">{brightness}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="180"
              value={brightness}
              onChange={e => setBrightness(Number(e.target.value))}
            />
          </div>
          <div className="slider-item">
            <div className="slider-label">
              <Contrast size={14} />
              <span>Contrast</span>
              <span className="slider-val">{contrastVal}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="200"
              value={contrastVal}
              onChange={e => setContrastVal(Number(e.target.value))}
            />
          </div>
        </div>
      )}

      {/* Bottom status strip */}
      <div className="dicom-hud-bottom">
        <span className="hud-indicator">
          <span className="status-live-dot"></span>
          256x256 RESNET-TENSOR MATRIX
        </span>
        {predictionLabel && (
          <span className="hud-pred-tag">
            DETECTED: {predictionLabel.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
};
