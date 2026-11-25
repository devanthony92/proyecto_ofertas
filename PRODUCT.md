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

## Evidence on Hand

None. Catalog items, prices, clients and simulated data are fictitious and must be presented as simulated, never as real company data.

## Product Principles

1. Keep it simple: one screen, no over-engineering.
2. Numbers first: every total and KPI is visible, correct and never shows NaN.
3. Spec-driven: if it is not in the spec, it is not built.
4. Demo-ready: the simulation must tell a clear story within a 30-second glance.

## Accessibility & Inclusion

WCAG AA contrast; usable at 375 px width.
