import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadBill } from '../api'

const MAX_PHOTOS = 3

export default function UploadPage() {
  const navigate = useNavigate()
  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  const [customerName, setCustomerName] = useState('')
  const [billAmount, setBillAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [sources, setSources] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const employeeName = localStorage.getItem('tile_bills_employee_name') || ''
  const token = localStorage.getItem('tile_bills_employee_token')

  function addFile(file, source) {
    if (files.length >= MAX_PHOTOS) return
    setFiles((prev) => [...prev, file])
    setPreviews((prev) => [...prev, URL.createObjectURL(file)])
    setSources((prev) => [...prev, source])
  }

  function handleCameraChange(e) {
    const file = e.target.files[0]
    if (file) addFile(file, 'camera')
    e.target.value = ''
  }

  function handleGalleryChange(e) {
    const file = e.target.files[0]
    if (file) addFile(file, 'gallery')
    e.target.value = ''
  }

  function removePhoto(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
    setSources((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!customerName.trim()) {
      setError('Please enter the customer / bill name')
      return
    }
    if (!paymentMethod) {
      setError('Please select a payment method')
      return
    }
    if (files.length === 0) {
      setError('Please add at least one photo')
      return
    }

    setLoading(true)
    try {
      await uploadBill({
        token,
        customerName,
        billAmount,
        paymentMethod,
        photoFiles: files,
        photoSources: sources,
      })
      navigate('/my-bills')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <h2>Upload Bill</h2>
      <p>Uploading as: <strong>{employeeName}</strong></p>

      <form onSubmit={handleSubmit} className="upload-form">
        <label>Customer / Bill Name</label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Enter customer or bill name"
        />

        <label>Bill Amount (optional)</label>
        <input
          type="number"
          value={billAmount}
          onChange={(e) => setBillAmount(e.target.value)}
          placeholder="Enter amount"
        />

        <label>Payment Method</label>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="">Select payment method</option>
          <option value="Cash">Cash</option>
          <option value="Credit">Credit</option>
          <option value="Account">Account</option>
          <option value="UPI">UPI</option>
        </select>

        <label>Bill Photos ({files.length}/{MAX_PHOTOS})</label>

        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={cameraInputRef}
          onChange={handleCameraChange}
          style={{ display: 'none' }}
        />
        <input
          type="file"
          accept="image/*"
          ref={galleryInputRef}
          onChange={handleGalleryChange}
          style={{ display: 'none' }}
        />

        <div className="upload-buttons-row">
          <button
            type="button"
            className="btn-secondary"
            disabled={files.length >= MAX_PHOTOS}
            onClick={() => cameraInputRef.current.click()}
          >
            📷 Take Photo
          </button>
          <button
            type="button"
            className="btn-secondary"
            disabled={files.length >= MAX_PHOTOS}
            onClick={() => galleryInputRef.current.click()}
          >
            🖼️ Choose from Gallery
          </button>
        </div>

        {previews.length > 0 && (
          <div className="preview-grid">
            {previews.map((src, idx) => (
              <div className="preview-thumb" key={idx}>
                <img src={src} alt={`Preview ${idx + 1}`} />
                <span className="photo-tag">{sources[idx] === 'gallery' ? 'Gallery' : 'Camera'}</span>
                <button type="button" className="preview-remove" onClick={() => removePhoto(idx)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Bill'}
        </button>
      </form>
    </div>
  )
}