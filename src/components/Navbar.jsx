import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <span className="brand">Rahul Tiles</span>
      <div className="nav-links">
        <Link to="/">Upload</Link>
        <Link to="/dashboard">Dashboard</Link>
      </div>
    </nav>
  )
}
