import { useState } from "react";
import { API_BASE } from "../config";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("FARMER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const params = new URLSearchParams({
        username: username,
        password: password,
      });

      const response = await fetch(
        `${API_BASE}/api/auth/login?${params.toString()}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || "Login failed.");
        return;
      }

      // Make sure the selected role matches the account role
      if (data.role !== role) {
        setError(
          `This account is registered as a ${data.role === "BUYER" ? "Buyer" : "Farmer"}.`
        );
        return;
      }

      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("username", data.username);
      localStorage.setItem("farmer_id", data.farmer_id);
      localStorage.setItem("buyer_id", data.buyer_id || "");
      localStorage.setItem("role", data.role);

      if (onLogin) {
        onLogin(data);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f1f6f2",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
          boxSizing: "border-box",
        }}
      >
        {/* Logo / Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              fontSize: "42px",
              marginBottom: "8px",
            }}
          >
            🌱
          </div>

          <h1
            style={{
              margin: "0",
              color: "#1f2937",
            }}
          >
            KisanLink
          </h1>

          <p
            style={{
              color: "#6b7280",
              marginTop: "8px",
            }}
          >
            Smart Agricultural Marketplace
          </p>
        </div>

        {/* Login Heading */}
        <h2
          style={{
            color: "#1f2937",
            marginBottom: "8px",
          }}
        >
          Welcome Back
        </h2>

        <p
          style={{
            color: "#6b7280",
            marginBottom: "24px",
          }}
        >
          Login to continue to your KisanLink account.
        </p>

        {/* Role Selector */}
        <div style={{ marginBottom: "22px" }}>
          <label
            style={{
              display: "block",
              fontWeight: "600",
              marginBottom: "10px",
              color: "#1f2937",
            }}
          >
            Login as
          </label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setRole("FARMER");
                setError("");
              }}
              style={{
                padding: "12px",
                borderRadius: "10px",
                border:
                  role === "FARMER"
                    ? "2px solid #2d6a4f"
                    : "1px solid #d9e2dc",
                background:
                  role === "FARMER" ? "#e8f5ee" : "white",
                color:
                  role === "FARMER" ? "#1b4332" : "#6b7280",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              🌾 Farmer
            </button>

            <button
              type="button"
              onClick={() => {
                setRole("BUYER");
                setError("");
              }}
              style={{
                padding: "12px",
                borderRadius: "10px",
                border:
                  role === "BUYER"
                    ? "2px solid #2d6a4f"
                    : "1px solid #d9e2dc",
                background:
                  role === "BUYER" ? "#e8f5ee" : "white",
                color:
                  role === "BUYER" ? "#1b4332" : "#6b7280",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              🏪 Buyer
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {/* Username */}
          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "8px",
                color: "#1f2937",
              }}
            >
              Username
            </label>

            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "13px",
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                boxSizing: "border-box",
                fontSize: "15px",
                outline: "none",
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "8px",
                color: "#1f2937",
              }}
            >
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "13px",
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                boxSizing: "border-box",
                fontSize: "15px",
                outline: "none",
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: "#fff1f2",
                color: "#b91c1c",
                padding: "12px",
                borderRadius: "10px",
                marginBottom: "18px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "10px",
              background: loading ? "#6b9f82" : "#2d6a4f",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Demo Account */}
        <div
          style={{
            marginTop: "24px",
            padding: "14px",
            background: "#f8faf9",
            borderRadius: "10px",
            textAlign: "center",
            color: "#6b7280",
            fontSize: "14px",
          }}
        >
          {role === "FARMER" ? (
            <>
              Farmer demo:{" "}
              <strong style={{ color: "#374151" }}>
                farmer1 / test123
              </strong>
            </>
          ) : (
            <>
              Buyer demo:{" "}
              <strong style={{ color: "#374151" }}>
                buyer1 / buyer123
              </strong>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;