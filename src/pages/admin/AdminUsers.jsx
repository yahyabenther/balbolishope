import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AdminUsers() {
  const { isSuperAdmin, addSubAdmin, listUsers } = useAuth();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  if (!isSuperAdmin) {
    return (
      <div className="container">
        <p>You don't have permission to view this page.</p>
      </div>
    );
  }

  const users = listUsers();

  function handleSubmit(e) {
    e.preventDefault();
    const result = addSubAdmin(form);
    if (result.ok) {
      setMessage("Sub-admin added successfully.");
      setForm({ firstName: "", lastName: "", email: "", password: "" });
    } else {
      setMessage(result.error);
    }
  }

  return (
    <div className="container">
      <h1>Manage Admins</h1>

      <h2>Add a sub-admin</h2>
      <form className="account-form" onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <label>First name</label>
        <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        <label>Last name</label>
        <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        <label>Email</label>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label>Password</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="btn btn-accent" type="submit">
          Add sub-admin
        </button>
      </form>
      {message && <p style={{ marginTop: 12 }}>{message}</p>}

      <h2 style={{ marginTop: 40 }}>All accounts</h2>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.email}>
              <td>
                {u.firstName} {u.lastName}
              </td>
              <td>{u.email}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}