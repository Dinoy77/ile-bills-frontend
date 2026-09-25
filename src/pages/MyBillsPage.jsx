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
  const totalAmount = bills.reduce((sum, b) => sum + (b.bill_amount || 0), 0)

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

  if (!token) {
    return <EmployeeLogin onSuccess={handleLoginSuccess} />
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>My bills ({bills.length})</h1>
        <div className="dashboard-actions">
          <button className="btn-refresh" onClick={load}>Refresh</button>
          <button className="btn-refresh" onClick={handleLogout}>Log out</button>
        </div>
      </div>

      {status === 'ready' && bills.length > 0 && (
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total bills</div>
            <div className="stat-value">{bills.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total amount</div>
            <div className="stat-value">₹{totalAmount.toLocaleString('en-IN')}</div>
          </div>
        </div>
      )}


      {status === 'loading' && <p className="msg">Loading bills...</p>}
      {status === 'error' && <p className="msg error">Couldn't reach the backend. Is it running?</p>}
      {status === 'ready' && bills.length === 0 && <p>You haven't uploaded any bills yet.</p>}

      {status === 'ready' && bills.length > 0 && (
        <div className="bill-grid">
          {bills.map((bill) => (
            <EmployeeBillCard key={bill.id} bill={bill} token={token} onChanged={load} />
          ))}
        </div>
      )}
    </div>
  )
}