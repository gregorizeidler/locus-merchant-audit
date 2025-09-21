import React, { useState } from 'react'
import { Search, AlertTriangle, CheckCircle, XCircle, Clock, Upload } from 'lucide-react'
import axios from 'axios'
import MerchantDetails from './MerchantDetails'
import RiskAssessment from './RiskAssessment'
import AddressComparison from './AddressComparison'
import CNPJComparison from './CNPJComparison'
import BatchValidation from './BatchValidation'
import LoadingSpinner from './LoadingSpinner'

const MerchantValidator = () => {
  const [activeTab, setActiveTab] = useState('single') // 'single' or 'batch'
  const [formData, setFormData] = useState({
    merchant_name: '',
    address: '',
    place_id: '',
    phone: '',
    transaction_amount: '',
    transaction_type: ''
  })
  
  const [validationResult, setValidationResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.merchant_name.trim()) {
      setError('Merchant name is required')
      return
    }

    setLoading(true)
    setError(null)
    setValidationResult(null)

    try {
      const payload = {
        merchant_name: formData.merchant_name,
        address: formData.address || null,
        place_id: formData.place_id || null,
        phone: formData.phone || null,
        transaction_amount: formData.transaction_amount ? parseFloat(formData.transaction_amount) : null,
        transaction_type: formData.transaction_type || null
      }

      const response = await axios.post('/api/validate-merchant', payload)
      setValidationResult(response.data)
    } catch (err) {
      console.error('Validation error:', err)
      setError(err.response?.data?.detail || 'An error occurred during validation')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'VALID':
        return <CheckCircle className="w-5 h-5 text-success-600" />
      case 'SUSPICIOUS':
        return <AlertTriangle className="w-5 h-5 text-warning-600" />
      case 'INVALID':
        return <XCircle className="w-5 h-5 text-danger-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'VALID':
        return 'text-success-700 bg-success-50 border-success-200'
      case 'SUSPICIOUS':
        return 'text-warning-700 bg-warning-50 border-warning-200'
      case 'INVALID':
        return 'text-danger-700 bg-danger-50 border-danger-200'
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Tab Navigation */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Search className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Merchant Validation</h2>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('single')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'single'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Search className="w-4 h-4 inline mr-2" />
              Single Validation
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'batch'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Batch Validation
            </button>
          </div>
        </div>
      </div>

      {/* Single Validation */}
      {activeTab === 'single' && (
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="merchant_name" className="block text-sm font-medium text-gray-700 mb-1">
                Merchant Name *
              </label>
              <input
                type="text"
                id="merchant_name"
                name="merchant_name"
                value={formData.merchant_name}
                onChange={handleInputChange}
                className="input"
                placeholder="Enter merchant name"
                required
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="input"
                placeholder="Enter merchant address"
              />
            </div>

            <div>
              <label htmlFor="place_id" className="block text-sm font-medium text-gray-700 mb-1">
                Google Place ID
              </label>
              <input
                type="text"
                id="place_id"
                name="place_id"
                value={formData.place_id}
                onChange={handleInputChange}
                className="input"
                placeholder="Enter Google Place ID (optional)"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="input"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label htmlFor="transaction_amount" className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Amount
              </label>
              <input
                type="number"
                id="transaction_amount"
                name="transaction_amount"
                value={formData.transaction_amount}
                onChange={handleInputChange}
                className="input"
                placeholder="Enter transaction amount"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label htmlFor="transaction_type" className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type
              </label>
              <select
                id="transaction_type"
                name="transaction_type"
                value={formData.transaction_type}
                onChange={handleInputChange}
                className="input"
              >
                <option value="">Select transaction type</option>
                <option value="purchase">Purchase</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="transfer">Transfer</option>
                <option value="deposit">Deposit</option>
                <option value="refund">Refund</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Validate Merchant</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-danger-50 border border-danger-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-danger-600" />
              <p className="text-danger-700">{error}</p>
            </div>
            </div>
          )}
        </div>
      )}

      {/* Batch Validation */}
      {activeTab === 'batch' && (
        <BatchValidation />
      )}

      {/* Single Validation Results */}
      {activeTab === 'single' && validationResult && (
        <div className="space-y-6">
          {/* Status Overview */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Validation Status</h3>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(validationResult.validation_status)}`}>
                {getStatusIcon(validationResult.validation_status)}
                <span className="font-medium">{validationResult.validation_status}</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p><strong>Search Query:</strong> {validationResult.search_query}</p>
              <p><strong>Timestamp:</strong> {new Date(validationResult.timestamp).toLocaleString()}</p>
            </div>
          </div>

          {/* Risk Assessment */}
          <RiskAssessment riskAssessment={validationResult.risk_assessment} />

          {/* Address Comparison */}
          {validationResult.address_comparison && (
            <AddressComparison addressComparison={validationResult.address_comparison} />
          )}

          {/* CNPJ Comparison */}
          {validationResult.cnpj_comparison && (
            <CNPJComparison cnpjComparison={validationResult.cnpj_comparison} />
          )}

          {/* Merchant Details */}
          {validationResult.merchant_info && (
            <MerchantDetails merchantInfo={validationResult.merchant_info} />
          )}
        </div>
      )}
    </div>
  )
}

export default MerchantValidator
