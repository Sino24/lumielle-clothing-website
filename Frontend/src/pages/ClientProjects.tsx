
import { useEffect, useState } from "react";
import "../styles/PageStyle/ClientProjects.css";

interface ClientProject {
  _id: string;
  clientName: string;
  category: string;
  description: string;
  coverImage: string;
  images: string[];
  tags: string[];
  isFeatured: boolean;
  order: number;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ALL_TAG = "All";

function ClientProjects() {
  const [projects, setProjects]         = useState<ClientProject[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeTag, setActiveTag]       = useState(ALL_TAG);
  const [lightbox, setLightbox]         = useState<{ project: ClientProject; imgIndex: number } | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/client-projects`)
      .then((r) => r.json())
      .then((d) => setProjects(Array.isArray(d) ? d : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  // Close lightbox on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight" && lightbox) {
        const imgs = [lightbox.project.coverImage, ...lightbox.project.images].filter(Boolean);
        setLightbox((l) => l ? { ...l, imgIndex: Math.min(l.imgIndex + 1, imgs.length - 1) } : l);
      }
      if (e.key === "ArrowLeft" && lightbox) {
        setLightbox((l) => l ? { ...l, imgIndex: Math.max(l.imgIndex - 1, 0) } : l);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox]);

  // Collect unique tags
  const allTags = [ALL_TAG, ...Array.from(new Set(projects.flatMap((p) => p.tags).filter(Boolean)))];

  const filtered = activeTag === ALL_TAG
    ? projects
    : projects.filter((p) => p.tags.includes(activeTag));

  const featured  = filtered.filter((p) => p.isFeatured);
  const regular   = filtered.filter((p) => !p.isFeatured);

  const openLightbox = (project: ClientProject, imgIndex = 0) => {
    setLightbox({ project, imgIndex });
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightbox(null);
    document.body.style.overflow = "";
  };

  return (
    <main className="cp">

      {/* ── Hero ── */}
      <section className="cp__hero">
        <div className="cp__hero-left">
          <p className="cp__eyebrow">Custom Work</p>
          <h1 className="cp__hero-title">
            Built for<br /><em>brands,</em><br />teams &amp; vision.
          </h1>
        </div>
        <div className="cp__hero-right">
          <div className="cp__hero-rule" />
          <p className="cp__hero-desc">
            From football jerseys to corporate uniforms — every piece crafted
            to spec, carrying your identity in fabric and form.
          </p>
          <div className="cp__hero-stats">
            <div className="cp__stat">
              <span className="cp__stat-num">200+</span>
              <span className="cp__stat-label">Projects Delivered</span>
            </div>
            <div className="cp__stat">
              <span className="cp__stat-num">50+</span>
              <span className="cp__stat-label">Brand Clients</span>
            </div>
            <div className="cp__stat">
              <span className="cp__stat-num">100%</span>
              <span className="cp__stat-label">Custom Made</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Filter tags ── */}
      {!loading && allTags.length > 1 && (
        <div className="cp__filters">
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`cp__filter-btn ${activeTag === tag ? "cp__filter-btn--active" : ""}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="cp__loading"><span className="cp__spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="cp__empty"><p>No projects found.</p></div>
      ) : (
        <section className="cp__content">

          {/* Featured row */}
          {featured.length > 0 && (
            <div className="cp__featured-row">
              {featured.map((project, i) => {
                const allImgs = [project.coverImage, ...project.images].filter(Boolean);
                return (
                  <article
                    key={project._id}
                    className={`cp__featured-card ${i % 2 === 0 ? "cp__featured-card--left" : "cp__featured-card--right"}`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="cp__featured-img-wrap" onClick={() => openLightbox(project)}>
                      {project.coverImage
                        ? <img src={project.coverImage} alt={project.clientName} />
                        : <div className="cp__img-placeholder" />
                      }
                      <div className="cp__featured-badge">Featured</div>
                      {allImgs.length > 1 && (
                        <div className="cp__img-count">+{allImgs.length - 1}</div>
                      )}
                    </div>
                    <div className="cp__featured-info">
                      {project.category && <p className="cp__card-category">{project.category}</p>}
                      <h2 className="cp__featured-name">{project.clientName}</h2>
                      {project.description && <p className="cp__featured-desc">{project.description}</p>}
                      {project.tags.length > 0 && (
                        <div className="cp__tags">
                          {project.tags.map((t) => <span key={t} className="cp__tag">{t}</span>)}
                        </div>
                      )}
                      {allImgs.length > 1 && (
                        <div className="cp__thumb-strip">
                          {allImgs.slice(0, 4).map((img, idx) => (
                            <button
                              key={idx}
                              className="cp__thumb"
                              onClick={() => openLightbox(project, idx)}
                            >
                              <img src={img} alt={`${project.clientName} ${idx + 1}`} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Regular grid */}
          {regular.length > 0 && (
            <div className="cp__grid">
              {regular.map((project, i) => {
                const allImgs = [project.coverImage, ...project.images].filter(Boolean);
                return (
                  <article
                    key={project._id}
                    className="cp__card"
                    style={{ animationDelay: `${i * 0.07}s` }}
                    onClick={() => openLightbox(project)}
                  >
                    <div className="cp__card-img-wrap">
                      {project.coverImage
                        ? <img src={project.coverImage} alt={project.clientName} />
                        : <div className="cp__img-placeholder" />
                      }
                      <div className="cp__card-overlay">
                        <span className="cp__card-view">View Project</span>
                      </div>
                      {allImgs.length > 1 && (
                        <div className="cp__img-count">+{allImgs.length - 1}</div>
                      )}
                    </div>
                    <div className="cp__card-info">
                      {project.category && <p className="cp__card-category">{project.category}</p>}
                      <h3 className="cp__card-name">{project.clientName}</h3>
                      {project.tags.length > 0 && (
                        <div className="cp__tags cp__tags--small">
                          {project.tags.slice(0, 2).map((t) => <span key={t} className="cp__tag">{t}</span>)}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

        </section>
      )}

      {/* ── CTA Banner ── */}
      <section className="cp__cta">
        <div className="cp__cta-inner">
          <p className="cp__eyebrow">Start a Project</p>
          <h2 className="cp__cta-title">Have a custom<br /><em>vision in mind?</em></h2>
          <p className="cp__cta-body">
            We work with teams, schools, brands, and businesses to bring
            custom apparel to life — exactly as you imagined it.
          </p>
          <a className="cp__cta-btn" href="mailto:hello@lumielle.com">
            Get in Touch
          </a>
        </div>
      </section>

      {/* ── Lightbox ── */}
      {lightbox && (() => {
        const allImgs = [lightbox.project.coverImage, ...lightbox.project.images].filter(Boolean);
        const img = allImgs[lightbox.imgIndex];
        return (
          <div className="cp__lightbox" onClick={closeLightbox}>
            <button className="cp__lb-close" onClick={closeLightbox}>✕</button>

            <div className="cp__lb-inner" onClick={(e) => e.stopPropagation()}>
              <div className="cp__lb-img-wrap">
                {lightbox.imgIndex > 0 && (
                  <button
                    className="cp__lb-arrow cp__lb-arrow--prev"
                    onClick={() => setLightbox((l) => l ? { ...l, imgIndex: l.imgIndex - 1 } : l)}
                  >‹</button>
                )}
                <img src={img} alt={lightbox.project.clientName} />
                {lightbox.imgIndex < allImgs.length - 1 && (
                  <button
                    className="cp__lb-arrow cp__lb-arrow--next"
                    onClick={() => setLightbox((l) => l ? { ...l, imgIndex: l.imgIndex + 1 } : l)}
                  >›</button>
                )}
              </div>

              <div className="cp__lb-info">
                {lightbox.project.category && (
                  <p className="cp__card-category">{lightbox.project.category}</p>
                )}
                <h3 className="cp__lb-name">{lightbox.project.clientName}</h3>
                {lightbox.project.description && (
                  <p className="cp__lb-desc">{lightbox.project.description}</p>
                )}
                {lightbox.project.tags.length > 0 && (
                  <div className="cp__tags">
                    {lightbox.project.tags.map((t) => <span key={t} className="cp__tag">{t}</span>)}
                  </div>
                )}
                {allImgs.length > 1 && (
                  <div className="cp__lb-dots">
                    {allImgs.map((_, idx) => (
                      <button
                        key={idx}
                        className={`cp__lb-dot ${idx === lightbox.imgIndex ? "cp__lb-dot--active" : ""}`}
                        onClick={() => setLightbox((l) => l ? { ...l, imgIndex: idx } : l)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

    </main>
  );
}

export default ClientProjects;