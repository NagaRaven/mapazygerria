import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './MapPoint.css';

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
  'Casa Nabila':          '#e91e8c',
  'Casa Sayid':           '#c8a84b',
  'Casa Shanek':          '#dc143c',
  'Iglesia del Sol Negro':'#8b0000',
};

const getPointColor = (point) => {
  if (point.color) return point.color;
  if (!point.faction) return '#00d4ff';
  return FACTION_COLORS[point.faction] || '#00d4ff';
};

const MapPoint = ({ point, onClick, isAdmin, onEdit, onDelete }) => {
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const color = getPointColor(point);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!showAdminMenu) onClick(point);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setShowAdminMenu(false);
    onEdit(point);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowAdminMenu(false);
    onDelete(point.id);
  };

  return (
    <motion.div
      className="map-point"
      style={{ left: `${point.x_percent}%`, top: `${point.y_percent}%` }}
      data-testid={`map-point-${point.id}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <motion.button
        className="map-point__marker"
        style={{ '--point-color': color }}
        onClick={handleClick}
        onContextMenu={(e) => {
          if (isAdmin) {
            e.preventDefault();
            setShowAdminMenu(!showAdminMenu);
          }
        }}
        whileHover={{ scale: 1.25 }}
        whileTap={{ scale: 0.9 }}
        aria-label={`Punto de interés: ${point.name}`}
      >
        <span className="map-point__core" />
        <span className="map-point__ring" />
        <span className="map-point__ring map-point__ring--delay" />
      </motion.button>

      <div className="map-point__label">{point.name}</div>

      {isAdmin && showAdminMenu && (
        <motion.div
          className="map-point__admin-menu"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="map-point__admin-btn map-point__admin-btn--edit" onClick={handleEditClick}>
            Editar
          </button>
          <button className="map-point__admin-btn map-point__admin-btn--delete" onClick={handleDeleteClick}>
            Eliminar
          </button>
          <button
            className="map-point__admin-btn map-point__admin-btn--cancel"
            onClick={(e) => { e.stopPropagation(); setShowAdminMenu(false); }}
          >
            Cancelar
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MapPoint;
