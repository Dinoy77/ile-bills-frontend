import { useState, useRef } from 'react'
import { uploadBill } from '../api.js'

export default function UploadPage() {
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [employeeName, setEmployeeName] = useState('')
  const [billAmount, setBillAmount] = useState('')
  const [status, setStatus] = useState('idle') // idle | uploading | success | error
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    setStatus('idle')
  }

  const handleUpload = async () => {
    if (!file || !employeeName.trim()) {
      alert('Please enter your name and take a photo first.')
      return
    }

    setStatus('uploading')
    try {
      await uploadBill({
        employeeName: employeeName.trim(),
        billAmount: billAmount || null,
        photoFile: file,
      })

      setStatus('success')
      setFile(null)
      setPreview(null)
      setBillAmount('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <div className="upload-page">
      <div className="upload-card">
        <h1>Upload a bill</h1>

        <label className="field">
          Your name
          <input
            type="text"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            placeholder="e.g. Ramesh Kumar"
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

        {preview && (
          <div className="preview">
            <img src={preview} alt="Bill preview" />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="camera-input"
        />
        <label htmlFor="camera-input" className="btn btn-secondary">
          {preview ? 'Retake photo' : 'Take photo'}
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