import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/admin-destination-control.module.css";

const AdminDestinationControl = () => {
  const router = useRouter();
  const [destinations, setDestinations] = useState([]);
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [destinationToDelete, setDestinationToDelete] = useState(null);
  const [isConfirmingBulkDelete, setIsConfirmingBulkDelete] = useState(false);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await fetch("http://localhost:8080/locations/all");
        if (!res.ok){
          console.error("Failed to fetch destinations");
        }
        const data = await res.json();
        const formatted = data.map(item => ({
          id: item.id || item.ID,
          placeName: item.name || item.LocationsName || "",
          categories: item.tags && typeof item.tags === "string" 
            ? item.tags.split(",").map(tag => tag.trim()).filter(Boolean) 
            : [],
        }));
        setDestinations(formatted);
        console.log("Formatted destinations:", formatted);
      } catch (err) {
        console.error("Error fetching destinations:", err);
        alert("ไม่สามารถโหลดข้อมูลสถานที่ท่องเที่ยวได้");
      }
    };
    fetchDestinations();
  }, []);

  const handleSelectDestination = (destinationId) => {
    setSelectedDestinations(prev =>
      prev.includes(destinationId)
        ? prev.filter(id => id !== destinationId)
        : [...prev, destinationId]
    );
  };

  const handleSelectAll = () => {
    const filteredDestinations = getFilteredDestinations();
    const allIds = filteredDestinations.map(destination => destination.id);
    setSelectedDestinations(
      selectedDestinations.length === allIds.length ? [] : allIds
    );
  };

  const getFilteredDestinations = () => {
    let filtered = destinations.filter(destination => {
      const name = destination.placeName || "";
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (filterCategory !== "all") {
      filtered = filtered.filter(destination =>
        destination.categories.includes(filterCategory)
      );
    }

    filtered.sort((a, b) => {
      let aValue = sortField === "categories"
        ? a.categories.join(", ")
        : a[sortField];
      let bValue = sortField === "categories"
        ? b.categories.join(", ")
        : b[sortField];
      
      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });

    return filtered;
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleEditDestination = (destination) => {
    router.push(`/admin-create-storypage?id=${destination.id}`);
  };

  const handleDeleteDestination = (destination) => {
    setDestinationToDelete(destination);
    setIsConfirmingDelete(true);
  };

  const confirmDeleteDestination = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("กรุณาเข้าสู่ระบบ");
      const res = await fetch(`http://localhost:8080/locations/${destinationToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setDestinations(prev => prev.filter(d => d.id !== destinationToDelete.id));
        setSelectedDestinations(prev => prev.filter(id => id !== destinationToDelete.id));
        setIsConfirmingDelete(false);
        setDestinationToDelete(null);
        alert("ลบสถานที่ท่องเที่ยวสำเร็จ");
      } else {
        const error = await res.json();
        alert(`ลบสถานที่ท่องเที่ยวไม่สำเร็จ: ${error.error || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์"}`);
      }
    } catch (err) {
      console.error("Error deleting destination:", err);
      alert(`เกิดข้อผิดพลาด: ${err.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = () => {
    if (selectedDestinations.length === 0) return;
    setIsConfirmingBulkDelete(true);
  };

  const confirmBulkDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("กรุณาเข้าสู่ระบบ");
      
      // Debug: ตรวจสอบข้อมูลที่จะส่ง
      const requestData = { ids: selectedDestinations };
      console.log("Sending data:", requestData);
      console.log("Selected destinations:", selectedDestinations);
      console.log("JSON string:", JSON.stringify(requestData));
      
      const res = await fetch(`http://localhost:8080/locations/bulk-delete`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });
      
      // Debug: ตรวจสอบ response
      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers);
      
      if (res.ok) {
        setDestinations(prev => prev.filter(d => !selectedDestinations.includes(d.id)));
        setSelectedDestinations([]);
        setIsConfirmingBulkDelete(false);
        alert("ลบสถานที่ท่องเที่ยวหลายรายการสำเร็จ");
      } else {
        const error = await res.json();
        console.error("Server error:", error);
        alert(`ลบสถานที่ท่องเที่ยวหลายรายการไม่สำเร็จ: ${error.error || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์"}`);
      }
    } catch (err) {
      console.error("Error bulk deleting:", err);
      alert(`เกิดข้อผิดพลาด: ${err.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Nature": return styles.categoryNature;
      case "Culture": return styles.categoryCulture;
      case "Food": return styles.categoryFood;
      case "Adventure": return styles.categoryAdventure;
      default: return styles.categoryDefault;
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case "Nature": return "ธรรมชาติ";
      case "Culture": return "วัฒนธรรม";
      case "Food": return "อาหาร";
      case "Adventure": return "ผจญภัย";
      default: return category;
    }
  };

  const filteredDestinations = getFilteredDestinations();

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <div className={styles.headerTop}>
            <h1 className={styles.pageTitle}>จัดการสถานที่ท่องเที่ยว</h1>
            <button 
              className={styles.backButton}
              onClick={() => router.push("/profile")}
            >
              กลับ
            </button>
          </div>
        </div>

        <div className={styles.controlsSection}>
          <div className={styles.searchFilters}>
            <input
              type="text"
              placeholder="ค้นหาสถานที่ท่องเที่ยว (ไอดี, ชื่อสถานที่)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">ประเภททั้งหมด</option>
              <option value="Nature">ธรรมชาติ</option>
              <option value="Culture">วัฒนธรรม</option>
              <option value="Food">อาหาร</option>
              <option value="Adventure">ผจญภัย</option>
            </select>
          </div>

          {selectedDestinations.length > 0 && (
            <div className={styles.bulkActions}>
              <span className={styles.selectionCount}>
                เลือกแล้ว {selectedDestinations.length} รายการ
              </span>
              <button 
                onClick={handleBulkDelete}
                className={`${styles.bulkActionBtn} ${styles.deleteBtn}`}
                disabled={isDeleting}
              >
                ลบสถานที่ท่องเที่ยวที่เลือก
              </button>
            </div>
          )}
        </div>

        <div className={styles.tableContainer}>
          {filteredDestinations.length > 0 ? (
            <table className={styles.destinationsTable}>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedDestinations.length === filteredDestinations.length && filteredDestinations.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th 
                    onClick={() => handleSort("id")}
                    style={{ cursor: "pointer" }}
                  >
                    ไอดี {sortField === "id" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th 
                    onClick={() => handleSort("placeName")}
                    style={{ cursor: "pointer" }}
                  >
                    ชื่อสถานที่ {sortField === "placeName" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th 
                    onClick={() => handleSort("categories")}
                    style={{ cursor: "pointer" }}
                  >
                    ประเภท {sortField === "categories" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredDestinations.map(destination => (
                  <tr key={destination.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedDestinations.includes(destination.id)}
                        onChange={() => handleSelectDestination(destination.id)}
                      />
                    </td>
                    <td className={styles.destinationId}>{destination.id}</td>
                    <td className={styles.destinationName}>{destination.placeName}</td>
                    <td>
                      {destination.categories.length > 0 ? (
                        destination.categories.map((tag, index) => (
                          <span 
                            key={index} 
                            className={`${styles.categoryBadge} ${getCategoryColor(tag)}`}
                          >
                            {getCategoryLabel(tag)}
                          </span>
                        ))
                      ) : (
                        <span className={`${styles.categoryBadge} ${styles.categoryDefault}`}>
                          ไม่ระบุ
                        </span>
                      )}
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => handleEditDestination(destination)}
                          className={styles.editBtn}
                          disabled={isDeleting}
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDeleteDestination(destination)}
                          className={styles.deleteBtn}
                          disabled={isDeleting}
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.noData}>
              ไม่พบข้อมูลสถานที่ท่องเที่ยวที่ตรงกับเงื่อนไขการค้นหา
            </div>
          )}
        </div>

        {isConfirmingDelete && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2 className={styles.modalTitle}>ยืนยันการลบ</h2>
              <div className={styles.modalContent}>
                <p>คุณต้องการลบสถานที่ท่องเที่ยว <strong>{destinationToDelete?.placeName}</strong> (ID: {destinationToDelete?.id}) ใช่หรือไม่?</p>
                <p className={styles.warningText}>การดำเนินการนี้จะลบข้อมูลที่เกี่ยวข้องทั้งหมดและไม่สามารถย้อนกลับได้</p>
              </div>
              <div className={styles.modalActions}>
                <button
                  onClick={() => setIsConfirmingDelete(false)}
                  className={styles.modalCancel}
                  disabled={isDeleting}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmDeleteDestination}
                  className={`${styles.modalSave} ${styles.confirmDelete}`}
                  disabled={isDeleting}
                >
                  {isDeleting ? "กำลังลบ..." : "ลบ"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isConfirmingBulkDelete && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2 className={styles.modalTitle}>ยืนยันการลบหลายรายการ</h2>
              <div className={styles.modalContent}>
                <p>คุณต้องการลบสถานที่ท่องเที่ยว {selectedDestinations.length} รายการที่เลือกใช่หรือไม่?</p>
                <p className={styles.warningText}>การดำเนินการนี้จะลบข้อมูลที่เกี่ยวข้องทั้งหมดและไม่สามารถย้อนกลับได้</p>
              </div>
              <div className={styles.modalActions}>
                <button
                  onClick={() => setIsConfirmingBulkDelete(false)}
                  className={styles.modalCancel}
                  disabled={isDeleting}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmBulkDelete}
                  className={`${styles.modalSave} ${styles.confirmDelete}`}
                  disabled={isDeleting}
                >
                  {isDeleting ? "กำลังลบ..." : "ลบทั้งหมด"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDestinationControl;