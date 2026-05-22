import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getImageUrl } from '../../services/api';
import './AddPointModal.css';

const POINT_COLORS = [
  { value: '#ff8c00', label: 'Naranja' },
  { value: '#ffd700', label: 'Amarillo' },
  { value: '#00ff88', label: 'Verde' },
  { value: '#00d4ff', label: 'Azul' },
];

const FACTIONS = [
  'Reino de Zygerria',
  'Casa Dinar',
  'Casa Thuul',
  'Alta Ciudad',
  'Casa Rakshi',
  'Casa Ameth',
  'Casa Syntha',
  'Casa Seraptis',
  'Casa Virana',
  'Casa Ferronix',
  'Casa Krysen',
  'Casa Nabila',
  'Casa Sayid',
  'Casa Shanek',
  'Casa Jaresh',
  'Casa Sokharis',
  'Casa Amenti',
  'Iglesia del Sol Negro',
];

const AddPointModal = ({ position, point, onSave, onClose }) => {
  const isEditing = !!point;

  const [form, setForm] = useState({
    name: '',
    description: '',
    faction: '',
    activities: '',
    color: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (point) {
      setForm({
        name: point.name || '',
        description: point.description || '',
        faction: point.faction || '',
        activities: point.activities || '',
        color: point.color || '',
      });
      if (point.image_url) setImagePreview(getImageUrl(point.image_url));
    }
  }, [point]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return; }
    setError('');
    setLoading(true);

    const data = new FormData();
    data.append('name', form.name.trim());
    data.append('description', form.description.trim());
    data.append('faction', form.faction);
    data.append('color', form.color);
    data.append('activities', form.activities.trim());
    data.append('x_percent', isEditing ? point.x_percent : position.x);
    data.append('y_percent', isEditing ? point.y_percent : position.y);
    if (image) data.append('image', image);

    try {
      await onSave(data, isEditing ? point.id : null);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el punto');
    } finally {
      setLoading(false);
    }
  };

  const coords = isEditing
    ? `X: ${point?.x_percent?.toFixed(1)}% / Y: ${point?.y_percent?.toFixed(1)}%`
    : `X: ${position?.x?.toFixed(1)}% / Y: ${position?.y?.toFixed(1)}%`;

  return (
    <motion.div
      className="add-point-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      data-testid="add-point-modal"
    >
      <motion.div
        className="add-point-modal"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="add-point-modal__corner add-point-modal__corner--tl" />
        <span className="add-point-modal__corner add-point-modal__corner--tr" />
        <span className="add-point-modal__corner add-point-modal__corner--bl" />
        <span className="add-point-modal__corner add-point-modal__corner--br" />

        <div className="add-point-modal__header">
          <div>
            <h2 className="add-point-modal__title">
              {isEditing ? 'EDITAR PUNTO' : 'NUEVO PUNTO DE INTERÉS'}
            </h2>
            <span className="add-point-modal__coords">{coords}</span>
          </div>
          <button className="add-point-modal__close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <form className="add-point-modal__form" onSubmit={handleSubmit} data-testid="add-point-form">
          <div className="add-point-modal__field">
            <label className="add-point-modal__label" htmlFor="name">NOMBRE *</label>
            <input
              id="name"
              className="add-point-modal__input"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nombre del lugar"
              disabled={loading}
              data-testid="point-name-input"
            />
          </div>

          <div className="add-point-modal__field">
            <label className="add-point-modal__label" htmlFor="faction">FACCIÓN</label>
            <select
              id="faction"
              className="add-point-modal__input add-point-modal__select"
              name="faction"
              value={form.faction}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">— Seleccionar facción —</option>
              {FACTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className="add-point-modal__field">
            <label className="add-point-modal__label">COLOR DEL MARCADOR</label>
            <div className="add-point-modal__colors">
              {POINT_COLORS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={`add-point-modal__color-swatch${form.color === value ? ' add-point-modal__color-swatch--active' : ''}`}
                  style={{ '--swatch-color': value }}
                  title={label}
                  onClick={() => setForm((prev) => ({ ...prev, color: prev.color === value ? '' : value }))}
                  disabled={loading}
                  aria-label={label}
                />
              ))}
            </div>
          </div>

          <div className="add-point-modal__field">
            <label className="add-point-modal__label" htmlFor="description">INFORME DE INTELIGENCIA</label>
            <textarea
              id="description"
              className="add-point-modal__input add-point-modal__textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Descripción del lugar..."
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="add-point-modal__field">
            <label className="add-point-modal__label" htmlFor="activities">
              OPERACIONES DISPONIBLES
            </label>
            <input
              id="activities"
              className="add-point-modal__input"
              type="text"
              name="activities"
              value={form.activities}
              onChange={handleChange}
              placeholder="Actividad 1, Actividad 2, ..."
              disabled={loading}
            />
            <span className="add-point-modal__hint">Separadas por comas</span>
          </div>

          <div className="add-point-modal__field">
            <label className="add-point-modal__label">IMAGEN HOLOGRÁFICA</label>
            <label className="add-point-modal__file-btn">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                disabled={loading}
                data-testid="image-upload"
              />
              {imagePreview ? 'CAMBIAR IMAGEN' : 'SUBIR IMAGEN'}
            </label>
            {imagePreview && (
              <img src={imagePreview} alt="Vista previa" className="add-point-modal__preview" />
            )}
          </div>

          {error && (
            <div className="add-point-modal__error" data-testid="add-point-error">
              ⚠ {error}
            </div>
          )}

          <div className="add-point-modal__actions">
            <button type="button" className="add-point-modal__btn-cancel" onClick={onClose} disabled={loading}>
              CANCELAR
            </button>
            <button type="submit" className="add-point-modal__btn-save" disabled={loading}>
              {loading ? 'GUARDANDO...' : isEditing ? 'ACTUALIZAR' : 'CREAR PUNTO'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddPointModal;
