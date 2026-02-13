import { createRoot } from 'react-dom/client'
import { UserProvider } from "./Features/UserContext.jsx";
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from "./App.jsx"
import { useEffect } from 'react';
import Lenis from 'lenis';
import AOS from 'aos';
import 'aos/dist/aos.css';

function SmoothScroll({ children }) {
  useEffect(() => {
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

    return () => {
      lenis.destroy();
    };
  }, []);

  return children;
}

// AOS initialization component
function AOSInit() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      mirror: true,
      offset: 100,
      easing: 'ease-out-cubic',
    });
    
    // Refresh AOS on mount
    AOS.refresh();
    
    // Refresh AOS on resize
    const handleResize = () => {
      AOS.refresh();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return null;
}

createRoot(document.getElementById('root')).render(
  <SmoothScroll>
    <AOSInit />
    <UserProvider>
      <App />
    </UserProvider>
  </SmoothScroll>
)
