import React, { useState, useRef } from 'react';
import { Modal } from '../Modal/Modal';
import { CrearPersonaFormData, TipoPersona, RolPersona } from '../../../types/persona';

export interface ModalCrearPersonaProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CrearPersonaFormData) => void;
}

export const ModalCrearPersona: React.FC<ModalCrearPersonaProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [nombre, setNombre] = useState('');
  const [carnet, setCarnet] = useState('');
  const [tipo, setTipo] = useState<TipoPersona>('Estudiante');
  const [rol, setRol] = useState<RolPersona>('Estudiante');
  const [carreraOArea, setCarreraOArea] = useState('');
  const [correo, setCorreo] = useState('');
  const [fotoArchivo, setFotoArchivo] = useState<File | null>(null);
  const [fotoPreviewUrl, setFotoPreviewUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTipoChange = (newTipo: TipoPersona) => {
    setTipo(newTipo);
    if (newTipo === 'Estudiante') {
      setRol('Estudiante');
    } else if (rol === 'Estudiante') {
      setRol('Encargado de recurso');
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !carnet.trim()) return;

    onSubmit({
      nombre: nombre.trim(),
      carnet: carnet.trim(),
      tipo,
      rol,
      carreraOArea: carreraOArea.trim() || (tipo === 'Estudiante' ? 'Ing. en Sistemas' : 'Personal General'),
      correo: correo.trim() || `${carnet.toLowerCase()}@est.ulsa.edu.ni`,
      fotoArchivo,
      fotoPreviewUrl,
    });

    // Resetear formulario
    setNombre('');
    setCarnet('');
    setTipo('Estudiante');
    setRol('Estudiante');
    setCarreraOArea('');
    setCorreo('');
    setFotoArchivo(null);
    setFotoPreviewUrl('');
    onClose();
  };

  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          background: 'transparent',
          color: '#FFFFFF',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        Cancelar
      </button>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!nombre.trim() || !carnet.trim()}
        style={{
          padding: '8px 20px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#FFFFFF',
          color: '#1C1C1C',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          cursor: !nombre.trim() || !carnet.trim() ? 'not-allowed' : 'pointer',
          opacity: !nombre.trim() || !carnet.trim() ? 0.4 : 1,
          transition: 'all 0.15s ease',
        }}
        onMouseOver={(e) => {
          if (nombre.trim() && carnet.trim()) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        }}
        onMouseOut={(e) => {
          if (nombre.trim() && carnet.trim()) e.currentTarget.style.backgroundColor = '#FFFFFF';
        }}
      >
        Crear persona
      </button>
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

        {/* Rol asignado */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Rol asignado
          </label>
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value as RolPersona)}
            style={{
              height: '38px',
              backgroundColor: '#333333',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '0 12px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {tipo === 'Estudiante' ? (
              <option value="Estudiante">Estudiante</option>
            ) : (
              <>
                <option value="Encargado de recurso">Encargado de recurso</option>
                <option value="Administrador">Administrador</option>
                <option value="Guardia">Guardia</option>
              </>
            )}
          </select>
        </div>

        {/* Carrera o área */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Carrera o área
          </label>
          <input
            type="text"
            placeholder={tipo === 'Estudiante' ? 'Ej. Ing. en Sistemas' : 'Ej. Dirección Académica / Laboratorio'}
            value={carreraOArea}
            onChange={(e) => setCarreraOArea(e.target.value)}
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
            }}
          />
        </div>

        {/* Correo institucional */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Correo institucional
          </label>
          <input
            type="email"
            placeholder={tipo === 'Estudiante' ? 'nombre@est.ulsa.edu.ni' : 'nombre@ulsa.edu.ni'}
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
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
            }}
          />
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
