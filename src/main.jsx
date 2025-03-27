import { createRoot } from 'react-dom/client'
import { UserProvider } from "./Features/UserContext.jsx";
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from "./App.jsx"

createRoot(document.getElementById('root')).render(
  <UserProvider>
    <App />
  </UserProvider>
)
