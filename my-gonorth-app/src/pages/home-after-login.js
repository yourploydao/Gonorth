// ยังไม่แยก nav and footer เป็น components แยกออกมา
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/home-after-login.module.css";
import Header from "../components/navigation";
import Footer from "../components/footer";

const HomeAfterAuthen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDistance, setSelectedDistance] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [currentFlashCard, setCurrentFlashCard] = useState(0);
  const [currentHistoryCard, setCurrentHistoryCard] = useState(0);

  // Flash Cards Data
  const flashCards = [
    {
      title: "อ่างแก้ว",
      subtitle: "ของขวัญแห่งกาลเวลา",
      description: "อ่างแก้วเกิดจากการที่ธรรมชาติสร้างสรรค์ขึ้นมาเป็นเวลานับล้านปี ด้วยการพัดพาของลมและฝน ทำให้เกิดเป็นอ่างน้ำใสใสที่สะท้อนท้องฟ้าได้อย่างสวยงาม",
      image: "https://media.readthecloud.co/wp-content/uploads/2021/12/29133520/angkaew-11-750x500.jpg",
      bgColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      title: "แกรนด์แคนยอน เชียงใหม่",
      subtitle: "ปาฏิหาริย์แห่งดินแดน",
      description: "เกิดจากการขุดดินเหนียวเพื่อทำอิฐ จนกลายเป็นหลุมลึกขนาดใหญ่ เมื่อเติมน้ำลงไป จึงกลายเป็นทะเลสาบสีฟ้าครามที่งดงามราวกับแกรนด์แคนยอนจริง",
      image: "https://jjubbbbb.wordpress.com/wp-content/uploads/2016/11/grand-canyon-of-chiang-mai2.jpg",
      bgColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
      title: "น้ำตกม่อนฮ่อง",
      subtitle: "เสียงเพลงแห่งป่าใหญ่",
      description: "น้ำตกที่ซ่อนตัวอยู่ในป่าลึก มีเสียงน้ำตกดังก้องเป็นเสียงเพลงของธรรมชาติ เล่ากันว่าเป็นที่อาศัยของเทพธิดาแห่งป่า ที่คอยปกป้องผืนป่าไว้",
      image: "https://www.govivigo.com/content/upload/images/Lampang/Kau-Fau-Waterfall.jpg",
      bgColor: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
    },
    {
      title: "บ้านข้างวัด",
      subtitle: "ร่มไผ่และเสียงระฆัง",
      description: "บ้านไม้เก่าแก่ที่ตั้งอยู่ข้างวัดเก่า สร้างมาตั้งแต่สมัยล้านนา ล้อมรอบด้วยไผ่เขียวและเสียงระฆังที่ดังขึ้นทุกเช้าเย็น เป็นสถานที่ที่ให้ความสงบและความสุข",
      image: "https://today-obs.line-scdn.net/0hD9HSJp0yGxZ1KgpR3SxkQU18F2dGTAEfV08GIAMoFXVcBl9BGkpIdVIoQjpREwsVVRhScFZ6EiIMTl5AGg/w644",
      bgColor: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
    }
  ];

  // History Cards Data - เพิ่มข้อมูลประวัติสถานที่
  const historyCards = [
    {
      title: "อ่างแก้ว",
      subtitle: "ของขวัญแห่งกาลเวลา",
      description: "เล่าขานกันว่าอ่างแก้วเกิดขึ้นจากน้ำตาของนางฟ้าที่เสียใจจากการจากลาคนรัก หยดน้ำตาที่หลั่งลงสู่แผ่นดินกลายเป็นอ่างน้ำใสดุจแก้วใส สะท้อนความทรงจำอันงดงามไว้ตลอดกาล",
      image: "https://media.readthecloud.co/wp-content/uploads/2021/12/29133520/angkaew-11-750x500.jpg",
      bgColor: "linear-gradient(135deg, #8EC5FC 0%, #E0C3FC 100%)",
      period: "ตำนานโบราณ"
    },
    {
      title: "แกรนด์แคนยอน เชียงใหม่", 
      subtitle: "ปาฏิหาริย์แห่งดินแดน",
      description: "ในอดีตที่นี่เป็นแหล่งขุดดินเหนียวของชาวบ้าน ใช้ทำอิฐปูนสร้างบ้านเรือน หลังจากขุดไปนานปี ฝนฟ้าได้เติมน้ำลงในหลุมลึก กลายเป็นทะเลสาบสีฟ้าครามที่มีความงามไม่แพ้แกรนด์แคนยอนแท้",
      image: "https://jjubbbbb.wordpress.com/wp-content/uploads/2016/11/grand-canyon-of-chiang-mai2.jpg",
      bgColor: "linear-gradient(135deg, #FFEAF2 0%, #FF8A80 100%)",
      period: "ศตวรรษที่ 20"
    },
    {
      title: "น้ำตกม่อนฮ่อง",
      subtitle: "เสียงเพลงแห่งป่าใหญ่", 
      description: "ตามตำนานของชาวม้ง น้ำตกแห่งนี้เป็นที่ประทับของวิญญาณป่า เสียงน้ำตกที่ดังก้องไปทั่วป่าคือเสียงเพลงที่วิญญาณป่าขับร้องเพื่อปกป้องสัตว์ป่าและต้นไม้ให้อยู่ในความสงบสุข",
      image: "https://www.govivigo.com/content/upload/images/Lampang/Kau-Fau-Waterfall.jpg",
      bgColor: "linear-gradient(135deg, #E8F5E8 0%, #B8E6B8 100%)",
      period: "ตำนานชาวเขา"
    },
    {
      title: "บ้านข้างวัด",
      subtitle: "ร่มไผ่และเสียงระฆัง",
      description: "บ้านไม้สักโบราณแห่งนี้สร้างขึ้นในสมัยพระเจ้ามังราย เป็นที่พักของพระสงฆ์และผู้แสวงบุญ ไผ่รอบบ้านปลูกไว้เพื่อให้ร่มเงาและสร้างความเย็นใจ เสียงระฆังวัดที่ดังขึ้นทุกเช้าเย็นเป็นสัญญาณแห่งความสงบและการดำรงอยู่ของวิถีชีวิตแบบล้านนา",
      image: "https://today-obs.line-scdn.net/0hD9HSJp0yGxZ1KgpR3SxkQU18F2dGTAEfV08GIAMoFXVcBl9BGkpIdVIoQjpREwsVVRhScFZ6EiIMTl5AGg/w644",
      bgColor: "linear-gradient(135deg, #FFF8E1 0%, #FFCC80 100%)",
      period: "สมัยล้านนา"
    }
  ];

  // Auto-rotate flash cards
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFlashCard((prev) => (prev + 1) % flashCards.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [flashCards.length]);

  // Auto-rotate history cards
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHistoryCard((prev) => (prev + 1) % historyCards.length);
    }, 6000); // Change every 6 seconds

    return () => clearInterval(interval);
  }, [historyCards.length]);

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

  const handleDestinationClick = (destination) => {
    router.push(`/destination/${destination}`);
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
      {/* Use the Header component */}
      <Header />

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

              <button onClick={handleSearchClick} className={styles.searchButton}>ค้นหา</button>
            </form>
          </div>
        </div>

        {/* History Flash Cards Section - เพิ่มส่วนใหม่ */}
        <section className={styles.historySection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>เรื่องเล่าจากอดีต</h2>
            <p className={styles.sectionSubtitle}>ประวัติและตำนานของสถานที่ท่องเที่ยวในเชียงใหม่</p>
          </div>
          
          <div className={styles.historyCardContainer}>
            <div 
              className={styles.historyCard}
              style={{ background: historyCards[currentHistoryCard].bgColor }}
            >
              <div className={styles.historyCardContent}>
                <div className={styles.historyCardText}>
                  <div className={styles.historyPeriod}>
                    {historyCards[currentHistoryCard].period}
                  </div>
                  <h2 className={styles.historyCardTitle}>
                    {historyCards[currentHistoryCard].title}
                  </h2>
                  <h3 className={styles.historyCardSubtitle}>
                    {historyCards[currentHistoryCard].subtitle}
                  </h3>
                  <p className={styles.historyCardDescription}>
                    {historyCards[currentHistoryCard].description}
                  </p>
                </div>
                <div className={styles.historyCardImageContainer}>
                  <img 
                    src={historyCards[currentHistoryCard].image} 
                    alt={historyCards[currentHistoryCard].title}
                    className={styles.historyCardImage}
                  />
                </div>
              </div>
            </div>
            
            {/* History Card Indicators */}
            <div className={styles.historyCardIndicators}>
              {historyCards.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.historyIndicator} ${index === currentHistoryCard ? styles.active : ''}`}
                  onClick={() => handleHistoryCardClick(index)}
                />
              ))}
            </div>
          </div>
        </section>

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

export default HomeAfterAuthen;