import React, { useState } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'
import MerchantValidator from './components/MerchantValidator'
import Header from './components/Header'

// You'll need to set your Google Maps API key here
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE'

function App() {
  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <MerchantValidator />
        </main>
      </div>
    </APIProvider>
  )
}

export default App
