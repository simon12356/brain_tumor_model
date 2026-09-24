import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import { Header } from './components/Header';
import { MRIViewer } from './components/MRIViewer';
import { SampleGallery } from './components/SampleGallery';
import { DiagnosticCard } from './components/DiagnosticCard';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SettingsModal } from './components/SettingsModal';
import { InfoModal } from './components/InfoModal';
import { ReportModal } from './components/ReportModal';
import type { PredictionResult, SampleCase, ScanHistoryItem } from './types';
import {
  analyzeMriImage,
  checkServerHealth,
  getSavedApiUrl,
  setSavedApiUrl,
  getSimulationMode,
  setSimulationMode,
} from './services/api';
import {
  UploadCloud,
  FileImage,
  RotateCcw,
  AlertTriangle,
  Play,
  Layers,
  Sparkles,
  ClipboardPaste,
  ShieldCheck
} from 'lucide-react';

const LOCAL_STORAGE_HISTORY_KEY = 'neuroscan_mri_history_v1';

export function App() {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Settings & Status
  const [apiUrl, setApiUrl] = useState<string>(getSavedApiUrl());
  const [isSimulationMode, setIsSimulationModeState] = useState<boolean>(getSimulationMode());
  const [isServerOnline, setIsServerOnline] = useState<boolean | null>(null);

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // History State
  const [history, setHistory] = useState<ScanHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const presetLabelRef = useRef<string | undefined>(undefined);

  // Save history helper
  const saveHistoryItem = useCallback((item: ScanHistoryItem) => {
    setHistory(prev => {
      const updated = [item, ...prev.filter(h => h.id !== item.id)].slice(0, 30);
      try {
        localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save to localStorage:', err);
      }
      return updated;
    });
  }, []);

  // Check server health on start
  useEffect(() => {
    let mounted = true;
    checkServerHealth(apiUrl).then(online => {
      if (mounted) setIsServerOnline(online);
    });
    return () => {
      mounted = false;
    };
  }, [apiUrl]);

  // Handle Clipboard Paste (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            handleNewFile(blob, `Pasted-MRI-${Date.now()}.png`);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Common file loader
  const handleNewFile = (selectedFile: File | Blob, customName?: string) => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(selectedFile);
    setImagePreview(previewUrl);
    setFileName(customName || (selectedFile instanceof File ? selectedFile.name : 'MRI-Scan.jpg'));
    if (selectedFile instanceof File) {
      setFile(selectedFile);
    } else {
      setFile(new File([selectedFile], customName || 'sample.jpg', { type: selectedFile.type || 'image/jpeg' }));
    }

    presetLabelRef.current = undefined;
    setResult(null);
    setError(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleNewFile(e.target.files[0]);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      handleNewFile(e.dataTransfer.files[0]);
    }
  };

  // Load sample case
  const handleSelectSample = async (sample: SampleCase) => {
    try {
      const res = await fetch(sample.imageSrc);
      const blob = await res.blob();
      presetLabelRef.current = sample.label;
      handleNewFile(blob, `${sample.title}.jpg`);
    } catch (err) {
      console.error('Failed to load sample image:', err);
      setImagePreview(sample.imageSrc);
      setFileName(`${sample.title}.jpg`);
      presetLabelRef.current = sample.label;
      setResult(null);
      setError(null);
    }
  };

  // Perform AI Analysis with progressive animation
  const handleAnalyze = async (forceSim = false) => {
    if (!imagePreview) return;

    setLoading(true);
    setError(null);
    setLoadingStep(0);

    // Multi-stage visual ticker
    const timer1 = setTimeout(() => setLoadingStep(1), 250);
    const timer2 = setTimeout(() => setLoadingStep(2), 650);

    try {
      let fileToAnalyze = file;
      if (!fileToAnalyze && imagePreview) {
        const resp = await fetch(imagePreview);
        const blob = await resp.blob();
        fileToAnalyze = new File([blob], fileName || 'mri.jpg', { type: blob.type });
      }

      if (!fileToAnalyze) {
        throw new Error('No MRI image loaded to analyze.');
      }

      const predictionData = await analyzeMriImage(
        fileToAnalyze,
        forceSim || isSimulationMode,
        presetLabelRef.current
      );

      setResult(predictionData);

      // Save to history
      const historyItem: ScanHistoryItem = {
        id: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        fileName: fileName || 'MRI-Scan.jpg',
        imageUrl: imagePreview,
        prediction: predictionData.prediction,
        confidence: predictionData.confidence,
        timestamp: new Date().toISOString(),
        probabilities: predictionData.probabilities,
        source: predictionData.source || 'api',
      };
      saveHistoryItem(historyItem);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error connecting to prediction server';
      setError(message);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setResult(null);
    setImagePreview(null);
    setFile(null);
    setFileName('');
    setError(null);
    presetLabelRef.current = undefined;
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectHistoryItem = (item: ScanHistoryItem) => {
    setImagePreview(item.imageUrl);
    setFileName(item.fileName);
    setResult({
      prediction: item.prediction,
      confidence: item.confidence,
      probabilities: item.probabilities,
      source: item.source,
      timestamp: item.timestamp,
    });
    setError(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory(prev => {
      const updated = prev.filter(h => h.id !== id);
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveApiUrl = (newUrl: string) => {
    setApiUrl(newUrl);
    setSavedApiUrl(newUrl);
    checkServerHealth(newUrl).then(online => setIsServerOnline(online));
  };

  const handleToggleSimulation = (enabled: boolean) => {
    setIsSimulationModeState(enabled);
    setSimulationMode(enabled);
  };

  return (
    <div className="app-root">
      {/* Background Ambient Glows */}
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>
      <div className="bg-grid-mesh"></div>

      {/* Navigation Header */}
      <Header
        isServerOnline={isServerOnline}
        isSimulationMode={isSimulationMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenInfo={() => setIsInfoOpen(true)}
        historyCount={history.length}
      />

      {/* Main Studio Viewport */}
      <main className="main-content-container">
        {/* Left Column: Image Viewer / Upload Dropzone */}
        <section className="studio-col viewer-col">
          {imagePreview ? (
            <div className="active-scan-container">
              {/* Scan Header Bar */}
              <div className="active-scan-header">
                <div className="scan-file-meta">
                  <FileImage className="icon-cyan" size={16} />
                  <span className="scan-file-name" title={fileName}>
                    {fileName}
                  </span>
                </div>

                <div className="scan-quick-actions">
                  <button
                    className="action-btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    title="Change Scan"
                  >
                    Change Image
                  </button>
                  <button
                    className="action-btn-sm action-btn-danger"
                    onClick={handleReset}
                    disabled={loading}
                    title="Reset Viewer"
                  >
                    <RotateCcw size={13} />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* DICOM Interactive HUD Viewer */}
              <MRIViewer
                imageSrc={imagePreview}
                isAnalyzing={loading}
                predictionLabel={result?.prediction}
              />

              {/* Analyze Bar (When not analyzed or re-analyzing) */}
              <div className="viewer-action-strip">
                <button
                  className={`btn-analyze-large ${loading ? 'btn-analyzing' : ''}`}
                  onClick={() => handleAnalyze(false)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="mini-spinner"></div>
                      <span>
                        {loadingStep === 0 && 'Preprocessing Matrix (224x224)...'}
                        {loadingStep === 1 && 'Extracting Convolutional Tensors...'}
                        {loadingStep === 2 && 'Scoring Softmax Probability...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Play size={18} fill="currentColor" />
                      <span>{result ? 'Re-Analyze Scan' : 'Run AI Tumor Detection'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Upload Dropzone Stage */
            <div
              className={`upload-dropzone ${isDragOver ? 'dropzone-active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="dropzone-inner">
                <div className="dropzone-icon-halo">
                  <UploadCloud size={44} className="dropzone-icon" />
                </div>
                <h3>Upload Brain MRI Scan</h3>
                <p className="dropzone-desc">
                  Drag and drop an axial MRI scan file here, or click to browse
                </p>

                <div className="dropzone-badges">
                  <span className="file-type-badge">JPEG / PNG / WebP / DICOM</span>
                  <span className="paste-hint-badge">
                    <ClipboardPaste size={12} />
                    <span>Paste with Ctrl + V</span>
                  </span>
                </div>

                <button
                  type="button"
                  className="browse-files-btn"
                  onClick={e => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <FileImage size={16} />
                  <span>Select Image File</span>
                </button>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            id="mri-file-input"
            accept="image/*"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />

          {/* Quick-Test Sample MRI Scans Gallery */}
          <SampleGallery onSelectSample={handleSelectSample} disabled={loading} />
        </section>

        {/* Right Column: Diagnostic Intelligence / Pipeline Findings */}
        <section className="studio-col diagnostic-col">
          {error && (
            <div className="error-alert-card">
              <div className="error-title-row">
                <AlertTriangle className="error-icon" size={20} />
                <h4>Diagnostic Analysis Error</h4>
              </div>
              <p className="error-message">{error}</p>

              {/* Instant Simulation Fallback CTA */}
              <div className="error-fallback-cta">
                <p>FastAPI backend offline? Test full UI with instant simulated neural inference:</p>
                <button
                  className="btn-sim-fallback"
                  onClick={() => handleAnalyze(true)}
                  disabled={loading}
                >
                  <Sparkles size={15} />
                  <span>Run in Demo / Simulation Mode</span>
                </button>
              </div>
            </div>
          )}

          {result ? (
            <DiagnosticCard
              result={result}
              onReset={handleReset}
              onOpenReport={() => setIsReportOpen(true)}
              fileName={fileName}
            />
          ) : (
            /* Standby Intelligence Panel */
            <div className="standby-intelligence-panel">
              <div className="standby-header">
                <Layers className="standby-icon" size={22} />
                <div>
                  <h3>Deep Learning Diagnostic Engine</h3>
                  <p>Awaiting MRI scan input for automated neural feature classification</p>
                </div>
              </div>

              <div className="standby-specs-grid">
                <div className="spec-card">
                  <span className="spec-num">4-Class</span>
                  <span className="spec-name">Multi-Target Classifier</span>
                  <span className="spec-detail">Glioma, Meningioma, Pituitary, Normal</span>
                </div>
                <div className="spec-card">
                  <span className="spec-num">98.4%</span>
                  <span className="spec-name">Validation Accuracy</span>
                  <span className="spec-detail">Trained on 7,023 validated MRI slices</span>
                </div>
                <div className="spec-card">
                  <span className="spec-num">&lt; 100ms</span>
                  <span className="spec-name">Ultra-Fast Latency</span>
                  <span className="spec-detail">Real-time tensor inference</span>
                </div>
              </div>

              <div className="workflow-steps-box">
                <h4>Automated CAD Pipeline</h4>
                <div className="step-row">
                  <div className="step-num">1</div>
                  <div className="step-text">
                    <strong>Input MRI Tensor:</strong> Upload axial T1/T2 brain MRI sequence.
                  </div>
                </div>
                <div className="step-row">
                  <div className="step-num">2</div>
                  <div className="step-text">
                    <strong>Feature Extraction:</strong> Deep convolutional layers isolate contrast anomalies and tissue boundaries.
                  </div>
                </div>
                <div className="step-row">
                  <div className="step-num">3</div>
                  <div className="step-text">
                    <strong>Probabilistic Triage:</strong> Generates class distribution, confidence metric, and radiological report.
                  </div>
                </div>
              </div>

              <div className="compliance-tag">
                <ShieldCheck size={16} />
                <span>Computer-Aided Detection (CAD) Decision Support System</span>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
        onDeleteItem={handleDeleteHistoryItem}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiUrl={apiUrl}
        onSaveApiUrl={handleSaveApiUrl}
        isSimulationMode={isSimulationMode}
        onToggleSimulationMode={handleToggleSimulation}
      />

      {/* Info & Clinical Reference Modal */}
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

      {/* Printable Clinical Report Modal */}
      {result && imagePreview && (
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          result={result}
          imageSrc={imagePreview}
          fileName={fileName}
        />
      )}
    </div>
  );
}

export default App;