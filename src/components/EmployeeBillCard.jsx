export default function EmployeeBillCard({ bill, onDelete }) {
  function handlePhotoClick(url) {
    window.open(url, '_blank')
  }

  function handleDownload(downloadUrl) {
    window.open(downloadUrl, '_blank')
  }

  const photos = bill.photo_urls || [{ url: bill.photo_url, download_url: bill.photo_url, source: 'camera' }]

  return (
    <div className="bill-card">
      <div className="bill-photos">
        {photos.map((photo, idx) => (
          <div className="bill-photo-thumb-wrap" key={idx}>
            <button type="button" className="bill-photo-thumb" onClick={() => handlePhotoClick(photo.url)}>
              <img src={photo.url} alt={`Bill photo ${idx + 1}`} />
              <span className="photo-tag">{photo.source === 'gallery' ? 'Gallery' : 'Camera'}</span>
            </button>
            <button
              type="button"
              className="download-btn"
              onClick={() => handleDownload(photo.download_url || photo.url)}
            >
              ⬇ Download
            </button>
          </div>
        ))}
      </div>

      <div className="bill-info">
        <p><strong>Customer:</strong> {bill.customer_name || '-'}</p>
        <p><strong>Amount:</strong> {bill.bill_amount ? `₹${bill.bill_amount}` : '-'}</p>
        <p><strong>Payment:</strong> {bill.payment_method || '-'}</p>
        <p><strong>Date:</strong> {bill.created_at ? new Date(bill.created_at).toLocaleDateString() : '-'}</p>
      </div>

      <button type="button" className="btn-secondary" onClick={() => onDelete(bill.id)}>
        Delete
      </button>
    </div>
  )
}