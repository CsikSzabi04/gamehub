import { createRoot } from 'react-dom/client'
import { UserProvider } from "./Features/UserContext.jsx";
import { LanguageProvider } from "./i18n/index.jsx";
import './index.css';
import App from "./App.jsx"
import { installErrorReporting } from './lib/errorReporting.js';

installErrorReporting();

const idle = (cb, timeout = 2000) =>
  window.requestIdleCallback ? window.requestIdleCallback(cb, { timeout }) : setTimeout(cb, 1);

// Smooth scrolling is a nice-to-have: load and start it once the first render is done,
// so it doesn't compete with the initial paint. (The AOS library was removed: no rendered
// component uses data-aos anymore.)
idle(() => {
  import('lenis').then(({ default: Lenis }) => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  });
});

createRoot(document.getElementById('root')).render(
  <UserProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </UserProvider>
)
