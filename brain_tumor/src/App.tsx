import { useState } from 'react';
import './App.css';

// 1. Shape of the API response
interface PredictionResult {
  prediction: string;
  confidence: number; // backend sends 0-1, not 0-100
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(selectedFile));

      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to get prediction');
      }

      setResult(data as PredictionResult);
    } catch (err: unknown) {
      // FIXED: no 'any' — use unknown and narrow
      const message = err instanceof Error? err.message : 'Error connecting to server';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setResult(null);
    setImagePreview(null);
    setFile(null);
    setError(null);
  };

  return (
    <div className="container">
      <h1>🧠 Brain Tumor Detection AI</h1>
      <p className="subtitle">Upload an MRI scan to analyze</p>

      <div className="card">
        <input
          type="file"
          id="upload"
          accept="image/*"
          onChange={handleFileChange}
          hidden
        />
        <label htmlFor="upload" className="upload-btn">
          Select MRI Image
        </label>

        {imagePreview && (
          <div className="preview-area">
            <img src={imagePreview} alt="MRI Preview" />
            {!loading &&!result && (
              <button onClick={handleAnalyze} className="analyze-btn">
                Analyze Image
              </button>
            )}
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Analyzing scan...</p>
          </div>
        )}

        {result && (
          <div className="result-area">
            <h2>Analysis Result</h2>
            <div className="result-card">
              <span className="label">Diagnosis:</span>
              <span className={`value ${result.prediction === 'notumor'? 'safe' : 'danger'}`}>
                {result.prediction.toUpperCase()}
              </span>
            </div>
            <div className="result-card">
              <span className="label">Confidence:</span>
              <span className="value">
                {(result.confidence * 100).toFixed(2)}%
              </span>
            </div>
            <button onClick={handleReset} className="reset-btn">
              Scan Another
            </button>
          </div>
        )}

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

export default App;