import { useState, useRef } from 'react'
import { uploadBill } from '../api.js'
import EmployeeLogin from '../components/EmployeeLogin.jsx'

const TOKEN_KEY = 'tile_bills_employee_token'
const NAME_KEY = 'tile_bills_employee_name'

export default function UploadPage() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [employeeName, setEmployeeName] = useState(() => localStorage.getItem(NAME_KEY) || '')

  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [photoSource, setPhotoSource] = useState('camera')
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

  function selectFile(selected, source) {
    if (!selected) return
    setFile(selected)
    setPhotoSource(source)
    setPreview(URL.createObjectURL(selected))
    setStatus('idle')
  }

  const handleCameraSelect = (e) => selectFile(e.target.files[0], 'camera')
  const handleGallerySelect = (e) => selectFile(e.target.files[0], 'gallery')

  const handleUpload = async () => {
    if (!file || !customerName.trim()) {
      alert('Please enter the customer/bill name and take a photo first.')
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
        photoSource,
        photoFile: file,
      })

      setStatus('success')
      setFile(null)
      setPreview(null)
      setPhotoSource('camera')
      setCustomerName('')
      setBillAmount('')
      setPaymentMethod('')
      if (cameraInputRef.current) cameraInputRef.current.value = ''
      if (galleryInputRef.current) galleryInputRef.current.value = ''
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

        {preview && (
          <div className="preview">
            <img src={preview} alt="Bill preview" />
            <p className="uploading-as">Source: <strong>{photoSource === 'gallery' ? 'Gallery' : 'Camera'}</strong></p>
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

        <label htmlFor="camera-input" className="btn btn-secondary">
          {preview ? 'Retake photo' : 'Take photo'}
        </label>
        <label htmlFor="gallery-input" className="btn btn-secondary">
          Choose from gallery
        </label>

        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={status === 'uploading' || !file}
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