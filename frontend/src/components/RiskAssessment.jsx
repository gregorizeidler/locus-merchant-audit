import React from 'react'
import { AlertTriangle, Shield, TrendingUp, CheckCircle } from 'lucide-react'

const RiskAssessment = ({ riskAssessment }) => {
  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'LOW':
        return 'text-success-700 bg-success-50 border-success-200'
      case 'MEDIUM':
        return 'text-warning-700 bg-warning-50 border-warning-200'
      case 'HIGH':
        return 'text-danger-700 bg-danger-50 border-danger-200'
      case 'CRITICAL':
        return 'text-red-700 bg-red-50 border-red-200'
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  const getRiskIcon = (level) => {
    switch (level) {
      case 'LOW':
        return <CheckCircle className="w-5 h-5 text-success-600" />
      case 'MEDIUM':
        return <Shield className="w-5 h-5 text-warning-600" />
      case 'HIGH':
        return <AlertTriangle className="w-5 h-5 text-danger-600" />
      case 'CRITICAL':
        return <TrendingUp className="w-5 h-5 text-red-600" />
      default:
        return <Shield className="w-5 h-5 text-gray-600" />
    }
  }

  const getScoreColor = (score) => {
    if (score < 30) return 'text-success-600'
    if (score < 60) return 'text-warning-600'
    if (score < 80) return 'text-danger-600'
    return 'text-red-600'
  }

  const getProgressBarColor = (score) => {
    if (score < 30) return 'bg-success-500'
    if (score < 60) return 'bg-warning-500'
    if (score < 80) return 'bg-danger-500'
    return 'bg-red-500'
  }

  return (
    <div className="card p-6">
      <div className="flex items-center space-x-3 mb-6">
        <TrendingUp className="w-6 h-6 text-primary-600" />
        <h3 className="text-xl font-semibold text-gray-900">Risk Assessment</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Score */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Risk Score</span>
            <span className={`text-2xl font-bold ${getScoreColor(riskAssessment.risk_score)}`}>
              {Math.round(riskAssessment.risk_score)}/100
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor(riskAssessment.risk_score)}`}
              style={{ width: `${Math.min(riskAssessment.risk_score, 100)}%` }}
            ></div>
          </div>

          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getRiskLevelColor(riskAssessment.risk_level)}`}>
            {getRiskIcon(riskAssessment.risk_level)}
            <span className="font-medium">{riskAssessment.risk_level} RISK</span>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Risk Factors</h4>
          {riskAssessment.risk_factors.length > 0 ? (
            <ul className="space-y-2">
              {riskAssessment.risk_factors.map((factor, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-warning-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{factor}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No specific risk factors identified</p>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {riskAssessment.recommendations.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
          <ul className="space-y-2">
            {riskAssessment.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default RiskAssessment
