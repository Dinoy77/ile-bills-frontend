import { useEffect, useState } from 'react'
import { fetchBills, bulkDeleteBills } from '../api.js'
import BillCard from '../components/BillCard.jsx'
import AdminLogin from '../components/AdminLogin.jsx'

const TOKEN_KEY = 'tile_bills_admin_token'

export default function DashboardPage() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [bills, setBills] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState('loading')
  const [openGroups, setOpenGroups] = useState({})
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

  useEffect(() => {
    if (token) load(token)
  }, [token])

  async function load(activeToken) {
    setStatus('loading')
    try {
      const data = await fetchBills(activeToken)
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
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setBills([])
  }

  function toggleGroup(key) {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }))
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

  function selectAllInGroup(groupBills) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      groupBills.forEach((b) => next.add(b.id))
      return next
    })
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return
    const confirmed = window.confirm(
      `Delete ${selectedIds.size} selected bill(s)? This cannot be undone.`
    )
    if (!confirmed) return

    setBulkDeleting(true)
    try {
      await bulkDeleteBills(token, Array.from(selectedIds))
      setSelectedIds(new Set())
      setSelectMode(false)
      await load(token)
    } catch (err) {
      console.error(err)
      alert('Could not delete selected bills.')
    } finally {
      setBulkDeleting(false)
    }
  }

  if (!token) {
    return <AdminLogin onSuccess={handleLoginSuccess} />
  }

  const filtered = bills.filter((b) =>
    b.employee_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalAmount = bills.reduce((sum, b) => sum + (b.bill_amount || 0), 0)
  const now = new Date()
  const thisMonthAmount = bills
    .filter((b) => {
      if (!b.created_at) return false
      const d = new Date(b.created_at)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((sum, b) => sum + (b.bill_amount || 0), 0)

  const groups = {}
  for (const bill of filtered) {
    const raw = (bill.employee_name || 'Unknown').trim()
    const key = raw.toLowerCase()
    if (!groups[key]) {
      groups[key] = { displayName: raw, bills: [] }
    }
    groups[key].bills.push(bill)
  }
  const groupKeys = Object.keys(groups).sort((a, b) =>
    groups[a].displayName.localeCompare(groups[b].displayName)
  )

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>All bills ({filtered.length})</h1>
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
              className="btn-icon-text danger"
              onClick={handleBulkDelete}
              disabled={selectedIds.size === 0 || bulkDeleting}
            >
              {bulkDeleting ? 'Deleting...' : `Delete selected (${selectedIds.size})`}
            </button>
            <button className="btn-icon-text" onClick={toggleSelectMode} disabled={bulkDeleting}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {status === 'ready' && bills.length > 0 && !selectMode && (
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total bills</div>
            <div className="stat-value">{bills.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total amount</div>
            <div className="stat-value">₹{totalAmount.toLocaleString('en-IN')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">This month</div>
            <div className="stat-value">₹{thisMonthAmount.toLocaleString('en-IN')}</div>
          </div>
        </div>
      )}

      {!selectMode && (
        <input
          type="text"
          placeholder="Search by employee name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      )}

      {status === 'loading' && <p className="msg">Loading bills...</p>}
      {status === 'error' && <p className="msg error">Couldn't reach the backend. Is it running?</p>}

      {status === 'ready' && groupKeys.map((key) => {
        const group = groups[key]
        const isOpen = !!openGroups[key] || selectMode
        const groupTotal = group.bills.reduce((sum, b) => sum + (b.bill_amount || 0), 0)
        return (
          <div className="employee-group" key={key}>
            <button className="employee-group-header" onClick={() => toggleGroup(key)}>
              <span className="employee-group-name">
                <span className="employee-group-arrow">{isOpen ? '▾' : '▸'}</span>
                📁 {group.displayName}
              </span>
              <span className="employee-group-meta">
                {group.bills.length} bill{group.bills.length !== 1 ? 's' : ''} · ₹{groupTotal.toLocaleString('en-IN')}
                {selectMode && (
                  <a
                    className="select-all-link"
                    onClick={(e) => { e.stopPropagation(); selectAllInGroup(group.bills) }}
                  >
                    Select all
                  </a>
                )}
              </span>
            </button>
            {isOpen && (
              <div className="bill-grid">
                {group.bills.map((bill) => (
                  <BillCard
                    key={bill.id}
                    bill={bill}
                    token={token}
                    onChanged={() => load(token)}
                    selectMode={selectMode}
                    selected={selectedIds.has(bill.id)}
                    onToggleSelect={toggleSelect}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}

      {status === 'ready' && filtered.length === 0 && <p>No bills found.</p>}
    </div>
  )
}