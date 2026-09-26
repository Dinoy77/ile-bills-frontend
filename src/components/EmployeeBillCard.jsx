import { useState } from 'react'
import { deleteMyBill } from '../api.js'

export default function EmployeeBillCard({ bill, token, onChanged }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const date = bill.created_at ? new Date(bill.created_at).toLocaleString() : ''

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteMyBill(token, bill.id)
      onChanged()
    } catch (err) {
      console.error(err)
      setDeleting(false)
    }
  }

  return (
    <div className="bill-card">
      <a href={bill.photo_url} target="_blank" rel="noreferrer">
        <img src={bill.photo_url} alt={`Bill for ${bill.customer_name || 'customer'}`} />
      </a>

      <div className="bill-info">
        <strong>{bill.customer_name || 'Untitled bill'}</strong>
        {bill.bill_amount != null && <span>Rs. {bill.bill_amount}</span>}
        {bill.payment_method && <span>{bill.payment_method}</span>}
        {bill.photo_source && <span>{bill.photo_source === 'gallery' ? 'Uploaded from gallery' : 'Camera photo'}</span>}
        <span className="bill-date">{date}</span>

        {confirmingDelete ? (
          <div className="bill-edit-actions">
            <span className="bill-edit-error">Delete this bill?</span>
            <button className="btn-icon-text danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Yes, delete'}
            </button>
            <button className="btn-icon-text" onClick={() => setConfirmingDelete(false)} disabled={deleting}>
              Cancel
            </button>
          </div>
        ) : (
          <div className="bill-card-actions">
            <button className="btn-icon-text danger" onClick={() => setConfirmingDelete(true)}>Delete</button>
          </div>
        )}
      </div>
    </div>
  )
}