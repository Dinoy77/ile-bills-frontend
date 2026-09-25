import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import UploadPage from './pages/UploadPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import MyBillsPage from './pages/MyBillsPage.jsx'
import EmployeesPage from './pages/EmployeesPage.jsx'
import TrashPage from './pages/TrashPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="page-wrap">
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/my-bills" element={<MyBillsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/trash" element={<TrashPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}