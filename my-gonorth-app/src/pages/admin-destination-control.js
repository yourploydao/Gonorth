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
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const fetchDestinations = async () => {
      const res = await fetch("http://localhost:8080/locations/all");
      const data = await res.json();
      // แปลงข้อมูลให้ตรงกับที่ frontend ใช้
      const formatted = data.map(item => ({
        id: item.id || item.ID, 
        placeName: item.name || item.LocationsName || "", 
        category: item.tags && item.tags.length > 0 ? item.tags[0].TagName : "ไม่ระบุ", // ใช้ TagName
      }));
      setDestinations(formatted);
      console.log("Formatted destinations:", formatted);
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
      // ตรวจสอบว่ามี placeName ก่อน
      const name = destination.placeName || "";
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // ตัวอย่างสำหรับ filter category
    if (filterCategory !== "all") {
      filtered = filtered.filter(destination => {
        const category = destination.category || "";
        return category === filterCategory;
      });
    }

    // Sort destinations
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleEditDestination = (destination) => {
    router.push(`/admin-create-storypage?id=${destination.id}`);
  };

  const handleDeleteDestination = (destination) => {
    setDestinationToDelete(destination);
    setIsConfirmingDelete(true);
  };

  // ลบทีละรายการ
  const confirmDeleteDestination = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/locations/${destinationToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setDestinations(prev => prev.filter(destination => destination.id !== destinationToDelete.id));
        setSelectedDestinations(prev => prev.filter(id => id !== destinationToDelete.id));
        setIsConfirmingDelete(false);
        setDestinationToDelete(null);
      } else {
        alert("ลบสถานที่ท่องเที่ยวไม่สำเร็จ");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการลบสถานที่ท่องเที่ยว");
    }
  };

  const handleBulkDelete = () => {
    if (selectedDestinations.length === 0) return;
    setIsConfirmingBulkDelete(true);
  };

  // ลบหลายรายการ
  const confirmBulkDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/locations/bulk-delete`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedDestinations }),
      });
      if (res.ok) {
        setDestinations(prev => prev.filter(destination => !selectedDestinations.includes(destination.id)));
        setSelectedDestinations([]);
        setIsConfirmingBulkDelete(false);
      } else {
        alert("ลบสถานที่ท่องเที่ยวไม่สำเร็จ");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการลบสถานที่ท่องเที่ยว");
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Nature': return styles.categoryNature;
      case 'Culture': return styles.categoryCulture;
      case 'Food': return styles.categoryFood;
      case 'Adventure': return styles.categoryAdventure;
      default: return '';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'Nature': return 'ธรรมชาติ';
      case 'Culture': return 'วัฒนธรรม';
      case 'Food': return 'อาหาร';
      case 'Adventure': return 'ผจญภัย';
      default: return category;
    }
  };

  const filteredDestinations = getFilteredDestinations();

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        {/* Header Section */}
        <div className={styles.pageHeader}>
          <div className={styles.headerTop}>
            <h1 className={styles.pageTitle}>จัดการสถานที่ท่องเที่ยว</h1>
            <button 
              className={styles.backButton}
              onClick={() => router.push('/profile')}
            >
              กลับ
            </button>
          </div>
        </div>

        {/* Controls */}
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
              >
                ลบสถานที่ท่องเที่ยวที่เลือก
              </button>
            </div>
          )}
        </div>

        {/* Destinations Table */}
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
                    onClick={() => handleSort('id')}
                    style={{ cursor: 'pointer' }}
                  >
                    ไอดี {sortField === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('placeName')}
                    style={{ cursor: 'pointer' }}
                  >
                    ชื่อสถานที่ {sortField === 'placeName' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('category')}
                    style={{ cursor: 'pointer' }}
                  >
                    ประเภท {sortField === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
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
                      <span className={`${styles.categoryBadge} ${getCategoryColor(destination.category)}`}>
                        {getCategoryLabel(destination.category)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => handleEditDestination(destination)}
                          className={styles.editBtn}
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDeleteDestination(destination)}
                          className={styles.deleteBtn}
                        >
                          ลบสถานที่ท่องเที่ยว
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

        {/* Delete Confirmation Modal */}
        {isConfirmingDelete && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2 className={styles.modalTitle}>ยืนยันการลบ</h2>
              <div className={styles.modalContent}>
                <p>คุณต้องการลบสถานที่ท่องเที่ยว <strong>{destinationToDelete?.placeName}</strong> (ID: {destinationToDelete?.id}) ใช่หรือไม่?</p>
                <p className={styles.warningText}>การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
              </div>
              <div className={styles.modalActions}>
                <button
                  onClick={() => setIsConfirmingDelete(false)}
                  className={styles.modalCancel}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmDeleteDestination}
                  className={`${styles.modalSave} ${styles.confirmDelete}`}
                >
                  ลบสถานที่ท่องเที่ยว
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Delete Confirmation Modal */}
        {isConfirmingBulkDelete && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2 className={styles.modalTitle}>ยืนยันการลบหลายรายการ</h2>
              <div className={styles.modalContent}>
                <p>คุณต้องการลบสถานที่ท่องเที่ยว {selectedDestinations.length} รายการที่เลือกใช่หรือไม่?</p>
                <p className={styles.warningText}>การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
              </div>
              <div className={styles.modalActions}>
                <button
                  onClick={() => setIsConfirmingBulkDelete(false)}
                  className={styles.modalCancel}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmBulkDelete}
                  className={`${styles.modalSave} ${styles.confirmDelete}`}
                >
                  ลบสถานที่ท่องเที่ยวทั้งหมด
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