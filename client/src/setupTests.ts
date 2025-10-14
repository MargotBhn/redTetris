import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util';

// Polyfills pour jsdom
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Mock fetch pour les tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    text: () => Promise.resolve('test response'),
    json: () => Promise.resolve({}),
  })
) as jest.Mock;