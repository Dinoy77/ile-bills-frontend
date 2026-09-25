import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const ADMIN_TOKEN_KEY = 'tile_bills_admin_token'
const EMPLOYEE_TOKEN_KEY = 'tile_bills_employee_token'

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem(ADMIN_TOKEN_KEY))
  const [isEmployee, setIsEmployee] = useState(!!localStorage.getItem(EMPLOYEE_TOKEN_KEY))

  useEffect(() => {
    function refresh() {
      setIsAdmin(!!localStorage.getItem(ADMIN_TOKEN_KEY))
      setIsEmployee(!!localStorage.getItem(EMPLOYEE_TOKEN_KEY))
    }
    window.addEventListener('authchange', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('authchange', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  return (
    <nav className="navbar">
      <span className="brand">Rahul Tiles</span>
      <div className="nav-links">
        {isAdmin && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/employees">Employees</Link>
            <Link to="/trash">Trash</Link>
          </>
        )}
        {!isAdmin && isEmployee && (
          <>
            <Link to="/">Upload</Link>
            <Link to="/my-bills">My Bills</Link>
          </>
        )}
        {!isAdmin && !isEmployee && <Link to="/">Upload</Link>}
      </div>
    </nav>
  )
}