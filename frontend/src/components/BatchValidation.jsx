import React, { useState, useRef } from 'react'
import { Upload, FileText, Download, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react'
import axios from 'axios'
import LoadingSpinner from './LoadingSpinner'

const BatchValidation = () => {
  const [file, setFile] = useState(null)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [batchStatus, setBatchStatus] = useState(null)
  const [isPolling, setIsPolling] = useState(false)
  const fileInputRef = useRef(null)
  const pollInterval = useRef(null)

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      setUploadStatus(null)
      setBatchStatus(null)
    } else {
      alert('Please select a valid CSV file')
    }
  }

  const handleUpload = async () => {
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploadStatus('uploading')
      const response = await axios.post('/api/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setBatchStatus(response.data)
      setUploadStatus('uploaded')
      startPolling(response.data.batch_id)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('error')
    }
  }

  const startPolling = (batchId) => {
    setIsPolling(true)
    pollInterval.current = setInterval(async () => {
      try {
        const response = await axios.get(`/api/batch-status/${batchId}`)
        setBatchStatus(response.data)

        if (['COMPLETED', 'FAILED'].includes(response.data.status)) {
          setIsPolling(false)
          clearInterval(pollInterval.current)
        }
      } catch (error) {
        console.error('Polling error:', error)
        setIsPolling(false)
        clearInterval(pollInterval.current)
      }
    }, 2000)
  }

  const downloadResults = () => {
    if (!batchStatus?.results) return

    const csvContent = [
      // Header
      'merchant_name,validation_status,risk_level,risk_score,google_name,google_address,phone,website,rating,business_status',
      // Data rows
      ...batchStatus.results.map(result => {
        const merchant = result.merchant_info
        return [
          `"${result.search_query.replace('name: ', '')}"`,
          result.validation_status,
          result.risk_assessment.risk_level,
          result.risk_assessment.risk_score.toFixed(1),
          merchant ? `"${merchant.name}"` : '',
          merchant ? `"${merchant.address}"` : '',
          merchant?.phone || '',
          merchant?.website || '',
          merchant?.rating || '',
          merchant?.business_status || ''
        ].join(',')
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `batch_validation_results_${batchStatus.batch_id}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const resetUpload = () => {
    setFile(null)
    setUploadStatus(null)
    setBatchStatus(null)
    setIsPolling(false)
    if (pollInterval.current) {
      clearInterval(pollInterval.current)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-success-600" />
      case 'FAILED':
        return <AlertTriangle className="w-5 h-5 text-danger-600" />
      case 'PROCESSING':
        return <LoadingSpinner size="sm" />
      default:
        return <Clock className="w-5 h-5 text-warning-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-success-700 bg-success-50 border-success-200'
      case 'FAILED':
        return 'text-danger-700 bg-danger-50 border-danger-200'
      case 'PROCESSING':
        return 'text-primary-700 bg-primary-50 border-primary-200'
      default:
        return 'text-warning-700 bg-warning-50 border-warning-200'
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Upload className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-gray-900">Batch Validation</h3>
        </div>
        {(file || batchStatus) && (
          <button
            onClick={resetUpload}
            className="btn btn-secondary flex items-center space-x-2 text-sm"
          >
            <X className="w-4 h-4" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Upload Section */}
      {!batchStatus && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">Upload CSV File</p>
              <p className="text-sm text-gray-600">
                Upload a CSV file with merchant data for batch validation
              </p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-primary mt-4"
            >
              Select CSV File
            </button>
          </div>

          {/* CSV Format Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">CSV Format Requirements:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Required columns:</strong> merchant_name</p>
              <p><strong>Optional columns:</strong> address, place_id, phone, transaction_amount, transaction_type</p>
              <p><strong>Example:</strong></p>
              <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                merchant_name,address,transaction_amount<br/>
                "McDonald's","123 Main St, New York",25.50<br/>
                "Starbucks","456 Broadway, NY",12.75
              </code>
            </div>
          </div>

          {/* Selected File */}
          {file && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-600">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleUpload}
                disabled={uploadStatus === 'uploading'}
                className="btn btn-primary flex items-center space-x-2"
              >
                {uploadStatus === 'uploading' ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Start Validation</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Batch Status */}
      {batchStatus && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(batchStatus.status)}
              <div>
                <p className="font-medium text-gray-900">
                  Batch ID: {batchStatus.batch_id.substring(0, 8)}...
                </p>
                <p className="text-sm text-gray-600">
                  {batchStatus.processed_merchants} / {batchStatus.total_merchants} processed
                </p>
              </div>
            </div>
            
            <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(batchStatus.status)}`}>
              {batchStatus.status}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{Math.round((batchStatus.processed_merchants / batchStatus.total_merchants) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(batchStatus.processed_merchants / batchStatus.total_merchants) * 100}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Results Summary */}
          {batchStatus.status === 'COMPLETED' && batchStatus.results && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Valid', status: 'VALID', color: 'success' },
                  { label: 'Suspicious', status: 'SUSPICIOUS', color: 'warning' },
                  { label: 'Invalid', status: 'INVALID', color: 'danger' },
                  { label: 'Errors', status: 'ERROR', color: 'gray' }
                ].map(({ label, status, color }) => {
                  const count = batchStatus.results.filter(r => r.validation_status === status).length
                  return (
                    <div key={status} className={`p-3 rounded-lg bg-${color}-50 border border-${color}-200`}>
                      <p className={`text-2xl font-bold text-${color}-700`}>{count}</p>
                      <p className={`text-sm text-${color}-600`}>{label}</p>
                    </div>
                  )
                })}
              </div>

              <button
                onClick={downloadResults}
                className="btn btn-primary flex items-center space-x-2 w-full justify-center"
              >
                <Download className="w-4 h-4" />
                <span>Download Results CSV</span>
              </button>
            </div>
          )}

          {/* Timing Info */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>Started: {new Date(batchStatus.created_at).toLocaleString()}</p>
            {batchStatus.completed_at && (
              <p>Completed: {new Date(batchStatus.completed_at).toLocaleString()}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default BatchValidation
