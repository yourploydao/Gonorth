import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
  iconUrl: require('leaflet/dist/images/marker-icon.png').default,
  shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
});

// สร้าง custom icons
const redIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="#dc2626" stroke="#b91c1c" stroke-width="1" d="m12.5,1c6.904,0 12.5,5.596 12.5,12.5c0,6.904 -12.5,26.5 -12.5,26.5s-12.5,-19.596 -12.5,-26.5c0,-6.904 5.596,-12.5 12.5,-12.5z"/>
      <circle fill="#ffffff" cx="12.5" cy="13.5" r="7"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12.5, 41],
  popupAnchor: [0, -41],
});

const blueIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="#2563eb" stroke="#1d4ed8" stroke-width="1" d="m12.5,1c6.904,0 12.5,5.596 12.5,12.5c0,6.904 -12.5,26.5 -12.5,26.5s-12.5,-19.596 -12.5,-26.5c0,-6.904 5.596,-12.5 12.5,-12.5z"/>
      <circle fill="#ffffff" cx="12.5" cy="13.5" r="7"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12.5, 41],
  popupAnchor: [0, -41],
});

// พิกัดศาลหลักเมืองเชียงใหม่
const CHIANG_MAI_CITY_HALL = {
  lat: 18.7883,
  lng: 98.9853
};

// Component สำหรับจัดการ click events บนแผนที่
const MapClickHandler = ({ onLocationSelect, selectedLocation }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });

  return selectedLocation ? (
    <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={blueIcon}>
      <Popup>
        <div style={{ textAlign: 'center' }}>
          <strong>ตำแหน่งที่เลือก</strong><br/>
          <small>Lat: {selectedLocation.lat.toFixed(5)}</small><br/>
          <small>Lng: {selectedLocation.lng.toFixed(5)}</small>
        </div>
      </Popup>
    </Marker>
  ) : null;
};

// Component สำหรับ search และ center แผนที่
const MapController = ({ searchLocation, mapRef }) => {
  const map = useMap();
  
  useEffect(() => {
    if (mapRef) {
      mapRef.current = map;
    }
  }, [map, mapRef]);
  
  useEffect(() => {
    if (searchLocation) {
      map.setView([searchLocation.lat, searchLocation.lng], 15);
    }
  }, [searchLocation, map]);
  
  return null;
};

const MapSelector = ({ onSelect }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchLocation, setSearchLocation] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const mapRef = useRef(null);

  // ฟังก์ชันคำนวณระยะทางแบบเส้นตรง (สำรอง)
  const calculateStraightDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // ฟังก์ชันเรียก OSRM API สำหรับคำนวณเส้นทาง
  const calculateRoute = async (lat, lng) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${CHIANG_MAI_CITY_HALL.lng},${CHIANG_MAI_CITY_HALL.lat};${lng},${lat}?overview=false&alternatives=false&steps=false`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          return {
            distance: (route.distance / 1000).toFixed(1), // Convert to km
            duration: Math.round(route.duration / 60) // Convert to minutes
          };
        }
      }
    } catch (error) {
      console.warn('OSRM API error, using fallback calculation:', error);
    } finally {
      setLoading(false);
    }
    
    // Fallback to straight-line calculation
    const straightDistance = calculateStraightDistance(
      lat, lng, 
      CHIANG_MAI_CITY_HALL.lat, CHIANG_MAI_CITY_HALL.lng
    );
    return {
      distance: straightDistance.toFixed(1),
      duration: Math.round(straightDistance * 2) // Rough estimate
    };
  };

  // ฟังก์ชันจัดการเมื่อเลือกตำแหน่งบนแผนที่
  const handleLocationSelect = async (lat, lng) => {
    setSelectedLocation({ lat, lng });
    
    // คำนวณระยะทางและเวลาเดินทาง
    const routeData = await calculateRoute(lat, lng);
    setRouteInfo(routeData);
  };

  // ฟังก์ชันค้นหาสถานที่
  const searchPlaces = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      // ใช้ Nominatim API สำหรับค้นหาสถานที่
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' เชียงใหม่')}&limit=5&countrycodes=th&bounded=1&viewbox=98.8,18.9,99.1,18.6`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.map(item => ({
          id: item.place_id,
          name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        })));
        setShowResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // ฟังก์ชันจัดการการเลือกจากผลการค้นหา
  const handleSearchResultSelect = (result) => {
    setSearchLocation(result);
    handleLocationSelect(result.lat, result.lng);
    setSearchQuery(result.name);
    setShowResults(false);
  };

  // ฟังก์ชันยืนยันการเลือก
  const handleConfirmSelection = () => {
    setShowConfirmModal(true);
  };

  // ฟังก์ชันยืนยันขั้นสุดท้าย
  const handleFinalConfirm = () => {
    if (selectedLocation && onSelect) {
      onSelect(selectedLocation.lat, selectedLocation.lng, routeInfo);
    }
    setShowConfirmModal(false);
  };

  // ฟังก์ชันยกเลิกการยืนยัน
  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
  };

  // ฟังก์ชันซูมเข้า
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  // ฟังก์ชันซูมออก
  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPlaces(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const mapStyles = {
    container: {
      position: 'relative',
      width: '100%',
      height: '500px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden'
    },
    searchContainer: {
      position: 'absolute',
      top: '10px',
      left: '10px',
      right: '10px',
      zIndex: 1000,
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    searchInput: {
      width: '100%',
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none'
    },
    searchResults: {
      maxHeight: '200px',
      overflowY: 'auto',
      borderTop: '1px solid #e5e7eb'
    },
    searchResultItem: {
      padding: '10px 12px',
      borderBottom: '1px solid #f3f4f6',
      cursor: 'pointer',
      fontSize: '13px',
      transition: 'background-color 0.2s'
    },
    infoPanel: {
      position: 'absolute',
      bottom: '10px',
      left: '10px',
      right: '10px',
      backgroundColor: 'white',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      fontSize: '13px'
    },
    legend: {
      position: 'absolute',
      bottom: '10px',
      right: '10px',
      backgroundColor: 'white',
      padding: '10px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      fontSize: '12px'
    },
    zoomControls: {
      position: 'absolute',
      bottom: '10px',
      left: '10px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '5px'
    },
    zoomButton: {
      width: '40px',
      height: '40px',
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '18px',
      fontWeight: 'bold',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'background-color 0.2s'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '5px'
    },
    colorDot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      marginRight: '8px'
    },
    confirmButton: {
      backgroundColor: '#059669',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '13px',
      marginTop: '10px',
      width: '100%'
    },
    confirmModal: {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    },
    confirmModalContent: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      maxWidth: '400px',
      width: '90%',
      textAlign: 'center'
    },
    confirmModalTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '15px',
      color: '#1f2937'
    },
    confirmModalInfo: {
      backgroundColor: '#f9fafb',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px',
      textAlign: 'left'
    },
    confirmModalButtons: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'center'
    },
    confirmModalButton: {
      padding: '10px 20px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    confirmModalButtonConfirm: {
      backgroundColor: '#059669',
      color: 'white'
    },
    confirmModalButtonCancel: {
      backgroundColor: '#6b7280',
      color: 'white'
    }
  };

  return (
    <div style={mapStyles.container}>
      {/* Search Box */}
      <div style={mapStyles.searchContainer}>
        <input
          type="text"
          placeholder="ค้นหาสถานที่ในเชียงใหม่... (เช่น วัดพระสิงห์, ดอยสุเทพ)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={mapStyles.searchInput}
        />
        
        {searchLoading && (
          <div style={{ padding: '10px', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
            กำลังค้นหา...
          </div>
        )}
        
        {showResults && searchResults.length > 0 && (
          <div style={mapStyles.searchResults}>
            {searchResults.map((result) => (
              <div
                key={result.id}
                style={{
                  ...mapStyles.searchResultItem,
                  ':hover': { backgroundColor: '#f9fafb' }
                }}
                onClick={() => handleSearchResultSelect(result)}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
              >
                <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                  {result.name.split(',')[0]}
                </div>
                <div style={{ color: '#6b7280', fontSize: '11px' }}>
                  {result.name}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {showResults && searchResults.length === 0 && searchQuery.length > 2 && !searchLoading && (
          <div style={{ padding: '10px', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
            ไม่พบสถานที่ที่ค้นหา
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={mapStyles.legend}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>สัญลักษณ์</div>
        <div style={mapStyles.legendItem}>
          <div style={{ ...mapStyles.colorDot, backgroundColor: '#dc2626' }}></div>
          <span>ศาลหลักเมืองเชียงใหม่</span>
        </div>
        <div style={mapStyles.legendItem}>
          <div style={{ ...mapStyles.colorDot, backgroundColor: '#2563eb' }}></div>
          <span>ตำแหน่งที่เลือก</span>
        </div>
        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '5px' }}>
          คลิกบนแผนที่เพื่อเลือกตำแหน่ง
        </div>
      </div>

      {/* Zoom Controls */}
      <div style={mapStyles.zoomControls}>
        <button
          style={mapStyles.zoomButton}
          onClick={handleZoomIn}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
        >
          +
        </button>
        <button
          style={mapStyles.zoomButton}
          onClick={handleZoomOut}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
        >
          −
        </button>
      </div>

      {/* Map */}
      <MapContainer
        center={[CHIANG_MAI_CITY_HALL.lat, CHIANG_MAI_CITY_HALL.lng]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false} // ปิด zoom control เริ่มต้น
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Marker ศาลหลักเมืองเชียงใหม่ */}
        <Marker position={[CHIANG_MAI_CITY_HALL.lat, CHIANG_MAI_CITY_HALL.lng]} icon={redIcon}>
          <Popup>
            <div style={{ textAlign: 'center' }}>
              <strong>ศาลหลักเมืองเชียงใหม่</strong><br/>
              <small>จุดอ้างอิงสำหรับการคำนวณระยะทาง</small>
            </div>
          </Popup>
        </Marker>

        {/* Map Click Handler */}
        <MapClickHandler 
          onLocationSelect={handleLocationSelect} 
          selectedLocation={selectedLocation}
        />
        
        {/* Map Controller for search */}
        <MapController searchLocation={searchLocation} mapRef={mapRef} />
      </MapContainer>

      {/* Info Panel */}
      {selectedLocation && (
        <div style={mapStyles.infoPanel}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '10px' }}>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>พิกัดที่เลือก</div>
              <div>Latitude: {selectedLocation.lat.toFixed(6)}</div>
              <div>Longitude: {selectedLocation.lng.toFixed(6)}</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>ระยะทางจากศาลหลักเมือง</div>
              {loading ? (
                <div>กำลังคำนวณ...</div>
              ) : routeInfo ? (
                <div>
                  <div>ระยะทาง: {routeInfo.distance} กม.</div>
                  <div>เวลาเดินทาง: {routeInfo.duration} นาที</div>
                </div>
              ) : (
                <div>ไม่สามารถคำนวณได้</div>
              )}
            </div>
          </div>
          
          <button
            onClick={handleConfirmSelection}
            style={mapStyles.confirmButton}
            disabled={loading}
          >
            {loading ? 'กำลังคำนวณ...' : 'เลือกตำแหน่งนี้'}
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedLocation && (
        <div style={mapStyles.confirmModal} onClick={handleCancelConfirm}>
          <div style={mapStyles.confirmModalContent} onClick={(e) => e.stopPropagation()}>
            <div style={mapStyles.confirmModalTitle}>ยืนยันการเลือกตำแหน่ง</div>
            
            <div style={mapStyles.confirmModalInfo}>
              <div style={{ marginBottom: '10px' }}>
                <strong>พิกัดที่เลือก:</strong>
              </div>
              <div style={{ marginBottom: '5px' }}>
                Latitude: {selectedLocation.lat.toFixed(6)}
              </div>
              <div style={{ marginBottom: '10px' }}>
                Longitude: {selectedLocation.lng.toFixed(6)}
              </div>
              
              {routeInfo && (
                <div>
                  <div style={{ marginBottom: '5px' }}>
                    <strong>ระยะทางจากศาลหลักเมือง:</strong> {routeInfo.distance} กม.
                  </div>
                  <div>
                    <strong>เวลาเดินทาง:</strong> {routeInfo.duration} นาที
                  </div>
                </div>
              )}
            </div>
            
            <div style={mapStyles.confirmModalButtons}>
              <button
                style={{
                  ...mapStyles.confirmModalButton,
                  ...mapStyles.confirmModalButtonCancel
                }}
                onClick={handleCancelConfirm}
              >
                ยกเลิก
              </button>
              <button
                style={{
                  ...mapStyles.confirmModalButton,
                  ...mapStyles.confirmModalButtonConfirm
                }}
                onClick={handleFinalConfirm}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapSelector;