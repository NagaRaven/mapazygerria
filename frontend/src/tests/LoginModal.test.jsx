import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginModal from '../components/Auth/LoginModal';
import { AuthContext } from '../context/AuthContext';

const renderWithAuth = (loginFn, onClose = vi.fn()) => {
  return render(
    <AuthContext.Provider value={{ login: loginFn, isAuthenticated: false }}>
      <LoginModal onClose={onClose} />
    </AuthContext.Provider>
  );
};

describe('LoginModal', () => {
  it('debe renderizar los campos de usuario y contraseña', () => {
    renderWithAuth(vi.fn());
    expect(screen.getByTestId('username-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
  });

  it('debe renderizar el botón de envío', () => {
    renderWithAuth(vi.fn());
    expect(screen.getByTestId('login-submit')).toBeInTheDocument();
  });

  it('el botón debe estar deshabilitado si los campos están vacíos', () => {
    renderWithAuth(vi.fn());
    expect(screen.getByTestId('login-submit')).toBeDisabled();
  });

  it('debe habilitar el botón cuando ambos campos tienen valor', async () => {
    const user = userEvent.setup();
    renderWithAuth(vi.fn());

    await user.type(screen.getByTestId('username-input'), 'starwarsrol');
    await user.type(screen.getByTestId('password-input'), 'starwarsrol');

    expect(screen.getByTestId('login-submit')).not.toBeDisabled();
  });

  it('debe llamar login con las credenciales correctas al enviar', async () => {
    const mockLogin = vi.fn().mockResolvedValue('starwarsrol');
    const onClose = vi.fn();
    renderWithAuth(mockLogin, onClose);

    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'starwarsrol' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'starwarsrol' } });
    fireEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('starwarsrol', 'starwarsrol');
    });
  });

  it('debe cerrar el modal tras login exitoso', async () => {
    const mockLogin = vi.fn().mockResolvedValue('starwarsrol');
    const onClose = vi.fn();
    renderWithAuth(mockLogin, onClose);

    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'starwarsrol' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'starwarsrol' } });
    fireEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('debe mostrar mensaje de error si login falla', async () => {
    const mockLogin = vi.fn().mockRejectedValue({
      response: { data: { error: 'Credenciales inválidas' } },
    });
    renderWithAuth(mockLogin);

    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'malo' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'mala' } });
    fireEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('login-error')).toBeInTheDocument();
      expect(screen.getByTestId('login-error').textContent).toContain('Credenciales inválidas');
    });
  });

  it('debe llamar onClose al hacer clic en CANCELAR', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithAuth(vi.fn(), onClose);

    await user.click(screen.getByText('CANCELAR'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
