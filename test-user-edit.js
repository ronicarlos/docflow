const fs = require('fs');

// Import fetch for Node.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testUserEdit() {
  try {
    console.log(" Testing user edit functionality...");
    
    // Read the session cookie
    const cookieContent = fs.readFileSync("cookies.txt", "utf8");
    const cookieLine = cookieContent.split("\n").find(line => line.includes("docflow-session"));
    
    if (!cookieLine) {
      console.log(" No session cookie found");
      return;
    }
    
    const sessionToken = cookieLine.split("\t").pop();
    console.log(" Session token found");
    
    // First, get the list of users to find a user ID
    console.log(" Getting users list...");
    const usersResponse = await fetch("http://localhost:3000/api/users", {
      headers: {
        "Cookie": `docflow-session=${sessionToken}`
      }
    });
    
    if (!usersResponse.ok) {
      console.log(" Failed to get users:", usersResponse.status);
      return;
    }
    
    const users = await usersResponse.json();
    console.log(" Users retrieved:", users.length);
    
    if (users.length === 0) {
      console.log(" No users found");
      return;
    }
    
    // Get the first user for testing
    const testUser = users[0];
    console.log(" Testing with user:", testUser.name, testUser.id);
    
    // Test updating the user (just change the name slightly)
    const updateData = {
      name: testUser.name + " (Edited)",
      email: testUser.email,
      role: testUser.role,
      isActive: testUser.isActive,
      accessibleContractIds: testUser.accessibleContractIds || [],
      disciplineIds: testUser.disciplineIds || []
    };
    
    console.log(" Attempting to update user...");
    const updateResponse = await fetch(`http://localhost:3000/api/users/${testUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `docflow-session=${sessionToken}`
      },
      body: JSON.stringify(updateData)
    });
    
    const updateResult = await updateResponse.text();
    console.log(" Update response status:", updateResponse.status);
    console.log(" Update response body:", updateResult);
    
    if (updateResponse.ok) {
      console.log(" User update successful!");
      
      // Revert the change
      console.log(" Reverting changes...");
      const revertData = {
        ...updateData,
        name: testUser.name
      };
      
      const revertResponse = await fetch(`http://localhost:3000/api/users/${testUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Cookie": `docflow-session=${sessionToken}`
        },
        body: JSON.stringify(revertData)
      });
      
      if (revertResponse.ok) {
        console.log(" Changes reverted successfully!");
      } else {
        console.log(" Failed to revert changes");
      }
    } else {
      console.log(" User update failed");
    }
    
  } catch (error) {
    console.error(" Error during test:", error);
  }
}

testUserEdit();
