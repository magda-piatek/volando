import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  GoogleMap,
  InfoWindow,
  LoadScript,
  Marker,
  DirectionsService,
  DirectionsRenderer,
} from '@react-google-maps/api';

// Container style for the Google Map
const containerStyle = {
  width: '100%',
  height: '100%',
};

// Default center location for the map
const defaultCenter = {
  lat: 49.5,
  lng: 14.5,
};

// Error handling for Google Maps loading
const handleLoadError = (e) => {
  console.error('Error loading Google Maps', e);
};

// Map load success handler
const handleMapLoad = (map) => {
  console.log('Map loaded successfully', map);
};

const Map = ({ hotels, selectedHotel, onHotelSelect }) => {
  const [currentLocation, setCurrentLocation] = useState(null); // State to store the current location of the user
  const [displayInfo, setDisplayInfo] = useState(null); // State to store the hotel info to display in InfoWindow
  const [directions, setDirections] = useState(null); // State to store directions
  const [showDirections, setShowDirections] = useState(false); // State to manage whether to show directions or not
  const mapRef = useRef(null); // Ref for the map object

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user's location", error);
          setCurrentLocation(defaultCenter);
        },
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setCurrentLocation(defaultCenter);
    }
  }, []);

  // Center map on selected hotel with a custom zoom level
  useEffect(() => {
    if (selectedHotel && mapRef.current) {
      const map = mapRef.current;
      const { latitude, longitude } = selectedHotel.location;
      map.setCenter({ lat: latitude, lng: longitude });
      map.setZoom(12); // Set a custom zoom level
      setShowDirections(false);
    }
  }, [selectedHotel]);

  // Handle marker click event
  const handleMarkerClick = (hotel) => {
    setDisplayInfo(hotel); // Show info window for the selected hotel
  };

// Handle get directions click event
const handleGetDirectionsClick = (hotel) => {
  setShowDirections(true); // Show directions
  setDisplayInfo(null); // Hide info window
};

  // Callback function for DirectionsService
  const directionCallback = (response, status) => {
    if (status === 'OK') {
      setDirections(response); // Store the directions response
    } else {
      console.error('Directions request failed due to ' + status);
    }
  };

  // Memorized current location marker
  const currentLocationMarker = useMemo(
    () =>
      currentLocation && (
        <Marker key="currentLocation" position={currentLocation} icon={{
          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        }} />
      ),
    [currentLocation],
  );

  // Memorized hotel markers
  const hotelMarkers = useMemo(
    () =>
      hotels.map((hotel) => (
        <Marker
          key={hotel.address}
          position={{
            lat: hotel.location.latitude,
            lng: hotel.location.longitude,
          }}
          onClick={() => handleMarkerClick(hotel)}
        >
          {displayInfo === hotel && (
            <InfoWindow onCloseClick={() => setDisplayInfo(null)}>
              <div>
                <h3>{hotel.name}</h3>
                <p>{`${hotel.description.substring(0, 12)}...`}</p>
                <button onClick={() => onHotelSelect(hotel)}>
                  Get Directions
                </button>
              </div>
            </InfoWindow>
          )}
        </Marker>
      )),
    [hotels, displayInfo],
  );

  return (
    <>
      <LoadScript
        googleMapsApiKey="AIzaSyBiJG97_IYoMHOFyLB-JmGfXWGQa9ocJ24"
        onError={handleLoadError}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentLocation || defaultCenter}
          zoom={10}
          onLoad={(map) => {
            handleMapLoad(map);
            mapRef.current = map; // Set map ref when map is loaded
          }}
        >
          {currentLocationMarker}
          {hotelMarkers}

          {currentLocation && selectedHotel && showDirections && (
            <DirectionsService
              options={{
                origin: currentLocation,
                destination: {
                  lat: selectedHotel.location.latitude,
                  lng: selectedHotel.location.longitude,
                },
                travelMode: 'DRIVING',
              }}
              callback={directionCallback}
            />
          )}

          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </LoadScript>
    </>
  );
};

export default Map;
