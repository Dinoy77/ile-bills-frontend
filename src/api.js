const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function uploadBill({ employeeName, billAmount, photoFile }) {
  const formData = new FormData()
  formData.append('employee_name', employeeName)
  if (billAmount) formData.append('bill_amount', billAmount)
  formData.append('photo', photoFile)

  const res = await fetch(`${API_URL}/bills`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status}`)
  }
  return res.json()
}

export async function fetchBills(token) {
  const res = await fetch(`${API_URL}/bills`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) {
    throw new Error('UNAUTHORIZED')
  }
  if (!res.ok) {
    throw new Error(`Failed to load bills: ${res.status}`)
  }
  return res.json()
}

export async function updateBill(token, billId, { employeeName, billAmount }) {
  const res = await fetch(`${API_URL}/bills/${billId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      employee_name: employeeName,
      bill_amount: billAmount === '' || billAmount == null ? null : Number(billAmount),
    }),
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(`Update failed: ${res.status}`)
  return res.json()
}

export async function deleteBill(token, billId) {
  const res = await fetch(`${API_URL}/bills/${billId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
  return res.json()
}

export async function adminLogin(password) {
  const res = await fetch(`${API_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  if (!res.ok) {
    throw new Error('Incorrect password')
  }
  const data = await res.json()
  return data.token
}
// Deletes multiple bills at once (and their photos). Admin only.
// Matches: @app.post("/bills/bulk-delete")
export async function bulkDeleteBills(token, ids) {
  const res = await fetch(`${API_URL}/bills/bulk-delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ids }),
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(`Bulk delete failed: ${res.status}`)
  return res.json()
}