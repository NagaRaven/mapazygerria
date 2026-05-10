import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import './LoginModal.css';

const LoginModal = ({ onClose }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="login-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      data-testid="login-modal"
    >
      <motion.div
        className="login-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="login-modal__corner login-modal__corner--tl" />
        <span className="login-modal__corner login-modal__corner--tr" />
        <span className="login-modal__corner login-modal__corner--bl" />
        <span className="login-modal__corner login-modal__corner--br" />

        <div className="login-modal__header">
          <div className="login-modal__icon">◈</div>
          <h2 className="login-modal__title">ACCESO INTELIGENCIA</h2>
          <p className="login-modal__subtitle">Sistema de control de Zygerria</p>
        </div>

        <form className="login-modal__form" onSubmit={handleSubmit}>
          <div className="login-modal__field">
            <label className="login-modal__label" htmlFor="username">
              IDENTIFICADOR
            </label>
            <input
              id="username"
              className="login-modal__input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="usuario"
              autoComplete="username"
              disabled={loading}
              data-testid="username-input"
            />
          </div>

          <div className="login-modal__field">
            <label className="login-modal__label" htmlFor="password">
              CÓDIGO DE ACCESO
            </label>
            <input
              id="password"
              className="login-modal__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
              data-testid="password-input"
            />
          </div>

          {error && (
            <motion.div
              className="login-modal__error"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              data-testid="login-error"
            >
              ⚠ {error}
            </motion.div>
          )}

          <button
            className="login-modal__btn"
            type="submit"
            disabled={loading || !username || !password}
            data-testid="login-submit"
          >
            {loading ? (
              <span className="login-modal__spinner">VERIFICANDO</span>
            ) : (
              'INICIAR SESIÓN'
            )}
          </button>
        </form>

        <button className="login-modal__cancel" onClick={onClose}>
          CANCELAR
        </button>
      </motion.div>
    </motion.div>
  );
};

export default LoginModal;
