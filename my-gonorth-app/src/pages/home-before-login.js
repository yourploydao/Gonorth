import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/home-before-login.module.css";
import Footer from "../components/footer";

const HomeBeforeAuthen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDistance, setSelectedDistance] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [latestLocations, setLatestLocations] = useState([]);
  const [randomLocations, setRandomLocations] = useState([]);

  useEffect(() => {
    const fetchLatestLocations = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:8080/locations/latest", {
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

      const allRes = await fetch("http://localhost:8080/locations/all", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, 
          },
      });

      if (!allRes.ok) throw new Error("Failed to fetch all locations");
      const allData = await allRes.json();

      // สุ่ม 3 สถานที่จากทั้งหมด
      const shuffled = allData.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);
      setRandomLocations(selected);

    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

    fetchLatestLocations();
    fetchRandomLocations();
  }, []);

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

  const handleDestinationClick = () => {
    router.push("/login");
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <img src="/assets/gonorth-logo.png" alt="GONORTH" className={styles.logoImage} />
        </div>
        <div className={styles.headerButtons}>
          <a href="/login" className={styles.loginButton}>เข้าสู่ระบบ</a>
          <a href="/signup" className={styles.signupButton}>ลงทะเบียน</a>
        </div>
      </header>

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
                  <option value="10,000+ THB">10,001+ บาท</option>
                </select>
              </div>

              <button type="submit" className={styles.searchButton}>ค้นหา</button>
            </form>
          </div>
        </div>

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
                      onClick={() => handleDestinationClick()}
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
            <h2 className={styles.sectionTitle}>วางแผนการเดินทางฤดูฝนสุดสมบูรณ์แบบของคุณ</h2>
            <p className={styles.sectionSubtitle}>ค้นหาจุดหมายปลายทางที่แนะนำมากที่สุด</p>
            <a href="/summer-trips" className={styles.seeMoreLink}>สำรวจสถานที่เพิ่มเติม</a> 
          </div> 

          <div className={styles.destinationCards}>
            {randomLocations.map((location) => (
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
                    <h3 className={styles.cardTitle}>{location.Topic}</h3>
                    {location.Address && (
                      <h4 className={styles.cardSubtitle}>{location.Address}</h4>
                    )}
                    <button
                      className={styles.showDetailButton}
                      onClick={() => handleDestinationClick()}
                    >
                      ดูรายละเอียด
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer - Replaced with Footer component */}
      <Footer />
    </div>
  );
};

export default HomeBeforeAuthen;