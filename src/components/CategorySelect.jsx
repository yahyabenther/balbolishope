import React, { useState, useRef, useEffect } from "react";

function CategoryIcon({ icon }) {
  if (!icon) return null;
  if (typeof icon === "function" || (typeof icon === "object" && icon !== null)) {
    const IconComponent = icon;
    return <IconComponent size={16} />;
  }
  return <span>{icon}</span>;
}

export default function CategorySelect({ categories, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = categories.find((c) => c.id === value);
  const label = selected ? selected.name : "Toutes les catégories";

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="category-select" ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        className="category-select__trigger"
        onClick={() => {
          console.log("CategorySelect trigger clicked. open was:", open); // TEMP DEBUG — remove once confirmed working
          setOpen((v) => !v);
        }}
      >
        {label}
        <span className={`category-select__arrow ${open ? "open" : ""}`}>▾</span>
      </button>

      {open && (
        <ul
          className="category-select__menu"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            left: "auto",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            minWidth: "220px",
            zIndex: 9999,
            padding: "6px 0",
            margin: 0,
            listStyle: "none",
          }}
        >
          <li
            className={`category-select__option ${!value ? "selected" : ""}`}
            style={{ padding: "10px 16px", fontSize: "14px", cursor: "pointer", color: "#1c1c1e" }}
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            Toutes les catégories
          </li>
          {categories.map((c) => (
            <li
              key={c.id}
              className={`category-select__option ${value === c.id ? "selected" : ""}`}
              style={{
                padding: "10px 16px",
                fontSize: "14px",
                cursor: "pointer",
                color: "#1c1c1e",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onClick={() => {
                onChange(c.id);
                setOpen(false);
              }}
            >
              <CategoryIcon icon={c.icon} /> {c.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}