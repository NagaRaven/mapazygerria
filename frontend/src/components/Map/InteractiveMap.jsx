import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MapPoint from './MapPoint';
import './InteractiveMap.css';

const InteractiveMap = ({
  points,
  onPointClick,
  isAdmin,
  isPlacingPoint,
  onMapClick,
  onEditPoint,
  onDeletePoint,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [crosshair, setCrosshair] = useState(null);
  const containerRef = useRef(null);

  const getRelativePosition = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };
  }, []);

  const handleMapClick = useCallback((e) => {
    if (!isPlacingPoint || !containerRef.current) return;
    const pos = getRelativePosition(e);
    if (pos) onMapClick(pos.x, pos.y);
  }, [isPlacingPoint, getRelativePosition, onMapClick]);

  const handleMouseMove = useCallback((e) => {
    if (!isPlacingPoint) { setCrosshair(null); return; }
    const pos = getRelativePosition(e);
    if (pos) setCrosshair(pos);
  }, [isPlacingPoint, getRelativePosition]);

  const handleMouseLeave = useCallback(() => setCrosshair(null), []);

  return (
    <div className="interactive-map">
      <AnimatePresence>
        {!imageLoaded && (
          <motion.div
            className="interactive-map__loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className="interactive-map__loading-text">CARGANDO MAPA DE ZYGERRIA</span>
            <div className="interactive-map__loading-bar">
              <motion.div
                className="interactive-map__loading-fill"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={containerRef}
        className={`interactive-map__container ${isPlacingPoint ? 'interactive-map__container--placing' : ''}`}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        data-testid="map-container"
      >
        <motion.img
          src="/ciudad-noche.png"
          alt="Mapa de Zygerria"
          className="interactive-map__image"
          initial={{ opacity: 0, filter: 'brightness(0) saturate(0)' }}
          animate={imageLoaded ? { opacity: 1, filter: 'brightness(1) saturate(1)' } : {}}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          onLoad={() => setImageLoaded(true)}
          draggable={false}
        />

        {imageLoaded && (
          <>
            <div className="interactive-map__scan-overlay" />
            <div className="interactive-map__vignette" />

            {points.map((point) => (
              <MapPoint
                key={point.id}
                point={point}
                onClick={onPointClick}
                isAdmin={isAdmin}
                onEdit={onEditPoint}
                onDelete={onDeletePoint}
              />
            ))}

            {isPlacingPoint && crosshair && (
              <div
                className="interactive-map__crosshair"
                style={{ left: `${crosshair.x}%`, top: `${crosshair.y}%` }}
              >
                <span className="interactive-map__crosshair-h" />
                <span className="interactive-map__crosshair-v" />
                <span className="interactive-map__crosshair-label">
                  {crosshair.x.toFixed(1)}% / {crosshair.y.toFixed(1)}%
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {isPlacingPoint && (
        <motion.div
          className="interactive-map__placing-hint"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          HAZ CLIC EN EL MAPA PARA COLOCAR EL PUNTO DE INTERÉS
        </motion.div>
      )}
    </div>
  );
};

export default InteractiveMap;
