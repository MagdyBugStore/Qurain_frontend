export function Stars({ rating, size = 13, className = "teacher-stars" }) {
  return (
    <div className={className}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={n <= Math.round(rating) ? "star" : "star empty"}
          style={{ fontSize: size }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

