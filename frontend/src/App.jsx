import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import InteractiveMap from './components/Map/InteractiveMap';
import FuturisticModal from './components/Modal/FuturisticModal';
import LoginModal from './components/Auth/LoginModal';
import AddPointModal from './components/Admin/AddPointModal';
import api from './services/api';
import './App.css';

const AppContent = () => {
  const { isAuthenticated, username, logout, loading } = useAuth();
  const [points, setPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isPlacingPoint, setIsPlacingPoint] = useState(false);
  const [addPointData, setAddPointData] = useState(null);
  const [editingPoint, setEditingPoint] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const loadPoints = useCallback(async () => {
    try {
      const res = await api.get('/api/points');
      setPoints(res.data);
      setFetchError(null);
    } catch {
      setFetchError('No se pudo conectar con el servidor');
    }
  }, []);

  useEffect(() => {
    if (!loading) loadPoints();
  }, [loading, loadPoints]);

  const handleMapClick = useCallback((x, y) => {
    if (!isPlacingPoint) return;
    setIsPlacingPoint(false);
    setAddPointData({ x, y });
  }, [isPlacingPoint]);

  const handleSavePoint = useCallback(async (formData, pointId) => {
    if (pointId) {
      await api.put(`/api/points/${pointId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } else {
      await api.post('/api/points', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    await loadPoints();
  }, [loadPoints]);

  const handleDeletePoint = useCallback(async (id) => {
    if (!window.confirm('¿Eliminar este punto de interés?')) return;
    try {
      await api.delete(`/api/points/${id}`);
      await loadPoints();
    } catch {
      alert('Error al eliminar el punto');
    }
  }, [loadPoints]);

  const handleEditPoint = useCallback((point) => {
    setEditingPoint(point);
    setAddPointData({ x: point.x_percent, y: point.y_percent });
  }, []);

  const closeAddModal = useCallback(() => {
    setAddPointData(null);
    setEditingPoint(null);
    setIsPlacingPoint(false);
  }, []);

  if (loading) {
    return (
      <div className="app-loading">
        <span className="app-loading__text">INICIALIZANDO SISTEMA</span>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Cabecera */}
      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-header__logo">◈</span>
          <div>
            <h1 className="app-header__title">ZYGERRIA</h1>
            <span className="app-header__subtitle">MAPA INTERACTIVO DE LA CIUDAD</span>
          </div>
        </div>

        <div className="app-header__actions">
          {fetchError && (
            <span className="app-header__error">{fetchError}</span>
          )}

          {isAuthenticated ? (
            <>
              <span className="app-header__user">◉ {username}</span>
              <button
                className={`app-header__btn app-header__btn--place ${isPlacingPoint ? 'app-header__btn--active' : ''}`}
                onClick={() => setIsPlacingPoint((v) => !v)}
                title="Añadir punto de interés"
              >
                {isPlacingPoint ? '✕ CANCELAR' : '+ AÑADIR PUNTO'}
              </button>
              <button className="app-header__btn app-header__btn--logout" onClick={logout}>
                SALIR
              </button>
            </>
          ) : (
            <button
              className="app-header__btn app-header__btn--login"
              onClick={() => setShowLogin(true)}
            >
              ACCESO INTELIGENCIA
            </button>
          )}
        </div>
      </header>

      {/* Mapa */}
      <main className="app-main">
        <InteractiveMap
          points={points}
          onPointClick={setSelectedPoint}
          isAdmin={isAuthenticated}
          isPlacingPoint={isPlacingPoint}
          onMapClick={handleMapClick}
          onEditPoint={handleEditPoint}
          onDeletePoint={handleDeletePoint}
        />
      </main>

      {/* Pie de página */}
      <footer className="app-footer">
        <span>{points.length} puntos de interés registrados</span>
        <span>STARWARS ROL DATABASE · ZYGERRIA v1.0</span>
      </footer>

      {/* Modales */}
      <AnimatePresence>
        {selectedPoint && (
          <FuturisticModal
            key="point-modal"
            point={selectedPoint}
            onClose={() => setSelectedPoint(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogin && (
          <LoginModal key="login-modal" onClose={() => setShowLogin(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {addPointData && (
          <AddPointModal
            key="add-modal"
            position={addPointData}
            point={editingPoint}
            onSave={handleSavePoint}
            onClose={closeAddModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
