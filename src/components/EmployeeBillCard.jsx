import { useState } from 'react'
import { deleteMyBill, updateMyBill } from '../api.js'

export default function EmployeeBillCard({ bill, token, onChanged }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [customerName, setCustomerName] = useState(bill.customer_name || '')
  const [amount, setAmount] = useState(bill.bill_amount ?? '')
  const [paymentMethod, setPaymentMethod] = useState(bill.payment_method || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const date = bill.created_at ? new Date(bill.created_at).toLocaleString() : ''
  const photos = bill.photos && bill.photos.length > 0
    ? bill.photos
    : [{ url: bill.photo_url, download_url: bill.download_url, source: bill.photo_source }]

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

  async function handleSave() {
    if (!customerName.trim()) {
      setError('Customer name cannot be empty.')
      return
    }
    if (!paymentMethod) {
      setError('Please select a payment method.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await updateMyBill(token, bill.id, {
        customerName: customerName.trim(),
        billAmount: amount,
        paymentMethod,
      })
      setIsEditing(false)
      onChanged()
    } catch (err) {
      setError('Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setCustomerName(bill.customer_name || '')
    setAmount(bill.bill_amount ?? '')
    setPaymentMethod(bill.payment_method || '')
    setError('')
    setIsEditing(false)
  }

  return (
    <div className="bill-card">
      <div className="bill-photos">
        {photos.map((photo, i) => (
          <div className="bill-photo-thumb" key={i}>
            <a href={photo.url} target="_blank" rel="noreferrer">
              <img src={photo.url} alt={`Bill for ${bill.customer_name || 'customer'} - photo ${i + 1}`} />
            </a>
            <div className="photo-thumb-meta">
              {photo.source && (
                <span className="photo-tag">{photo.source === 'gallery' ? 'Gallery' : 'Camera'}</span>
              )}
              {photo.download_url && (
                <button
                  type="button"
                  className="btn btn-secondary download-btn"
                  onClick={() => window.open(photo.download_url, '_blank')}
                >
                  Download
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isEditing ? (
        <div className="bill-info bill-edit">
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="bill-edit-input"
            placeholder="Customer name"
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bill-edit-input"
            placeholder="Amount"
          />
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="bill-edit-input"
          >
            <option value="">Select payment method</option>
            <option value="Cash">Cash</option>
            <option value="Credit">Credit</option>
            <option value="Account">Account</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
          </select>
          {error && <span className="bill-edit-error">{error}</span>}
          <div className="bill-edit-actions">
            <button className="btn-icon-text" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button className="btn-icon-text" onClick={handleCancel} disabled={saving}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="bill-info">
          <strong>{bill.customer_name || 'Untitled bill'}</strong>
          {bill.bill_amount != null && <span>Rs. {bill.bill_amount}</span>}
          {bill.payment_method && <span>{bill.payment_method}</span>}

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
              <button className="btn-icon-text" onClick={() => setIsEditing(true)}>Edit</button>
              <button className="btn-icon-text danger" onClick={() => setConfirmingDelete(true)}>Delete</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}