import { useEffect, useState } from 'react'
import { fetchEmployees, createEmployee, deleteEmployee } from '../api.js'
import AdminLogin from '../components/AdminLogin.jsx'

const TOKEN_KEY = 'tile_bills_admin_token'

export default function EmployeesPage() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [employees, setEmployees] = useState([])
  const [status, setStatus] = useState('loading')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  useEffect(() => {
    if (token) load(token)
  }, [token])

  async function load(activeToken) {
    setStatus('loading')
    try {
      const data = await fetchEmployees(activeToken)
      setEmployees(data)
      setStatus('ready')
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') {
        handleLogout()
      } else {
        console.error(err)
        setStatus('error')
      }
    }
  }

  function handleLoginSuccess(newToken) {
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
    window.dispatchEvent(new Event('authchange'))
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setEmployees([])
    window.dispatchEvent(new Event('authchange'))
  }

  async function handleCreate(e) {
    e.preventDefault()
    setCreateError('')
    setCreateSuccess('')
    if (!name.trim() || !email.trim() || !password) {
      setCreateError('Please fill in all fields.')
      return
    }
    setCreating(true)
    try {
      const result = await createEmployee(token, {
        name: name.trim(),
        email: email.trim(),
        password,
      })
      setCreateSuccess(
        result.linked_bills > 0
          ? `Employee created. Linked ${result.linked_bills} existing bill(s) to this account.`
          : 'Employee created.'
      )
      setName('')
      setEmail('')
      setPassword('')
      await load(token)
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') {
        handleLogout()
      } else {
        setCreateError(err.message || 'Could not create employee.')
      }
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(employeeId) {
    const confirmed = window.confirm('Remove this employee account? Their bills will stay on record.')
    if (!confirmed) return
    try {
      await deleteEmployee(token, employeeId)
      await load(token)
    } catch (err) {
      console.error(err)
      alert('Could not remove employee.')
    }
  }

  if (!token) {
    return <AdminLogin onSuccess={handleLoginSuccess} />
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Employees ({employees.length})</h1>
        <div className="dashboard-actions">
          <button className="btn-refresh" onClick={() => load(token)}>Refresh</button>
          <button className="btn-refresh" onClick={handleLogout}>Log out</button>
        </div>
      </div>

      <form className="employee-form" onSubmit={handleCreate}>
        <h2>Add employee</h2>
        <div className="employee-form-row">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={creating}>
            {creating ? 'Adding...' : 'Add employee'}
          </button>
        </div>
        {createError && <p className="msg error">{createError}</p>}
        {createSuccess && <p className="msg success">{createSuccess}</p>}
      </form>

      {status === 'loading' && <p className="msg">Loading employees...</p>}
      {status === 'error' && <p className="msg error">Couldn't reach the backend. Is it running?</p>}
      {status === 'ready' && employees.length === 0 && <p>No employees added yet.</p>}

      {status === 'ready' && employees.length > 0 && (
        <table className="employee-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Bills uploaded</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.bill_count}</td>
                <td>
                  <button className="btn-icon-text danger" onClick={() => handleDelete(emp.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}