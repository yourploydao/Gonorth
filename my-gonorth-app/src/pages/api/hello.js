export default async function handler(req, res) {
  if (req.method === "POST") {
    // เช็คว่าเป็นการ login หรือไม่
    if (req.url === "/api/hello") {
      const response = await fetch("http://localhost:8080/api/hello", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });

      const data = await response.json();
      return res.status(200).json(data);
    }

    if (req.url === "/api/login") {
      // ตัวอย่างข้อมูล user (ในระบบจริงควรเช็คจาก DB)
      const { username, password } = req.body;

      if (username === "admin" && password === "password") {
        return res.status(200).json({ message: "Login successful", token: "fake-jwt-token" });
      } else {
        return res.status(401).json({ error: "Invalid credentials" });
      }
    }
  }

  if (req.method === "GET") {
    return res.status(200).json({ message: "Hello from Next.js API!" });
  }

  // ถ้าเป็น Method อื่น (PUT, DELETE) ให้ Error 405
  return res.status(405).json({ error: "Method Not Allowed" });
}

//try to connect with go
