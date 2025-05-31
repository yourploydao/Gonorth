import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/admin-user-management.module.css";
import Header from "../components/navigation";
import Footer from "../components/footer";

const AdminUserManagement = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isConfirmingBulkDelete, setIsConfirmingBulkDelete] = useState(false);
  const [sortField, setSortField] = useState('username');
  const [sortOrder, setSortOrder] = useState('asc');

  // Mock data - replace with actual API calls
  const mockUsers = [
    {
      id: 1,
      username: "สมชาย ใจดี",
      email: "somchai@example.com",
      role: "user",
      status: "active",
      profileImage: "/assets/profile-placeholder.png"
    },
    {
      id: 2,
      username: "สมหญิง รักสวย",
      email: "somying@example.com",
      role: "admin",
      status: "active",
      profileImage: "/assets/profile-placeholder.png"
    },
    {
      id: 3,
      username: "นาย ดีใจ",
      email: "nai.deejai@example.com",
      role: "user",
      status: "banned",
      profileImage: "/assets/profile-placeholder.png"
    },
    {
      id: 4,
      username: "นางสาว สุขใจ",
      email: "sukjai@example.com",
      role: "admin",
      status: "active",
      profileImage: "/assets/profile-placeholder.png"
    },
    {
      id: 5,
      username: "ป้าดับเพลิง",
      email: "firewoman@example.com",
      role: "user",
      status: "banned",
      profileImage: "/assets/profile-placeholder.png"
    },
    {
      id: 6,
      username: "นายหล่อ มากๆ",
      email: "handsome@example.com",
      role: "user",
      status: "active",
      profileImage: "/assets/profile-placeholder.png"
    },
    {
      id: 7,
      username: "คุณแม่ดี ใจงาม",
      email: "goodmother@example.com",
      role: "admin",
      status: "active",
      profileImage: "/assets/profile-placeholder.png"
    },
    {
      id: 8,
      username: "ลุงสมหวัง ปลื้มใจ",
      email: "uncle@example.com",
      role: "user",
      status: "banned",
      profileImage: "/assets/profile-placeholder.png"
    }
  ];

  useEffect(() => {
    // Simulate API call
    setUsers(mockUsers);
  }, []);

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    const filteredUsers = getFilteredUsers();
    const allIds = filteredUsers.map(user => user.id);
    setSelectedUsers(
      selectedUsers.length === allIds.length ? [] : allIds
    );
  };

  const getFilteredUsers = () => {
    let filtered = users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === "all" || user.role === filterRole;
      const matchesStatus = filterStatus === "all" || user.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort users
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

  const handleEditUser = (user) => {
    setEditingUser({...user});
    setIsEditingUser(true);
  };

  const handleSaveUser = () => {
    setUsers(prev => prev.map(user => 
      user.id === editingUser.id ? editingUser : user
    ));
    setIsEditingUser(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setIsConfirmingDelete(true);
  };

  const confirmDeleteUser = () => {
    setUsers(prev => prev.filter(user => user.id !== userToDelete.id));
    setSelectedUsers(prev => prev.filter(id => id !== userToDelete.id));
    setIsConfirmingDelete(false);
    setUserToDelete(null);
  };

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) return;
    
    switch (action) {
      case 'activate':
        setUsers(prev => prev.map(user => 
          selectedUsers.includes(user.id) ? {...user, status: 'active'} : user
        ));
        setSelectedUsers([]);
        break;
      case 'ban':
        setUsers(prev => prev.map(user => 
          selectedUsers.includes(user.id) ? {...user, status: 'banned'} : user
        ));
        setSelectedUsers([]);
        break;
      case 'delete':
        setIsConfirmingBulkDelete(true);
        break;
    }
  };

  const confirmBulkDelete = () => {
    setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
    setSelectedUsers([]);
    setIsConfirmingBulkDelete(false);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return styles.statusActive;
      case 'banned': return styles.statusBanned;
      default: return '';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return styles.roleAdmin;
      case 'user': return styles.roleUser;
      default: return '';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return 'ผู้ดูแลระบบ';
      case 'user': return 'ผู้ใช้ทั่วไป';
      default: return role;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'ใช้งาน';
      case 'banned': return 'ถูกระงับ';
      default: return status;
    }
  };

  const filteredUsers = getFilteredUsers();

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.mainContent}>
        {/* Header Section */}
        <div className={styles.pageHeader}>
          <div className={styles.headerTop}>
            <h1 className={styles.pageTitle}>จัดการผู้ใช้</h1>
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
              placeholder="ค้นหาผู้ใช้ (ชื่อ, อีเมล)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">บทบาททั้งหมด</option>
              <option value="admin">ผู้ดูแลระบบ</option>
              <option value="user">ผู้ใช้ทั่วไป</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="active">ใช้งาน</option>
              <option value="banned">ถูกระงับ</option>
            </select>
          </div>

          {selectedUsers.length > 0 && (
            <div className={styles.bulkActions}>
              <span className={styles.selectionCount}>
                เลือกแล้ว {selectedUsers.length} รายการ
              </span>
              <button 
                onClick={() => handleBulkAction('activate')}
                className={styles.bulkActionBtn}
              >
                เปิดใช้งาน
              </button>
              <button 
                onClick={() => handleBulkAction('ban')}
                className={styles.bulkActionBtn}
              >
                ระงับบัญชี
              </button>
              <button 
                onClick={() => handleBulkAction('delete')}
                className={`${styles.bulkActionBtn} ${styles.deleteBtn}`}
              >
                ลบ
              </button>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className={styles.tableContainer}>
          {filteredUsers.length > 0 ? (
            <table className={styles.usersTable}>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th 
                    onClick={() => handleSort('username')}
                    style={{ cursor: 'pointer' }}
                  >
                    ชื่อผู้ใช้ {sortField === 'username' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('email')}
                    style={{ cursor: 'pointer' }}
                  >
                    อีเมล {sortField === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('role')}
                    style={{ cursor: 'pointer' }}
                  >
                    บทบาท {sortField === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('status')}
                    style={{ cursor: 'pointer' }}
                  >
                    สถานะ {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                      />
                    </td>
                    <td className={styles.userName}>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`${styles.roleBadge} ${getRoleColor(user.role)}`}>
                        {getRoleText(user.role)}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(user.status)}`}>
                        {getStatusText(user.status)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => handleEditUser(user)}
                          className={styles.editBtn}
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className={styles.deleteBtn}
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
              ไม่พบข้อมูลผู้ใช้ที่ตรงกับเงื่อนไขการค้นหา
            </div>
          )}
        </div>

        {/* Edit User Modal */}
        {isEditingUser && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2 className={styles.modalTitle}>แก้ไขข้อมูลผู้ใช้</h2>
              <div className={styles.modalContent}>
                <label className={styles.modalLabel}>ชื่อผู้ใช้</label>
                <input
                  type="text"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                  className={styles.modalInput}
                />
                
                <label className={styles.modalLabel}>อีเมล</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className={styles.modalInput}
                />
                
                <label className={styles.modalLabel}>บทบาท</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  className={styles.modalInput}
                >
                  <option value="user">ผู้ใช้ทั่วไป</option>
                  <option value="admin">ผู้ดูแลระบบ</option>
                </select>
                
                <label className={styles.modalLabel}>สถานะ</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                  className={styles.modalInput}
                >
                  <option value="active">ใช้งาน</option>
                  <option value="banned">ถูกระงับ</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button
                  onClick={() => setIsEditingUser(false)}
                  className={styles.modalCancel}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveUser}
                  className={styles.modalSave}
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isConfirmingDelete && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2 className={styles.modalTitle}>ยืนยันการลบ</h2>
              <div className={styles.modalContent}>
                <p>คุณต้องการลบผู้ใช้ <strong>{userToDelete?.username}</strong> ใช่หรือไม่?</p>
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
                  onClick={confirmDeleteUser}
                  className={`${styles.modalSave} ${styles.confirmDelete}`}
                >
                  ลบ
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
                <p>คุณต้องการลบผู้ใช้ {selectedUsers.length} รายการที่เลือกใช่หรือไม่?</p>
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
                  ลบทั้งหมด
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminUserManagement;