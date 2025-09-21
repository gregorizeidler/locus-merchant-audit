import React from 'react'
import { Map, Phone, Globe, Star, MapPin, Clock, Camera, Users } from 'lucide-react'
import GoogleMapView from './GoogleMapView'

const MerchantDetails = ({ merchantInfo }) => {
  const getBusinessStatusColor = (status) => {
    switch (status) {
      case 'OPERATIONAL':
        return 'text-success-700 bg-success-50 border-success-200'
      case 'CLOSED_TEMPORARILY':
        return 'text-warning-700 bg-warning-50 border-warning-200'
      case 'CLOSED_PERMANENTLY':
        return 'text-danger-700 bg-danger-50 border-danger-200'
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  const formatBusinessTypes = (types) => {
    return types
      .filter(type => !['establishment', 'point_of_interest'].includes(type))
      .map(type => type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
      .slice(0, 5) // Limit to 5 types
  }

  const getPriceLevelText = (level) => {
    switch (level) {
      case 0: return 'Free'
      case 1: return 'Inexpensive'
      case 2: return 'Moderate'
      case 3: return 'Expensive'
      case 4: return 'Very Expensive'
      default: return 'Unknown'
    }
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <MapPin className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-gray-900">Merchant Details</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{merchantInfo.name}</h4>
              <p className="text-gray-600">{merchantInfo.address}</p>
            </div>

            {merchantInfo.business_status && (
              <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium ${getBusinessStatusColor(merchantInfo.business_status)}`}>
                {merchantInfo.business_status.replace(/_/g, ' ')}
              </div>
            )}

            <div className="space-y-2">
              {merchantInfo.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{merchantInfo.phone}</span>
                </div>
              )}

              {merchantInfo.website && (
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <a
                    href={merchantInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 underline"
                  >
                    {merchantInfo.website}
                  </a>
                </div>
              )}

              {merchantInfo.rating && (
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-700">
                    {merchantInfo.rating.toFixed(1)} / 5.0
                    {merchantInfo.user_ratings_total && (
                      <span className="text-gray-500 ml-1">
                        ({merchantInfo.user_ratings_total} reviews)
                      </span>
                    )}
                  </span>
                </div>
              )}

              {merchantInfo.price_level !== null && merchantInfo.price_level !== undefined && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Price Level:</span>
                  <span className="text-sm text-gray-700">{getPriceLevelText(merchantInfo.price_level)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Business Types */}
            {merchantInfo.types && merchantInfo.types.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Business Types</h5>
                <div className="flex flex-wrap gap-2">
                  {formatBusinessTypes(merchantInfo.types).map((type, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Opening Hours */}
            {merchantInfo.opening_hours && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Opening Hours</span>
                </h5>
                <div className="text-sm text-gray-600">
                  {merchantInfo.opening_hours.open_now !== undefined && (
                    <p className={`font-medium ${merchantInfo.opening_hours.open_now ? 'text-success-600' : 'text-danger-600'}`}>
                      {merchantInfo.opening_hours.open_now ? 'Open Now' : 'Closed Now'}
                    </p>
                  )}
                  {merchantInfo.opening_hours.weekday_text && (
                    <div className="mt-2 space-y-1">
                      {merchantInfo.opening_hours.weekday_text.map((day, index) => (
                        <p key={index} className="text-xs">{day}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Photos */}
        {merchantInfo.photos && merchantInfo.photos.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-1">
              <Camera className="w-4 h-4" />
              <span>Photos</span>
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {merchantInfo.photos.map((photo, index) => (
                <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={photo}
                    alt={`${merchantInfo.name} - Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Map View */}
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Map className="w-6 h-6 text-primary-600" />
          <h4 className="text-lg font-semibold text-gray-900">Location</h4>
        </div>
        
        <div className="h-96 rounded-lg overflow-hidden">
          <GoogleMapView
            center={merchantInfo.location}
            merchant={merchantInfo}
          />
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>
            <strong>Coordinates:</strong> {merchantInfo.location.lat.toFixed(6)}, {merchantInfo.location.lng.toFixed(6)}
          </p>
          <p>
            <strong>Place ID:</strong> {merchantInfo.place_id}
          </p>
        </div>
      </div>
    </div>
  )
}

export default MerchantDetails
