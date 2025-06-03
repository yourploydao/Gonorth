import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Import Map component แบบ dynamic เพื่อป้องกัน SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then((mod) => mod.Polyline), { ssr: false });

const RouteMap = () => {
  const router = useRouter();
  const [waypoints, setWaypoints] = useState([]);
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState({ distance: 0, duration: 0 });
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState(null);
  const [icons, setIcons] = useState({ startIcon: null, destinationIcon: null });
  const [mapRef, setMapRef] = useState(null);

  // ตรวจสอบว่าเป็น client-side
  useEffect(() => {
    setIsClient(true);
    
    // Import Leaflet เฉพาะใน client-side
    const loadLeaflet = async () => {
      try {
        const leaflet = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        
        // แก้ไข icon default
        delete leaflet.Icon.Default.prototype._getIconUrl;
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: '/leaflet/marker-icon-2x.png',
          iconUrl: '/leaflet/marker-icon.png',
          shadowUrl: '/leaflet/marker-shadow.png',
        });

        // สร้าง custom icons
        const startIcon = new leaflet.Icon({
          iconUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
              <path fill="#28a745" stroke="#fff" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
              <circle fill="#fff" cx="12.5" cy="12.5" r="6"/>
              <text x="12.5" y="17" text-anchor="middle" fill="#28a745" font-size="10" font-weight="bold">S</text>
            </svg>
          `),
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        });

        const destinationIcon = new leaflet.Icon({
          iconUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
              <path fill="#dc3545" stroke="#fff" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
              <circle fill="#fff" cx="12.5" cy="12.5" r="6"/>
            </svg>
          `),
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        });

        setL(leaflet);
        setIcons({ startIcon, destinationIcon });
      } catch (error) {
        console.error('Error loading Leaflet:', error);
        setError('ไม่สามารถโหลดแผนที่ได้');
      }
    };

    loadLeaflet();
  }, []);

  // ฟังก์ชันคำนวณระยะทาง
  const calculateDistance = (point1, point2) => {
    const lat1 = point1.lat * Math.PI / 180;
    const lat2 = point2.lat * Math.PI / 180;
    const deltaLat = (point2.lat - point1.lat) * Math.PI / 180;
    const deltaLng = (point2.lng - point1.lng) * Math.PI / 180;

    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const R = 6371000;

    return R * c;
  };

  // ฟังก์ชันหา permutation
  const permute = (arr) => {
    if (arr.length <= 1) return [arr];
    if (arr.length > 7) return [arr]; // จำกัดการคำนวณ
    
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = permute([...arr.slice(0, i), ...arr.slice(i + 1)]);
      for (let r of rest) {
        result.push([arr[i], ...r]);
      }
    }
    return result;
  };

  // ฟังก์ชันดึงข้อมูลเส้นทางจาก OSRM
  const getRouteData = async (from, to) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&continue_straight=false`,
        { 
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        return {
          distance: data.routes[0].distance,
          duration: data.routes[0].duration,
          geometry: data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]])
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching route data:', error);
      // ถ้า OSRM ไม่ทำงาน ให้ส่งคืนเส้นตรง
      return {
        distance: calculateDistance(from, to),
        duration: calculateDistance(from, to) / 10, // ประมาณการ
        geometry: [[from.lat, from.lng], [to.lat, to.lng]]
      };
    }
  };

  // ฟังก์ชันหาเส้นทางที่ดีที่สุด
  const findOptimalRoute = async (waypoints) => {
    if (waypoints.length <= 2) return waypoints;
    
    if (waypoints.length <= 6) {
      // ใช้ brute force สำหรับจุดน้อย
      const firstPoint = waypoints[0];
      const otherPoints = waypoints.slice(1);
      const permutations = permute(otherPoints);
      
      let bestRoute = waypoints;
      let shortestDistance = Infinity;
      
      for (let perm of permutations.slice(0, 20)) { // จำกัดการตรวจสอบ
        const route = [firstPoint, ...perm];
        let totalDistance = 0;
        
        for (let i = 0; i < route.length - 1; i++) {
          totalDistance += calculateDistance(route[i], route[i + 1]);
        }
        
        if (totalDistance < shortestDistance) {
          shortestDistance = totalDistance;
          bestRoute = route;
        }
      }
      
      return bestRoute;
    }
    
    // ใช้ Nearest Neighbor สำหรับจุดเยอะ
    const unvisited = [...waypoints.slice(1)];
    const route = [waypoints[0]];
    let current = waypoints[0];
    
    while (unvisited.length > 0) {
      let nearest = null;
      let shortestDistance = Infinity;
      
      for (let point of unvisited) {
        const distance = calculateDistance(current, point);
        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearest = point;
        }
      }
      
      if (nearest) {
        route.push(nearest);
        current = nearest;
        unvisited.splice(unvisited.indexOf(nearest), 1);
      }
    }
    
    return route;
  };

  // ดึง waypoints จาก query string
  useEffect(() => {
    if (router.query.waypoints) {
      try {
        const decoded = JSON.parse(decodeURIComponent(router.query.waypoints));
        console.log('Decoded waypoints:', decoded);
        
        const validWaypoints = decoded.filter(point => {
          const lat = parseFloat(point.lat);
          const lng = parseFloat(point.lng);
          return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
        }).map(point => ({
          ...point,
          lat: parseFloat(point.lat),
          lng: parseFloat(point.lng)
        }));
        
        console.log('Valid waypoints:', validWaypoints);
        
        if (validWaypoints.length === 0) {
          setError('ไม่พบข้อมูลพิกัดที่ถูกต้อง');
          return;
        }
        
        setWaypoints(validWaypoints);
      } catch (err) {
        console.error('Error parsing waypoints:', err);
        setError('ไม่สามารถอ่านข้อมูลจุดหมายได้');
      }
    } else {
      setError('ไม่พบข้อมูลจุดหมาย');
    }
  }, [router.query.waypoints]);

  // คำนวณเส้นทางที่ดีที่สุด
  useEffect(() => {
    const calculateOptimalRoute = async () => {
      if (waypoints.length < 2) {
        setOptimizedRoute(waypoints);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        console.log('Calculating optimal route for:', waypoints);
        
        const bestRoute = await findOptimalRoute(waypoints);
        console.log('Best route:', bestRoute);
        setOptimizedRoute(bestRoute);

        // ดึงข้อมูลเส้นทางจริง
        const allCoordinates = [];
        let totalDistance = 0;
        let totalDuration = 0;

        for (let i = 0; i < bestRoute.length - 1; i++) {
          const routeData = await getRouteData(bestRoute[i], bestRoute[i + 1]);
          if (routeData) {
            allCoordinates.push(...routeData.geometry);
            totalDistance += routeData.distance;
            totalDuration += routeData.duration;
          }
          
          // เพิ่ม delay เล็กน้อยเพื่อไม่ให้ spam API
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        setRouteCoordinates(allCoordinates);
        setRouteInfo({
          distance: totalDistance,
          duration: totalDuration
        });

      } catch (err) {
        console.error('Error calculating route:', err);
        setError('เกิดข้อผิดพลาดในการคำนวณเส้นทาง: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (waypoints.length > 0 && isClient && L) {
      calculateOptimalRoute();
    }
  }, [waypoints, isClient, L]);

  // ฟังก์ชันแปลงเวลา
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} ชม. ${minutes} นาที`;
    }
    return `${minutes} นาที`;
  };

  // ฟังก์ชันแปลงระยะทาง
  const formatDistance = (meters) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} กม.`;
    }
    return `${Math.round(meters)} ม.`;
  };

  // คำนวณจุดกึ่งกลาง
  const getMapCenter = () => {
    if (waypoints.length === 0) return [13.7563, 100.5018]; // กรุงเทพฯ
    
    const lats = waypoints.map(p => p.lat);
    const lngs = waypoints.map(p => p.lng);
    
    const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
    const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2;
    
    return [centerLat, centerLng];
  };

  const handleBackToFavorites = () => {
    router.push('/favourites');
  };

  // ฟังก์ชัน Zoom
  const handleZoomIn = () => {
    if (mapRef) {
      mapRef.setZoom(mapRef.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef) {
      mapRef.setZoom(mapRef.getZoom() - 1);
    }
  };

  // แสดง loading ขณะรอ client-side rendering
  if (!isClient || !L) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div>🗺️ กำลังโหลดแผนที่...</div>
          <div style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
            กรุณารอสักครู่
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '8px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>เกิดข้อผิดพลาด</h2>
          <p style={{ marginBottom: '1.5rem' }}>{error}</p>
          <button 
            onClick={handleBackToFavorites}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            กลับไปหน้ารายการโปรด
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      {/* แสดงข้อมูลการโหลด */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'white',
          padding: '15px 25px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
          zIndex: 1000,
          textAlign: 'center'
        }}>
          <div>🗺️ กำลังคำนวณเส้นทางที่ดีที่สุด...</div>
          <div style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
            จุดหมาย: {waypoints.length} จุด
          </div>
        </div>
      )}

      {/* ปุ่มกลับ - ขวาบน */}
      <button
        onClick={handleBackToFavorites}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
          zIndex: 1000
        }}
      >
        ← กลับไปรายการโปรด
      </button>

      {/* ปุ่ม Zoom - ข้างบนข้อมูลเส้นทาง */}
      <div style={{
        position: 'absolute',
        bottom: '180px',
        left: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        zIndex: 1000
      }}>
        <button
          onClick={handleZoomIn}
          style={{
            backgroundColor: 'white',
            border: '2px solid #ddd',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            color: '#333'
          }}
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          style={{
            backgroundColor: 'white',
            border: '2px solid #ddd',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            color: '#333'
          }}
        >
          -
        </button>
      </div>

      {/* แสดงข้อมูลเส้นทาง - ล่างซ้าย */}
      {!loading && routeInfo.distance > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
          zIndex: 1000,
          minWidth: '250px',
          border: '1px solid #ddd'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#000', fontWeight: 'bold' }}>ข้อมูลเส้นทาง</h4>
          <div style={{ fontSize: '0.9em', lineHeight: '1.5', color: '#000' }}>
            <div><strong>ระยะทาง:</strong> {formatDistance(routeInfo.distance)}</div>
            <div><strong>เวลาโดยประมาณ:</strong> {formatDuration(routeInfo.duration)}</div>
            <div><strong>จำนวนจุดหมาย:</strong> {optimizedRoute.length} จุด</div>
          </div>
        </div>
      )}

      {/* Container สำหรับแผนที่ */}
      <div style={{
        height: '100%',
        width: '100%',
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          height: '100%',
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '2px solid #e9ecef'
        }}>
          {/* แผนที่ */}
          {waypoints.length > 0 && (
            <MapContainer
              center={getMapCenter()}
              zoom={waypoints.length === 1 ? 15 : 10}
              style={{ height: '100%', width: '100%' }}
              key={`map-${waypoints.length}`}
              whenCreated={setMapRef}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* แสดง Markers */}
              {optimizedRoute.map((point, idx) => (
                <Marker 
                  key={`marker-${point.id}-${idx}`}
                  position={[point.lat, point.lng]}
                  icon={idx === 0 ? icons.startIcon : icons.destinationIcon}
                >
                  <Popup>
                    <div style={{ textAlign: 'center' }}>
                      <strong>{point.name || `จุดที่ ${idx + 1}`}</strong>
                      <br />
                      {idx === 0 ? 'จุดเริ่มต้น' : `จุดหมายที่ ${idx}`}
                      <br />
                      <small>ลำดับที่ {idx + 1}</small>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* แสดงเส้นทาง */}
              {routeCoordinates.length > 0 && (
                <Polyline
                  positions={routeCoordinates}
                  color="#007bff"
                  weight={4}
                  opacity={0.8}
                />
              )}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteMap;