# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: hiring managers and engineering leads filling backend roles. They scan fast, want proof of shipped systems, and need the resume one click away.

Secondary: freelance and contract clients (founders who need something built) who want to see live products and an easy way to reach the owner.

Confirmed by the owner on 2026-10-08: "Both, hiring first".

## Product Purpose

The personal portfolio of Shubhanshu Pandey, a backend developer. It shows his deployed projects, the tools he works with, a journal, and his resume, in order to win interviews first and contract work second.

Success: a visitor leaves remembering that he ships live products (owner's chosen takeaway), and reaches the resume or his email within seconds.

## Positioning

Every project on the site is deployed and usable today, each with a public URL and public source. The proof is the running product, not a description of it.

## Operating Context

The owner manages all content through an admin CMS (Express and MongoDB API, media on Cloudinary): about, projects, skills, social links, blog posts, resume PDF. The public site reads that content from the live API at runtime.

## Capabilities and Constraints

- React 19, Vite 7, Tailwind 4 and Framer Motion single-page app, deployed on Vercel.
- Routes that must keep working: `/`, `/work`, `/blog`, `/blog/:slug`, `/resume`, `/admin/*`.
- Content stays CMS-driven. The admin must keep every function it has today.
- Content as of 2026-10-08: 3 projects (no images, none featured), 18 skills with self-rated proficiency, 0 published blog posts, no profile image, resume PDF on Cloudinary.
- Undecided: whether the owner will supply project screenshots or a portrait. The site must look complete without them.

## Brand Commitments

- Owner-pinned theme: a Japanese rural area (countryside).
- Owner asked explicitly for all of: torii gates, cherry blossoms, a red sun, brush lettering, prominent Japanese text, rich animation, and a showpiece people remember ("Use all of these in my portfolio to make it look fabulous").
- It must not look AI-generated and it must be very impressive.
- Name: Shubhanshu Pandey. Initials mark: SP.
- Owner's own tagline, currently in the hero: "thinking human".

## Evidence on Hand

- Live projects with public URLs and GitHub source: GeoJobs, Unified Conversational AI Engine, Forms Management Platform.
- Profiles: GitHub, LinkedIn, LeetCode.
- Resume PDF.
- Owner-entered stats: 1.5 years of experience, 5 projects, 15 technologies, 284 commits.
- Absent, never to be fabricated: testimonials, client names, employer names, project screenshots, a portrait, benchmarks.

## Product Principles

1. Proof first. Live link and source are one click from every project.
2. English carries the information, Japanese carries the atmosphere. Japanese is never the only label on an action.
3. The show never blocks the scan. Work, resume and contact stay reachable within seconds from anywhere on the page.
4. Owner-editable. Everything a visitor reads comes from the CMS or degrades gracefully when a field is empty.

## Accessibility & Inclusion

Inferred default, not specified by the owner: WCAG AA contrast, full keyboard access, and a reduced-motion path for every animation.
