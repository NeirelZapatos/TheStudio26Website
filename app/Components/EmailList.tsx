import React, { useState } from "react";

const EmailList: React.FC = () => {
  const [email, setEmail] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // For now, login
    console.log("Email submitted:", email);
    setEmail(""); // Clear after submission
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Subscribe to our mailing list</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={handleInputChange}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>
          ➔
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center" as const,
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderTop: "1px solid #eaeaea",
  },
  heading: {
    marginBottom: "10px",
    fontSize: "18px",
    color: "#333",
  },
  form: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    width: "250px",
  },
  button: {
    padding: "10px 16px",
    fontSize: "16px",
    backgroundColor: "#333",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default EmailList;