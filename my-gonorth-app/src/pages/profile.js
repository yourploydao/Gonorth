import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminProfile from "./admin-profile-page";
import UserProfile from "./user-profile-page"; 

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push("/login");
    }
  }, []);

  if (!user) return <div>Loading...</div>;
  console.log("user from localStorage:", user);
  // เลือกหน้า profile ตาม role
  if (user.role === "admin") {
    return <AdminProfile />;
  }
  return <UserProfile />;
};

export default ProfilePage;