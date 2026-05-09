import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FuturisticModal from '../components/Modal/FuturisticModal';

const mockPoint = {
  id: 1,
  name: 'Palacio de la Reina Miraj',
  description: 'Sede del poder zygerriano',
  faction: 'Imperio Esclavista Zygerriano',
  activities: 'Negociaciones, Subastas, Audiencias',
  x_percent: 48.5,
  y_percent: 32.0,
  image_url: null,
};

describe('FuturisticModal', () => {
  it('debe renderizar el título del punto', () => {
    const onClose = vi.fn();
    render(<FuturisticModal point={mockPoint} onClose={onClose} />);
    expect(screen.getByText('Palacio de la Reina Miraj')).toBeInTheDocument();
  });

  it('debe mostrar la facción', () => {
    const onClose = vi.fn();
    render(<FuturisticModal point={mockPoint} onClose={onClose} />);
    expect(screen.getByText('Imperio Esclavista Zygerriano')).toBeInTheDocument();
  });

  it('debe mostrar la descripción', () => {
    const onClose = vi.fn();
    render(<FuturisticModal point={mockPoint} onClose={onClose} />);
    expect(screen.getByText('Sede del poder zygerriano')).toBeInTheDocument();
  });

  it('debe mostrar las actividades como tags individuales', () => {
    const onClose = vi.fn();
    render(<FuturisticModal point={mockPoint} onClose={onClose} />);
    expect(screen.getByText('Negociaciones')).toBeInTheDocument();
    expect(screen.getByText('Subastas')).toBeInTheDocument();
    expect(screen.getByText('Audiencias')).toBeInTheDocument();
  });

  it('debe mostrar las coordenadas', () => {
    const onClose = vi.fn();
    render(<FuturisticModal point={mockPoint} onClose={onClose} />);
    expect(screen.getByText(/48\.50%/)).toBeInTheDocument();
    expect(screen.getByText(/32\.00%/)).toBeInTheDocument();
  });

  it('debe llamar onClose al hacer clic en el botón de cerrar', () => {
    const onClose = vi.fn();
    render(<FuturisticModal point={mockPoint} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Cerrar'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('debe llamar onClose al hacer clic en CERRAR TRANSMISIÓN', () => {
    const onClose = vi.fn();
    render(<FuturisticModal point={mockPoint} onClose={onClose} />);
    fireEvent.click(screen.getByText('CERRAR TRANSMISIÓN'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('debe llamar onClose al presionar Escape', () => {
    const onClose = vi.fn();
    render(<FuturisticModal point={mockPoint} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('debe llamar onClose al hacer clic en el overlay', () => {
    const onClose = vi.fn();
    render(<FuturisticModal point={mockPoint} onClose={onClose} />);
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('no debe mostrar imagen si image_url es null', () => {
    const onClose = vi.fn();
    render(<FuturisticModal point={mockPoint} onClose={onClose} />);
    expect(screen.queryByAltText(/Vista de/)).not.toBeInTheDocument();
  });

  it('debe mostrar imagen si image_url está presente', () => {
    const onClose = vi.fn();
    const pointWithImage = { ...mockPoint, image_url: '/uploads/zona.jpg' };
    render(<FuturisticModal point={pointWithImage} onClose={onClose} />);
    expect(screen.getByAltText(`Vista de ${mockPoint.name}`)).toBeInTheDocument();
  });

  it('no debe renderizar nada si point es null', () => {
    const onClose = vi.fn();
    const { container } = render(<FuturisticModal point={null} onClose={onClose} />);
    expect(container.firstChild).toBeNull();
  });

  it('debe tener role=dialog para accesibilidad', () => {
    const onClose = vi.fn();
    render(<FuturisticModal point={mockPoint} onClose={onClose} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
