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
  iconUrl: 'data:image/svg+xml;base64=' + btoa(`
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
  const [savedMaps, setSavedMaps] = useState([]);
  const [showSavedMaps, setShowSavedMaps] = useState(false);
  const [mapName, setMapName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  // ฟิลด์สำหรับใส่พิกัดแบบแมนนวล
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [showCoordinateInput, setShowCoordinateInput] = useState(false);
  
  const mapRef = useRef(null);

  // Load saved maps from memory on component mount
  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem('savedMaps') || '[]');
    setSavedMaps(saved);
  }, []);

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

  // ฟังก์ชันจัดการการใส่พิกัดแบบแมนนวล
  const handleManualCoordinateSubmit = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (isNaN(lat) || isNaN(lng)) {
      alert('กรุณาใส่พิกัดที่ถูกต้อง');
      return;
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('พิกัดไม่อยู่ในช่วงที่ถูกต้อง');
      return;
    }
    
    // เซ็ตแมพไปยังตำแหน่งนั้น
    setSearchLocation({ lat, lng });
    handleLocationSelect(lat, lng);
    setShowCoordinateInput(false);
    setManualLat('');
    setManualLng('');
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
     `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' เชียงใหม่')}&limit=5&countrycodes=th`
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

  // ฟังก์ชันเซฟแมพ
  const handleSaveMap = () => {
    if (!selectedLocation) {
      alert('กรุณาเลือกตำแหน่งก่อนเซฟแมพ');
      return;
    }
    setShowSaveModal(true);
  };

  // ฟังก์ชันยืนยันการเซฟแมพ
  const handleConfirmSaveMap = () => {
    if (!mapName.trim()) {
      alert('กรุณาใส่ชื่อแมพ');
      return;
    }

    const newMap = {
      id: Date.now(),
      name: mapName.trim(),
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      routeInfo: routeInfo,
      savedAt: new Date().toLocaleString('th-TH')
    };

    const updatedMaps = [...savedMaps, newMap];
    setSavedMaps(updatedMaps);
    sessionStorage.setItem('savedMaps', JSON.stringify(updatedMaps));
    
    setShowSaveModal(false);
    setMapName('');
    alert('เซฟแมพเรียบร้อยแล้ว!');
  };

  // ฟังก์ชันโหลดแมพที่เซฟไว้
  const handleLoadSavedMap = (savedMap) => {
    setSearchLocation({ lat: savedMap.lat, lng: savedMap.lng });
    handleLocationSelect(savedMap.lat, savedMap.lng);
    setShowSavedMaps(false);
  };

  // ฟังก์ชันลบแมพที่เซฟไว้
  const handleDeleteSavedMap = (mapId) => {
    if (confirm('ต้องการลบแมพนี้ใช่หรือไม่?')) {
      const updatedMaps = savedMaps.filter(map => map.id !== mapId);
      setSavedMaps(updatedMaps);
      sessionStorage.setItem('savedMaps', JSON.stringify(updatedMaps));
    }
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
    topControls: {
      position: 'absolute',
      top: '10px',
      left: '10px',
      right: '10px',
      zIndex: 1000,
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap'
    },
    searchContainer: {
      flex: '1',
      minWidth: '300px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    controlButtons: {
      display: 'flex',
      gap: '5px'
    },
    controlButton: {
      padding: '8px 12px',
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      whiteSpace: 'nowrap'
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
    coordinateInput: {
      position: 'absolute',
      top: '70px',
      left: '10px',
      right: '10px',
      backgroundColor: 'white',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000
    },
    coordinateInputRow: {
      display: 'flex',
      gap: '10px',
      marginBottom: '10px',
      alignItems: 'center'
    },
    coordinateField: {
      flex: '1',
      padding: '8px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '14px'
    },
    savedMapsPanel: {
      position: 'absolute',
      top: '70px',
      left: '10px',
      right: '10px',
      maxHeight: '300px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      overflow: 'hidden'
    },
    savedMapsHeader: {
      padding: '15px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontWeight: 'bold'
    },
    savedMapsList: {
      maxHeight: '200px',
      overflowY: 'auto'
    },
    savedMapItem: {
      padding: '12px 15px',
      borderBottom: '1px solid #f3f4f6',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    savedMapInfo: {
      flex: '1',
      cursor: 'pointer'
    },
    savedMapName: {
      fontWeight: '500',
      marginBottom: '2px'
    },
    savedMapDetails: {
      fontSize: '11px',
      color: '#6b7280'
    },
    deleteButton: {
      padding: '4px 8px',
      backgroundColor: '#dc2626',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '11px'
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
      marginRight: '10px'
    },
    saveButton: {
      backgroundColor: '#2563eb',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '13px',
      marginTop: '10px'
    },
    modal: {
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
    modalContent: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      maxWidth: '400px',
      width: '90%',
      textAlign: 'center'
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '15px',
      color: '#1f2937'
    },
    modalInfo: {
      backgroundColor: '#f9fafb',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px',
      textAlign: 'left'
    },
    modalButtons: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'center'
    },
    modalButton: {
      padding: '10px 20px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    modalButtonConfirm: {
      backgroundColor: '#059669',
      color: 'white'
    },
    modalButtonCancel: {
      backgroundColor: '#6b7280',
      color: 'white'
    },
    modalInput: {
      width: '100%',
      padding: '10px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      marginBottom: '15px',
      fontSize: '14px'
    }
  };

  return (
    <div style={mapStyles.container}>
      {/* Top Controls */}
      <div style={mapStyles.topControls}>
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

        {/* Control Buttons */}
        <div style={mapStyles.controlButtons}>
          <button
            style={{
              ...mapStyles.controlButton,
              backgroundColor: showCoordinateInput ? '#e5e7eb' : 'white'
            }}
            onClick={() => setShowCoordinateInput(!showCoordinateInput)}
          >
            ใส่พิกัด
          </button>
          <button
            style={{
              ...mapStyles.controlButton,
              backgroundColor: showSavedMaps ? '#e5e7eb' : 'white'
            }}
            onClick={() => setShowSavedMaps(!showSavedMaps)}
          >
            แมพที่เซฟไว้ ({savedMaps.length})
          </button>
        </div>
      </div>

      {/* Coordinate Input Panel */}
      {showCoordinateInput && (
        <div style={mapStyles.coordinateInput}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>ใส่พิกัด (Latitude, Longitude)</div>
          <div style={mapStyles.coordinateInputRow}>
            <input
              type="number"
              placeholder="Latitude (เช่น 18.7883)"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              style={mapStyles.coordinateField}
              step="any"
            />
            <input
              type="number"
              placeholder="Longitude (เช่น 98.9853)"
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
              style={mapStyles.coordinateField}
              step="any"
            />
            <button
              onClick={handleManualCoordinateSubmit}
              style={{
                padding: '8px 16px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ไป
            </button>
            <button
              onClick={() => setShowCoordinateInput(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      {/* Saved Maps Panel */}
      {showSavedMaps && (
        <div style={mapStyles.savedMapsPanel}>
          <div style={mapStyles.savedMapsHeader}>
            <span>แมพที่เซฟไว้</span>
            <button
              onClick={() => setShowSavedMaps(false)}
              style={{
                padding: '4px 8px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ปิด
            </button>
          </div>
          
          <div style={mapStyles.savedMapsList}>
            {savedMaps.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                ยังไม่มีแมพที่เซฟไว้
              </div>
            ) : (
              savedMaps.map((savedMap) => (
                <div key={savedMap.id} style={mapStyles.savedMapItem}>
                  <div 
                    style={mapStyles.savedMapInfo}
                    onClick={() => handleLoadSavedMap(savedMap)}
                  >
                    <div style={mapStyles.savedMapName}>{savedMap.name}</div>
                    <div style={mapStyles.savedMapDetails}>
                      {savedMap.lat.toFixed(5)}, {savedMap.lng.toFixed(5)}
                    </div>
                    <div style={mapStyles.savedMapDetails}>
                      เซฟเมื่อ: {savedMap.savedAt}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSavedMap(savedMap.id)}
                    style={mapStyles.deleteButton}
                  >
                    ลบ
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

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
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleConfirmSelection}
              style={mapStyles.confirmButton}
              disabled={loading}
            >
              {loading ? 'กำลังคำนวณ...' : 'เลือกตำแหน่งนี้'}
            </button>
            <button
              onClick={handleSaveMap}
              style={mapStyles.saveButton}
              disabled={loading}
            >
              เซฟแมพ
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedLocation && (
        <div style={mapStyles.modal} onClick={handleCancelConfirm}>
          <div style={mapStyles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={mapStyles.modalTitle}>ยืนยันการเลือกตำแหน่ง</div>
            
            <div style={mapStyles.modalInfo}>
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
            
            <div style={mapStyles.modalButtons}>
              <button
                style={{
                  ...mapStyles.modalButton,
                  ...mapStyles.modalButtonCancel
                }}
                onClick={handleCancelConfirm}
              >
                ยกเลิก
              </button>
              <button
                style={{
                  ...mapStyles.modalButton,
                  ...mapStyles.modalButtonConfirm
                }}
                onClick={handleFinalConfirm}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Map Modal */}
      {showSaveModal && (
        <div style={mapStyles.modal} onClick={() => setShowSaveModal(false)}>
          <div style={mapStyles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={mapStyles.modalTitle}>เซฟแมพ</div>
            
            <div style={{ textAlign: 'left', marginBottom: '15px' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>พิกัดที่จะเซฟ:</strong>
              </div>
              <div style={{ marginBottom: '5px', fontSize: '14px' }}>
                Latitude: {selectedLocation.lat.toFixed(6)}
              </div>
              <div style={{ fontSize: '14px' }}>
                Longitude: {selectedLocation.lng.toFixed(6)}
              </div>
            </div>
            
            <input
              type="text"
              placeholder="ใส่ชื่อแมพ (เช่น บ้านฉัน, ร้านอาหารโปรด)"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              style={mapStyles.modalInput}
              autoFocus
            />
            
            <div style={mapStyles.modalButtons}>
              <button
                style={{
                  ...mapStyles.modalButton,
                  ...mapStyles.modalButtonCancel
                }}
                onClick={() => setShowSaveModal(false)}
              >
                ยกเลิก
              </button>
              <button
                style={{
                  ...mapStyles.modalButton,
                  ...mapStyles.modalButtonConfirm
                }}
                onClick={handleConfirmSaveMap}
              >
                เซฟ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapSelector;