import { useEffect, useState } from 'react'
import {
  fetchTrash,
  restoreBill,
  permanentlyDeleteBill,
  bulkRestoreBills,
  bulkPermanentlyDeleteBills,
} from '../api.js'
import AdminLogin from '../components/AdminLogin.jsx'

const TOKEN_KEY = 'tile_bills_admin_token'

export default function TrashPage() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [bills, setBills] = useState([])
  const [status, setStatus] = useState('loading')
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [bulkWorking, setBulkWorking] = useState(false)

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

  function toggleSelectMode() {
    setSelectMode((prev) => !prev)
    setSelectedIds(new Set())
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAllBills() {
    setSelectedIds(new Set(bills.map((b) => b.id)))
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  async function handleBulkRestore() {
    if (selectedIds.size === 0) return
    const confirmed = window.confirm(`Restore ${selectedIds.size} selected bill(s)?`)
    if (!confirmed) return

    setBulkWorking(true)
    try {
      await bulkRestoreBills(token, Array.from(selectedIds))
      setSelectedIds(new Set())
      setSelectMode(false)
      await load(token)
    } catch (err) {
      console.error(err)
      alert('Could not restore selected bills.')
    } finally {
      setBulkWorking(false)
    }
  }

  async function handleBulkPermanentDelete() {
    if (selectedIds.size === 0) return
    const confirmed = window.confirm(
      `Permanently delete ${selectedIds.size} selected bill(s)? This cannot be undone.`
    )
    if (!confirmed) return

    setBulkWorking(true)
    try {
      await bulkPermanentlyDeleteBills(token, Array.from(selectedIds))
      setSelectedIds(new Set())
      setSelectMode(false)
      await load(token)
    } catch (err) {
      console.error(err)
      alert('Could not permanently delete selected bills.')
    } finally {
      setBulkWorking(false)
    }
  }

  if (!token) {
    return <AdminLogin onSuccess={handleLoginSuccess} />
  }

  const allSelected = bills.length > 0 && selectedIds.size === bills.length

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Trash ({bills.length})</h1>
        <div className="dashboard-actions">
          {!selectMode && (
            <>
              <button className="btn-refresh" onClick={() => load(token)}>Refresh</button>
              <button className="btn-refresh" onClick={toggleSelectMode}>Select</button>
              <button className="btn-refresh" onClick={handleLogout}>Log out</button>
            </>
          )}
        </div>
      </div>

      {selectMode && (
        <div className="bulk-actions-bar">
          <span>{selectedIds.size} selected</span>
          <div className="bulk-actions-buttons">
            <button
              className="btn-icon-text"
              onClick={() => (allSelected ? clearSelection() : selectAllBills())}
              disabled={bulkWorking || bills.length === 0}
            >
              {allSelected ? 'Unselect all' : `Select all (${bills.length})`}
            </button>
            <button
              className="btn-icon-text"
              onClick={handleBulkRestore}
              disabled={selectedIds.size === 0 || bulkWorking}
            >
              {bulkWorking ? 'Working...' : `Restore selected (${selectedIds.size})`}
            </button>
            <button
              className="btn-icon-text danger"
              onClick={handleBulkPermanentDelete}
              disabled={selectedIds.size === 0 || bulkWorking}
            >
              {bulkWorking ? 'Working...' : `Delete selected permanently (${selectedIds.size})`}
            </button>
            <button className="btn-icon-text" onClick={toggleSelectMode} disabled={bulkWorking}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <p className="msg">Deleted bills stay here until permanently deleted. Restoring brings them back to the dashboard.</p>

      {status === 'loading' && <p className="msg">Loading trash...</p>}
      {status === 'error' && <p className="msg error">Couldn't reach the backend. Is it running?</p>}
      {status === 'ready' && bills.length === 0 && <p>Trash is empty.</p>}

      {status === 'ready' && bills.length > 0 && (
        <div className="bill-grid">
          {bills.map((bill) => (
            <div
              className={`bill-card${selectMode ? ' bill-card-selectable' : ''}${selectedIds.has(bill.id) ? ' bill-card-selected' : ''}`}
              key={bill.id}
              onClick={() => { if (selectMode) toggleSelect(bill.id) }}
            >
              {selectMode && (
                <div className="bill-select-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(bill.id)}
                    onChange={() => toggleSelect(bill.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              <button
                type="button"
                className="bill-photo-btn"
                onClick={(e) => {
                  if (selectMode) { e.stopPropagation(); return }
                  window.open(bill.photo_url, '_blank')
                }}
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
                {!selectMode && (
                  <div className="bill-card-actions">
                    <button className="btn-icon-text" onClick={() => handleRestore(bill.id)}>Restore</button>
                    <button className="btn-icon-text danger" onClick={() => handlePermanentDelete(bill.id)}>
                      Delete permanently
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}