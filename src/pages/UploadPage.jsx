import { useState, useRef } from 'react'
import { uploadBill } from '../api.js'
import EmployeeLogin from '../components/EmployeeLogin.jsx'

const TOKEN_KEY = 'tile_bills_employee_token'
const NAME_KEY = 'tile_bills_employee_name'
const MAX_PHOTOS = 3

export default function UploadPage() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [employeeName, setEmployeeName] = useState(() => localStorage.getItem(NAME_KEY) || '')

  const [photos, setPhotos] = useState([]) // { file, preview, source }
  const [customerName, setCustomerName] = useState('')
  const [billAmount, setBillAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [status, setStatus] = useState('idle')
  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  function handleLoginSuccess(newToken, name) {
    localStorage.removeItem('tile_bills_admin_token')
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(NAME_KEY, name)
    setToken(newToken)
    setEmployeeName(name)
    window.dispatchEvent(new Event('authchange'))
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(NAME_KEY)
    setToken(null)
    setEmployeeName('')
    window.dispatchEvent(new Event('authchange'))
  }

  function addPhoto(selected, source) {
    if (!selected) return
    setPhotos((prev) => {
      if (prev.length >= MAX_PHOTOS) return prev
      return [...prev, { file: selected, preview: URL.createObjectURL(selected), source }]
    })
    setStatus('idle')
  }

  const handleCameraSelect = (e) => {
    addPhoto(e.target.files[0], 'camera')
    e.target.value = ''
  }
  const handleGallerySelect = (e) => {
    addPhoto(e.target.files[0], 'gallery')
    e.target.value = ''
  }

  function removePhoto(index) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  function resetForm() {
    setPhotos([])
    setCustomerName('')
    setBillAmount('')
    setPaymentMethod('')
    if (cameraInputRef.current) cameraInputRef.current.value = ''
    if (galleryInputRef.current) galleryInputRef.current.value = ''
  }

  const handleUpload = async () => {
    if (photos.length === 0 || !customerName.trim()) {
      alert('Please enter the customer/bill name and add at least one photo first.')
      return
    }
    if (!paymentMethod) {
      alert('Please select a payment method.')
      return
    }

    setStatus('uploading')
    try {
      await uploadBill({
        token,
        customerName: customerName.trim(),
        billAmount: billAmount || null,
        paymentMethod,
        photos,
      })

      setStatus('success')
      resetForm()
    } catch (err) {
      console.error(err)
      if (err.message === 'UNAUTHORIZED') {
        handleLogout()
      } else {
        setStatus('error')
      }
    }
  }

  if (!token) {
    return <EmployeeLogin onSuccess={handleLoginSuccess} />
  }

  const canAddMore = photos.length < MAX_PHOTOS

  return (
    <div className="upload-page">
      <div className="upload-card">
        <h1>Upload a bill</h1>
        <p className="uploading-as">
          Uploading as <strong>{employeeName}</strong> ·{' '}
          <button type="button" className="link-btn" onClick={handleLogout}>Not you? Log out</button>
        </p>

        <label className="field">
          Customer / bill name
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="e.g. Sharma Tiles Showroom"
          />
        </label>

        <label className="field">
          Bill amount (optional)
          <input
            type="number"
            value={billAmount}
            onChange={(e) => setBillAmount(e.target.value)}
            placeholder="e.g. 4500"
          />
        </label>

        <label className="field">
          Payment method
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="">Select payment method</option>
            <option value="Cash">Cash</option>
            <option value="Credit">Credit</option>
            <option value="Account">Account</option>
            <option value="UPI">UPI</option>
          </select>
        </label>

        {photos.length > 0 && (
          <div className="preview-grid">
            {photos.map((p, i) => (
              <div className="preview" key={i}>
                <img src={p.preview} alt={`Bill photo ${i + 1}`} />
                <p className="uploading-as">
                  {p.source === 'gallery' ? 'Gallery' : 'Camera'} ·{' '}
                  <button type="button" className="link-btn" onClick={() => removePhoto(i)}>Remove</button>
                </p>
              </div>
            ))}
          </div>
        )}

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraSelect}
          style={{ display: 'none' }}
          id="camera-input"
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleGallerySelect}
          style={{ display: 'none' }}
          id="gallery-input"
        />

        {canAddMore && (
          <>
            <label htmlFor="camera-input" className="btn btn-secondary">
              {photos.length === 0 ? 'Take photo' : 'Add another photo (camera)'}
            </label>
            <label htmlFor="gallery-input" className="btn btn-secondary">
              {photos.length === 0 ? 'Choose from gallery' : 'Add another photo (gallery)'}
            </label>
          </>
        )}
        {!canAddMore && (
          <p className="uploading-as">Maximum of {MAX_PHOTOS} photos added.</p>
        )}

        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={status === 'uploading' || photos.length === 0}
        >
          {status === 'uploading' ? 'Uploading...' : 'Upload bill'}
        </button>

        {status === 'success' && <p className="msg success">Bill uploaded.</p>}
        {status === 'error' && (
          <p className="msg error">Upload failed. Is the backend running?</p>
        )}
      </div>
    </div>
  )
}