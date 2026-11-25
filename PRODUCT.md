# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React (JavaScript) + Tailwind CSS v4 + Chart.js (react-chartjs-2) + jsPDF (jspdf-autotable) + ExcelJS. No backend; state in React, persistence in localStorage. Chosen by the user (university suggestion list).

## Users

- **Técnico / asesor comercial** of an elevator service company: after a site visit, turns the list of equipment, materials, spare parts and labor hours into a client quote (oferta) and downloads it as PDF.
- **Jefe comercial**: watches the month's quote pipeline, edits business assumptions and exports reports.
- **Evaluators**: university professors and portfolio visitors watching a live demo on a laptop or projector. This is the primary real-world context.

## Product Purpose

"Elevia Ofertas" generates elevator installation and repair quotes from technician visit data, with automatic totals (margin, IVA 19%, COP), and simulates a 30-day commercial month (start / pause / reset) to show live KPIs, charts, a table and automatic conclusions. Success: a group project that meets every university requirement and reads as a credible startup-style business tool.

## Positioning

Built by someone who works in the elevator service industry: the quote structure (equipos, materiales, repuestos, horas de mano de obra, instalación nueva vs reparación) mirrors real practice instead of a generic invoice demo.

## Operating Context

Single screen. Quotes are delivered to clients as PDF. Reports exported to PDF and Excel. Demoed in class; must look good on a projector and on a phone.

## Capabilities and Constraints

See `specs/001-generador-ofertas/spec.md`. Spanish UI, COP currency (`$ 1.234.567`). No login, no database, no email.

## Brand Commitments

Fictitious brand "Elevia Ofertas". Must not use the name, logo or colors of any real elevator company. Voice: professional and direct, neutral Spanish, tuteo, trade terms (oferta, repuesto, mano de obra).

Visual identity (user-pinned, 2026-11 redesign): executive Enterprise SaaS look inspired by Power BI, Salesforce Lightning, SAP Analytics Cloud and Schneider EcoStruxure (as references only; never their logos, names or exact styling). Palette #F8FAFC background, white cards, primary #0057B8, success #10B981, warning #F59E0B, critical #DC2626, text #111827, secondary text #6B7280; Inter self-hosted; 12 px radius; light and dark mode. The Elevia logo is an original drawn mark (cabin with up/down arrows).

Data honesty: every number comes from the quotes in state (simulated or entered by hand) and is labeled as simulated. "Previous period" is the previous simulated month saved on reset, or the previous window of equal length. The forecast is a declared linear projection, never presented as AI. The user profile is a demo user; there is no login.

## Evidence on Hand

None. Catalog items, prices, clients and simulated data are fictitious and must be presented as simulated, never as real company data.

## Product Principles

1. Keep it simple: one screen, no over-engineering.
2. Numbers first: every total and KPI is visible, correct and never shows NaN.
3. Spec-driven: if it is not in the spec, it is not built.
4. Demo-ready: the simulation must tell a clear story within a 30-second glance.

## Accessibility & Inclusion

WCAG AA contrast; usable at 375 px width.
