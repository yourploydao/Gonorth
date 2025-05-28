// ยังไม่แยก nav and footer เป็น components แยกออกมา
import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/results-after-search.module.css";
import Header from "../components/navigation";
import Footer from "../components/footer";

const DestinationList = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Nature");
  const [selectedDistance, setSelectedDistance] = useState("0 km");
  const [selectedBudget, setSelectedBudget] = useState("0 - 2,000 THB");
  const [sortBy, setSortBy] = useState("Recommended");

  // สร้าง placeholderStyle สำหรับตัวเลือก Select
  const placeholderStyle = { color: "#888" };

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

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleFavouritesClick = () => {
    router.push('/favourites');
  };

  const handleViewPlace = () => {
    router.push('/story-page');
  };

  // const handleViewPlace = (destination) => {
  //   router.push(`/destination/${destination}/deals`);
  // };

  const handleShowMoreResults = () => {
    console.log("Loading more results...");
    // Implementation for loading more results
  };

  return (
    <div className={styles.container}>
      {/* Use the Header component */}
      <Header />

      <div className={styles.mainContent}>
        {/* Search Box */}
        <div className={styles.destinationSearchContainer}>
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
                className={!selectedCategory ? styles.placeholderSelect : ""}
              >
                <option value="" disabled style={!selectedCategory ? placeholderStyle : {}}>ตัวเลือก</option>
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
                className={!selectedDistance ? styles.placeholderSelect : ""}
              >
                <option value="" disabled style={!selectedDistance ? placeholderStyle : {}}>ตัวเลือก</option>
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
                className={!selectedBudget ? styles.placeholderSelect : ""}
              >
                <option value="" disabled style={!selectedBudget ? placeholderStyle : {}}>ตัวเลือก</option>
                <option value="0 - 2,000 THB">0 - 2,000 บาท</option>
                <option value="2,000 - 5,000 THB">2,001 - 5,000 บาท</option>
                <option value="5,000 - 10,000 THB">5,001 - 10,000 บาท</option>
                <option value="10,000+ THB">10,001+ บาท</option>
              </select>
            </div>

            <button type="submit" className={styles.searchButton}>ค้นหา</button>
          </form>
        </div>

        {/* Results Section */}
        <div className={styles.resultsContainer}>
          <div className={styles.resultsHeader}>
            <div className={styles.resultsCount}>แสดงสถานที่ <strong>4</strong> จากทั้งหมด <strong>20</strong> แห่ง</div>
            <div className={styles.sortContainer}>
              <span>จัดเรียงตาม:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="Recommended">แนะนำ</option>
                <option value="Price">ราคา</option>
                <option value="Distance">ระยะทาง</option>
                <option value="Rating">ระดับคะแนน</option>
              </select>
            </div>
          </div>

          {/* Destination List */}
          <div className={styles.destinationList}>
            {/* Destination Item 1 */}
            <div className={styles.favouriteItem}>
              <div className={styles.favouriteImage}>
                <img src="https://jjubbbbb.wordpress.com/wp-content/uploads/2016/11/grand-canyon-of-chiang-mai2.jpg" alt="แกรนด์แคนยอน เชียงใหม่" />
              </div>
              <div className={styles.favouriteInfo}>
                <h3 className={styles.favouriteTitle}>แกรนด์แคนยอน เชียงใหม่</h3>
                
                <div className={styles.infoItem}>
                <span className={styles.infoIcon}>
                  <img src="https://cdn-icons-png.flaticon.com/128/526/526754.png" alt="Car Icon" />
                </span>
                  <span className={styles.infoText}>ห่างจากใจกลางเมือง 20 กิโลเมตร</span>
                </div>
                
                <div className={styles.infoItem}>
                <span className={styles.infoIcon}>
                  <img src="https://cdn-icons-png.flaticon.com/128/1614/1614997.png" alt="Ticket Icon" />
                </span>
                  <span className={styles.infoText}>เข้าชมฟรี</span>
                </div>
                
                <div className={styles.infoItem}>
                <span className={styles.infoIcon}>
                  <img src="https://cdn-icons-png.flaticon.com/128/2972/2972531.png" alt="Time Icon" />
                </span>
                  <span className={styles.infoText}>เปิดทำการ เวลา 09:00 น. – 16:00 น.</span>
                </div>
                
                <div className={styles.actionButtons}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewPlace('grand-canyon-chiangmai')}
                  >
                    ชมสถานที่
                  </button>
                </div>
              </div>
              
              <div className={styles.destinationRating}>
                <div className={styles.ratingScore}>5.0</div>
                <div className={styles.ratingText}>ดีเยี่ยม</div>
                <div className={styles.reviewCount}>25 รีวิว</div>
              </div>
            </div>

            {/* Destination Item 2 */}
            <div className={styles.favouriteItem}>
              <div className={styles.favouriteImage}>
                <img src="https://media.readthecloud.co/wp-content/uploads/2021/12/29133520/angkaew-11-750x500.jpg" alt="น้ำตกม่อนฮ่อง (ป่าแป๋)" />
              </div>
              <div className={styles.favouriteInfo}>
                <h3 className={styles.favouriteTitle}>น้ำตกม่อนฮ่อง (ป่าแป๋)</h3>
                
                <div className={styles.infoItem}>
                <span className={styles.infoIcon}>
                  <img src="https://cdn-icons-png.flaticon.com/128/526/526754.png" alt="Car Icon" />
                </span>
                  <span className={styles.infoText}>ห่างจากใจกลางเมือง 20 กิโลเมตร</span>
                </div>
                
                <div className={styles.infoItem}>
                <span className={styles.infoIcon}>
                  <img src="https://cdn-icons-png.flaticon.com/128/1614/1614997.png" alt="Ticket Icon" />
                </span>
                  <span className={styles.infoText}>เข้าชมฟรี</span>
                </div>
                
                <div className={styles.infoItem}>
                <span className={styles.infoIcon}>
                  <img src="https://cdn-icons-png.flaticon.com/128/2972/2972531.png" alt="Time Icon" />
                </span>
                  <span className={styles.infoText}>เปิดทำการ เวลา 09:00 น. – 16:00 น.</span>
                </div>
                
                <div className={styles.actionButtons}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewPlace('mon-hong-waterfall')}
                  >
                    ชมสถานที่
                  </button>
                </div>
              </div>
              
              <div className={styles.destinationRating}>
                <div className={styles.ratingScore}>4.5</div>
                <div className={styles.ratingText}>ดีเยี่ยม</div>
                <div className={styles.reviewCount}>15 รีวิว</div>
              </div>
            </div>

            {/* Destination Item 3 */}
            <div className={styles.favouriteItem}>
              <div className={styles.favouriteImage}>
                <img src="https://i.ytimg.com/vi/9_0j8BOBiE8/maxresdefault.jpg" alt="สวนบ่อแก้ว" />
              </div>
              <div className={styles.favouriteInfo}>
                <h3 className={styles.favouriteTitle}>สวนบ่อแก้ว</h3>
                
                <div className={styles.infoItem}>
                <span className={styles.infoIcon}>
                  <img src="https://cdn-icons-png.flaticon.com/128/526/526754.png" alt="Car Icon" />
                </span>
                  <span className={styles.infoText}>ห่างจากใจกลางเมือง 20 กิโลเมตร</span>
                </div>
                
                <div className={styles.infoItem}>
                <span className={styles.infoIcon}>
                  <img src="https://cdn-icons-png.flaticon.com/128/1614/1614997.png" alt="Ticket Icon" />
                </span>
                  <span className={styles.infoText}>เข้าชมฟรี</span>
                </div>
                
                <div className={styles.infoItem}>
                <span className={styles.infoIcon}>
                  <img src="https://cdn-icons-png.flaticon.com/128/2972/2972531.png" alt="Time Icon" />
                </span>
                  <span className={styles.infoText}>เปิดทำการ เวลา 09:00 น. – 16:00 น.</span>
                </div>
                
                <div className={styles.actionButtons}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewPlace('suan-bo-kaew')}
                  >
                    ชมสถานที่
                  </button>
                </div>
              </div>
              
              <div className={styles.destinationRating}>
                <div className={styles.ratingScore}>4.2</div>
                <div className={styles.ratingText}>ดีเยี่ยม</div>
                <div className={styles.reviewCount}>12 รีวิว</div>
              </div>
            </div>

            {/* Destination Item 4 */}
            <div className={styles.favouriteItem}>
              <div className={styles.favouriteImage}>
                <img src="https://static.ticket2attraction.com/gallery/1ea4fe7f-71c1-4170-b95f-4f0b70f19ece/adcfe8c9-9316-4e4f-89c2-4669cec51d5d-1200.webp" alt="ทุ่งดอกไฮเดรนเยีย โครงการหลวงขุนแปะ" />
              </div>
              <div className={styles.favouriteInfo}>
                <h3 className={styles.favouriteTitle}>ทุ่งดอกไฮเดรนเยีย โครงการหลวงขุนแปะ</h3>
                
                <div className={styles.infoItem}>
                <span className={styles.infoIcon}>
                  <img src="https://cdn-icons-png.flaticon.com/128/526/526754.png" alt="Car Icon" />
                </span>
                  <span className={styles.infoText}>ห่างจากใจกลางเมือง 20 กิโลเมตร</span>
                </div>
                
                <div className={styles.infoItem}>
                <span className={styles.infoIcon}>
                  <img src="https://cdn-icons-png.flaticon.com/128/1614/1614997.png" alt="Ticket Icon" />
                </span>
                  <span className={styles.infoText}>เข้าชมฟรี</span>
                </div>
                
                <div className={styles.infoItem}>
                <span className={styles.infoIcon}>
                  <img src="https://cdn-icons-png.flaticon.com/128/2972/2972531.png" alt="Time Icon" />
                </span>
                  <span className={styles.infoText}>เปิดทำการ เวลา 09:00 น. – 16:00 น.</span>
                </div>
                
                <div className={styles.actionButtons}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewPlace('hydrangea-royal-project')}
                  >
                    ชมสถานที่
                  </button>
                </div>
              </div>
              
              <div className={styles.destinationRating}>
                <div className={styles.ratingScore}>4.0</div>
                <div className={styles.ratingText}>ดี</div>
                <div className={styles.reviewCount}>8 รีวิว</div>
              </div>
            </div>
          </div>

          {/* Show More Button */}
          <button className={styles.showMoreButton} onClick={handleShowMoreResults}>
          แสดงผลลัพธ์เพิ่มเติม
          </button>
        </div>
      </div>

      {/* Footer - Replaced with Footer component */}
      <Footer />
    </div>
  );
};

export default DestinationList;