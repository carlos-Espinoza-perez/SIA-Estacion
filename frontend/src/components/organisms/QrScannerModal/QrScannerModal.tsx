import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Modal } from '../Modal/Modal';
import { Button } from '../../atoms/Button/Button';

export interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
  title?: string;
  subtitle?: string;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  title = 'Escanear Código QR de la Estación',
  subtitle = 'Apunta la cámara al código QR que se muestra en la pantalla del ESP32',
}) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'camera' | 'file'>('camera');
  const [manualCode, setManualCode] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerElementId = 'sia-qr-reader-region';

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    if (isOpen && activeTab === 'camera') {
      setCameraError(null);

      const startScanner = async () => {
        try {
          // Esperar a que el elemento DOM esté disponible en el modal
          await new Promise((r) => setTimeout(r, 200));
          const el = document.getElementById(scannerElementId);
          if (!el) return;

          html5QrCode = new Html5Qrcode(scannerElementId);
          scannerRef.current = html5QrCode;

          const cameras = await Html5Qrcode.getCameras();
          if (!cameras || cameras.length === 0) {
            setCameraError('No se detectó ninguna cámara disponible en este equipo.');
            return;
          }

          // Preferir cámara trasera en móviles o la primera cámara encontrada
          const cameraId = cameras[cameras.length - 1].id;

          await html5QrCode.start(
            cameraId,
            {
              fps: 15,
              qrbox: (viewfinderWidth, viewfinderHeight) => {
                const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                const edgeSize = Math.max(220, Math.floor(minEdge * 0.75));
                return { width: edgeSize, height: edgeSize };
              },
            },
            (decodedText) => {
              if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().then(() => {
                  onScanSuccess(decodedText);
                  onClose();
                }).catch(console.error);
              }
            },
            () => {
              // frame de escaneo sin detección
            }
          );
        } catch (err: unknown) {
          console.error('Error al inicializar cámara:', err);
          const errorMsg = err instanceof Error ? err.message : String(err);
          setCameraError(
            errorMsg.includes('Permission') || errorMsg.includes('NotAllowedError')
              ? 'Permiso de cámara denegado. Permite el acceso a la cámara en el navegador o ingresa el código manualmente.'
              : `Error al acceder a la cámara: ${errorMsg}`
          );
        }
      };

      startScanner();
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isOpen, activeTab]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('file-qr-temp-region');
      const result = await html5QrCode.scanFile(file, true);
      onScanSuccess(result);
      onClose();
    } catch (err) {
      console.error('Error al escanear archivo QR:', err);
      setCameraError('No se encontró ningún código QR válido en la imagen seleccionada.');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onScanSuccess(manualCode.trim());
    onClose();
  };

  const footer = (
    <Button type="button" variant="secondary" size="sm" onClick={onClose}>
      Cerrar
    </Button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      width={560}
      footer={footer}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '8px' }}>
        {/* Selector de pestañas: Cámara / Subir Imagen / Código Manual */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            padding: '3px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            gap: '4px',
          }}
        >
          <Button
            type="button"
            variant={activeTab === 'camera' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('camera')}
            style={{ flex: 1, height: '32px', fontSize: '12px' }}
          >
            Usar Cámara
          </Button>
          <Button
            type="button"
            variant={activeTab === 'file' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('file')}
            style={{ flex: 1, height: '32px', fontSize: '12px' }}
          >
            Subir Imagen / Foto
          </Button>
        </div>

        {/* Pestaña: Cámara */}
        {activeTab === 'camera' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '100%',
                height: '340px',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#0a0a0a',
                border: '2px solid rgba(59, 130, 246, 0.4)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
              }}
            >
              <style>{`
                #${scannerElementId} {
                  width: 100% !important;
                  height: 100% !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                  border: none !important;
                }
                #${scannerElementId} video {
                  width: 100% !important;
                  height: 100% !important;
                  object-fit: cover !important;
                  border-radius: 10px !important;
                }
                #${scannerElementId} img {
                  display: none !important;
                }
                #${scannerElementId}__scan_region {
                  border: 2px solid #60A5FA !important;
                  border-radius: 12px !important;
                  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5) !important;
                }
              `}</style>
              <div id={scannerElementId} style={{ width: '100%', height: '100%' }} />

              {cameraError && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(15, 15, 15, 0.95)',
                    textAlign: 'center',
                    gap: '10px',
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span style={{ fontSize: '12px', color: '#F87171', lineHeight: 1.4 }}>
                    {cameraError}
                  </span>
                </div>
              )}
            </div>

            <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)', margin: 0, textAlign: 'center' }}>
              Coloca el código QR del ESP32 frente al lente hasta que sea detectado automáticamente.
            </p>
          </div>
        )}

        {/* Pestaña: Subir Imagen */}
        {activeTab === 'file' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <div id="file-qr-temp-region" style={{ display: 'none' }} />
            <label
              style={{
                width: '100%',
                padding: '30px 20px',
                borderRadius: '10px',
                border: '2px dashed rgba(255, 255, 255, 0.2)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = '#3B82F6')}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)')}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 500 }}>
                Haz clic para seleccionar una foto o captura del código QR
              </span>
              <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
                PNG, JPG o WEBP
              </span>
            </label>

            {cameraError && (
              <span style={{ fontSize: '12px', color: '#F87171' }}>
                {cameraError}
              </span>
            )}
          </div>
        )}

        {/* Ingreso manual rápido alternativo */}
        <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>
              O ingresa el código manualmente:
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="PAIR-A8492 o MAC..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                style={{
                  flex: 1,
                  height: '36px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  padding: '0 10px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!manualCode.trim()}
              >
                Aplicar Código
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};
