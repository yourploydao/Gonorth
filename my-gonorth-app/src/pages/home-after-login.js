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
  const [latestLocations, setLatestLocations] = useState([]);
  const [randomLocations, setRandomLocations] = useState([]);

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
                      Show Detail
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
            <h2 className={styles.sectionTitle}>New Journey</h2>
            <p className={styles.sectionSubtitle}>Welcome to the new journey</p>
            <a href="/summer-trips" className={styles.seeMoreLink}>See more places</a> 
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
                      onClick={() => handleDestinationClick(location.ID)}
                    >
                      Show Detail
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

export default HomeAfterAuthen;