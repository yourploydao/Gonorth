// ยังไม่แยก nav and footer เป็น components แยกออกมา
import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/new-destinations.module.css";

const NewDestinations = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("History");
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

  const handleViewPlace = (destination) => {
    router.push(`/destination/${destination}`);
  };

  const handleShowMoreResults = () => {
    console.log("Loading more results...");
    // Implementation for loading more results
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>

        {/* Results Section */}
        <div className={styles.resultsContainer}>
          <div className={styles.resultsHeader}>
            <div className={styles.resultsCount}>แสดงสถานที่ <strong>4</strong> จากทั้งหมด <strong>12</strong> แห่ง</div>
            <div className={styles.sortContainer}>
              <span>จัดเรียงตาม:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="" disabled>ตัวเลือก</option>
                <option value="ratings">คะแนนรีวิว</option>
                <option value="Distance">ระยะทาง</option>
                <option value="Price">ราคาเข้าชม</option>
              </select>
            </div>
          </div>

          {/* Destination List */}
          <div className={styles.destinationList}>
            {/* Destination Item 1 */}
            <div className={styles.destinationItem}>
              <div className={styles.destinationImage}>
                <img src="https://www.agoda.com/wp-content/uploads/2024/06/chiang-mai-wat-doi-suthep-featured-1244x700.jpg" alt="วัดพระธาตุดอยสุเทพ" />
              </div>
              <div className={styles.destinationInfo}>
                <h3 className={styles.destinationTitle}>วัดพระธาตุดอยสุเทพ</h3>
                
                <div className={styles.historySection}>
                  <p className={styles.historyText}>
                    สร้างขึ้นในปี พ.ศ. 1926 โดยพระมหาเถระสุมนะ เป็นวัดที่มีความศักดิ์สิทธิ์และเป็นสัญลักษณ์ของจังหวัดเชียงใหม่ 
                    ตั้งอยู่บนยอดดอยสุเทพสูง 1,073 เมตรจากระดับน้ำทะเล
                  </p>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>
                    <img src="https://cdn-icons-png.flaticon.com/128/526/526754.png" alt="Distance Icon" />
                  </span>
                  <span className={styles.infoText}>ห่างจากใจกลางเมือง 15 กิโลเมตร</span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>
                    <img src="https://cdn-icons-png.flaticon.com/128/1614/1614997.png" alt="Ticket Icon" />
                  </span>
                  <span className={styles.infoText}>ค่าเข้าชม 50 บาท (คนไทย 30 บาท)</span>
                </div>

                <div className={styles.facilitiesSection}>
                  <h4 className={styles.facilitiesTitle}>สิ่งอำนวยความสะดวก:</h4>
                  <div className={styles.facilitiesList}>
                    <span className={styles.facilityTag}>ลิฟต์นาคราช</span>
                    <span className={styles.facilityTag}>ที่จอดรถ</span>
                    <span className={styles.facilityTag}>ร้านอาหาร</span>
                    <span className={styles.facilityTag}>ห้องน้ำ</span>
                    <span className={styles.facilityTag}>ร้านขายของที่ระลึก</span>
                  </div>
                </div>
                
                <div className={styles.actionButtons}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewPlace('doi-suthep-temple')}
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
              
              <div className={styles.destinationRating}>
                <div className={styles.ratingScore}>4.8</div>
                <div className={styles.ratingText}>ดีเยี่ยม</div>
                <div className={styles.reviewCount}>1,250 รีวิว</div>
              </div>
            </div>

            {/* Destination Item 2 */}
            <div className={styles.destinationItem}>
              <div className={styles.destinationImage}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Three_Kings_Monument%2C_Chiang_Mai_%28I%29.jpg" alt="อนุสาวรีย์สามกษัตริย์" />
              </div>
              <div className={styles.destinationInfo}>
                <h3 className={styles.destinationTitle}>อนุสาวรีย์สามกษัตริย์</h3>
                
                <div className={styles.historySection}>
                  <p className={styles.historyText}>
                    สร้างขึ้นเพื่อเป็นเกียรติแก่กษัตริย์ผู้ก่อตั้งเชียงใหม่ 3 พระองค์ คือ พ่อขุนเมืองแก้ว พ่อขุนรามคำแหง และพญามังราย 
                    เป็นจุดศูนย์กลางทางประวัติศาสตร์ของเมืองเชียงใหม่
                  </p>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>
                    <img src="https://cdn-icons-png.flaticon.com/128/526/526754.png" alt="Distance Icon" />
                  </span>
                  <span className={styles.infoText}>ห่างจากใจกลางเมือง 0.5 กิโลเมตร</span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>
                    <img src="https://cdn-icons-png.flaticon.com/128/1614/1614997.png" alt="Ticket Icon" />
                  </span>
                  <span className={styles.infoText}>เข้าชมฟรี</span>
                </div>

                <div className={styles.facilitiesSection}>
                  <h4 className={styles.facilitiesTitle}>สิ่งอำนวยความสะดวก:</h4>
                  <div className={styles.facilitiesList}>
                    <span className={styles.facilityTag}>จุดถ่ายรูป</span>
                    <span className={styles.facilityTag}>ป้ายข้อมูล</span>
                    <span className={styles.facilityTag}>ที่นั่งพักผ่อน</span>
                    <span className={styles.facilityTag}>แสงไฟส่องสว่าง</span>
                  </div>
                </div>
                
                <div className={styles.actionButtons}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewPlace('three-kings-monument')}
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
              
              <div className={styles.destinationRating}>
                <div className={styles.ratingScore}>4.3</div>
                <div className={styles.ratingText}>ดี</div>
                <div className={styles.reviewCount}>680 รีวิว</div>
              </div>
            </div>

            {/* Destination Item 3 */}
            <div className={styles.destinationItem}>
              <div className={styles.destinationImage}>
                <img src="https://image-tc.galaxy.tf/wijpeg-e07rgtlimh9ajqyiylwv7r49t/wat-chedi-luang_standard.jpg?crop=112%2C0%2C1777%2C1333" alt="วัดเจดีย์หลวง" />
              </div>
              <div className={styles.destinationInfo}>
                <h3 className={styles.destinationTitle}>วัดเจดีย์หลวง</h3>
                
                <div className={styles.historySection}>
                  <p className={styles.historyText}>
                    สร้างขึ้นในสมัยพญาแสนเมืองมา ราวปี พ.ศ. 1954-1981 เป็นวัดเก่าแก่ที่มีเจดีย์องค์ใหญ่สูง 86 เมตร 
                    เคยเป็นที่ประดิษฐานพระแก้วมรกต
                  </p>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>
                    <img src="https://cdn-icons-png.flaticon.com/128/526/526754.png" alt="Distance Icon" />
                  </span>
                  <span className={styles.infoText}>ห่างจากใจกลางเมือง 1 กิโลเมตร</span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>
                    <img src="https://cdn-icons-png.flaticon.com/128/1614/1614997.png" alt="Ticket Icon" />
                  </span>
                  <span className={styles.infoText}>เข้าชมฟรี</span>
                </div>

                <div className={styles.facilitiesSection}>
                  <h4 className={styles.facilitiesTitle}>สิ่งอำนวยความสะดวก:</h4>
                  <div className={styles.facilitiesList}>
                    <span className={styles.facilityTag}>ที่จอดรถ</span>
                    <span className={styles.facilityTag}>ห้องน้ำ</span>
                    <span className={styles.facilityTag}>ร้านขายของที่ระลึก</span>
                    <span className={styles.facilityTag}>ป้ายข้อมูลประวัติ</span>
                    <span className={styles.facilityTag}>ที่พักพิง</span>
                  </div>
                </div>
                
                <div className={styles.actionButtons}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewPlace('wat-chedi-luang')}
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
              
              <div className={styles.destinationRating}>
                <div className={styles.ratingScore}>4.6</div>
                <div className={styles.ratingText}>ดีเยี่ยม</div>
                <div className={styles.reviewCount}>920 รีวิว</div>
              </div>
            </div>

            {/* Destination Item 4 */}
            <div className={styles.destinationItem}>
              <div className={styles.destinationImage}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6c/Wat_Phra_Sing%2C_Chiang_Mai_%28I%29.jpg" alt="วัดพระสิงห์วรมหาวิหาร" />
              </div>
              <div className={styles.destinationInfo}>
                <h3 className={styles.destinationTitle}>วัดพระสิงห์วรมหาวิหาร</h3>
                
                <div className={styles.historySection}>
                  <p className={styles.historyText}>
                    สร้างขึ้นในปี พ.ศ. 1888 โดยพญากำฟู เป็นวัดหลวงที่มีความสำคัญทางประวัติศาสตร์และศิลปกรรม 
                    เป็นที่ประดิษฐานพระพุทธสิงห์ซึ่งเป็นพระพุทธรูปคู่บ้านคู่เมืองของเชียงใหม่
                  </p>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>
                    <img src="https://cdn-icons-png.flaticon.com/128/526/526754.png" alt="Distance Icon" />
                  </span>
                  <span className={styles.infoText}>ห่างจากใจกลางเมือง 0.8 กิโลเมตร</span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>
                    <img src="https://cdn-icons-png.flaticon.com/128/1614/1614997.png" alt="Ticket Icon" />
                  </span>
                  <span className={styles.infoText}>เข้าชมฟรี</span>
                </div>

                <div className={styles.facilitiesSection}>
                  <h4 className={styles.facilitiesTitle}>สิ่งอำนวยความสะดวก:</h4>
                  <div className={styles.facilitiesList}>
                    <span className={styles.facilityTag}>ที่จอดรถ</span>
                    <span className={styles.facilityTag}>ห้องน้ำ</span>
                    <span className={styles.facilityTag}>พิพิธภัณฑ์</span>
                    <span className={styles.facilityTag}>ไกด์ท้องถิ่น</span>
                    <span className={styles.facilityTag}>ร้านขายของที่ระลึก</span>
                  </div>
                </div>
                
                <div className={styles.actionButtons}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewPlace('wat-phra-singh')}
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
              
              <div className={styles.destinationRating}>
                <div className={styles.ratingScore}>4.7</div>
                <div className={styles.ratingText}>ดีเยี่ยม</div>
                <div className={styles.reviewCount}>1,150 รีวิว</div>
              </div>
            </div>
          </div>

          {/* Show More Button */}
          <button className={styles.showMoreButton} onClick={handleShowMoreResults}>
            แสดงผลลัพธ์เพิ่มเติม
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewDestinations;