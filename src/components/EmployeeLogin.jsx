import { useState } from 'react'
import { employeeLogin } from '../api.js'
import PasswordInput from './PasswordInput.jsx'

export default function EmployeeLogin({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await employeeLogin(email.trim(), password)
      onSuccess(data.token, data.name)
    } catch (err) {
      setError('Incorrect email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <h1>Employee Login</h1>
        <p className="login-subtitle">Log in with the email and password your admin gave you.</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoFocus
        />
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit" className="btn btn-primary" disabled={loading || !email || !password}>
          {loading ? 'Checking...' : 'Log in'}
        </button>
        {error && <p className="msg error">{error}</p>}
      </form>
    </div>
  )
}