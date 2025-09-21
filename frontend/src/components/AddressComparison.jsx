import React from 'react'
import { MapPin, AlertTriangle, CheckCircle, Info } from 'lucide-react'

const AddressComparison = ({ addressComparison }) => {
  if (!addressComparison) return null

  const getMatchIcon = (isMatch) => {
    return isMatch ? (
      <CheckCircle className="w-5 h-5 text-success-600" />
    ) : (
      <AlertTriangle className="w-5 h-5 text-warning-600" />
    )
  }

  const getMatchColor = (isMatch) => {
    return isMatch 
      ? 'text-success-700 bg-success-50 border-success-200'
      : 'text-warning-700 bg-warning-50 border-warning-200'
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-success-600'
    if (score >= 70) return 'text-warning-600'
    return 'text-danger-600'
  }

  return (
    <div className="card p-6">
      <div className="flex items-center space-x-3 mb-6">
        <MapPin className="w-6 h-6 text-primary-600" />
        <h3 className="text-xl font-semibold text-gray-900">Address Comparison</h3>
      </div>

      <div className="space-y-4">
        {/* Match Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getMatchIcon(addressComparison.is_match)}
            <span className="font-medium text-gray-900">
              {addressComparison.is_match ? 'Addresses Match' : 'Address Mismatch'}
            </span>
          </div>
          <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getMatchColor(addressComparison.is_match)}`}>
            {Math.round(addressComparison.similarity_score)}% Similar
          </div>
        </div>

        {/* Similarity Score */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Similarity Score</span>
            <span className={`font-bold ${getScoreColor(addressComparison.similarity_score)}`}>
              {addressComparison.similarity_score.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                addressComparison.similarity_score >= 90 ? 'bg-success-500' :
                addressComparison.similarity_score >= 70 ? 'bg-warning-500' : 'bg-danger-500'
              }`}
              style={{ width: `${Math.min(addressComparison.similarity_score, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Address Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Provided Address</h4>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-900">{addressComparison.provided_address}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Google Places Address</h4>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-900">{addressComparison.google_address}</p>
            </div>
          </div>
        </div>

        {/* Differences */}
        {addressComparison.differences && addressComparison.differences.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-1">
              <Info className="w-4 h-4" />
              <span>Differences Found</span>
            </h4>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <ul className="space-y-1">
                {addressComparison.differences.map((difference, index) => (
                  <li key={index} className="text-sm text-yellow-800 flex items-start space-x-2">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    <span>{difference}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Interpretation Guide */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Interpretation Guide:</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>90-100%:</strong> Excellent match - addresses are essentially identical</p>
            <p><strong>80-89%:</strong> Good match - minor formatting differences</p>
            <p><strong>60-79%:</strong> Partial match - some discrepancies present</p>
            <p><strong>&lt;60%:</strong> Poor match - significant differences, requires investigation</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddressComparison
