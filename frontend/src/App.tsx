import { HashRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { MarvinProvider } from './lib/store'
import Admin from './pages/Admin'
import Gateway from './pages/Gateway'
import Inicio from './pages/Inicio'
import Malla from './pages/Malla'
import Mando from './pages/Mando'
import Nodo from './pages/Nodo'
import Registro from './pages/Registro'

export default function App() {
  return (
    <MarvinProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Inicio />} />
            <Route path="nodo" element={<Nodo />} />
            <Route path="malla" element={<Malla />} />
            <Route path="mando" element={<Mando />} />
            <Route path="gateway" element={<Gateway />} />
            <Route path="registro" element={<Registro />} />
            <Route path="admin" element={<Admin />} />
          </Route>
        </Routes>
      </HashRouter>
    </MarvinProvider>
  )
}
