const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Uploads a bill: sends the photo file + form fields as multipart/form-data.
// Matches a FastAPI endpoint like:
//   @app.post("/bills")
//   async def create_bill(employee_name: str = Form(...), bill_amount: float = Form(None), photo: UploadFile = File(...))
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

// Fetches the list of all bills.
// Matches a FastAPI endpoint like:
//   @app.get("/bills")
//   async def list_bills(): ...
export async function fetchBills() {
  const res = await fetch(`${API_URL}/bills`)
  if (!res.ok) {
    throw new Error(`Failed to load bills: ${res.status}`)
  }
  return res.json()
}
