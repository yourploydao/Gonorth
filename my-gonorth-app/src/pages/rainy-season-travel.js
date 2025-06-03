import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/rainy-season-travel.module.css";

const RainySeasonTravel = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ในร่ม");
  const [selectedDistance, setSelectedDistance] = useState("0-10 km");
  const [selectedBudget, setSelectedBudget] = useState("0 - 3,000 THB");
  const [sortBy, setSortBy] = useState("แนะนำ");

  const placeholderStyle = { color: "#888" };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", {
      query: searchQuery,
      category: selectedCategory || "Not selected",
      distance: selectedDistance || "Not selected",
      budget: selectedBudget || "Not selected"
    });
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
    console.log("Loading more rainy season destinations...");
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>

        {/* Results Section */}
        <div className={styles.resultsContainer}>
          <div className={styles.resultsHeader}>
            <div className={styles.resultsCount}>แสดงสถานที่ <strong>4</strong> จากทั้งหมด <strong>15</strong> แห่ง</div>
            <div className={styles.sortContainer}>
              <span>จัดเรียงตาม:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="" disabled>ตัวเลือก</option>
                <option value="คะแนน">คะแนนรีวิว</option>
                <option value="ระยะทาง">ระยะทาง</option>
                <option value="งบประมาณ">ราคาเข้าชม</option>
              </select>
            </div>
          </div>

          {/* Destination List */}
          <div className={styles.destinationList}>
            {/* Destination Item 1 */}
            <div className={styles.destinationItem}>
              <div className={styles.destinationImage}>
                <img src="https://mycity.tataya.net/th/img_prod/c1436_p083500252_.jpg" alt="พิพิธภัณฑ์ศิลปะร่วมสมัยเชียงใหม่" />
              </div>
              <div className={styles.destinationInfo}>
                <h3 className={styles.destinationTitle}>พิพิธภัณฑ์ศิลปะร่วมสมัยเชียงใหม่</h3>
                
                <div className={styles.rainFeatureSection}>
                <div className={styles.rainIcon}>
                <img
                  src="https://cdn-icons-png.flaticon.com/128/4724/4724094.png"
                  alt="Rain"
                  width={40}
                  height={40}
                />
              </div>
                  <p className={styles.rainFeatureText}>
                    สถานที่ในร่มที่สมบูรณ์แบบสำหรับวันฝนตกรวมทั้ง ชื่นชมผลงานศิลปะร่วมสมัยของศิลปินเชียงใหม่และนานาชาติ 
                    พร้อมกิจกรรมเวิร์คช็อปและคาเฟ่บรรยากาศดี
                  </p>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>
                    <img src="https://cdn-icons-png.flaticon.com/128/526/526754.png" alt="Distance Icon" />
                  </span>
                  <span className={styles.infoText}>ห่างจากใจกลางเมือง 5 กิโลเมตร</span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>
                    <img src="https://cdn-icons-png.flaticon.com/128/1614/1614997.png" alt="Ticket Icon" />
                  </span>
                  <span className={styles.infoText}>ค่าเข้าชม 150 บาท (นักเรียน/นักศึกษา 80 บาท)</span>
                </div>

                <div className={styles.facilitiesSection}>
                  <h4 className={styles.facilitiesTitle}>สิ่งอำนวยความสะดวก:</h4>
                  <div className={styles.facilitiesList}>
                    <span className={styles.facilityTag}>ที่จอดรถ</span>
                    <span className={styles.facilityTag}>ร้านอาหาร</span>
                    <span className={styles.facilityTag}>ห้องน้ำ</span>
                    <span className={styles.facilityTag}>ร้านขายของที่ระลึก</span>
                  </div>
                </div>
                
                <div className={styles.actionButtons}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewPlace('maiiam-contemporary-art-museum')}
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
              
              <div className={styles.destinationRating}>
                <div className={styles.ratingScore}>4.7</div>
                <div className={styles.ratingText}>ดีเยี่ยม</div>
                <div className={styles.reviewCount}>890 รีวิว</div>
              </div>
            </div>

            {/* Destination Item 2 */}
            <div className={styles.destinationItem}>
              <div className={styles.destinationImage}>
                <img src="https://raintreehotelchiangmai.com/wp-content/uploads/2022/05/warorot-market-chiang-mai-thailand-july-downtown-area-where-locals-tourists-come-to-buy-variety-139385620_1280x720_acf_cropped-1.jpg" alt="ตลาดวโรรส" />
              </div>
              <div className={styles.destinationInfo}>
                <h3 className={styles.destinationTitle}>ตลาดวโรรส</h3>
                
                <div className={styles.rainFeatureSection}>
                <div className={styles.rainIcon}>
                <img
                  src="https://cdn-icons-png.flaticon.com/128/4724/4724094.png"
                  alt="Rain"
                  width={40}
                  height={40}
                />
              </div>
                  <p className={styles.rainFeatureText}>
                    ตลาดในร่มขนาดใหญ่ที่เปิดมาตั้งแต่ปี 1910 เหมาะสำหรับช้อปปิ้งในวันฝนตก มีสินค้าหลากหลาย 
                    อาหารท้องถิ่น และของที่ระลึกเชียงใหม่
                  </p>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>
                    <img src="https://cdn-icons-png.flaticon.com/128/526/526754.png" alt="Distance Icon" />
                  </span>
                  <span className={styles.infoText}>ห่างจากใจกลางเมือง 2 กิโลเมตร</span>
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
                    <span className={styles.facilityTag}>ร้านอาหาร</span>
                    <span className={styles.facilityTag}>ห้องน้ำ</span>
                    <span className={styles.facilityTag}>ร้านขายของที่ระลึก</span>
                  </div>
                </div>
                
                <div className={styles.actionButtons}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewPlace('warorot-market')}
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
              
              <div className={styles.destinationRating}>
                <div className={styles.ratingScore}>4.4</div>
                <div className={styles.ratingText}>ดี</div>
                <div className={styles.reviewCount}>1,240 รีวิว</div>
              </div>
            </div>

            {/* Destination Item 3 */}
            <div className={styles.destinationItem}>
              <div className={styles.destinationImage}>
                <img src="https://cms.dmpcdn.com/travel/2020/10/27/d4cd86a0-180e-11eb-ab84-d705c02e81b2_original.jpg" alt="น้ำตกแม่กำปอง" />
              </div>
              <div className={styles.destinationInfo}>
                <h3 className={styles.destinationTitle}>น้ำตกแม่กำปอง</h3>
                
                <div className={styles.rainFeatureSection}>
                <div className={styles.rainIcon}>
                <img
                  src="https://cdn-icons-png.flaticon.com/128/4724/4724094.png"
                  alt="Rain"
                  width={40}
                  height={40}
                />
              </div>
                  <p className={styles.rainFeatureText}>
                    ฤดูฝนคือช่วงที่น้ำตกสวยที่สุด น้ำตกแม่กำปองมีน้ำไหลเซาะแรงและทิวทัศน์เขียวขจี 
                    มีศาลาพักผ่อนและร้านอาหารบริเวณใกล้เคียง
                  </p>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>
                    <img src="https://cdn-icons-png.flaticon.com/128/526/526754.png" alt="Distance Icon" />
                  </span>
                  <span className={styles.infoText}>ห่างจากใจกลางเมือง 28 กิโลเมตร</span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>
                    <img src="https://cdn-icons-png.flaticon.com/128/1614/1614997.png" alt="Ticket Icon" />
                  </span>
                  <span className={styles.infoText}>ค่าเข้าชม 30 บาท</span>
                </div>

                <div className={styles.facilitiesSection}>
                  <h4 className={styles.facilitiesTitle}>สิ่งอำนวยความสะดวก:</h4>
                  <div className={styles.facilitiesList}>
                    <span className={styles.facilityTag}>ที่จอดรถ</span>
                    <span className={styles.facilityTag}>ร้านอาหาร</span>
                    <span className={styles.facilityTag}>ห้องน้ำ</span>
                    <span className={styles.facilityTag}>ร้านขายของที่ระลึก</span>
                  </div>
                </div>
                
                <div className={styles.actionButtons}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewPlace('mae-kampong-waterfall')}
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
              
              <div className={styles.destinationRating}>
                <div className={styles.ratingScore}>4.8</div>
                <div className={styles.ratingText}>ดีเยี่ยม</div>
                <div className={styles.reviewCount}>650 รีวิว</div>
              </div>
            </div>

            {/* Destination Item 4 */}
            <div className={styles.destinationItem}>
              <div className={styles.destinationImage}>
                <img src="https://shoppingcenter.centralpattana.co.th/images/default-source/central-chiangmai/thumbnail274a16de-5f8f-44b7-8758-de9897fb13cf.jpg?sfvrsn=726597ad_9" alt="เซ็นทรัลเฟสติวัล เชียงใหม่" />
              </div>
              <div className={styles.destinationInfo}>
                <h3 className={styles.destinationTitle}>เซ็นทรัลเฟสติวัล เชียงใหม่</h3>
                
                <div className={styles.rainFeatureSection}>
                <div className={styles.rainIcon}>
                <img
                  src="https://cdn-icons-png.flaticon.com/128/4724/4724094.png"
                  alt="Rain"
                  width={40}
                  height={40}
                />
              </div>
                  <p className={styles.rainFeatureText}>
                    ศูนย์การค้าขนาดใหญ่ที่มีทั้งร้านค้า ร้านอาหาร โรงภาพยนตร์ และกิจกรรมมากมาย 
                    เหมาะสำหรับการพักผ่อนทั้งวันในวันที่ฝนตกหนัก
                  </p>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>
                    <img src="https://cdn-icons-png.flaticon.com/128/526/526754.png" alt="Distance Icon" />
                  </span>
                  <span className={styles.infoText}>ห่างจากใจกลางเมือง 8 กิโลเมตร</span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>
                    <img src="https://cdn-icons-png.flaticon.com/128/1614/1614997.png" alt="Ticket Icon" />
                  </span>
                  <span className={styles.infoText}> เข้าชมฟรี (ค่าใช้จ่ายตามร้านค้า)</span>
                </div>

                <div className={styles.facilitiesSection}>
                  <h4 className={styles.facilitiesTitle}>สิ่งอำนวยความสะดวก:</h4>
                  <div className={styles.facilitiesList}>
                    <span className={styles.facilityTag}>ที่จอดรถ</span>
                    <span className={styles.facilityTag}>ร้านอาหาร</span>
                    <span className={styles.facilityTag}>ห้องน้ำ</span>
                    <span className={styles.facilityTag}>ร้านขายของที่ระลึก</span>
                  </div>
                </div>
                
                <div className={styles.actionButtons}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewPlace('central-festival-chiangmai')}
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
              
              <div className={styles.destinationRating}>
                <div className={styles.ratingScore}>4.5</div>
                <div className={styles.ratingText}>ดี</div>
                <div className={styles.reviewCount}>2,150 รีวิว</div>
              </div>
            </div>
          </div>

          {/* Show More Button */}
          <button className={styles.showMoreButton} onClick={handleShowMoreResults}>
            แสดงสถานที่เพิ่มเติม
          </button>
        </div>

        {/* Tips Section */}
        <div className={styles.tipsSection}>
          <h2 className={styles.tipsTitle}>เคล็ดลับการเที่ยวฤดูฝนในเชียงใหม่</h2>
          <div className={styles.tipsList}>
            <div className={styles.tipItem}>
            <div className={styles.tipIcon}>
                <img
                  src="https://cdn-icons-png.flaticon.com/128/949/949878.png"
                  alt="Umbrella"
                  width={45}
                  height={45}
                />
              </div>
              <div className={styles.tipContent}>
                <h4>เตรียมร่มและเสื้อกันฝน</h4>
                <p>ฝนในเชียงใหม่มักตกแบบปรอยสุก เตรียมอุปกรณ์กันฝนไว้เสมอ</p>
              </div>
            </div>
            <div className={styles.tipItem}>
            <div className={styles.tipIcon}>
                <img
                  src="https://cdn-icons-png.flaticon.com/128/8728/8728083.png"
                  alt="Time"
                  width={45}
                  height={45}
                />
              </div>
              <div className={styles.tipContent}>
                <h4>เลือกเวลาเที่ยวอย่างชาญฉลาด</h4>
                <p>ฝนมักตกช่วงบ่ายถึงเย็น เที่ยวตอนเช้าจะได้หลีกเลี่ยงฝน</p>
              </div>
            </div>
            <div className={styles.tipItem}>
            <div className={styles.tipIcon}>
                <img
                  src="https://cdn-icons-png.flaticon.com/128/1334/1334203.png"
                  alt="Time"
                  width={45}
                  height={45}
                />
              </div>
              <div className={styles.tipContent}>
                <h4>เลือกรองเท้าที่เหมาะสม</h4>
                <p>รองเท้ากันน้ำหรือแซนดัลจะช่วยให้เดินง่ายในหน้าฝน</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RainySeasonTravel;