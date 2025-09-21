import React from 'react'
import { Building, CheckCircle, AlertTriangle, XCircle, Info, Calendar, MapPin, Phone, Mail, Users } from 'lucide-react'

const CNPJComparison = ({ cnpjComparison }) => {
  if (!cnpjComparison || !cnpjComparison.cnpj_found) {
    return null
  }

  const getStatusIcon = (found, hasData) => {
    if (!found) return <XCircle className="w-5 h-5 text-gray-500" />
    if (!hasData) return <AlertTriangle className="w-5 h-5 text-warning-600" />
    return <CheckCircle className="w-5 h-5 text-success-600" />
  }

  const getStatusColor = (found, hasData) => {
    if (!found) return 'text-gray-700 bg-gray-50 border-gray-200'
    if (!hasData) return 'text-warning-700 bg-warning-50 border-warning-200'
    return 'text-success-700 bg-success-50 border-success-200'
  }

  const getNameMatchColor = (similarity) => {
    if (similarity >= 0.8) return 'text-success-600'
    if (similarity >= 0.6) return 'text-warning-600'
    return 'text-danger-600'
  }

  const formatCNPJ = (cnpj) => {
    if (!cnpj || cnpj.length !== 14) return cnpj
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  const getRegistrationStatusColor = (status) => {
    if (!status) return 'text-gray-600'
    const upperStatus = status.toUpperCase()
    if (upperStatus.includes('ATIVA')) return 'text-success-600'
    if (upperStatus.includes('BAIXADA') || upperStatus.includes('SUSPENSA')) return 'text-danger-600'
    if (upperStatus.includes('INAPTA')) return 'text-warning-600'
    return 'text-gray-600'
  }

  return (
    <div className="card p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Building className="w-6 h-6 text-primary-600" />
        <h3 className="text-xl font-semibold text-gray-900">CNPJ Verification</h3>
      </div>

      <div className="space-y-6">
        {/* CNPJ Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(cnpjComparison.cnpj_found, cnpjComparison.cnpj_data)}
            <span className="font-medium text-gray-900">
              {cnpjComparison.cnpj_found ? 'CNPJ Found' : 'No CNPJ Found'}
            </span>
          </div>
          <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(cnpjComparison.cnpj_found, cnpjComparison.cnpj_data)}`}>
            {cnpjComparison.cnpj_found ? (cnpjComparison.cnpj_data ? 'Verified' : 'Data Unavailable') : 'Not Found'}
          </div>
        </div>

        {/* CNPJ Data */}
        {cnpjComparison.cnpj_data && (
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Company Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{cnpjComparison.cnpj_data.company_name}</p>
                        {cnpjComparison.cnpj_data.trade_name && (
                          <p className="text-sm text-gray-600">Trade Name: {cnpjComparison.cnpj_data.trade_name}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p><strong>CNPJ:</strong> {formatCNPJ(cnpjComparison.cnpj_data.cnpj)}</p>
                      {cnpjComparison.cnpj_data.legal_nature && (
                        <p><strong>Legal Nature:</strong> {cnpjComparison.cnpj_data.legal_nature}</p>
                      )}
                      {cnpjComparison.cnpj_data.company_size && (
                        <p><strong>Company Size:</strong> {cnpjComparison.cnpj_data.company_size}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Registration Status */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Registration Status</h4>
                  <div className="space-y-1">
                    {cnpjComparison.cnpj_data.registration_status && (
                      <p className={`font-medium ${getRegistrationStatusColor(cnpjComparison.cnpj_data.registration_status)}`}>
                        {cnpjComparison.cnpj_data.registration_status}
                      </p>
                    )}
                    {cnpjComparison.cnpj_data.registration_date && (
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Registered: {cnpjComparison.cnpj_data.registration_date}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Contact Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    {cnpjComparison.cnpj_data.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{cnpjComparison.cnpj_data.phone}</span>
                      </div>
                    )}
                    {cnpjComparison.cnpj_data.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{cnpjComparison.cnpj_data.email}</span>
                      </div>
                    )}
                    {cnpjComparison.cnpj_data.address?.full_address && (
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 mt-0.5" />
                        <span>{cnpjComparison.cnpj_data.address.full_address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Activity */}
                {cnpjComparison.cnpj_data.main_activity && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Main Activity</h4>
                    <p className="text-sm text-gray-600">{cnpjComparison.cnpj_data.main_activity}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Name Comparison */}
            {cnpjComparison.name_comparison && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Name Verification</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase">Company Name Match</p>
                    <div className="flex items-center space-x-2">
                      {cnpjComparison.name_comparison.company_name_match ? (
                        <CheckCircle className="w-4 h-4 text-success-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-danger-600" />
                      )}
                      <span className={`text-sm font-medium ${getNameMatchColor(cnpjComparison.name_comparison.company_name_similarity || 0)}`}>
                        {Math.round((cnpjComparison.name_comparison.company_name_similarity || 0) * 100)}% Similar
                      </span>
                    </div>
                  </div>
                  
                  {cnpjComparison.name_comparison.trade_name_similarity > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase">Trade Name Match</p>
                      <div className="flex items-center space-x-2">
                        {cnpjComparison.name_comparison.trade_name_match ? (
                          <CheckCircle className="w-4 h-4 text-success-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-danger-600" />
                        )}
                        <span className={`text-sm font-medium ${getNameMatchColor(cnpjComparison.name_comparison.trade_name_similarity || 0)}`}>
                          {Math.round((cnpjComparison.name_comparison.trade_name_similarity || 0) * 100)}% Similar
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {cnpjComparison.name_comparison.best_match_name && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Best Match:</strong> {cnpjComparison.name_comparison.best_match_name}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Risk Assessment */}
            {cnpjComparison.risk_assessment && cnpjComparison.risk_assessment.risk_factors && cnpjComparison.risk_assessment.risk_factors.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">CNPJ Risk Factors</h4>
                <div className="space-y-2">
                  {cnpjComparison.risk_assessment.risk_factors.map((factor, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-warning-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{factor}</span>
                    </div>
                  ))}
                </div>
                
                {cnpjComparison.risk_assessment.recommendations && cnpjComparison.risk_assessment.recommendations.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">Recommendations</p>
                    <div className="space-y-1">
                      {cnpjComparison.risk_assessment.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <Info className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Partners Information */}
            {cnpjComparison.cnpj_data.partners && cnpjComparison.cnpj_data.partners.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>Partners ({cnpjComparison.cnpj_data.partners.length})</span>
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {cnpjComparison.cnpj_data.partners.slice(0, 5).map((partner, index) => (
                    <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                      <p className="font-medium">{partner.nome}</p>
                      {partner.qual && <p className="text-xs text-gray-500">{partner.qual}</p>}
                    </div>
                  ))}
                  {cnpjComparison.cnpj_data.partners.length > 5 && (
                    <p className="text-xs text-gray-500 italic">
                      +{cnpjComparison.cnpj_data.partners.length - 5} more partners
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {cnpjComparison.risk_assessment?.error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800">
                <strong>CNPJ Verification Error:</strong> {cnpjComparison.risk_assessment.error}
              </p>
            </div>
          </div>
        )}

        {/* Information Note */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">About CNPJ Verification:</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• CNPJ (Cadastro Nacional da Pessoa Jurídica) is the Brazilian federal tax ID for companies</p>
            <p>• Data is sourced from the Brazilian Federal Revenue Service (Receita Federal)</p>
            <p>• This verification helps confirm the legitimacy of Brazilian businesses</p>
            <p>• Registration status and business activity are key indicators for risk assessment</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CNPJComparison
