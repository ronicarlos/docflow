const fetch = require("node-fetch");

async function simulateLogin() {
  try {
    console.log(" Attempting login...");
    
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@docflow.com",
        password: "admin123"
      })
    });
    
    const data = await response.text();
    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));
    console.log("Response body:", data);
    
    if (response.ok) {
      console.log(" Login successful!");
      const cookies = response.headers.get("set-cookie");
      if (cookies) {
        console.log(" Session cookie:", cookies);
      }
    } else {
      console.log(" Login failed");
    }
    
  } catch (error) {
    console.error("Error during login:", error);
  }
}

simulateLogin();
