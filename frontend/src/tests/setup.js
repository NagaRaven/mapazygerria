import '@testing-library/jest-dom';

// Mock de framer-motion para evitar animaciones en tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: new Proxy(
      {},
      {
        get: (_, tag) => {
          const Component = ({ children, ...props }) => {
            const { initial, animate, exit, variants, transition, whileHover, whileTap, ...rest } = props;
            return actual.React
              ? actual.React.createElement(tag, rest, children)
              : require('react').createElement(tag, rest, children);
          };
          Component.displayName = `motion.${tag}`;
          return Component;
        },
      }
    ),
    AnimatePresence: ({ children }) => children,
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.confirm
window.confirm = vi.fn(() => true);

// Mock URL.createObjectURL
window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
