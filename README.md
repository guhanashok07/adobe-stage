# Adobe Stage

> **Reclaiming the Digital Canvas.**  
> Browser-native · AI-first · Collaborative Design Platform for 400M+ Creatives.

[![Live Prototype](https://img.shields.io/badge/Live%20Prototype-adobestageproto.netlify.app-0052FF?style=for-the-badge&logo=netlify&logoColor=white)](https://adobestageproto.netlify.app/)
[![Course](https://img.shields.io/badge/CMU-Product%20Marketing-C41230?style=for-the-badge)](https://www.cmu.edu/)
[![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Interactive Deck](https://img.shields.io/badge/Presentation-Launch%20Deck%20HTML-FF0000?style=for-the-badge&logo=adobe&logoColor=white)](./deck.html)

---

## 📌 Executive Overview

**Adobe Stage** was conceived and built as the final product launch strategy for the **Carnegie Mellon University Product Marketing Course**.

Today's generative design tools suffer from the **"Prompt Wall"**: users type a prompt and receive 90% of a design, but fixing a single margin, adjusting a font hierarchy, or shifting a brand color requires an endless spiral of follow-up text prompts. 

Adobe Stage resolves this tension. It combines the rapid zero-to-one velocity of generative AI with the granular, direct visual manipulation that creative professionals demand—all inside a fast, browser-native canvas powered by Adobe Spectrum and Adobe Firefly.

---

## 🎯 The Core Problem: The "Prompt Wall"

```
Traditional UI Tools (Figma/Adobe XD)       Prompt-Only AI (Midjourney/Claude/Stitch)
-------------------------------------       -----------------------------------------
• High learning curve                       • Fast 0-to-1 generation
• Manual layout & vector math               • Zero precision over the final 10%
• Steep cognitive load for non-designers     • Endless prompt re-rolls to tweak a button
```

### Cognitive Science: System 1 vs. System 2 Thinking
Daniel Kahneman's decision science explains why pure prompt interfaces fail visual thinkers:
* **System 2 (Heavy & Exhausting)**: Prompting forces creators to translate visual spatial intent into linguistic syntax (*"move button 12px right and make border-radius 8px"*).
* **System 1 (Flow & Autopilot)**: Direct visual manipulation (clicking, dragging, slider adjustments) operates effortlessly in intuition.

> **Adobe Stage returns creators to System 1.** Prompt the foundation in plain English; refine the details visually with sliders and direct manipulation.

---

## 🚀 Key Architectural & Product Pillars

### 1. Dual-Surface Workflow
* **UI/UX Design Studio**: Component hierarchy, responsive artboards, fintech dashboard templates, and dynamic design tokens.
* **Graphic Design & Brand Surface**: Typography hero banners, vector shapes, social media ad formats, and abstract brand assets.

### 2. Interactive "Block" System
Every generated element on the Stage canvas is instantiated as an **interactive block**:
* Click to select, resize, and drag.
* Live inline text editing (`contentEditable`).
* Dynamic property inspectors (position, dimensions, fills, themes).
* Instant toggle between Dark Mode and Light Mode tokens.

### 3. Integrated Brand DNA Engine
* Embeds brand color palettes, font pairings, and design system constraints directly into every generative prompt.
* Guarantees brand consistency across marketing teams, founders, and solo designers without agency overhead.

---

## 📊 Strategic Go-To-Market (GTM) Summary

| Pillar | Strategy | Target Metric |
| :--- | :--- | :--- |
| **GTM Phase 1: Land** | Product-led community blitz via Product Hunt, Design Twitter/X, and YouTube design educators. | **10M Free Signups** in Year 1 |
| **GTM Phase 2: Expand** | Native embedding into the Adobe Creative Cloud desktop app (25M+ active subscribers). | **Time-to-First-Value < 60s** |
| **Enterprise Trojan Horse** | PQL trigger at 5+ domain users. Sell enterprise governance, SSO, and Firefly IP indemnification. | **$100M ARR** by Year 1 |

---

## 🥊 Competitive Advantage

| Capability | Figma / Canva | Google Stitch / Claude UI | Adobe Stage |
| :--- | :--- | :--- | :--- |
| **Design Philosophy** | Manual, human-led vector authoring | Code-generation & prompt-to-UI | **Fluid AI-assisted visual system** |
| **Surface Scope** | UI (Figma) or Social (Canva, siloed) | Primarily app dashboards | **Full creative suite (UI/UX + Brand)** |
| **Enterprise Safety** | Limited AI indemnification | Ambiguous training data risks | **100% Commercially safe via Firefly** |
| **The "Last 10%"** | Manual effort | Uncontrollable re-prompting | **Direct visual block manipulation** |

---

## 💻 Tech Stack & Prototype Implementation

* **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom Adobe Spectrum dark-mode aesthetics
* **Icons**: [Lucide React](https://lucide.dev/)
* **Deployment**: [Netlify](https://adobestageproto.netlify.app/)
* **Interactive Presentation**: Run or view [`deck.html`](./deck.html)

---

---

## 👥 Course & Project Credit

Developed as a collaborative team project for the **Product Marketing Course** at **Carnegie Mellon University**.