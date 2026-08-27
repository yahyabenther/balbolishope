import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import slide1 from "../assets/slides/test1.jpeg";
import slide2 from "../assets/slides/test2.jpg";
import slide3 from "../assets/slides/test3.jpeg";

const slides = [
  {
    id: 1,
    image: slide1,
    title: "Remise Spéciale",
    subtitle: "Jusqu'à 50% de réduction sur une sélection d'accessoires",
  },
  {
    id: 2,
    image: slide2,
    title: "Tout pour votre téléphone",
    subtitle: "Des coques aux réparations, aux meilleurs prix en Tunisie.",
  },
  {
    id: 3,
    image: slide3,
    title: "Nouveautés Tout Juste Arrivées",
    subtitle: "Découvrez les derniers téléphones et accessoires.",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  const prev = () => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="hero-slider">
      <div className="hero-slider__track">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={`hero-slider__slide ${i === current ? "active" : ""}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="hero-slider__overlay">
              <h2>{slide.title}</h2>
              <p>{slide.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="hero-slider__arrow hero-slider__arrow--left" onClick={prev} aria-label="Diapositive précédente">
        <ChevronLeft size={22} />
      </button>
      <button className="hero-slider__arrow hero-slider__arrow--right" onClick={next} aria-label="Diapositive suivante">
        <ChevronRight size={22} />
      </button>

      <div className="hero-slider__dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`hero-slider__dot ${i === current ? "active" : ""}`}
            onClick={() => setCurrent(i)}
            aria-label={`Aller à la diapositive ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}