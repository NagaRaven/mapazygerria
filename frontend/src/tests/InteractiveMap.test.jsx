import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InteractiveMap from '../components/Map/InteractiveMap';

const mockPoints = [
  {
    id: 1,
    name: 'Palacio de la Reina',
    description: 'Sede del poder',
    faction: 'Imperio Esclavista Zygerriano',
    activities: 'Negociaciones',
    x_percent: 48.5,
    y_percent: 32.0,
    image_url: null,
  },
  {
    id: 2,
    name: 'Puerto Estelar',
    description: 'Principal puerto',
    faction: 'Neutral',
    activities: 'Viajes, Comercio',
    x_percent: 72.0,
    y_percent: 58.5,
    image_url: null,
  },
];

describe('InteractiveMap', () => {
  it('debe renderizar la imagen del mapa', () => {
    render(
      <InteractiveMap
        points={[]}
        onPointClick={vi.fn()}
        isAdmin={false}
        isPlacingPoint={false}
        onMapClick={vi.fn()}
        onEditPoint={vi.fn()}
        onDeletePoint={vi.fn()}
      />
    );
    expect(screen.getByAltText('Mapa de Zygerria')).toBeInTheDocument();
  });

  it('debe renderizar los puntos de interés tras cargar la imagen', () => {
    render(
      <InteractiveMap
        points={mockPoints}
        onPointClick={vi.fn()}
        isAdmin={false}
        isPlacingPoint={false}
        onMapClick={vi.fn()}
        onEditPoint={vi.fn()}
        onDeletePoint={vi.fn()}
      />
    );

    const img = screen.getByAltText('Mapa de Zygerria');
    fireEvent.load(img);

    expect(screen.getByTestId('map-point-1')).toBeInTheDocument();
    expect(screen.getByTestId('map-point-2')).toBeInTheDocument();
  });

  it('debe llamar onPointClick al hacer clic en un punto', () => {
    const onPointClick = vi.fn();
    render(
      <InteractiveMap
        points={mockPoints}
        onPointClick={onPointClick}
        isAdmin={false}
        isPlacingPoint={false}
        onMapClick={vi.fn()}
        onEditPoint={vi.fn()}
        onDeletePoint={vi.fn()}
      />
    );

    const img = screen.getByAltText('Mapa de Zygerria');
    fireEvent.load(img);

    fireEvent.click(screen.getByLabelText('Punto de interés: Palacio de la Reina'));
    expect(onPointClick).toHaveBeenCalledWith(mockPoints[0]);
  });

  it('debe añadir clase de cursor al colocar punto en modo placing', () => {
    render(
      <InteractiveMap
        points={[]}
        onPointClick={vi.fn()}
        isAdmin={true}
        isPlacingPoint={true}
        onMapClick={vi.fn()}
        onEditPoint={vi.fn()}
        onDeletePoint={vi.fn()}
      />
    );

    const img = screen.getByAltText('Mapa de Zygerria');
    fireEvent.load(img);

    expect(screen.getByTestId('map-container')).toHaveClass('interactive-map__container--placing');
  });

  it('no debe mostrar clase placing cuando isPlacingPoint es false', () => {
    render(
      <InteractiveMap
        points={[]}
        onPointClick={vi.fn()}
        isAdmin={false}
        isPlacingPoint={false}
        onMapClick={vi.fn()}
        onEditPoint={vi.fn()}
        onDeletePoint={vi.fn()}
      />
    );

    expect(screen.getByTestId('map-container')).not.toHaveClass('interactive-map__container--placing');
  });

  it('debe mostrar hint de colocación cuando isPlacingPoint es true', () => {
    render(
      <InteractiveMap
        points={[]}
        onPointClick={vi.fn()}
        isAdmin={true}
        isPlacingPoint={true}
        onMapClick={vi.fn()}
        onEditPoint={vi.fn()}
        onDeletePoint={vi.fn()}
      />
    );

    expect(screen.getByText(/HAZ CLIC EN EL MAPA/i)).toBeInTheDocument();
  });

  it('no debe mostrar hint cuando isPlacingPoint es false', () => {
    render(
      <InteractiveMap
        points={[]}
        onPointClick={vi.fn()}
        isAdmin={false}
        isPlacingPoint={false}
        onMapClick={vi.fn()}
        onEditPoint={vi.fn()}
        onDeletePoint={vi.fn()}
      />
    );

    expect(screen.queryByText(/HAZ CLIC EN EL MAPA/i)).not.toBeInTheDocument();
  });

  it('debe renderizar sin puntos sin errores', () => {
    expect(() =>
      render(
        <InteractiveMap
          points={[]}
          onPointClick={vi.fn()}
          isAdmin={false}
          isPlacingPoint={false}
          onMapClick={vi.fn()}
          onEditPoint={vi.fn()}
          onDeletePoint={vi.fn()}
        />
      )
    ).not.toThrow();
  });
});
