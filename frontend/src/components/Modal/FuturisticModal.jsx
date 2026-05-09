import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../../services/api';
import './FuturisticModal.css';

const FACTION_COLORS = {
  'Reino de Zygerria':    '#ffd700',
  'Casa Dinar':           '#ff8c00',
  'Casa Thuul':           '#4169e1',
  'Alta Ciudad':          '#c0c0c0',
  'Casa Rakshi':          '#c0392b',
  'Casa Ameth':           '#00ff88',
  'Casa Syntha':          '#00d4ff',
  'Casa Seraptis':        '#9b59b6',
  'Casa Virana':          '#e67e22',
  'Casa Ferronix':        '#708090',
  'Casa Krysen':          '#008080',
  'Casa Shanek':          '#dc143c',
  'Iglesia del Sol Negro':'#8b0000',
};

const getFactionColor = (faction) =>
  (faction && FACTION_COLORS[faction]) || '#00d4ff';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 30, filter: 'brightness(0) blur(4px)' },
  visible: {
    opacity: 1, scale: 1, y: 0,
    filter: 'brightness(1) blur(0px)',
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0, scale: 0.9, y: -20,
    filter: 'brightness(0) blur(4px)',
    transition: { duration: 0.25 },
  },
};

const FuturisticModal = ({ point, onClose }) => {
  const factionColor = getFactionColor(point?.faction);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!point) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={`Información de ${point.name}`}
        data-testid="futuristic-modal"
      >
        <motion.div
          className="modal"
          style={{ '--faction-color': factionColor }}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Escáner de arranque */}
          <motion.div
            className="modal__scanner"
            initial={{ top: 0, opacity: 0.8 }}
            animate={{ top: '100%', opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          />

          {/* Esquinas decorativas */}
          <span className="modal__corner modal__corner--tl" />
          <span className="modal__corner modal__corner--tr" />
          <span className="modal__corner modal__corner--bl" />
          <span className="modal__corner modal__corner--br" />

          {/* Cabecera */}
          <div className="modal__header">
            <div className="modal__header-left">
              <div className="modal__signal">
                <span className="modal__signal-dot" />
                TRANSMISIÓN ACTIVA
              </div>
              <h2 className="modal__title">{point.name}</h2>
            </div>
            <button
              className="modal__close"
              onClick={onClose}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          {/* Línea separadora con pulso */}
          <div className="modal__divider">
            <span className="modal__divider-pulse" />
          </div>

          {/* Contenido */}
          <div className="modal__body">
            {/* Imagen de la zona */}
            {point.image_url && (
              <div className="modal__image-frame">
                <img
                  src={getImageUrl(point.image_url)}
                  alt={`Vista de ${point.name}`}
                  className="modal__image"
                />
                <div className="modal__image-overlay" />
                <span className="modal__image-label">IMAGEN HOLOGRÁFICA</span>
              </div>
            )}

            {/* Facción */}
            {point.faction && (
              <div className="modal__faction">
                <span className="modal__faction-icon" />
                <div className="modal__faction-info">
                  <span className="modal__label">BAJO CONTROL DE</span>
                  <span
                    className="modal__faction-name"
                    style={{ color: factionColor, textShadow: `0 0 10px ${factionColor}` }}
                  >
                    {point.faction}
                  </span>
                </div>
              </div>
            )}

            {/* Descripción */}
            {point.description && (
              <div className="modal__section">
                <span className="modal__label">INFORME DE INTELIGENCIA</span>
                <p className="modal__text">{point.description}</p>
              </div>
            )}

            {/* Actividades */}
            {point.activities && (
              <div className="modal__section">
                <span className="modal__label">OPERACIONES DISPONIBLES</span>
                <div className="modal__activities">
                  {point.activities.split(',').map((act, i) => (
                    <span key={i} className="modal__activity-tag">
                      {act.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Coordenadas */}
            <div className="modal__coords">
              <span className="modal__label">COORDENADAS</span>
              <span className="modal__coords-value">
                X: {point.x_percent?.toFixed(2)}% · Y: {point.y_percent?.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Pie */}
          <div className="modal__footer">
            <span className="modal__footer-text">ZYGERRIA CITY DATABASE v4.2</span>
            <button className="modal__btn-close" onClick={onClose}>
              CERRAR TRANSMISIÓN
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FuturisticModal;
