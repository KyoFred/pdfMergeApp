// App.js
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [merging, setMerging] = useState(false);
  const [mergedFile, setMergedFile] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
    
    await uploadFiles(selectedFiles);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const selectedFiles = Array.from(e.dataTransfer.files || []);
    if (selectedFiles.length === 0) return;
    
    await uploadFiles(selectedFiles);
  };

  const uploadFiles = async (selectedFiles) => {
    setError(null);
    setUploading(true);
    
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('documents', file);
      });
      
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setFiles(prevFiles => [...prevFiles, ...response.data.files]);
    } catch (err) {
      setError(err.response?.data?.error || 'Errore durante il caricamento dei file');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (id) => {
    const fileElement = document.querySelector(`[data-file-id="${id}"]`);
    if (fileElement) {
      fileElement.classList.add('removing');
      setTimeout(() => {
        setFiles(files.filter(file => file.id !== id));
      }, 300);
    } else {
      setFiles(files.filter(file => file.id !== id));
    }
  };

  const mergePDFs = async () => {
    setError(null);
    setMerging(true);
    
    try {
      const response = await axios.post(`${API_URL}/merge`, {
        files
      });
      
      setMergedFile(response.data.file);
    } catch (err) {
      setError(err.response?.data?.error || 'Errore durante l\'unione dei PDF');
      console.error('Merge error:', err);
    } finally {
      setMerging(false);
    }
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('image')) return '🖼️';
    if (type.includes('text')) return '📃';
    return '📁';
  };

  const getFileSize = (size) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo-container">
            <img src="/kyocera-logo.svg" alt="Kyocera" className="kyocera-logo" width="147" height="32" />
            <span>KYOCERA Document Solutions</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <h1 className="c-title c-title--h1 l-hero__title">Unisci i tuoi documenti in modo semplice e veloce</h1>
          <section className="upload-section">
            <div 
              className={`drop-zone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="drop-zone-content">
                {uploading ? (
                  <>
                    <div className="loading-spinner"></div>
                    <h2 className="loading-message">Caricamento in corso</h2>
                    <p className="loading-subtitle">Attendere il completamento</p>
                  </>
                ) : (
                  <>
                    <i className="upload-icon">📄</i>
                    <h2 className="c-title c-title--h2">Carica i tuoi documenti</h2>
                    <p>Trascina i file qui o</p>
                    <label className="kyocera-button">
                      SELEZIONA FILE
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <p className="file-types">PDF, Word, Immagini</p>
                  </>
                )}
              </div>
            </div>
          </section>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {files.length > 0 && (
            <section className="files-section">
              <h2 className="c-title c-title--h2 l-section__title">Documenti caricati</h2>
              <div className="files-list">
                {files.map((file) => (
                  <div key={file.id} className="file-item" data-file-id={file.id}>
                    <span className="file-icon">{getFileIcon(file.type)}</span>
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{getFileSize(file.size)}</span>
                    <button 
                      className="remove-button"
                      onClick={() => removeFile(file.id)}
                      disabled={merging}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="action-buttons">
                <button 
                  className="kyocera-button"
                  onClick={mergePDFs}
                  disabled={merging || files.length < 2}
                >
                  {merging ? (
                    <>
                      <div className="loading-spinner loading-spinner--small"></div>
                      <span>UNIONE IN CORSO</span>
                    </>
                  ) : (
                    'UNISCI PDF'
                  )}
                </button>
              </div>
            </section>
          )}

          {mergedFile && (
            <section className="result-section">
              <h2 className="c-title c-title--h2 l-section__title">File Unito</h2>
              <div className="merged-file">
                <span className="file-icon">📄</span>
                <span className="file-name">{mergedFile.name}</span>
                <a 
                  href={mergedFile ? `${API_URL}/download/${mergedFile.name}` : '#'}
                  className="kyocera-button kyocera-button-success"
                  download={mergedFile ? mergedFile.name : ''}
                >
                  SCARICA
                </a>
              </div>
            </section>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p> {new Date().getFullYear()} Kyocera Document Solutions</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
