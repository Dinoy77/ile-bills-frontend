import { useState } from 'react'
import { updateBill, deleteBill } from '../api.js'

export default function BillCard({ bill, token, onChanged, selectMode, selected, onToggleSelect }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(bill.employee_name)
  const [amount, setAmount] = useState(bill.bill_amount ?? '')
  const [saving, setSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [error, setError] = useState('')

  const date = bill.created_at ? new Date(bill.created_at).toLocaleString() : ''
  const photos = bill.photos && bill.photos.length > 0
    ? bill.photos
    : [{ url: bill.photo_url, download_url: bill.download_url, source: bill.photo_source }]

  async function handleSave() {
    if (!name.trim()) {
      setError('Name cannot be empty.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await updateBill(token, bill.id, { employeeName: name, billAmount: amount })
      setIsEditing(false)
      onChanged()
    } catch (err) {
      setError('Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setName(bill.employee_name)
    setAmount(bill.bill_amount ?? '')
    setError('')
    setIsEditing(false)
  }

  async function handleDelete() {
    setSaving(true)
    try {
      await deleteBill(token, bill.id)
      onChanged()
    } catch (err) {
      setError('Could not delete.')
      setSaving(false)
    }
  }

  function handleCardClick() {
    if (selectMode) {
      onToggleSelect(bill.id)
    }
  }

  return (
    <div
      className={`bill-card${selectMode ? ' bill-card-selectable' : ''}${selected ? ' bill-card-selected' : ''}`}
      onClick={handleCardClick}
    >
      {selectMode && (
        <div className="bill-select-checkbox">
          <input
            type="checkbox"
            checked={!!selected}
            onChange={() => onToggleSelect(bill.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="bill-photos">
        {photos.map((photo, i) => (
          <div className="bill-photo-thumb" key={i}>
            <a
              href={photo.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => { if (selectMode) e.preventDefault() }}
            >
              <img src={photo.url} alt={`Bill by ${bill.employee_name} - photo ${i + 1}`} />
            </a>
            <div className="photo-thumb-meta">
              {photo.source && (
                <span className="photo-tag">{photo.source === 'gallery' ? 'Gallery' : 'Camera'}</span>
              )}
              {photo.download_url && (
                <button
                  type="button"
                  className="btn btn-secondary download-btn"
                  onClick={(e) => { e.stopPropagation(); window.open(photo.download_url, '_blank') }}
                >
                  Download
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isEditing && !selectMode ? (
        <div className="bill-info bill-edit">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bill-edit-input"
            placeholder="Employee name"
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bill-edit-input"
            placeholder="Amount"
          />
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
          <strong>{bill.employee_name}</strong>
          {bill.customer_name && <span>Customer: {bill.customer_name}</span>}
          {bill.bill_amount != null && <span>Rs. {bill.bill_amount}</span>}
          {bill.payment_method && <span>{bill.payment_method}</span>}

          <span className="bill-date">{date}</span>

          {!selectMode && (
            confirmingDelete ? (
              <div className="bill-edit-actions">
                <span className="bill-edit-error">Delete this bill?</span>
                <button className="btn-icon-text danger" onClick={handleDelete} disabled={saving}>
                  {saving ? 'Deleting...' : 'Yes, delete'}
                </button>
                <button className="btn-icon-text" onClick={() => setConfirmingDelete(false)} disabled={saving}>
                  Cancel
                </button>
              </div>
            ) : (
              <div className="bill-card-actions">
                <button className="btn-icon-text" onClick={() => setIsEditing(true)}>Edit</button>
                <button className="btn-icon-text danger" onClick={() => setConfirmingDelete(true)}>Delete</button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}