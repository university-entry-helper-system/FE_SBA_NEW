// HelloForm.tsx
import React, { useState } from "react";

const HelloForm: React.FC = () => {
  const [name, setName] = useState("");
  const [greeting, setGreeting] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGreeting(`Xin chào, ${name}!`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Chào bạn!</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nhập tên của bạn"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Gửi</button>
      </form>
      {greeting && <p>{greeting}</p>}
    </div>
  );
};

export default HelloForm;
