import React from 'react'
import { X, ExternalLink, MapPin } from 'lucide-react'

const StreetViewModal = ({ location, address, merchantName, onClose }) => {
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  // Generate Street View Static API URL
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${location.lat},${location.lng}&heading=151.78&pitch=-0.76&key=${GOOGLE_MAPS_API_KEY}`
  
  // Generate Google Maps link
  const googleMapsUrl = `https://www.google.com/maps/@${location.lat},${location.lng},3a,75y,151.78h,84.24t/data=!3m6!1e1!3m4!1s0x0:0x0!2e0!7i16384!8i8192`

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{merchantName}</h3>
            <p className="text-sm text-gray-600 flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{address}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Street View Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Street View Image */}
            <div className="relative">
              <img
                src={streetViewUrl}
                alt={`Street view of ${merchantName}`}
                className="w-full h-96 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY5NzM4MyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIFN0cmVldCBWaWV3IGF2YWlsYWJsZTwvdGV4dD48L3N2Zz4='
                }}
              />
              <div className="absolute top-4 right-4">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white bg-opacity-90 hover:bg-opacity-100 px-3 py-2 rounded-lg shadow-md flex items-center space-x-2 text-sm font-medium text-gray-700 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in Google Maps</span>
                </a>
              </div>
            </div>

            {/* Location Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-900">Coordinates</p>
                <p className="text-gray-600">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-900">View Type</p>
                <p className="text-gray-600">Street Level</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-900">Source</p>
                <p className="text-gray-600">Google Street View</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Visual Verification Tips:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Check if the business signage matches the merchant name</li>
                <li>• Verify the building type matches the business category</li>
                <li>• Look for signs of business activity (open/closed, customers, etc.)</li>
                <li>• Note any discrepancies for further investigation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default StreetViewModal
