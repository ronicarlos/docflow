console.log("Checking localStorage for simulated user data...");
if (typeof window !== "undefined") {
  console.log("simulated_user_id:", localStorage.getItem("simulated_user_id"));
  console.log("simulated_tenant_id:", localStorage.getItem("simulated_tenant_id"));
  console.log("All localStorage keys:", Object.keys(localStorage));
} else {
  console.log("Running in server environment - no localStorage");
}
