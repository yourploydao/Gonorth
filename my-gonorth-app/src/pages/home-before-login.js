import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/home-before-login.module.css";
import Footer from "../components/footer";

const HomeBeforeAuthen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDistance, setSelectedDistance] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");

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

  const handleDestinationClick = (destination) => {
    router.push(`/destination/${destination}`);
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
            <div className={styles.destinationCard}>
              <div className={styles.cardImage} style={{ backgroundImage: `url('https://static.ticket2attraction.com/gallery/1ea4fe7f-71c1-4170-b95f-4f0b70f19ece/adcfe8c9-9316-4e4f-89c2-4669cec51d5d-1200.webp')` }}>
                <div className={styles.cardOverlay}>
                  <h3 className={styles.cardTitle}>Pongyang Jungle</h3>
                  <h4 className={styles.cardSubtitle}>Coaster & Zipline</h4>
                  <button 
                    className={styles.showDetailButton}
                    onClick={() => handleDestinationClick('pongyang-jungle')}
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.destinationCard}>
              <div className={styles.cardImage} style={{ backgroundImage: `url('https://today-obs.line-scdn.net/0hD9HSJp0yGxZ1KgpR3SxkQU18F2dGTAEfV08GIAMoFXVcBl9BGkpIdVIoQjpREwsVVRhScFZ6EiIMTl5AGg/w644')` }}>
                <div className={styles.cardOverlay}>
                  <h3 className={styles.cardTitle}>บ้านข้างวัด</h3>
                  <button 
                    className={styles.showDetailButton}
                    onClick={() => handleDestinationClick('ban-kang-wat')}
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.destinationCard}>
              <div className={styles.cardImage} style={{ backgroundImage: `url('https://i.ytimg.com/vi/9_0j8BOBiE8/maxresdefault.jpg')` }}>
                <div className={styles.cardOverlay}>
                  <h3 className={styles.cardTitle}>Jungle De Cafe (แม่ริม)</h3>
                  <button 
                    className={styles.showDetailButton}
                    onClick={() => handleDestinationClick('jungle-de-cafe')}
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Summer Trip Section */}
        <section className={styles.destinationsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>วางแผนการเดินทางฤดูฝนสุดสมบูรณ์แบบของคุณ</h2>
            <p className={styles.sectionSubtitle}>ค้นหาจุดหมายปลายทางที่แนะนำมากที่สุด</p>
            <a href="/summer-trips" className={styles.seeMoreLink}>สำรวจสถานที่เพิ่มเติม</a>
          </div>

          <div className={styles.destinationCards}>
            <div className={styles.destinationCard}>
              <div className={styles.cardImage} style={{ backgroundImage: `url('https://www.govivigo.com/content/upload/images/Lampang/Kau-Fau-Waterfall.jpg')` }}>
                <div className={styles.cardOverlay}>
                  <h3 className={styles.cardTitle}>น้ำตกม่อนฮ่อง (ป่าแป๋)</h3>
                  <button 
                    className={styles.showDetailButton}
                    onClick={() => handleDestinationClick('mon-hong-waterfall')}
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.destinationCard}>
              <div className={styles.cardImage} style={{ backgroundImage: `url('https://media.readthecloud.co/wp-content/uploads/2021/12/29133520/angkaew-11-750x500.jpg')` }}>
                <div className={styles.cardOverlay}>
                  <h3 className={styles.cardTitle}>อ่างแก้ว</h3>
                  <button 
                    className={styles.showDetailButton}
                    onClick={() => handleDestinationClick('ang-kaew')}
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.destinationCard}>
              <div className={styles.cardImage} style={{ backgroundImage: `url('https://jjubbbbb.wordpress.com/wp-content/uploads/2016/11/grand-canyon-of-chiang-mai2.jpg')` }}>
                <div className={styles.cardOverlay}>
                  <h3 className={styles.cardTitle}>แกรนด์แคนยอน เชียงใหม่</h3>
                  <button 
                    className={styles.showDetailButton}
                    onClick={() => handleDestinationClick('grand-canyon-chiangmai')}
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer - Replaced with Footer component */}
      <Footer />
    </div>
  );
};

export default HomeBeforeAuthen;