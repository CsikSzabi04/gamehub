import './App.css';
import './body.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Body from './Body.jsx'

// Every page except the home page is its own chunk, downloaded on first visit to that route.
// React Router's `lazy` loads the chunk *before* rendering. (With React.lazy + <Suspense>,
// React 19 holds back revealing the page for up to 300 ms, which every route paid on load.)
const page = (load) => () => load().then(module => ({ Component: module.default }));

// Login/SignUp take the auth instance as a prop; load it together with the page chunk
const pageWithAuth = (load) => () =>
  Promise.all([load(), import('../firebaseAuth.js')]).then(([{ default: Page }, { auth }]) => ({
    Component: (props) => <Page auth={auth} {...props} />,
  }));

// The router must be created once (outside the component), otherwise every
// re-render of App builds a new router and remounts the whole page.
// The logged-in user is provided by UserContext (see main.jsx).
const router = createBrowserRouter([
  { path: "/", element: <Body /> },
  { path: "/terms", lazy: page(() => import('./TermsAndPrivacy/Terms.jsx')) },
  { path: "/movies", lazy: page(() => import('./FeaturesByGame/Movies/Movie.jsx')) },
  { path: "/dbd", lazy: page(() => import('./FeaturesByGame/DBD/DbdApp.jsx')) },
  { path: "/hub", lazy: page(() => import('./Hub/HubPage.jsx')) },
  { path: "/hub/:id", lazy: page(() => import('./Hub/UniversePage.jsx')) },
  { path: "/game/:source/:id", lazy: page(() => import('./Features/StoreGamePage.jsx')) },
  { path: "/review", lazy: page(() => import('./Features/Review.jsx')) },
  { path: "/allreview/:gameId", lazy: page(() => import('./Features/AllReview.jsx')) },
  { path: "/searchreview/:gameId", lazy: page(() => import('./Features/SearchReview.jsx')) },
  { path: "/reviews/:gameId", lazy: page(() => import('./Features/ReviewsOpen.jsx')) },
  { path: "/privacy", lazy: page(() => import('./TermsAndPrivacy/Privacy.jsx')) },
  { path: "/profile", lazy: page(() => import('./pages/Profile.jsx')) },
  { path: "/login", lazy: pageWithAuth(() => import('./pages/Login.jsx')) },
  { path: "/discover", lazy: page(() => import('./Sections/Dicvover.jsx')) },
  { path: "/contact", lazy: page(() => import('./Features/Contact.jsx')) },
  { path: "/signup", lazy: pageWithAuth(() => import('./pages/SignUp.jsx')) },
  { path: "*", lazy: page(() => import('./pages/Notfound.jsx')) },
]);

// Warm the most visited page chunks so navigation feels instant, but only well after the
// current page has painted (parsing them earlier delayed the first paint)
function warmChunks() {
  const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
  setTimeout(() => idle(() => {
    import('./Sections/Dicvover.jsx');
    import('./Features/Review.jsx');
    import('./pages/Login.jsx');
  }), 2000);
}
if (document.readyState === 'complete') warmChunks();
else window.addEventListener('load', warmChunks, { once: true });

export default function App() {
  return (
    <div className='app'>
      <RouterProvider router={router} />
    </div>
  );
}
