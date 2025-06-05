// ยังไม่แยก nav and footer เป็น components แยกออกมา
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/results-after-search.module.css";
import Header from "../components/navigation";

const DestinationList = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(""); 
  const [selectedDistance, setSelectedDistance] = useState(""); 
  const [selectedBudget, setSelectedBudget] = useState("");     
  const [sortBy, setSortBy] = useState(""); 
  const [locations, setLocations] = useState([]);
  const [reviewStats, setReviewStats] = useState({}); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);

  // ดึงข้อมูลสถานที่
  const fetchLocations = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (params.name && params.name !== "") queryParams.append('name', params.name);
      if (params.tag && params.tag !== "" && params.tag !== "ทั้งหมด") queryParams.append('tag', params.tag);
      if (params.distance_range && params.distance_range !== "" && params.distance_range !== "ทั้งหมด") queryParams.append('distance_range', params.distance_range);
      if (params.budget_range && params.budget_range !== "" && params.budget_range !== "ทั้งหมด") queryParams.append('budget_range', params.budget_range);

      const response = await fetch(`http://localhost:8080/locations/filter?${queryParams}`);
      if (!response.ok) throw new Error("ไม่สามารถดึงข้อมูลสถานที่ได้");
      const data = await response.json();
      setLocations(data || []);
      setTotalResults((data && data.length) || 0);

      fetchAllReviewStats(data || []);
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setLocations([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  // ดึง review stat 
  const fetchAllReviewStats = async (locations) => {
    const statsObj = {};
    await Promise.all(
      locations.map(async (loc) => {
        if (!loc.ID) return;
        try {
          const res = await fetch(`http://localhost:8080/location/${loc.ID}/review-stats`);
          if (res.ok) {
            const stat = await res.json();
            statsObj[loc.ID] = stat; 
          }
        } catch (e) {
          console.error(`Error fetching review stats for location ID ${loc.ID}:`, e);
          statsObj[loc.ID] = { average_rating: 0, total_reviews: 0 }; 
        }
      })
    );
    setReviewStats(statsObj);
  };

  const fetchLocationsBySeason = async (season) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8080/locations/season/${season}`);
      if (!response.ok) throw new Error("ไม่สามารถดึงข้อมูลสถานที่ตามฤดูได้");
      const data = await response.json();
      setLocations(data || []);
      setTotalResults((data && data.length) || 0);
      fetchAllReviewStats(data || []);
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setLocations([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    const { season, searchQuery, selectedCategory, selectedDistance, selectedBudget, sortBy: sortByQuery } = router.query;

    if (season) {
      setSearchQuery("");
      setSelectedCategory("");
      setSelectedDistance("");
      setSelectedBudget("");
      setSortBy("");
      fetchLocationsBySeason(season);
      return;
    }

    if (
      searchQuery !== undefined ||
      selectedCategory !== undefined ||
      selectedDistance !== undefined ||
      selectedBudget !== undefined ||
      sortByQuery !== undefined
    ) {
      setSearchQuery(searchQuery || "");
      setSelectedCategory(selectedCategory || "");
      setSelectedDistance(selectedDistance || "");
      setSelectedBudget(selectedBudget || "");
      setSortBy(sortByQuery || "");

      const searchParams = {
        name: (searchQuery || "").trim() || undefined,
        tag: selectedCategory && selectedCategory !== "" ? mapCategoryToTag(selectedCategory) : undefined,
        distance_range: selectedDistance && selectedDistance !== "" ? mapDistanceRange(selectedDistance) : undefined,
        budget_range: selectedBudget && selectedBudget !== "" ? mapBudgetRange(selectedBudget) : undefined
      };
      Object.keys(searchParams).forEach(key =>
        searchParams[key] === undefined && delete searchParams[key]
      );
      fetchLocations(searchParams);
      return;
    }

    // ถ้าไม่มี query string ให้ใช้ sessionStorage หรือ fetchLocations ตามเดิม
    const saved = sessionStorage.getItem("searchState");
    if (saved) {
      const state = JSON.parse(saved);
      setSearchQuery(state.searchQuery);
      setSelectedCategory(state.selectedCategory);
      setSelectedDistance(state.selectedDistance);
      setSelectedBudget(state.selectedBudget);
      setSortBy(state.sortBy);
      setLocations(state.locations);
      setTotalResults(state.totalResults);
      setReviewStats(state.reviewStats);
    } else {
      fetchLocations();
    }
  }, [router.isReady]);

  const getLocationImage = (location) => {
    if (location.images && location.images.length > 0) {
      return location.images[0].URL;
    }
    return "https://via.placeholder.com/300x200?text=No+Image";
  };

  const formatBudgetRange = (budgetRange) => {
    if (budgetRange === "ฟรี" || budgetRange === "0") {
      return "เข้าชมฟรี";
    }
    return `งบประมาณ ${budgetRange} บาท`;
  };

  // เพิ่ม logic สำหรับ "Latest"
  const sortLocations = (locations, sortBy, reviewStats) => {
    const sorted = [...locations];
    if (sortBy === "Price") {
      sorted.sort((a, b) => {
        const getMin = (range) => {
          if (!range) return 0;
          if (range.includes("+")) return parseInt(range.replace("+", ""));
          return parseInt(range.split("-")[0]);
        };
        return getMin(a.budget_range) - getMin(b.budget_range);
      });
    } else if (sortBy === "Distance") {
      sorted.sort((a, b) => (a.DistanceFromCity ?? 0) - (b.DistanceFromCity ?? 0));
    } else if (sortBy === "Rating") {
      sorted.sort((a, b) => {
        const aRating = reviewStats[a.ID]?.average_rating ?? 0;
        const bRating = reviewStats[b.ID]?.average_rating ?? 0;
        return bRating - aRating;
      });
    } else if (sortBy === "Latest") {
      sorted.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
    }
    return sorted;
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    const searchParams = {
      name: searchQuery.trim() || undefined,
      tag: selectedCategory && selectedCategory !== "" ? mapCategoryToTag(selectedCategory) : undefined,
      distance_range: selectedDistance && selectedDistance !== "" ? mapDistanceRange(selectedDistance) : undefined,
      budget_range: selectedBudget && selectedBudget !== "" ? mapBudgetRange(selectedBudget) : undefined
    };

    Object.keys(searchParams).forEach(key =>
      searchParams[key] === undefined && delete searchParams[key]
    );

    console.log("Searching for:", searchParams);
    await fetchLocations(searchParams);
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleFavouritesClick = () => {
    router.push('/favourites');
  };

  const handleViewPlace = (id) => {
    // เก็บ state ลง sessionStorage
    sessionStorage.setItem("searchState", JSON.stringify({
      searchQuery,
      selectedCategory,
      selectedDistance,
      selectedBudget,
      sortBy,
      locations,
      totalResults,
      reviewStats
    }));
    router.push(`/story-page?id=${id}`);
  };

  const handleShowMoreResults = () => {
    console.log("Loading more results...");
  };

  const mapCategoryToTag = (category) => {
    const categoryMap = {
      "ธรรมชาติ": "Nature",
      "วัฒนธรรม": "Culture",
      "อาหาร": "Food",
      "ผจญภัย": "Adventure"
    };
    return categoryMap[category] || category;
  };

  const mapDistanceRange = (distance) => {
    const distanceMap = {
      "0 กิโลเมตร": "0 km",
      "0-10 กิโลเมตร": "0-10 km",
      "11-20 กิโลเมตร": "11-20 km",
      "21+ กิโลเมตร": "21+ km"
    };
    return distanceMap[distance] || distance;
  };

  const mapBudgetRange = (budget) => {
    const budgetMap = {
      "ฟรี": "0-0",
      "0 - 2,000 บาท": "0-2000",
      "2,001 - 5,000 บาท": "2000-5000",
      "5,001 - 10,000 บาท": "5000-10000",
      "10,001+ บาท": "10000+"
    };
    return budgetMap[budget] || budget;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
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
                <option value="">ทั้งหมด</option>
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
                <option value="">ทั้งหมด</option>
                <option value="0 กิโลเมตร">0 กิโลเมตร</option>
                <option value="0-10 กิโลเมตร">0-10 กิโลเมตร</option>
                <option value="11-20 กิโลเมตร">11-20 กิโลเมตร</option>
                <option value="21+ กิโลเมตร">21+ กิโลเมตร</option>
              </select>
            </div>

            <div className={styles.searchField}>
              <label>งบประมาณ</label>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className={!selectedBudget ? styles.placeholderSelect : ""}
              >
                <option value="">ทั้งหมด</option>
                <option value="ฟรี">ฟรี</option>
                <option value="0 - 2,000 บาท">0 - 2,000 บาท</option>
                <option value="2,001 - 5,000 บาท">2,001 - 5,000 บาท</option>
                <option value="5,001 - 10,000 บาท">5,001 - 10,000 บาท</option>
                <option value="10,001+ บาท">10,001+ บาท</option>
              </select>
            </div>

            <button type="submit" className={styles.searchButton} disabled={loading}>
              {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className={styles.resultsContainer}>
          <div className={styles.resultsHeader}>
            <div className={styles.resultsCount}>
              แสดงสถานที่ <strong>{locations.length}</strong> จากทั้งหมด <strong>{totalResults}</strong> แห่ง
            </div>
            <div className={styles.sortContainer}>
              <span>จัดเรียงตาม:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="">แนะนำ</option>
                <option value="Latest">ล่าสุด</option>
                <option value="Price">ราคา</option>
                <option value="Distance">ระยะทาง</option>
                <option value="Rating">ระดับคะแนน</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className={styles.loadingState}>
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={styles.errorState}>
              <p>เกิดข้อผิดพลาด: {error}</p>
              <button onClick={() => fetchLocations()}>ลองใหม่</button>
            </div>
          )}

          {/* Destination List */}
          {!loading && !error && (
            <div className={styles.destinationList}>
              {console.log("locations from API:", locations)}
              {locations.length > 0 ? (
                sortLocations(locations, sortBy, reviewStats).map((locations, index) => {
                  const stat = reviewStats[locations.ID] || {};
                  console.log(`รีวิวของสถานที่ ${locations.name} (ID: ${locations.ID}):`, stat);

                  return (
                    <div key={locations.ID || index} className={styles.favouriteItem}>
                      <div className={styles.favouriteImage}>
                        <img
                          src={getLocationImage(locations)}
                          alt={locations.name || 'สถานที่ท่องเที่ยว'}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                          }}
                        />
                      </div>
                      <div className={styles.favouriteInfo}>
                        <h3 className={styles.favouriteTitle}>
                          {locations.name || 'ไม่มีชื่อสถานที่'}
                        </h3>
                        <div className={styles.infoItem}>
                          <span className={styles.infoIcon}>
                            <img src="https://cdn-icons-png.flaticon.com/128/526/526754.png" alt="Car Icon" />
                          </span>
                          <span className={styles.infoText}>
                            ห่างจากใจกลางเมือง {locations.distance ?? 0} กิโลเมตร
                          </span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoIcon}>
                            <img src="https://cdn-icons-png.flaticon.com/128/1614/1614997.png" alt="Ticket Icon" />
                          </span>
                          <span className={styles.infoText}>
                            {formatBudgetRange(locations.budget_range)}
                          </span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoIcon}>
                            <img src="https://cdn-icons-png.flaticon.com/128/2972/2972531.png" alt="Time Icon" />
                          </span>
                          <span className={styles.infoText}>
                            เปิดทำการ {locations.open_time} - {locations.close_time} น.
                          </span>
                        </div>
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.viewButton}
                            onClick={() => handleViewPlace(location.ID)}
                          >
                            ชมสถานที่
                          </button>
                        </div>
                      </div>

                      <div className={styles.destinationRating}>
                        <div className={styles.ratingScore}>
                          {stat.average_rating ? stat.average_rating.toFixed(1) : '0.0'}
                        </div>
                        <div className={styles.ratingText}>
                          {stat.average_rating >= 4.5 ? 'ดีเยี่ยม' :
                            stat.average_rating >= 4.0 ? 'ดี' :
                              stat.average_rating >= 3.0 ? 'พอใช้' : 'ต้องปรับปรุง'}
                        </div>
                        <div className={styles.reviewCount}>
                          {stat.total_reviews || 0} รีวิว
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={styles.noResults}>
                  <p>ไม่พบสถานที่ท่องเที่ยวที่ตรงกับเงื่อนไขการค้นหา</p>
                </div>
              )}
            </div>
          )}

          {/* Show More Button */}
          {locations.length > 0 && (
            <button className={styles.showMoreButton} onClick={handleShowMoreResults}>
              แสดงผลลัพธ์เพิ่มเติม
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default DestinationList;