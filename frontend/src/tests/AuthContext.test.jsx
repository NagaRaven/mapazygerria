import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../context/AuthContext';

vi.mock('../services/api', () => ({
  default: {
    defaults: { headers: { common: {} } },
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import api from '../services/api';

const TestConsumer = () => {
  const { isAuthenticated, username, login, logout, loading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="username">{username || 'none'}</span>
      <button onClick={() => login('starwarsrol', 'starwarsrol')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    api.defaults.headers.common = {};
  });

  it('debe iniciar con estado no autenticado', async () => {
    api.get.mockResolvedValueOnce({ data: { valid: false } });
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('username').textContent).toBe('none');
  });

  it('debe autenticar al llamar login', async () => {
    api.post.mockResolvedValueOnce({
      data: { token: 'fake-jwt-token', username: 'starwarsrol' },
    });
    api.get.mockRejectedValueOnce(new Error('No token'));

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    await user.click(screen.getByText('Login'));
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
      expect(screen.getByTestId('username').textContent).toBe('starwarsrol');
    });
  });

  it('debe desautenticar al llamar logout', async () => {
    api.post.mockResolvedValueOnce({
      data: { token: 'fake-jwt-token', username: 'starwarsrol' },
    });
    api.get.mockRejectedValueOnce(new Error('No token'));

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    await user.click(screen.getByText('Login'));
    await waitFor(() => expect(screen.getByTestId('authenticated').textContent).toBe('true'));

    await user.click(screen.getByText('Logout'));
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('username').textContent).toBe('none');
  });

  it('debe persistir sesión desde localStorage', async () => {
    localStorage.setItem('zygerria_token', 'stored-token');
    localStorage.setItem('zygerria_user', 'starwarsrol');
    api.get.mockResolvedValueOnce({ data: { valid: true, username: 'starwarsrol' } });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
      expect(screen.getByTestId('username').textContent).toBe('starwarsrol');
    });
  });

  it('debe limpiar sesión inválida de localStorage', async () => {
    localStorage.setItem('zygerria_token', 'expired-token');
    localStorage.setItem('zygerria_user', 'starwarsrol');
    api.get.mockRejectedValueOnce({ response: { status: 401 } });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
    });
    expect(localStorage.getItem('zygerria_token')).toBeNull();
  });
});
