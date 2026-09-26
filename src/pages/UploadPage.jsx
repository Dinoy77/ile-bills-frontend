import { useState, useRef } from 'react'
import { uploadBill } from '../api.js'
import EmployeeLogin from '../components/EmployeeLogin.jsx'

const TOKEN_KEY = 'tile_bills_employee_token'
const NAME_KEY = 'tile_bills_employee_name'
const MAX_PHOTOS = 3

export default function UploadPage() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [employeeName, setEmployeeName] = useState(() => localStorage.getItem(NAME_KEY) || '')

  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [billAmount, setBillAmount] = useState('')
  const [status, setStatus] = useState('idle')
  const fileInputRef = useRef(null)

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

  const handleFileSelect = (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    if (files.length >= MAX_PHOTOS) return
    setFiles((prev) => [...prev, selected])
    setPreviews((prev) => [...prev, URL.createObjectURL(selected)])
    setStatus('idle')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleRemovePhoto(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  function handleAddPhotoClick() {
    if (files.length >= MAX_PHOTOS) return
    fileInputRef.current?.click()
  }

  const handleUpload = async () => {
    if (files.length === 0 || !customerName.trim()) {
      alert('Please enter the customer/bill name and take at least one photo first.')
      return
    }

    setStatus('uploading')
    try {
      await uploadBill({
        token,
        customerName: customerName.trim(),
        billAmount: billAmount || null,
        photoFiles: files,
      })

      setStatus('success')
      setFiles([])
      setPreviews([])
      setCustomerName('')
      setBillAmount('')
      if (fileInputRef.current) fileInputRef.current.value = ''
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

        {previews.length > 0 && (
          <div className="preview-grid">
            {previews.map((src, i) => (
              <div className="preview-thumb" key={i}>
                <img src={src} alt={`Bill photo ${i + 1}`} />
                <button type="button" className="preview-remove" onClick={() => handleRemovePhoto(i)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleAddPhotoClick}
          disabled={files.length >= MAX_PHOTOS}
        >
          {files.length === 0
            ? 'Take photo'
            : files.length >= MAX_PHOTOS
            ? `Photo limit reached (${MAX_PHOTOS}/${MAX_PHOTOS})`
            : `Add another photo (${files.length}/${MAX_PHOTOS})`}
        </button>

        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={status === 'uploading' || files.length === 0}
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