// Test setup file
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock window.location
Object.defineProperty(global, 'location', {
  value: {
    href: 'http://localhost:5173',
    origin: 'http://localhost:5173',
  },
  writable: true,
});

// Mock window.dispatchEvent
global.dispatchEvent = vi.fn();

// Mock CustomEvent
global.CustomEvent = class CustomEvent {
  constructor(type, options) {
    this.type = type;
    this.detail = options?.detail;
  }
};

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
});
