// ยังไม่แยก nav and footer เป็น components แยกออกมา
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/home-before-login.module.css";

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
          <a href="/login" className={styles.loginButton}>Login</a>
          <a href="/signup" className={styles.signupButton}>Sign up</a>
        </div>
      </header>

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

              <button type="submit" className={styles.searchButton}>Search</button>
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
                      onClick={() => handleDestinationClick()}
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
                      onClick={() => handleDestinationClick()}
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

export default HomeBeforeAuthen;