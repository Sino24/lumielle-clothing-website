// src/components/AdminSkeleton.tsx

import React from "react";
import "../styles/ComponentStyle/AdminSkeleton.css";

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
        {hasUpload   && <div className="ask ask-upload-box ask-full" />}
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

// ── Dashboard ──
// No header, no nav — AdminDashboard renders its own header outside this component
function DashboardBody() {
  return (
    <>
      {/* Stats */}
      <SkStats count={4} emoji />

      {/* Quick links */}
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

      {/* Recent products */}
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
function ProductsBody() {
  return (
    <>
      <div className="ask-pm-toolbar">
        <div className="ask ask-pm-search" />
        <div className="ask-pm-toolbar-row2">
          <div className="ask ask-pm-select" />
          <div className="ask ask-pm-count" />
        </div>
      </div>

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

// ── About ──
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

// ── Contact ──
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

// ── Hero ──
function HeroBody() {
  return (
    <>
      <div className="ask ask-hero-preview" />
      <SkPanel inputs={2} hasTextarea />
      <SkPanel inputs={1} hasUpload />
    </>
  );
}

// ── Client Projects ──
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

// ── Users ──
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

// ── Orders ──
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
// Route maps
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
  about:             2,
  lookbook:          2,
  products:          2,
  hero:              2,
  "client-projects": 2,
};

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────
export function AdminSkeleton({ variant }: Props) {
  const Body       = BODY_MAP[variant];
  const buttons    = HEADER_BTNS[variant] ?? 1;
  const isDashboard = variant === "dashboard";

  return (
    <div className="ask-page">
      {/* Dashboard renders its own header — skip SkHeader to avoid duplication */}
      {!isDashboard && <SkHeader buttons={buttons} />}
      <Body />
    </div>
  );
}