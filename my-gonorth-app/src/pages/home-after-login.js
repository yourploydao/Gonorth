import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/home-after-login.module.css";

const HomeAfterAuthen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDistance, setSelectedDistance] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [latestLocations, setLatestLocations] = useState([]);
  const [randomLocations, setRandomLocations] = useState([]);
  const [seasonalLocations, setSeasonalLocations] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchLatestLocations = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:8080/locations-login/latest", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, 
          },
        });

      if (!res.ok) {
          console.error("API response not OK:", res.status, res.statusText);
          return;
      }
      
      const data = await res.json();
      console.log("Fetched data:", data);
      setLatestLocations(data);
    } catch (error) {
      console.error("Error fetching latest locations:", error);
    }
  };

  const fetchRandomLocations = async () => {
    try {
      const token = localStorage.getItem("token");

      const allRes = await fetch("http://localhost:8080/locations-login/all", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, 
          },
      });

      if (!allRes.ok) throw new Error("Failed to fetch all locations");
      const allData = await allRes.json();

      const shuffled = allData.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5);
      setRandomLocations(selected);

    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchSeasonalLocations = async () => {
    try {
      const token = localStorage.getItem("token");
      const currentSeason = getCurrentSeason(); 

      const res = await fetch(`http://localhost:8080/locations-login/season/${currentSeason}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, 
        },
      });

      if (!res.ok) {
        console.error("API response not OK:", res.status, res.statusText);
        return;
      }
      
      const data = await res.json();

      const shuffled = data.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);

      console.log("Fetched seasonal data:", selected);
      setSeasonalLocations(selected);
    } catch (error) {
      console.error("Error fetching seasonal locations:", error);
    }
  };

    fetchLatestLocations();
    fetchRandomLocations();
    fetchSeasonalLocations();
  }, []);

  // หาฤดูกาลปัจจุบัน
  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1; 
    
    if (month >= 3 && month <= 5) return "summer";
    if (month >= 6 && month <= 10) return "rainy";
    return "winter";
  };

  // แปลงชื่อฤดูเป็นภาษาไทย
  const getSeasonDisplayName = () => {
    const currentSeason = getCurrentSeason();

    switch (currentSeason) {
      case "summer":
        return "ฤดูร้อน";
      case "rainy":
        return "ฤดูฝน";
      case "winter":
        return "ฤดูหนาว";
      default:
        return "ไม่ทราบฤดูกาล";
    }
  };

  const [currentHistoryCard, setCurrentHistoryCard] = useState(0);

  // Auto-rotate history cards
  useEffect(() => {
    if (randomLocations.length === 0) return;

    const interval = setInterval(() => {
      setCurrentHistoryCard((prev) => (prev + 1) % randomLocations.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [randomLocations.length]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality here
    console.log("Searching for:", {
      query: searchQuery,
      category: selectedCategory || "Not selected", 
      distance: selectedDistance || "Not selected",
      budget: selectedBudget || "Not selected"
    });
    // Router navigation would go here
  };

  const handleSearchClick = () => {
    router.push('/results-after-search');
  };

  const handleDestinationClick = (locationId) => {
    console.log("Navigating to location ID:", locationId);
    router.push(`/story-page?id=${locationId}`);
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleFavouritesClick = () => {
    router.push('/favourites');
  };

  const handleFlashCardClick = (index) => {
    setCurrentFlashCard(index);
  };

  const handleHistoryCardClick = (index) => {
    setCurrentHistoryCard(index);
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        {/* Hero Section with Rounded Corners */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h2 className={styles.heroSubtitle}>เปิดประสบการณ์ใหม่</h2>
            <h1 className={styles.heroTitle}>ก้าวข้ามทุกขีดจำกัด</h1>
            <p className={styles.heroText}>มุ่งสู่เชียงใหม่ในแบบที่คุณไม่เคยสัมผัสมาก่อน</p>
          </div>
        </section>

        {/* Search Box - Overlapping the hero image */}
        <div className={styles.searchBoxWrapper}>
          <div className={styles.searchBox}>
            <h3 className={styles.searchTitle}>ลองหาจุดหมายใหม่ ๆ ให้ตัวเองดูไหม?</h3>
            
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <div className={styles.searchField}>
                <label>ค้นหา</label>
                <div className={styles.inputWithIcon}>
                  <input 
                    type="text" 
                    placeholder="การผจญภัยครั้งใหม่..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <span className={styles.searchIcon}>
                    <img src="https://cdn-icons-png.flaticon.com/128/13207/13207561.png" alt="Search Icon" />
                  </span>
                </div>
              </div>

              <div className={styles.searchField}>
                <label>ประเภทสถานที่</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="" disabled>ตัวเลือก</option>
                  <option value="Nature">ธรรมชาติ</option>
                  <option value="Culture">วัฒนธรรม</option>
                  <option value="Food">อาหาร</option>
                  <option value="Adventure">ผจญภัย</option>
                </select>
              </div>

              <div className={styles.searchField}>
                <label>ระยะห่างจากใจกลางเมือง</label>
                <select 
                  value={selectedDistance}
                  onChange={(e) => setSelectedDistance(e.target.value)}
                >
                  <option value="" disabled>ตัวเลือก</option>
                  <option value="0 km">0 กิโลเมตร</option>
                  <option value="0-5 km">0-10 กิโลเมตร</option>
                  <option value="5-10 km">11-20 กิโลเมตร</option>
                  <option value="10+ km">21+ กิโลเมตร</option>
                </select>
              </div>

              <div className={styles.searchField}>
                <label>งบประมาณ</label>
                <select 
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                >
                  <option value="" disabled>ตัวเลือก</option>
                  <option value="0 - 2,000 THB">0 - 2,000 บาท</option>
                  <option value="2,000 - 5,000 THB">2,001 - 5,000 บาท</option>
                  <option value="5,000 - 10,000 THB">5,001 - 10,000 บาท</option>
                  <option value="10,000+ THB">10,000+ บาท</option>
                </select>
              </div>

              <button onClick={handleSearchClick} className={styles.searchButton}>ค้นหา</button>
            </form>
          </div>
        </div>

        {/* History Flash Cards Section - เพิ่มส่วนใหม่ */}
        <section className={styles.historySection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>เรื่องเล่าจากอดีต</h2>
            <p className={styles.sectionSubtitle}>
              ประวัติและตำนานของสถานที่ท่องเที่ยวในเชียงใหม่
            </p>
          </div>

          {/* แสดงผลเฉพาะตอนที่ randomLocations มีข้อมูลแล้วเท่านั้น  */}
          {randomLocations.length > 0 && (
            <div className={styles.historyCardContainer}>
              <div
                className={styles.historyCard}
                style={{
                  background:
                    "linear-gradient(135deg,#FFF8E1 0%,#FFCC80 100%)",
                }}
              >
                <div className={styles.historyCardContent}>
                  <div className={styles.historyCardText}>
                    <h2 className={styles.historyCardTitle}>
                      {randomLocations[currentHistoryCard]?.Topic}
                    </h2>
                    <h3 className={styles.historyCardSubtitle}>
                      {randomLocations[currentHistoryCard]?.LocationsName ||
                        "ไม่มีข้อมูล"}
                    </h3>
                    <p className={styles.historyCardDescription}>
                      {expanded
                        ? randomLocations[currentHistoryCard]?.History
                        : randomLocations[currentHistoryCard]?.History.slice(0, 200) + "..."}
                      <button
                        className={styles.showHistory}
                        onClick={() => handleDestinationClick(randomLocations[currentHistoryCard]?.ID)}
                      >
                        ดูรายละเอียดเพิ่มเติม
                      </button>
                    </p>
                  </div>

                  <div className={styles.historyCardImageContainer}>
                    <img
                      src={
                        randomLocations[currentHistoryCard]?.Images?.find(
                          (img) => img.IsMain,
                        )?.URL ||
                        randomLocations[currentHistoryCard]?.Images?.[0]?.URL ||
                        "/images/placeholder.jpg"
                      }
                      alt={randomLocations[currentHistoryCard]?.LocationsName}
                      className={styles.historyCardImage}
                    />
                  </div>
                </div>
              </div>

              {/* Indicators */}
              <div className={styles.historyCardIndicators}>
                {randomLocations.map((_, index) => (
                  <button
                    key={index}
                    className={`${styles.historyIndicator} ${
                      index === currentHistoryCard ? styles.active : ""
                    }`}
                    onClick={() => handleHistoryCardClick(index)}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* New Destinations Section */}
        <section className={styles.destinationsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>สถานที่ใหม่ ๆ ที่น่าไป</h2>
            <p className={styles.sectionSubtitle}>ออกตามหาจุดหมายปลายทางใหม่ ๆ</p>
            <a href="/destinations" className={styles.seeMoreLink}>สำรวจสถานที่เพิ่มเติม</a>
          </div>

          <div className={styles.destinationCards}>
            {latestLocations.map((location) => (
              <div key={location.ID} className={styles.destinationCard}>
                <div
                  className={styles.cardImage}
                  style={{
                    backgroundImage: `url('${
                      location.Images?.find(img => img.IsMain)?.URL || location.Images?.[0]?.URL 
                    }')`
                  }}
                >
                  <div className={styles.cardOverlay}>
                    <h3 className={styles.cardTitle}>{location.LocationsName}</h3>
                    {location.Address && (
                      <h4 className={styles.cardSubtitle}>{location.Address}</h4>
                    )}
                    <button
                      className={styles.showDetailButton}
                      onClick={() => handleDestinationClick(location.ID)}
                    >
                      ดูรายละเอียด
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* New Journey */}
        <section className={styles.destinationsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              วางแผนการเดินทาง{getSeasonDisplayName()}สุดสมบูรณ์แบบของคุณ
            </h2>
            <p className={styles.sectionSubtitle}>ค้นหาจุดหมายปลายทางที่แนะนำมากที่สุด</p>
            <a href="/summer-trips" className={styles.seeMoreLink}>สำรวจสถานที่เพิ่มเติม</a>
          </div>
          
          <div className={styles.destinationCards}>
            {seasonalLocations.length > 0 ? (
              seasonalLocations.map((location) => (
                <div key={location.ID} className={styles.destinationCard}>
                  <div
                    className={styles.cardImage}
                    style={{
                      backgroundImage: `url('${
                        location.Images?.find(img => img.IsMain)?.URL || location.Images?.[0]?.URL 
                      }')`
                    }}
                  >
                    <div className={styles.cardOverlay}>
                      <h3 className={styles.cardTitle}>{location.LocationsName}</h3>
                      {location.Address && (
                        <h4 className={styles.cardSubtitle}>{location.Address}</h4>
                      )}
                      <button
                        className={styles.showDetailButton}
                        onClick={() => handleDestinationClick(location.ID)}
                      >
                        ดูรายละเอียด
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Fallback ถ้าไม่มีข้อมูลจาก database
              <p>ไม่มีข้อมูลสถานที่ในฤดูกาลนี้</p>
            )}
          </div>
        </section>
      </div>

    </div>
  );
};

export default HomeAfterAuthen;