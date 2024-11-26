/* global google */
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { GoogleMap, DirectionsRenderer, Marker } from '@react-google-maps/api';
import '../App.css';

function MapComponent() {
  const location = useLocation();
  const { startPoint, destination } = location.state;

  const [directions, setDirections] = useState(null);
  const [error, setError] = useState(null);
  const [places, setPlaces] = useState({ attractions: [], restaurants: [], hotels: [] });
  const [activeTab, setActiveTab] = useState('attractions');
  const [highlightedPlace, setHighlightedPlace] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [itinerary, setItinerary] = useState([
    { time: new Date().toLocaleString(), name: startPoint, period: '-' }
  ]);
  const mapRef = useRef(null);

  // Function to set the map reference
  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  // Fetch directions from startPoint to destination
  const fetchDirections = (origin, destination, waypoints = []) => {
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin,
        destination,
        waypoints: waypoints.map(place => ({ location: place })),
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          setError("Could not calculate route. Please try again.");
        }
      }
    );
  };

  useEffect(() => {
    if (startPoint && destination) {
      fetchDirections(startPoint, destination);
    }
  }, [startPoint, destination]);

  // Fetch nearby places based on destination
  useEffect(() => {
    if (destination) {
      const placesService = new google.maps.places.PlacesService(document.createElement('div'));
      const requestTypes = [
        { type: 'tourist_attraction', label: 'attractions' },
        { type: 'restaurant', label: 'restaurants' },
        { type: 'lodging', label: 'hotels' }
      ];

      requestTypes.forEach(({ type, label }) => {
        const request = {
          location: directions?.routes[0]?.legs[0]?.end_location,
          radius: 5000,
          type: [type],
        };

        placesService.nearbySearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            setPlaces(prev => ({
              ...prev,
              [label]: results
            }));
          }
        });
      });
    }
  }, [directions, destination]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handlePlaceClick = (place) => {
    setHighlightedPlace(place.geometry.location);
    if (mapRef.current) {
      mapRef.current.panTo(place.geometry.location);
      mapRef.current.setZoom(15);
    }
    setCollapsed(true); // Collapse the panel when a place is clicked
  };

  const handleAddPlace = (place) => {
    const previousLocation = itinerary[itinerary.length - 1];
    const timeTaken = Math.floor(Math.random() * 15 + 10); // Random travel time between 10-25 mins
    const newTime = new Date(new Date(previousLocation.time).getTime() + timeTaken * 60000);
    const period = `${timeTaken} min`;

    const newItinerary = [
      ...itinerary,
      { time: newTime.toLocaleString(), name: place.name, period }
    ];

    setItinerary(newItinerary);
    fetchDirections(startPoint, destination, newItinerary.slice(1).map(item => item.name));
  };

  const handleRemovePlace = (index) => {
    const updatedItinerary = itinerary.filter((_, i) => i !== index);
    setItinerary(updatedItinerary);
    const waypoints = updatedItinerary.slice(1).map(item => item.name);
    fetchDirections(startPoint, destination, waypoints);
  };

  return (
    <div className="map-container">
      {/* Floating Trip Guide Panel */}
      <div className={`floating-panel ${collapsed ? 'collapsed' : ''}`}>
        <button className="collapse-button" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '→' : '←'}
        </button>
        {!collapsed && (
          <>
            <h3>Trip Guide</h3>
            <table className="trip-guide">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Location</th>
                  <th>Period</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {itinerary.map((item, index) => (
                  <tr key={index}>
                    <td>{item.time}</td>
                    <td>{item.name}</td>
                    <td>{item.period}</td>
                    {index > 0 && (
                      <td>
                        <button className="remove-button" onClick={() => handleRemovePlace(index)}>-</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Places to Visit Tabs */}
            <h4>Places to Visit</h4>
            <div className="tab-container">
              {['attractions', 'restaurants', 'hotels'].map((tab) => (
                <div
                  key={tab}
                  className={`tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </div>
              ))}
            </div>

            {/* Display List of Places with Add Button */}
            <ul className="place-list">
              {places[activeTab].map((place) => (
                <li key={place.place_id} className="place-item">
                  <span onClick={() => handlePlaceClick(place)}>{place.name}</span>
                  <button className="add-button" onClick={() => handleAddPlace(place)}>+</button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Google Map Component */}
      <GoogleMap
        center={highlightedPlace || directions?.routes[0]?.legs[0]?.start_location}
        zoom={highlightedPlace ? 15 : 8}
        mapContainerStyle={{ width: '100%', height: '100vh' }}
        onLoad={onMapLoad}
        options={{ zoomControl: true }}
      >
        {directions && <DirectionsRenderer directions={directions} />}
        {highlightedPlace && <Marker position={highlightedPlace} />}
      </GoogleMap>
    </div>
  );
}

export default MapComponent;
