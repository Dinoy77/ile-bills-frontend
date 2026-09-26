import { useEffect, useState } from 'react'
import { fetchTrash, restoreBill, permanentlyDeleteBill } from '../api.js'
import AdminLogin from '../components/AdminLogin.jsx'

const TOKEN_KEY = 'tile_bills_admin_token'

export default function TrashPage() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [bills, setBills] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (token) load(token)
  }, [token])

  async function load(activeToken) {
    setStatus('loading')
    try {
      const data = await fetchTrash(activeToken)
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

  function handleLoginSuccess(newToken) {
    localStorage.removeItem('tile_bills_employee_token')
    localStorage.removeItem('tile_bills_employee_name')
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
    window.dispatchEvent(new Event('authchange'))
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setBills([])
    window.dispatchEvent(new Event('authchange'))
  }

  async function handleRestore(billId) {
    try {
      await restoreBill(token, billId)
      await load(token)
    } catch (err) {
      console.error(err)
      alert('Could not restore bill.')
    }
  }

  async function handlePermanentDelete(billId) {
    const confirmed = window.confirm('Permanently delete this bill? This cannot be undone.')
    if (!confirmed) return
    try {
      await permanentlyDeleteBill(token, billId)
      await load(token)
    } catch (err) {
      console.error(err)
      alert('Could not permanently delete bill.')
    }
  }

  if (!token) {
    return <AdminLogin onSuccess={handleLoginSuccess} />
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Trash ({bills.length})</h1>
        <div className="dashboard-actions">
          <button className="btn-refresh" onClick={() => load(token)}>Refresh</button>
          <button className="btn-refresh" onClick={handleLogout}>Log out</button>
        </div>
      </div>

      <p className="msg">Deleted bills stay here until permanently deleted. Restoring brings them back to the dashboard.</p>

      {status === 'loading' && <p className="msg">Loading trash...</p>}
      {status === 'error' && <p className="msg error">Couldn't reach the backend. Is it running?</p>}
      {status === 'ready' && bills.length === 0 && <p>Trash is empty.</p>}

      {status === 'ready' && bills.length > 0 && (
        <div className="bill-grid">
          {bills.map((bill) => (
            <div className="bill-card" key={bill.id}>
              <button
                type="button"
                className="bill-photo-btn"
                onClick={() => window.open(bill.photo_url, '_blank')}
              >
                <img src={bill.photo_url} alt={`Bill by ${bill.employee_name}`} />
              </button>
              <div className="bill-info">
                <strong>{bill.employee_name}</strong>
                {bill.customer_name && <span>Customer: {bill.customer_name}</span>}
                {bill.bill_amount != null && <span>Rs. {bill.bill_amount}</span>}
                <span className="bill-date">
                  Deleted: {bill.deleted_at ? new Date(bill.deleted_at).toLocaleString() : ''}
                </span>
                <div className="bill-card-actions">
                  <button className="btn-icon-text" onClick={() => handleRestore(bill.id)}>Restore</button>
                  <button className="btn-icon-text danger" onClick={() => handlePermanentDelete(bill.id)}>
                    Delete permanently
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}