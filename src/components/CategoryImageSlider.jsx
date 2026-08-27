import React, { useState, useEffect } from "react";

// Cycles through an array of product images (one per product in the
// category) every 2 seconds. Handles both real photo URLs and the
// placeholder color codes currently used in SampleProducts.js.
export default function CategoryImageSlider({ images, alt }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [images]);

  if (!images || images.length === 0) {
    return <div className="category-pill__image" style={{ background: "#e5e7eb" }} />;
  }

  const current = images[index];
const isUrl =
  current.startsWith("http") ||
  current.startsWith("/") ||
  current.startsWith("data:");
  return (
    <div className="category-pill__image">
      <div key={index} className="category-pill__image-frame">
        {isUrl ? (
          <img src={current} alt={alt} />
        ) : (
          <div className="category-pill__image-swatch" style={{ background: current }} />
        )}
      </div>
    </div>
  );
}