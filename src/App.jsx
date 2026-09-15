import './App.css';
import './body.css';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import Body from './Body.jsx'
import AppRuntime from './pwa/AppRuntime.jsx'
import { loadNamespaces } from './i18n/index.jsx'

// Every page except the home page is its own chunk, downloaded on first visit to that route.
// React Router's `lazy` loads the chunk *before* rendering. (With React.lazy + <Suspense>,
// React 19 holds back revealing the page for up to 300 ms, which every route paid on load.)
// The second argument lists the translation namespaces the page needs; they load in parallel with the chunk.
const page = (load, namespaces = []) => () =>
  Promise.all([load(), loadNamespaces(namespaces)]).then(([module]) => ({ Component: module.default }));

// Login/SignUp take the auth instance as a prop; load it together with the page chunk
const pageWithAuth = (load, namespaces = []) => () =>
  Promise.all([load(), import('../firebaseAuth.js'), loadNamespaces(namespaces)]).then(([{ default: Page }, { auth }]) => ({
    Component: (props) => <Page auth={auth} {...props} />,
  }));

// The router must be created once (outside the component), otherwise every
// re-render of App builds a new router and remounts the whole page.
// The logged-in user is provided by UserContext (see main.jsx).
const router = createBrowserRouter([
  { path: "/", element: <Body /> },
  { path: "/terms", lazy: page(() => import('./TermsAndPrivacy/Terms.jsx'), ['legal', 'legalCommon']) },
  { path: "/cookies", lazy: page(() => import('./TermsAndPrivacy/CookiePolicy.jsx'), ['cookies', 'legalCommon']) },
  { path: "/legal-notice", lazy: page(() => import('./TermsAndPrivacy/LegalNotice.jsx'), ['legalNotice', 'legalCommon']) },
  { path: "/movies", lazy: page(() => import('./FeaturesByGame/Movies/Movie.jsx'), ['movies']) },
  { path: "/dbd", lazy: page(() => import('./FeaturesByGame/DBD/DbdApp.jsx'), ['dbd']) },
  { path: "/hub", lazy: page(() => import('./Hub/HubPage.jsx'), ['discover']) },
  { path: "/hub/:id", lazy: page(() => import('./Hub/UniversePage.jsx')) },
  { path: "/game/:source/:id", lazy: page(() => import('./Features/StoreGamePage.jsx'), ['storePage', 'calendar', 'gameInfo', 'hardware', 'library', 'prices', 'reviewsPlus', 'subscriptions', 'achievements', 'profileExtras']) },
  { path: "/review", lazy: page(() => import('./Features/Review.jsx'), ['reviews']) },
  { path: "/allreview/:gameId", lazy: page(() => import('./Features/AllReview.jsx'), ['reviewsPlus', 'gameInfo', 'hardware', 'library', 'achievements', 'profileExtras']) },
  { path: "/searchreview/:gameId", lazy: page(() => import('./Features/SearchReview.jsx'), ['reviewsPlus', 'gameInfo', 'hardware', 'library', 'achievements', 'profileExtras']) },
  { path: "/reviews/:gameId", lazy: page(() => import('./Features/ReviewsOpen.jsx')) },
  { path: "/privacy", lazy: page(() => import('./TermsAndPrivacy/Privacy.jsx'), ['privacy', 'legalCommon']) },
  { path: "/profile", lazy: page(() => import('./pages/Profile.jsx'), ['profile', 'profileExtras', 'social', 'hardware', 'library', 'achievements']) },
  { path: "/login", lazy: pageWithAuth(() => import('./pages/Login.jsx'), ['auth']) },
  // Discover is part of the Hub now; keep old links working
  { path: "/discover", element: <Navigate to={{ pathname: '/hub', hash: '#discover' }} replace /> },
  { path: "/contact", lazy: page(() => import('./Features/Contact.jsx'), ['contact']) },
  { path: "/signup", lazy: pageWithAuth(() => import('./pages/SignUp.jsx'), ['auth']) },
  // Community features
  { path: "/community", lazy: page(() => import('./pages/CommunityPage.jsx')) },
  { path: "/notifications", lazy: page(() => import('./pages/NotificationsPage.jsx')) },
  { path: "/alerts", lazy: page(() => import('./pages/AlertsPage.jsx'), ['prices']) },
  { path: "/library", lazy: page(() => import('./pages/LibraryPage.jsx'), ['library']) },
  { path: "/achievements", lazy: page(() => import('./pages/AchievementsPage.jsx'), ['achievements', 'profile', 'profileExtras', 'library', 'steam']) },
  { path: "/wishlist", lazy: page(() => import('./pages/WishlistPage.jsx'), ['steam', 'prices', 'library']) },
  { path: "/lfg", lazy: page(() => import('./pages/LfgPage.jsx'), ['lfg']) },
  { path: "/calendar", lazy: page(() => import('./pages/CalendarPage.jsx'), ['calendar']) },
  { path: "/free-games", lazy: page(() => import('./pages/FreeGamesPage.jsx'), ['calendar', 'freeGames']) },
  { path: "/subscriptions", lazy: page(() => import('./pages/SubscriptionsPage.jsx'), ['subscriptions']) },
  { path: "/status", lazy: page(() => import('./pages/StatusPage.jsx'), ['status']) },
  { path: "/u/:username", lazy: page(() => import('./pages/PublicProfilePage.jsx'), ['social', 'profile']) },
  { path: "/feed", lazy: page(() => import('./pages/FeedPage.jsx'), ['social']) },
  { path: "/leaderboard", lazy: page(() => import('./pages/LeaderboardPage.jsx'), ['social']) },
  { path: "/challenges", lazy: page(() => import('./pages/ChallengesPage.jsx'), ['challenges']) },
  { path: "/tierlist", lazy: page(() => import('./pages/TierListPage.jsx'), ['tierlists']) },
  { path: "/tierlist/:id", lazy: page(() => import('./pages/TierListPage.jsx'), ['tierlists']) },
  { path: "/builds", lazy: page(() => import('./pages/BuildsPage.jsx'), ['builds']) },
  { path: "*", lazy: page(() => import('./pages/Notfound.jsx'), ['notfound']) },
]);

// Warm the most visited page chunks so navigation feels instant, but only well after the
// current page has painted (parsing them earlier delayed the first paint)
function warmChunks() {
  const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
  setTimeout(() => idle(() => {
    import('./Hub/HubPage.jsx');
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
      <AppRuntime navigate={router.navigate} />
    </div>
  );
}
