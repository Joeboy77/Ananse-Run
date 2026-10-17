import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { game } from './game/runtime'
import { loadProfile } from './store/profileStore'
import './styles/global.css'

void loadProfile().then(() => game.refreshMenu())

const root = document.getElementById('root')
if (!root) throw new Error('Root element missing')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
