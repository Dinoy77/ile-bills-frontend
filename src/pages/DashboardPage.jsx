import { useEffect, useState } from 'react'
import { fetchBills } from '../api.js'
import BillCard from '../components/BillCard.jsx'

export default function DashboardPage() {
  const [bills, setBills] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState('loading') // loading | ready | error

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setStatus('loading')
    try {
      const data = await fetchBills()
      setBills(data)
      setStatus('ready')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  const filtered = bills.filter((b) =>
    b.employee_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>All bills ({filtered.length})</h1>
        <button className="btn-refresh" onClick={load}>Refresh</button>
      </div>

      <input
        type="text"
        placeholder="Search by employee name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      {status === 'loading' && <p className="msg">Loading bills...</p>}
      {status === 'error' && <p className="msg error">Couldn't reach the backend. Is it running?</p>}

      <div className="bill-grid">
        {filtered.map((bill) => (
          <BillCard key={bill.id} bill={bill} />
        ))}
        {status === 'ready' && filtered.length === 0 && <p>No bills found.</p>}
      </div>
    </div>
  )
}
