import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar    from './components/Navbar'
import HomePage  from './pages/HomePage'
import WallPage  from './pages/WallPage'
import TimelinePage from './pages/TimelinePage'
import GamePage  from './pages/GamePage'
import CakePage  from './pages/CakePage'
import PrivatePage from './pages/PrivatePage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin route — no navbar */}
        <Route path="/admin" element={<AdminPage />} />

        {/* All other routes — with navbar */}
        <Route path="*" element={
          <>
            <Navbar />
            <Routes>
              <Route path="/"         element={<HomePage />}   />
              <Route path="/wall"     element={<WallPage />}   />
              <Route path="/timeline" element={<TimelinePage />} />
              <Route path="/game"     element={<GamePage />}   />
              <Route path="/cake"     element={<CakePage />}   />
              <Route path="/private"  element={<PrivatePage />} />
            </Routes>
          </>
        } />
      </Routes>
    </BrowserRouter>
  )
}
