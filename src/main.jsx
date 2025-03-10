import { createRoot } from 'react-dom/client'
import { UserProvider } from "./UserContext.jsx";
import './index.css';
import App from "./App.jsx"

createRoot(document.getElementById('root')).render(
  <UserProvider>
  <App />
  </UserProvider>
)
