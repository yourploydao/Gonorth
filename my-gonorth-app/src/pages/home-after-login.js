// ยังไม่แยก nav and footer เป็น components แยกออกมา
import { useState } from "react";
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

  const handleDestinationC = (destination) => {
    router.push(`/destination/${destination}`);
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleFavouritesClick = () => {
    router.push('/favourites');
  };

  return (
    <div className={styles.container}>
      {/* Use the Header component */}
      <Header />

      {/* The rest of the component remains the same... */}
      <div className={styles.mainContent}>
        {/* Hero Section with Rounded Corners */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h2 className={styles.heroSubtitle}>Helping You</h2>
            <h1 className={styles.heroTitle}>GO BEYOND, GO NORTH</h1>
            <p className={styles.heroText}>Experience Chiang Mai Like Never Before</p>
          </div>
        </section>

        {/* Search Box - Overlapping the hero image */}
        <div className={styles.searchBoxWrapper}>
          <div className={styles.searchBox}>
            <h3 className={styles.searchTitle}>Find your new destinations?</h3>
            
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
                >
                  <option value="" disabled>Select</option>
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
                >
                  <option value="" disabled>Select</option>
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
                >
                  <option value="" disabled>Select</option>
                  <option value="0 - 2,000 THB">0 - 2,000 THB</option>
                  <option value="2,000 - 5,000 THB">2,000 - 5,000 THB</option>
                  <option value="5,000 - 10,000 THB">5,000 - 10,000 THB</option>
                  <option value="10,000+ THB">10,000+ THB</option>
                </select>
              </div>

              <button onClick={handleSearchClick} className={styles.searchButton}>Search</button>
            </form>
          </div>
        </div>

        {/* New Destinations Section */}
        <section className={styles.destinationsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>New Destinations</h2>
            <p className={styles.sectionSubtitle}>Search for New destinations</p>
            <a href="/destinations" className={styles.seeMoreLink}>See more places</a>
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
                    Show Detail
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
                    Show Detail
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
                    Show Detail
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Summer Trip Section */}
        <section className={styles.destinationsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Plan Your Summer Perfect Trip</h2>
            <p className={styles.sectionSubtitle}>Search Places most recommendation destinations</p>
            <a href="/summer-trips" className={styles.seeMoreLink}>See more places</a>
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
                    Show Detail
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
                    Show Detail
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.destinationCard}>
              <div className={styles.cardImage} style={{ backgroundImage: `url('https://jjubbbbb.wordpress.com/wp-content/uploads/2016/11/grand-canyon-of-chiang-mai2.jpg')` }}>
              {/* <div className={styles.cardImage} style={{ backgroundImage: `url('https://via.placeholder.com/300x200')` }}></div> */}
                <div className={styles.cardOverlay}>
                  <h3 className={styles.cardTitle}>แกรนด์แคนยอน เชียงใหม่</h3>
                  <button 
                    className={styles.showDetailButton}
                    onClick={() => handleDestinationClick('grand-canyon-chiangmai')}
                  >
                    Show Detail
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