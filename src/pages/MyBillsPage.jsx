import { useEffect, useState } from 'react'
import { fetchMyBills } from '../api.js'
import EmployeeBillCard from '../components/EmployeeBillCard.jsx'
import EmployeeLogin from '../components/EmployeeLogin.jsx'

const TOKEN_KEY = 'tile_bills_employee_token'
const NAME_KEY = 'tile_bills_employee_name'

export default function MyBillsPage() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [bills, setBills] = useState([])
  const [status, setStatus] = useState('loading')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const filtered = bills.filter((b) => {
    if (!fromDate && !toDate) return true
    if (!b.created_at) return false
    const billDate = new Date(b.created_at)

    if (fromDate) {
      const start = new Date(fromDate + 'T00:00:00')
      if (billDate < start) return false
    }
    if (toDate) {
      const end = new Date(toDate + 'T23:59:59')
      if (billDate > end) return false
    }
    return true
  })

  const totalAmount = filtered.reduce((sum, b) => sum + (b.bill_amount || 0), 0)

  useEffect(() => {
    if (token) load()
  }, [token])

  async function load() {
    setStatus('loading')
    try {
      const data = await fetchMyBills(token)
      setBills(data)
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

  function handleLoginSuccess(newToken, name) {
    localStorage.removeItem('tile_bills_admin_token')
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(NAME_KEY, name)
    setToken(newToken)
    window.dispatchEvent(new Event('authchange'))
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(NAME_KEY)
    setToken(null)
    setBills([])
    window.dispatchEvent(new Event('authchange'))
  }

  function clearDateFilter() {
    setFromDate('')
    setToDate('')
  }

  if (!token) {
    return <EmployeeLogin onSuccess={handleLoginSuccess} />
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>My bills ({filtered.length})</h1>
        <div className="dashboard-actions">
          <button className="btn-refresh" onClick={load}>Refresh</button>
          <button className="btn-refresh" onClick={handleLogout}>Log out</button>
        </div>
      </div>

      {status === 'ready' && bills.length > 0 && (
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total bills</div>
            <div className="stat-value">{filtered.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total amount</div>
            <div className="stat-value">₹{totalAmount.toLocaleString('en-IN')}</div>
          </div>
        </div>
      )}

      {status === 'ready' && bills.length > 0 && (
        <div className="date-filter-row">
          <label className="date-filter-field">
            From
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </label>
          <label className="date-filter-field">
            To
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </label>
          {(fromDate || toDate) && (
            <button type="button" className="btn-icon-text" onClick={clearDateFilter}>
              Clear dates
            </button>
          )}
        </div>
      )}

      {status === 'loading' && <p className="msg">Loading bills...</p>}
      {status === 'error' && <p className="msg error">Couldn't reach the backend. Is it running?</p>}
      {status === 'ready' && bills.length === 0 && <p>You haven't uploaded any bills yet.</p>}
      {status === 'ready' && bills.length > 0 && filtered.length === 0 && (
        <p>No bills found in that date range.</p>
      )}

      {status === 'ready' && filtered.length > 0 && (
        <div className="bill-grid">
          {filtered.map((bill) => (
            <EmployeeBillCard key={bill.id} bill={bill} token={token} onChanged={load} />
          ))}
        </div>
      )}
    </div>
  )
}