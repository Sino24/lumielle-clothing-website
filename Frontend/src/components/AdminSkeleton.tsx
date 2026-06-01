
import "../styles//ComponentStyle/AdminSkeleton.css";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type AdminSkeletonVariant =
  | "dashboard"
  | "products"
  | "lookbook"
  | "about"
  | "contact"
  | "hero"
  | "client-projects"
  | "users"
  | "orders";

interface Props {
  variant: AdminSkeletonVariant;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared building blocks
// ─────────────────────────────────────────────────────────────────────────────

/** Standard page header: title + subtitle on the left, 1-2 buttons on the right */
function SkHeader({ buttons = 1 }: { buttons?: number }) {
  return (
    <div className="ask-hd">
      <div className="ask-hd-left">
        <div className="ask ask-title" />
        <div className="ask ask-sub" />
      </div>
      <div className="ask-hd-right">
        {buttons >= 2 && <div className="ask ask-btn-ghost" />}
        <div className="ask ask-btn" />
      </div>
    </div>
  );
}

/** Stat cards row */
function SkStats({ count = 4, emoji = false }: { count?: number; emoji?: boolean }) {
  return (
    <div className="ask-stats" style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}>
      {Array.from({ length: count }).map((_, i) => (
        <div className="ask-stat-card" key={i}>
          {emoji && <div className="ask ask-stat-emoji" />}
          <div className="ask ask-stat-num" />
          <div className="ask ask-stat-label" />
        </div>
      ))}
    </div>
  );
}

/** Generic table / list rows (avatar + meta + badge pattern) */
function SkRows({
  rows = 6,
  avatar = false,
  cols = 3,
}: {
  rows?: number;
  avatar?: boolean;
  cols?: number;
}) {
  return (
    <div className="ask-table">
      <div className="ask-table-head">
        {Array.from({ length: cols }).map((_, i) => (
          <div className="ask ask-th" key={i} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div className="ask-table-row" key={i}>
          {avatar && <div className="ask ask-avatar" />}
          <div className="ask ask-td-name" />
          <div className="ask ask-td-mid" />
          <div className="ask ask-td-pill" />
        </div>
      ))}
    </div>
  );
}

/** Form panel (used by about / hero / client-projects) */
function SkPanel({
  inputs = 2,
  hasTextarea = false,
  hasUpload = false,
  hasRows = false,
}: {
  inputs?: number;
  hasTextarea?: boolean;
  hasUpload?: boolean;
  hasRows?: boolean;
}) {
  return (
    <div className="ask-panel">
      <div className="ask ask-panel-title" />
      <div className="ask-form-grid">
        {Array.from({ length: inputs }).map((_, i) => (
          <div className={`ask ask-input${inputs === 1 ? " ask-full" : ""}`} key={i} />
        ))}
        {hasTextarea && <div className="ask ask-textarea ask-full" />}
        {hasUpload && <div className="ask ask-upload-box ask-full" />}
        {hasRows &&
          Array.from({ length: 3 }).map((_, i) => (
            <div className="ask-value-row ask-full" key={i}>
              <div className="ask ask-input-num" />
              <div className="ask ask-input" />
              <div className="ask ask-input ask-flex1" />
            </div>
          ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-variant bodies
// ─────────────────────────────────────────────────────────────────────────────

function DashboardBody() {
  return (
    <>
      <div className="ask-nav">
        {Array.from({ length: 9 }).map((_, i) => (
          <div className="ask ask-nav-pill" key={i} />
        ))}
      </div>
      <SkStats count={4} emoji />
      <div className="ask ask-section-label" />
      <div className="ask-links">
        {Array.from({ length: 8 }).map((_, i) => (
          <div className="ask-link-card" key={i}>
            <div className="ask ask-link-icon" />
            <div className="ask-link-text">
              <div className="ask ask-link-title" />
              <div className="ask ask-link-desc" />
            </div>
            <div className="ask ask-link-arrow" />
          </div>
        ))}
      </div>
      <div className="ask ask-section-label ask-mt" />
      <div className="ask-recent">
        {Array.from({ length: 5 }).map((_, i) => (
          <div className="ask-recent-row" key={i}>
            <div className="ask ask-thumb" />
            <div className="ask-recent-meta">
              <div className="ask ask-recent-name" />
              <div className="ask ask-recent-cat" />
            </div>
            <div className="ask ask-recent-price" />
          </div>
        ))}
      </div>
    </>
  );
}

// ── Products ──
// Mirrors pm-toolbar (full-width search bar + row2 with select+count)
// then pm-grid (auto-fill minmax 200px) with full card anatomy:
// 3:4 image → body (category chip, name, price, colour swatches) → footer (size tags + img count)
function ProductsBody() {
  return (
    <>
      {/* toolbar */}
      <div className="ask-pm-toolbar">
        <div className="ask ask-pm-search" />
        <div className="ask-pm-toolbar-row2">
          <div className="ask ask-pm-select" />
          <div className="ask ask-pm-count" />
        </div>
      </div>

      {/* product grid */}
      <div className="ask-pm-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div className="ask-pm-card" key={i}>
            <div className="ask ask-pm-img" />
            <div className="ask-pm-body">
              <div className="ask ask-pm-cat" />
              <div className="ask ask-pm-name" />
              <div className="ask ask-pm-price" />
              <div className="ask-pm-swatches">
                {Array.from({ length: 4 }).map((__, j) => (
                  <div className="ask ask-pm-swatch" key={j} />
                ))}
              </div>
            </div>
            <div className="ask-pm-foot">
              <div className="ask-pm-sizes">
                {Array.from({ length: 3 }).map((__, j) => (
                  <div className="ask ask-pm-size-tag" key={j} />
                ))}
              </div>
              <div className="ask ask-pm-img-count" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Lookbook ──
// Mirrors alb-grid (auto-fill minmax 220px) with:
// 3:4 image → card body (order badge, title, subtitle)
function LookbookBody() {
  return (
    <div className="ask-lb-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div className="ask-lb-card" key={i}>
          <div className="ask ask-lb-img" />
          <div className="ask-lb-card-body">
            <div className="ask ask-lb-order" />
            <div className="ask ask-lb-title" />
            <div className="ask ask-lb-sub" />
          </div>
        </div>
      ))}
    </div>
  );
}

function AboutBody() {
  return (
    <>
      <SkPanel inputs={1} hasTextarea />
      <SkPanel inputs={2} />
      <SkPanel inputs={1} hasTextarea hasUpload />
      <SkPanel inputs={0} hasRows />
      <SkPanel inputs={1} hasTextarea hasUpload />
    </>
  );
}

function ContactBody() {
  return (
    <>
      <SkStats count={4} />
      <div className="ask-msg-list">
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="ask-msg-row" key={i}>
            <div className="ask ask-avatar" />
            <div className="ask-msg-meta">
              <div className="ask ask-msg-name" />
              <div className="ask ask-msg-email" />
            </div>
            <div className="ask ask-msg-preview" />
            <div className="ask-msg-right">
              <div className="ask ask-msg-date" />
              <div className="ask ask-status-pill" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function HeroBody() {
  return (
    <>
      <div className="ask ask-hero-preview" />
      <SkPanel inputs={2} hasTextarea />
      <SkPanel inputs={1} hasUpload />
    </>
  );
}

function ClientProjectsBody() {
  return (
    <>
      <div className="ask-toolbar">
        <div className="ask ask-search" />
        <div className="ask ask-btn" />
      </div>
      <div className="ask-lb-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="ask-lb-card" key={i}>
            <div className="ask ask-lb-img" />
            <div className="ask-lb-card-body">
              <div className="ask ask-lb-title" />
              <div className="ask ask-lb-sub" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function UsersBody() {
  return (
    <>
      <SkStats count={3} />
      <div className="ask-toolbar">
        <div className="ask ask-search" />
        <div className="ask ask-btn-ghost" />
      </div>
      <SkRows rows={8} avatar cols={4} />
    </>
  );
}

function OrdersBody() {
  return (
    <>
      <SkStats count={4} />
      <div className="ask-toolbar">
        <div className="ask ask-search" />
        <div className="ask ask-btn-ghost" />
        <div className="ask ask-btn-ghost" />
      </div>
      <SkRows rows={8} cols={5} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────
const BODY_MAP: Record<AdminSkeletonVariant, React.FC> = {
  dashboard:         DashboardBody,
  products:          ProductsBody,
  lookbook:          LookbookBody,
  about:             AboutBody,
  contact:           ContactBody,
  hero:              HeroBody,
  "client-projects": ClientProjectsBody,
  users:             UsersBody,
  orders:            OrdersBody,
};

const HEADER_BTNS: Partial<Record<AdminSkeletonVariant, number>> = {
  about:             2,   // Refresh + Save
  lookbook:          2,   // Refresh + Add Look
  products:          2,   // Refresh icon + Add Product
  hero:              2,
  "client-projects": 2,
};

export function AdminSkeleton({ variant }: Props) {
  const Body = BODY_MAP[variant];
  const buttons = HEADER_BTNS[variant] ?? 1;

  return (
    <div className="ask-page">
      <SkHeader buttons={buttons} />
      <Body />
    </div>
  );
}