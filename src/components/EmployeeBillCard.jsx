import { useState } from 'react'
import { deleteMyBill } from '../api.js'

export default function EmployeeBillCard({ bill, token, onChanged }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const date = bill.created_at ? new Date(bill.created_at).toLocaleString() : ''
  const photos = bill.photo_urls && bill.photo_urls.length > 0 ? bill.photo_urls : [bill.photo_url]

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
      <div className="bill-photos">
        {photos.map((url, i) => (
          <button
            key={i}
            type="button"
            className="bill-photo-thumb"
            onClick={() => window.open(url, '_blank')}
          >
            <img src={url} alt={`Bill photo ${i + 1} for ${bill.customer_name || 'customer'}`} />
          </button>
        ))}
      </div>

      <div className="bill-info">
        <strong>{bill.customer_name || 'Untitled bill'}</strong>
        {bill.bill_amount != null && <span>Rs. {bill.bill_amount}</span>}
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