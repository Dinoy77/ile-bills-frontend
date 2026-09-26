export default function BillCard({ bill, selectMode, selected, onToggleSelect, onEdit }) {
  function handlePhotoClick(e, url) {
    e.stopPropagation()
    if (selectMode) return
    window.open(url, '_blank')
  }

  function handleDownload(e, downloadUrl) {
    e.stopPropagation()
    window.open(downloadUrl, '_blank')
  }

  const photos = bill.photo_urls || [{ url: bill.photo_url, download_url: bill.photo_url, source: 'camera' }]

  return (
    <div
      className={`bill-card ${selectMode ? 'select-mode' : ''} ${selected ? 'selected' : ''}`}
      onClick={() => selectMode && onToggleSelect(bill.id)}
    >
      {selectMode && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(bill.id)}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      <div className="bill-photos">
        {photos.map((photo, idx) => (
          <div className="bill-photo-thumb-wrap" key={idx}>
            <button
              type="button"
              className="bill-photo-thumb"
              onClick={(e) => handlePhotoClick(e, photo.url)}
            >
              <img src={photo.url} alt={`Bill photo ${idx + 1}`} />
              <span className="photo-tag">{photo.source === 'gallery' ? 'Gallery' : 'Camera'}</span>
            </button>
            <button
              type="button"
              className="download-btn"
              onClick={(e) => handleDownload(e, photo.download_url || photo.url)}
            >
              ⬇ Download
            </button>
          </div>
        ))}
      </div>

      <div className="bill-info">
        <p><strong>Employee:</strong> {bill.employee_name}</p>
        <p><strong>Customer:</strong> {bill.customer_name || '-'}</p>
        <p><strong>Amount:</strong> {bill.bill_amount ? `₹${bill.bill_amount}` : '-'}</p>
        <p><strong>Payment:</strong> {bill.payment_method || '-'}</p>
        <p><strong>Date:</strong> {bill.created_at ? new Date(bill.created_at).toLocaleDateString() : '-'}</p>
      </div>

      {!selectMode && onEdit && (
        <button type="button" className="btn-secondary" onClick={() => onEdit(bill)}>
          Edit
        </button>
      )}
    </div>
  )
}