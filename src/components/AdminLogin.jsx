import { useState } from 'react'
import { adminLogin } from '../api.js'
import PasswordInput from './PasswordInput.jsx'

export default function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const token = await adminLogin(password)
      onSuccess(token)
    } catch (err) {
      setError('Incorrect password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <h1>Admin Login</h1>
        <p className="login-subtitle">Enter the admin password to view all bills.</p>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          autoFocus
        />
        <button type="submit" className="btn btn-primary" disabled={loading || !password}>
          {loading ? 'Checking...' : 'Log in'}
        </button>
        {error && <p className="msg error">{error}</p>}
      </form>
    </div>
  )
}
