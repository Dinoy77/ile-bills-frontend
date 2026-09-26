const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function uploadBill({ token, customerName, billAmount, paymentMethod, photoFile }) {
  const formData = new FormData()
  formData.append('customer_name', customerName)
  if (billAmount) formData.append('bill_amount', billAmount)
  formData.append('payment_method', paymentMethod)
  formData.append('photo', photoFile)
  

  const res = await fetch(`${API_URL}/bills`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED')
  }
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

// ---------- Employee login + their own bills ----------

export async function employeeLogin(email, password) {
  const res = await fetch(`${API_URL}/employee/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    throw new Error('Incorrect email or password')
  }
  return res.json() // { token, name }
}

export async function fetchMyBills(token) {
  const res = await fetch(`${API_URL}/my-bills`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(`Failed to load bills: ${res.status}`)
  return res.json()
}

export async function deleteMyBill(token, billId) {
  const res = await fetch(`${API_URL}/my-bills/${billId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
  return res.json()
}

// ---------- Admin: manage employee accounts ----------

export async function fetchEmployees(token) {
  const res = await fetch(`${API_URL}/admin/employees`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(`Failed to load employees: ${res.status}`)
  return res.json()
}

export async function createEmployee(token, { name, email, password }) {
  const res = await fetch(`${API_URL}/admin/employees`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, email, password }),
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || `Failed to create employee: ${res.status}`)
  }
  return res.json()
}

export async function deleteEmployee(token, employeeId) {
  const res = await fetch(`${API_URL}/admin/employees/${employeeId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
  return res.json()
}
export async function resetEmployeePassword(token, employeeId, newPassword) {
  const res = await fetch(`${API_URL}/admin/employees/${employeeId}/reset-password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ new_password: newPassword }),
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || `Failed to reset password: ${res.status}`)
  }
  return res.json()
}
export async function fetchTrash(token) {
  const res = await fetch(`${API_URL}/admin/trash`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(`Failed to load trash: ${res.status}`)
  return res.json()
}

export async function restoreBill(token, billId) {
  const res = await fetch(`${API_URL}/admin/trash/${billId}/restore`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(`Restore failed: ${res.status}`)
  return res.json()
}

export async function permanentlyDeleteBill(token, billId) {
  const res = await fetch(`${API_URL}/admin/trash/${billId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(`Permanent delete failed: ${res.status}`)
  return res.json()
}