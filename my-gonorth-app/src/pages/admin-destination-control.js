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

  // Mock data - replace with actual API calls
  const mockDestinations = [
    {
      id: "01",
      placeName: "วัดพระแก้ว",
      category: "Culture",
      image: "/assets/destination-placeholder.png"
    },
    {
      id: "02",
      placeName: "เขาใหญ่",
      category: "Nature",
      image: "/assets/destination-placeholder.png"
    },
    {
      id: "03",
      placeName: "ตลาดจตุจักร",
      category: "Food",
      image: "/assets/destination-placeholder.png"
    },
    {
      id: "04",
      placeName: "สะพานข้ามแคว",
      category: "Adventure",
      image: "/assets/destination-placeholder.png"
    },
    {
      id: "05",
      placeName: "อุทยานแห่งชาติดอยอินทนนท์",
      category: "Nature",
      image: "/assets/destination-placeholder.png"
    },
    {
      id: "06",
      placeName: "พระราชวังใหญ่",
      category: "Culture",
      image: "/assets/destination-placeholder.png"
    },
    {
      id: "07",
      placeName: "ลิงแสมสน",
      category: "Food",
      image: "/assets/destination-placeholder.png"
    },
    {
      id: "08",
      placeName: "เขื่อนศรีนครินทร์",
      category: "Adventure",
      image: "/assets/destination-placeholder.png"
    }
  ];

  useEffect(() => {
    // Simulate API call
    setDestinations(mockDestinations);
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
      const matchesSearch = destination.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           destination.placeName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "all" || destination.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

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
    // Navigate to edit page with destination ID
    router.push(`/admin-destination-edit?id=${destination.id}`);
  };

  const handleDeleteDestination = (destination) => {
    setDestinationToDelete(destination);
    setIsConfirmingDelete(true);
  };

  const confirmDeleteDestination = () => {
    setDestinations(prev => prev.filter(destination => destination.id !== destinationToDelete.id));
    setSelectedDestinations(prev => prev.filter(id => id !== destinationToDelete.id));
    setIsConfirmingDelete(false);
    setDestinationToDelete(null);
  };

  const handleBulkDelete = () => {
    if (selectedDestinations.length === 0) return;
    setIsConfirmingBulkDelete(true);
  };

  const confirmBulkDelete = () => {
    setDestinations(prev => prev.filter(destination => !selectedDestinations.includes(destination.id)));
    setSelectedDestinations([]);
    setIsConfirmingBulkDelete(false);
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
              onClick={() => router.push('/admin-profile')}
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