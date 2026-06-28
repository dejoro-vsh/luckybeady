import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AdminApp from './AdminApp.jsx'
import AdminSubscribe from './pages/AdminSubscribe.jsx'
import './styles/global.css'

const path = window.location.pathname;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {path === '/admin/alert' ? <AdminSubscribe /> : path.startsWith('/admin') ? <AdminApp /> : <App />}
  </React.StrictMode>,
)
