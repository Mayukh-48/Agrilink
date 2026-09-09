import { useState } from "react";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
        `http://127.0.0.1:8000/api/auth/login?${params.toString()}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || "Login failed.");
        return;
      }

      // Save logged-in farmer information
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("username", data.username);
      localStorage.setItem("farmer_id", data.farmer_id);
      localStorage.setItem("role", data.role);

      // Tell App.jsx that login succeeded
      if (onLogin) {
        onLogin(data);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(
        "Could not connect to the backend."
      );
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

        {/* LOGO */}
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
            C
          </div>

          <h1
            style={{
              margin: "0",
              color: "#1f2937",
            }}
          >
            AgriLink
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

        {/* LOGIN TITLE */}
        <h2
          style={{
            color: "#1f2937",
            marginBottom: "8px",
          }}
        >
          Farmer Login
        </h2>

        <p
          style={{
            color: "#6b7280",
            marginBottom: "24px",
          }}
        >
          Login to manage your crops and marketplace activity.
        </p>

        {/* ERROR */}
        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "18px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin}>

          {/* USERNAME */}
          <div style={{ marginBottom: "18px" }}>

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#1f2937",
                fontWeight: "600",
              }}
            >
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              placeholder="Enter your username"
              required
              style={{
                width: "100%",
                padding: "13px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                boxSizing: "border-box",
                color: "#1f2937",
                background: "white",
              }}
            />

          </div>

          {/* PASSWORD */}
          <div style={{ marginBottom: "24px" }}>

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#1f2937",
                fontWeight: "600",
              }}
            >
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              required
              style={{
                width: "100%",
                padding: "13px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                boxSizing: "border-box",
                color: "#1f2937",
                background: "white",
              }}
            />

          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              background: "#287a49",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        {/* DEMO ACCOUNT */}
        <div
          style={{
            marginTop: "24px",
            padding: "14px",
            background: "#f8faf8",
            borderRadius: "8px",
            textAlign: "center",
            fontSize: "13px",
            color: "#6b7280",
          }}
        >
          Demo account:{" "}
          <strong>farmer1</strong> /{" "}
          <strong>test123</strong>
        </div>

      </div>
    </div>
  );
}

export default Login;