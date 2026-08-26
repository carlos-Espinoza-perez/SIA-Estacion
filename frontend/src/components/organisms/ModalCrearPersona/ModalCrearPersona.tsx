import React, { useState, useRef } from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '../../atoms/Button/Button';
import { CrearPersonaFormData, TipoPersona } from '../../../types/persona';

export interface ModalCrearPersonaProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CrearPersonaFormData) => void | Promise<void>;
}

export const ModalCrearPersona: React.FC<ModalCrearPersonaProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [nombre, setNombre] = useState('');
  const [carnet, setCarnet] = useState('');
  const [tipo, setTipo] = useState<TipoPersona>('Estudiante');
  const [fotoArchivo, setFotoArchivo] = useState<File | null>(null);
  const [fotoPreviewUrl, setFotoPreviewUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTipoChange = (newTipo: TipoPersona) => {
    setTipo(newTipo);
  };

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setFotoArchivo(file);
      const url = URL.createObjectURL(file);
      setFotoPreviewUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !carnet.trim()) return;

    setIsSaving(true);
    try {
      await onSubmit({
        nombre: nombre.trim(),
        carnet: carnet.trim(),
        tipo,
        rol: (tipo === 'Estudiante' ? 'Estudiante' : 'Encargado') as any,
        carreraOArea: '',
        correo: '',
        fotoArchivo,
        fotoPreviewUrl,
      });

      // Resetear formulario
      setNombre('');
      setCarnet('');
      setTipo('Estudiante');
      setFotoArchivo(null);
      setFotoPreviewUrl('');
      onClose();
    } catch (error) {
      console.error('Error al crear persona:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const footer = (
    <>
      <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={isSaving}>
        Cancelar
      </Button>

      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={handleSubmit}
        disabled={!nombre.trim() || !carnet.trim()}
        isLoading={isSaving}
      >
        Crear persona
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva persona"
      subtitle="Registra una persona y su fotografía de referencia."
      width={560}
      footer={footer}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '12px' }}>
        {/* Nombre completo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Nombre completo
          </label>
          <input
            type="text"
            placeholder="Ej. Ana Morales"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={{
              height: '38px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '0 12px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.35)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
          />
        </div>

        {/* Carnet o código */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Carnet o código
          </label>
          <input
            type="text"
            placeholder="Ej. 22-A0200-0056"
            value={carnet}
            onChange={(e) => setCarnet(e.target.value)}
            style={{
              height: '38px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '0 12px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.35)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
          />
        </div>

        {/* Tipo (Segmented Control) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Tipo
          </label>
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '3px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => handleTipoChange('Estudiante')}
              style={{
                flex: 1,
                height: '32px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: tipo === 'Estudiante' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: tipo === 'Estudiante' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: tipo === 'Estudiante' ? 500 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Estudiante
            </button>
            <button
              type="button"
              onClick={() => handleTipoChange('Personal')}
              style={{
                flex: 1,
                height: '32px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: tipo === 'Personal' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: tipo === 'Personal' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: tipo === 'Personal' ? 500 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Personal
            </button>
          </div>
        </div>


        {/* Fotografía de referencia */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Fotografía de referencia
          </label>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{
              border: `1.5px dashed ${isDragging ? '#FFFFFF' : 'rgba(255, 255, 255, 0.2)'}`,
              backgroundColor: isDragging ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              borderRadius: '10px',
              padding: '20px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {fotoPreviewUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={fotoPreviewUrl}
                  alt="Preview"
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    {fotoArchivo?.name || 'Fotografía seleccionada'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>
                    Haz clic para cambiar la imagen
                  </span>
                </div>
              </div>
            ) : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'Inter, sans-serif' }}>
                  Arrastra una imagen o selecciona un archivo
                </span>
              </>
            )}
          </div>

          <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'Inter, sans-serif' }}>
            Se almacena cifrada y se elimina al pasar la persona a inactiva.
          </span>
        </div>
      </form>
    </Modal>
  );
};
