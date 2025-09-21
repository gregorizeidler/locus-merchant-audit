import React from 'react'
import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps'

const GoogleMapView = ({ center, merchant }) => {
  const mapOptions = {
    mapId: 'locus-merchant-audit-map',
    disableDefaultUI: false,
    clickableIcons: true,
    scrollwheel: true,
  }

  return (
    <Map
      style={{ width: '100%', height: '100%' }}
      defaultCenter={center}
      defaultZoom={16}
      gestureHandling={'greedy'}
      disableDefaultUI={false}
      options={mapOptions}
    >
      <AdvancedMarker position={center}>
        <Pin
          background={'#3b82f6'}
          borderColor={'#1d4ed8'}
          glyphColor={'white'}
        />
      </AdvancedMarker>
    </Map>
  )
}

export default GoogleMapView
