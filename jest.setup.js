// Polyfill for TextEncoder/TextDecoder for Jest environment
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock fetch for Jest environment
global.fetch = jest.fn(() =>
  Promise.resolve({
    text: () => Promise.resolve('mocked response')
  })
);