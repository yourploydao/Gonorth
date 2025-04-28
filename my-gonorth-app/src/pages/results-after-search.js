// ยังไม่แยก nav and footer เป็น components แยกออกมา
import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/results-after-search.module.css";

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
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <img src="/assets/gonorth-logo.png" alt="GONORTH" className={styles.logoImage} />
        </div>
        <div className={styles.headerButtons}>
          <a href="/favourites" className={styles.favouritesButton}>
            <img 
              src="https://cdn-icons-png.flaticon.com/128/2550/2550290.png" 
              alt="Heart" 
              className={styles.heartIcon} 
            /> Favourites
          </a>
          {/* Divider between favourites and profile */}
          <div className={styles.headerDivider}></div>
          <div className={styles.userProfile} onClick={handleProfileClick}>
            <img src="/assets/Profile.jpg" alt="John D." className={styles.profileImage} />
            <span className={styles.profileName}>John D.</span>
          </div>
        </div>
      </header>

      <div className={styles.mainContent}>
        {/* Search Box */}
        <div className={styles.destinationSearchContainer}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchField}>
              <label>Search</label>
              <div className={styles.inputWithIcon}>
                <input 
                  type="text" 
                  placeholder="Your new journey..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className={styles.searchIcon}>🔍</span>
              </div>
            </div>

            <div className={styles.searchField}>
              <label>Categories</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={!selectedCategory ? styles.placeholderSelect : ""}
              >
                <option value="" disabled style={!selectedCategory ? placeholderStyle : {}}>Select</option>
                <option value="Nature">Nature</option>
                <option value="Culture">Culture</option>
                <option value="Food">Food</option>
                <option value="Adventure">Adventure</option>
              </select>
            </div>

            <div className={styles.searchField}>
              <label>Distance from city center</label>
              <select 
                value={selectedDistance}
                onChange={(e) => setSelectedDistance(e.target.value)}
                className={!selectedDistance ? styles.placeholderSelect : ""}
              >
                <option value="" disabled style={!selectedDistance ? placeholderStyle : {}}>Select</option>
                <option value="0 km">0 km</option>
                <option value="0-5 km">0-5 km</option>
                <option value="5-10 km">5-10 km</option>
                <option value="10+ km">10+ km</option>
              </select>
            </div>

            <div className={styles.searchField}>
              <label>Budget</label>
              <select 
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className={!selectedBudget ? styles.placeholderSelect : ""}
              >
                <option value="" disabled style={!selectedBudget ? placeholderStyle : {}}>Select</option>
                <option value="0 - 2,000 THB">0 - 2,000 THB</option>
                <option value="2,000 - 5,000 THB">2,000 - 5,000 THB</option>
                <option value="5,000 - 10,000 THB">5,000 - 10,000 THB</option>
                <option value="10,000+ THB">10,000+ THB</option>
              </select>
            </div>

            <button type="submit" className={styles.searchButton}>Search</button>
          </form>
        </div>

        {/* Results Section */}
        <div className={styles.resultsContainer}>
          <div className={styles.resultsHeader}>
            <div className={styles.resultsCount}>Showing <strong>4</strong> of <strong>20</strong> places</div>
            <div className={styles.sortContainer}>
              <span>Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="Recommended">Recommended</option>
                <option value="Price">Price</option>
                <option value="Distance">Distance</option>
                <option value="Rating">Rating</option>
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
                  <span className={styles.infoIcon}>🚗</span>
                  <span className={styles.infoText}>20 km from city center</span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>🎫</span>
                  <span className={styles.infoText}>Free entrance</span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>🕒</span>
                  <span className={styles.infoText}>Open 09:00 am - 16:00 pm</span>
                </div>
                
                <div className={styles.actionButtons}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewPlace('grand-canyon-chiangmai')}
                  >
                    View Place
                  </button>
                </div>
              </div>
              
              <div className={styles.destinationRating}>
                <div className={styles.ratingScore}>5.0</div>
                <div className={styles.ratingText}>Very Good</div>
                <div className={styles.reviewCount}>25 reviews</div>
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
                  <span className={styles.infoIcon}>🚗</span>
                  <span className={styles.infoText}>20 km from city center</span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>🎫</span>
                  <span className={styles.infoText}>Free entrance</span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>🕒</span>
                  <span className={styles.infoText}>Open 09:00 am - 16:00 pm</span>
                </div>
                
                <div className={styles.actionButtons}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewPlace('mon-hong-waterfall')}
                  >
                    View Place
                  </button>
                </div>
              </div>
              
              <div className={styles.destinationRating}>
                <div className={styles.ratingScore}>4.5</div>
                <div className={styles.ratingText}>Very Good</div>
                <div className={styles.reviewCount}>15 reviews</div>
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
                  <span className={styles.infoIcon}>🚗</span>
                  <span className={styles.infoText}>20 km from city center</span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>🎫</span>
                  <span className={styles.infoText}>Free entrance</span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>🕒</span>
                  <span className={styles.infoText}>Open 08:00 am - 17:00 pm</span>
                </div>
                
                <div className={styles.actionButtons}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewPlace('suan-bo-kaew')}
                  >
                    View Place
                  </button>
                </div>
              </div>
              
              <div className={styles.destinationRating}>
                <div className={styles.ratingScore}>4.2</div>
                <div className={styles.ratingText}>Very Good</div>
                <div className={styles.reviewCount}>12 reviews</div>
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
                  <span className={styles.infoIcon}>🚗</span>
                  <span className={styles.infoText}>20 km from city center</span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>🎫</span>
                  <span className={styles.infoText}>Free entrance</span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>🕒</span>
                  <span className={styles.infoText}>Open 09:00 am - 16:00 pm</span>
                </div>
                
                <div className={styles.actionButtons}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewPlace('hydrangea-royal-project')}
                  >
                    View Place
                  </button>
                </div>
              </div>
              
              <div className={styles.destinationRating}>
                <div className={styles.ratingScore}>4.0</div>
                <div className={styles.ratingText}>Very Good</div>
                <div className={styles.reviewCount}>8 reviews</div>
              </div>
            </div>
          </div>

          {/* Show More Button */}
          <button className={styles.showMoreButton} onClick={handleShowMoreResults}>
            Show more results
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <img src="/assets/gonorth-logo.png" alt="GONORTH" className={styles.footerLogoImage} />
          </div>
          
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>Explore & Experience</h3>
            <ul className={styles.footerLinks}>
              <li><a href="/explore/mountain-views">Mountain & Scenic Views</a></li>
              <li><a href="/explore/eco-tourism">Nature & Eco Tourism</a></li>
              <li><a href="/explore/cultural-sites">Cultural & Heritage Sites</a></li>
              <li><a href="/explore/cafes">Gardens & Cafés</a></li>
              <li><a href="/explore/adventure">Adventure & Outdoor Activities</a></li>
            </ul>
          </div>
          
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>Contact Us</h3>
            <p className={styles.contactInfo}>
              King Mongkut's University of Technology Thonburi<br />
              126 Pracha Uthit Rd,<br />
              Khwaeng Bang Mot,<br />
              Khet Thung Khru, Bangkok 10140
            </p>
          </div>
          
          <div className={styles.footerSection}>
            <p className={styles.contactDetail}>
              Email: athitan.maha@kmutt.ac.th<br />
              Tel: 099-9999999
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DestinationList;