import '@testing-library/jest-dom/vitest';
import { loadAllNamespaces } from './i18n/index.jsx';

// Translations are lazy chunks in the app; tests get them all up front
await loadAllNamespaces();
