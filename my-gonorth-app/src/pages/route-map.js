import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from '../styles/route-map.module.css';

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

  // Helper function to safely encode SVG to base64
  const encodeSVGToBase64 = (svgString) => {
    try {
      // Convert to UTF-8 byte array first, then to base64
      const utf8Bytes = new TextEncoder().encode(svgString);
      let binaryString = '';
      for (let i = 0; i < utf8Bytes.length; i++) {
        binaryString += String.fromCharCode(utf8Bytes[i]);
      }
      return btoa(binaryString);
    } catch (error) {
      console.error('Error encoding SVG:', error);
      // Fallback: use a simple colored circle instead
      const simpleSvg = `<svg width="30" height="45" viewBox="0 0 30 45" xmlns="http://www.w3.org/2000/svg"><circle fill="#4CAF50" cx="15" cy="15" r="12"/></svg>`;
      return btoa(simpleSvg);
    }
  };

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

        // สร้าง custom icons โดยใช้ SVG ที่ไม่มีตัวอักษรไทย
        const startSvg = `<svg width="30" height="45" viewBox="0 0 30 45" xmlns="http://www.w3.org/2000/svg">
          <path fill="#4CAF50" stroke="#fff" stroke-width="2" d="M15 0C6.7 0 0 6.7 0 15c0 15 15 30 15 30s15-15 15-30C30 6.7 23.3 0 15 0z"/>
          <circle fill="#fff" cx="15" cy="15" r="8"/>
          <text x="15" y="20" text-anchor="middle" fill="#4CAF50" font-size="12" font-weight="bold">S</text>
        </svg>`;

        const destinationSvg = `<svg width="30" height="45" viewBox="0 0 30 45" xmlns="http://www.w3.org/2000/svg">
          <path fill="#FF5722" stroke="#fff" stroke-width="2" d="M15 0C6.7 0 0 6.7 0 15c0 15 15 30 15 30s15-15 15-30C30 6.7 23.3 0 15 0z"/>
          <circle fill="#fff" cx="15" cy="15" r="8"/>
          <circle fill="#FF5722" cx="15" cy="15" r="4"/>
        </svg>`;

        const startIcon = new leaflet.Icon({
          iconUrl: 'data:image/svg+xml;base64,' + encodeSVGToBase64(startSvg),
          iconSize: [30, 45],
          iconAnchor: [15, 45],
          popupAnchor: [0, -45],
        });

        const destinationIcon = new leaflet.Icon({
          iconUrl: 'data:image/svg+xml;base64,' + encodeSVGToBase64(destinationSvg),
          iconSize: [30, 45],
          iconAnchor: [15, 45],
          popupAnchor: [0, -45],
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
      <div className={styles.loadingContainer}>
        <div className={styles.loadingCard}>
          <div className={styles.loadingIcon}>🗺️</div>
          <h2>กำลังโหลดแผนที่</h2>
          <p>กรุณารอสักครู่...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>เกิดข้อผิดพลาด</h2>
          <p>{error}</p>
          <button onClick={handleBackToFavorites} className={styles.backButton}>
            กลับไปหน้ารายการโปรด
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1>🗺️ เส้นทางการเดินทาง</h1>
            <p>{waypoints.length} จุดหมาย</p>
          </div>
          <button onClick={handleBackToFavorites} className={styles.backButton}>
            กลับ
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingSpinner}>🧭</div>
            <div className={styles.loadingText}>
              <div>กำลังคำนวณเส้นทางที่ดีที่สุด</div>
              <div className={styles.loadingSubtext}>
                กำลังประมวลผล {waypoints.length} จุดหมาย...
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.mainContent}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          {/* Route Info */}
          {!loading && routeInfo.distance > 0 && (
            <div className={styles.routeInfo}>
              <h3>📊 ข้อมูลเส้นทาง</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <span className={styles.infoIcon}>📏</span>
                  <div>
                    <div className={styles.infoLabel}>ระยะทางรวม</div>
                    <div className={styles.infoValue}>{formatDistance(routeInfo.distance)}</div>
                  </div>
                </div>
                <div className={styles.infoCard}>
                  <span className={styles.infoIcon}>⏱️</span>
                  <div>
                    <div className={styles.infoLabel}>เวลาโดยประมาณ</div>
                    <div className={styles.infoValue}>{formatDuration(routeInfo.duration)}</div>
                  </div>
                </div>
                <div className={styles.infoCard}>
                  <span className={styles.infoIcon}>📍</span>
                  <div>
                    <div className={styles.infoLabel}>จำนวนจุดหมาย</div>
                    <div className={styles.infoValue}>{optimizedRoute.length} จุด</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Waypoints List */}
          <div className={styles.waypointsList}>
            <h3>🗺️ ลำดับการเดินทาง</h3>
            <div className={styles.waypointsContainer}>
              {optimizedRoute.map((point, idx) => (
                <div
                  key={`waypoint-${point.id}-${idx}`}
                  className={`${styles.waypointCard} ${idx === 0 ? styles.startPoint : ''}`}
                >
                  <div className={`${styles.waypointIcon} ${idx === 0 ? styles.startIcon : styles.destinationIcon}`}>
                    {idx === 0 ? 'S' : idx}
                  </div>
                  <div className={styles.waypointInfo}>
                    <div className={styles.waypointName}>
                      {point.name || `จุดที่ ${idx + 1}`}
                    </div>
                    <div className={styles.waypointType}>
                      {idx === 0 ? 'จุดเริ่มต้น' : `จุดหมายที่ ${idx}`}
                    </div>
                  </div>
                  <div className={styles.waypointOrder}>
                    #{idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

          {/* Map */}
          <div className={styles.mapContainer}>
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
                      <div className={styles.popupContent}>
                        <strong>{point.name || `จุดที่ ${idx + 1}`}</strong>
                        <br />
                        <span className={styles.popupType}>
                          {idx === 0 ? 'จุดเริ่มต้น' : `จุดหมายที่ ${idx}`}
                        </span>
                        <br />
                        <small className={styles.popupOrder}>ลำดับที่ {idx + 1}</small>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* แสดงเส้นทาง */}
                {routeCoordinates.length > 0 && (
                  <Polyline
                    positions={routeCoordinates}
                    color="#4285F4"
                    weight={5}
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