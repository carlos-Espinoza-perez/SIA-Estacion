import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '../../atoms/Button/Button';

export interface CameraCaptureProps {
  onCapture: (files: File[]) => void;
  onCancel: () => void;
}

type CaptureMode = 'idle' | 'camera' | 'preview' | 'upload-preview';

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<CaptureMode>('idle');
  const [capturedDataUrls, setCapturedDataUrls] = useState<string[]>([]);
  const [capturedFiles, setCapturedFiles] = useState<File[]>([]);
  const [cameraError, setCameraError] = useState<string>('');

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // Conectar el stream al <video> DESPUÉS de que React renderice el modo 'camera'
  useEffect(() => {
    if (mode === 'camera' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current
        .play()
        .catch((err) => console.error('Error al reproducir video:', err));
    }
  }, [mode]);

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      });
      streamRef.current = stream;
      // Primero actualizamos el modo (React renderiza el <video>)
      // El useEffect de arriba se encarga de conectar el stream al elemento
      setMode('camera');
    } catch {
      setCameraError('No se pudo acceder a la cámara. Verifique los permisos del navegador.');
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedDataUrls([dataUrl]);
    stopCamera();

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], 'foto_referencia.jpg', { type: 'image/jpeg' });
          setCapturedFiles([file]);
        }
      },
      'image/jpeg',
      0.92
    );
    setMode('preview');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const previews = await Promise.all(files.map((file) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    })));

    setCapturedDataUrls(previews);
    setCapturedFiles(files);
    setMode('upload-preview');
    e.target.value = '';
  };

  const retake = () => {
    setCapturedDataUrls([]);
    setCapturedFiles([]);
    startCamera();
  };

  const confirm = () => {
    if (capturedFiles.length > 0) onCapture(capturedFiles);
  };

  // ── Idle screen ──
  if (mode === 'idle') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {cameraError && (
          <div
            style={{
              padding: '10px 14px',
              background: 'rgba(255, 69, 58, 0.12)',
              border: '1px solid rgba(255, 69, 58, 0.3)',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#FF453A',
            }}
          >
            {cameraError}
          </div>
        )}

        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px dashed rgba(255,255,255,0.12)',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            textAlign: 'center',
          }}
        >
          {/* Face icon hint */}
          <div style={{ position: 'relative', width: '80px', height: '90px' }}>
            <svg viewBox="0 0 80 90" fill="none" width="80" height="90">
              <ellipse
                cx="40"
                cy="44"
                rx="28"
                ry="36"
                stroke="rgba(10,132,255,0.5)"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              <circle cx="32" cy="38" r="3" fill="rgba(255,255,255,0.3)" />
              <circle cx="48" cy="38" r="3" fill="rgba(255,255,255,0.3)" />
              <path
                d="M33 52 Q40 58 47 52"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>

          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', margin: '0 0 4px 0' }}>
              Fotografía para reconocimiento facial
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              Use la cámara web para una mejor precisión,<br />o suba un archivo de su dispositivo.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button variant="primary" size="sm" onClick={startCamera}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Usar cámara web
            </Button>
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Subir archivo
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  // ── Camera live view ──
  if (mode === 'camera') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#000', lineHeight: 0 }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', display: 'block', maxHeight: '440px', objectFit: 'cover' }}
          />

          {/* Sombra oscura con hueco del óvalo */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              WebkitMaskImage:
                'radial-gradient(ellipse 58% 62% at 50% 46%, transparent 100%, black 100%)',
              maskImage:
                'radial-gradient(ellipse 58% 62% at 50% 46%, transparent 100%, black 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Borde del óvalo */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '58%',
              aspectRatio: '3/4',
              borderRadius: '50%',
              border: '2.5px solid rgba(10,132,255,0.9)',
              boxShadow: '0 0 24px rgba(10,132,255,0.25), inset 0 0 24px rgba(10,132,255,0.06)',
              pointerEvents: 'none',
            }}
          />

          {/* Instrucción inferior */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: 0,
              right: 0,
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(6px)',
                color: '#FFFFFF',
                fontSize: '11px',
                padding: '5px 14px',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              Centre su rostro dentro del óvalo · Mire directamente a la cámara
            </span>
          </div>

          {/* Esquinas decorativas */}
          {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
            <div
              key={corner}
              style={{
                position: 'absolute',
                width: '18px',
                height: '18px',
                borderColor: 'rgba(10,132,255,0.7)',
                borderStyle: 'solid',
                borderWidth: 0,
                ...(corner === 'tl' && { top: 10, left: 10, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 4 }),
                ...(corner === 'tr' && { top: 10, right: 10, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 4 }),
                ...(corner === 'bl' && { bottom: 10, left: 10, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 4 }),
                ...(corner === 'br' && { bottom: 10, right: 10, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 4 }),
                pointerEvents: 'none',
              }}
            />
          ))}
        </div>

        {/* Canvas oculto para captura */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Tips */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          {[
            { icon: '👤', text: 'Rostro centrado y visible' },
            { icon: '💡', text: 'Buena iluminación frontal' },
            { icon: '↔️', text: 'Distancia: aprox. 50 cm' },
            { icon: '🚫', text: 'Sin lentes oscuros ni gorra' },
          ].map((tip) => (
            <div
              key={tip.text}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 8px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span>{tip.icon}</span>
              <span>{tip.text}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" onClick={() => { stopCamera(); setMode('idle'); }}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={captureFrame}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
            </svg>
            Capturar foto
          </Button>
        </div>
      </div>
    );
  }

  // ── Preview after capture or file upload ──
  if (mode === 'preview' || mode === 'upload-preview') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', lineHeight: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: capturedDataUrls.length > 1 ? 'repeat(2, minmax(0, 1fr))' : '1fr', gap: '4px' }}>
            {capturedDataUrls.map((dataUrl, index) => (
              <img
                key={dataUrl}
                src={dataUrl}
                alt={`Vista previa ${index + 1}`}
                style={{ width: '100%', height: capturedDataUrls.length > 1 ? '180px' : 'auto', maxHeight: '440px', objectFit: 'cover', display: 'block' }}
              />
            ))}
          </div>
          {/* Óvalo sobre la preview */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '58%',
              aspectRatio: '3/4',
              borderRadius: '50%',
              border: '2.5px dashed rgba(74, 222, 128, 0.8)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: 0,
              right: 0,
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                background: 'rgba(34,197,94,0.2)',
                backdropFilter: 'blur(6px)',
                color: '#4ADE80',
                fontSize: '11px',
                padding: '5px 14px',
                borderRadius: '20px',
                border: '1px solid rgba(74,222,128,0.3)',
              }}
            >
              Vista previa: {capturedFiles.length} {capturedFiles.length === 1 ? 'fotografía' : 'fotografías'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={mode === 'preview' ? retake : () => setMode('idle')}
          >
            {mode === 'preview' ? 'Volver a tomar' : 'Elegir otros archivos'}
          </Button>
          <Button variant="primary" size="sm" onClick={confirm}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {capturedFiles.length === 1 ? 'Usar esta foto' : 'Usar estas fotos'}
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
