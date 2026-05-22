import "../styles/ComponentStyle/SkeletonLoader.css";

export function PageSkeleton() {
  return (
    <div className="sk-page">
      <div className="sk-hero">
        <div className="sk-hero-left">
          <div className="sk sk-eyebrow" />
          <div className="sk sk-h1-a" />
          <div className="sk sk-h1-b" />
        </div>
        <div className="sk-hero-right">
          <div className="sk sk-rule" />
          <div className="sk sk-p" />
          <div className="sk sk-p sk-p-80" />
          <div className="sk sk-p sk-p-60" />
        </div>
      </div>

      <div className="sk-body">
        <div className="sk sk-body-img" />
        <div className="sk-body-lines">
          <div className="sk sk-p" />
          <div className="sk sk-p sk-p-80" />
          <div className="sk sk-p sk-p-60" />
          <div className="sk sk-p" style={{ marginTop: "1rem" }} />
          <div className="sk sk-p sk-p-80" />
        </div>
      </div>

      <div className="sk-cards">
        {[0, 1, 2].map((i) => (
          <div className="sk-card-block" key={i}>
            <div className="sk sk-card-face" />
            <div className="sk sk-tag" />
            <div className="sk sk-name" />
            <div className="sk sk-price" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductsSkeleton() {
  return (
    <div className="sk-products-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div className="sk-card" key={i}>
          <div className="sk sk-card-img" />
          <div className="sk sk-tag" />
          <div className="sk sk-name" />
          <div className="sk sk-price" />
        </div>
      ))}
    </div>
  );
}

export function LookbookSkeleton() {
  return (
    <div className="sk-lookbook-track">
      {Array.from({ length: 4 }).map((_, i) => (
        <div className="sk sk-look-card" key={i} />
      ))}
    </div>
  );
}