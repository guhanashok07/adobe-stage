# Adobe Stage

> **Reclaiming the digital canvas.**
> Browser-native, AI-first, collaborative design for the 400M+ people who make things.

### ▶ [Open the live prototype](https://adobestageproto.netlify.app/)
### 📊 [Open the launch deck](https://adobestageproto.netlify.app/deck.html)

[![React](https://img.shields.io/badge/React%2019-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Netlify](https://img.shields.io/badge/Deployed%20on-Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white)](https://adobestageproto.netlify.app/)
[![CMU](https://img.shields.io/badge/CMU-Product%20Marketing-C41230?style=flat-square)](https://www.cmu.edu/)

No install, no account, no API key. Both links open in the browser.

---

Adobe Stage was built as the final product launch project for the Product Marketing course at Carnegie Mellon. It is a working prototype, not a mockup, and you can open it right now.

---

## The problem: the prompt wall

Everyone can generate a screen now. Ask any of them for a fintech dashboard and you will have something in eight seconds. Genuinely impressive, and completely undifferentiated. Now ask it to move the transfer button twelve pixels to the right and make the corner radius a little tighter.

Good luck.

You will type a follow-up prompt. Then another. Then you will re-roll the whole thing and lose the two parts you actually liked. This is the prompt wall: the first 90% arrives almost free, and the last 10% costs more than doing it by hand would have.

Why does this happen? Daniel Kahneman gave us the vocabulary for it years before any of this existed.

- **System 2** is slow, deliberate, effortful. Prompting lives here. You have to translate a spatial intention into a sentence: *"move the button 12px right and set the border radius to 8"*. That is a translation tax you pay on every single tweak.
- **System 1** is fast, intuitive, automatic. Dragging a thing to where you want it lives here. So does clicking a swatch, or nudging with an arrow key.

Every prompt-only tool forces visual thinkers to work in System 2 forever. Stage hands them back System 1 for the part where it matters.

**Generate the first 90%. Finish the last 10% by hand.**

---

## Try it in 60 seconds

This is the whole argument, and you can run it yourself on the [live prototype](https://adobestageproto.netlify.app/). No account, no API key, no install. On first load a ghost cursor runs the whole argument by itself in about nine seconds, silently, and hands control back the moment you touch anything.

**1. Pick a concept, then pick a different one.**
Stage opens on the campaign surface. Switch the workspace to **UI/UX Design**, then in the Stage AI bar click **A music streaming app**, followed by **An online shopping app**. Watch what changes. The first becomes a media player with large artwork, a scrubber and a queue, in purple. The second becomes a catalogue with a promo banner and a product grid, in rose. The composition changes, not just the wording, and the brand colour comes with it.

**2. Notice the second surface.**
The footer of the AI panel now says *Graphic Design updated*. Click it to go back. The same concept is already laid out as a 4:5 social ad, using the same brand name and the same headline logic. One starting point, two surfaces, one brand. This is the part Figma and Canva make you do twice.

**3. Now finish it by hand, without prompting again.**
This is the part nothing else does. Select anything on the canvas. Then:

| What you want | How you do it |
|---|---|
| Move it roughly | Drag it |
| Move it precisely | Arrow keys, or Shift + arrow for 10px steps |
| Move it exactly | Drag the blue X or Y in the properties panel, the way you would in After Effects, or click it and type |
| Resize it | Drag any of the four corner handles |
| Rewrite the copy | Click the text and type. It is live on the artboard, not in a side field |
| Recolour it | Fill swatch in the properties panel |
| Line it up | The six alignment buttons |
| Add something | Shape and text tools in the toolbar, then Delete to remove |

**4. Change your mind, freely.**
`Cmd+Z` walks back through every edit, including a whole drag or resize as one step. `Shift+Cmd+Z` goes forward again. Then open **Parameters** in the Stage AI bar, drop **fidelity** below 35%, and watch the same layout render as a greyscale wireframe. Raise it and the polish comes back.

That is the proof. You never re-prompted to get the last 10%, and you never lost the 90% you already had.

---

## What actually works, and what does not

I would rather be honest about a prototype than oversell it, so the app itself marks this distinction: anything greyed out in the interface is deliberately unbuilt, and hovering it says so.

**Working today**

- Three app compositions (analytics dashboard, media player, catalogue) and two campaign compositions (type poster, product ad), switchable by hand from the toolbar or chosen for you by the prompt
- A dozen one-click starting points that pick the layout, palette, copy and theme, answered by real Gemini or OpenAI calls when you supply a key and by deterministic archetypes when you do not
- A scripted ghost-cursor walkthrough on first load
- A generated accent colour that carries through the whole screen
- Scrubbable numeric values, disclosure groups and keyframe affordances, modelled on Premiere's panels
- Drag, four-corner resize, arrow-key nudge, delete
- Inline text editing directly on the artboard
- X / Y / W / H scrub controls, six-way alignment, fill colour, opacity, transform reset
- Undo and redo across every edit
- Fidelity and creativity parameters that genuinely change the output, not just the UI
- Light and dark theme tokens
- Layer tree that reflects generated content

**Deliberately not built**

Brand DNA library integration, multi-user collaboration, export to code and assets, Creative Cloud Libraries, auto layout, and the Prototype and Inspect tabs. These are visible in the UI because they are where the product goes next, and a launch deck that hides its roadmap is not much of a launch deck.

---

## Bring your own model

Stage never sees your key and there is no Stage server to send it to. Paste a Gemini or OpenAI key into the **Guide & key** dialog and it is written to your browser's local storage, then sent only to that provider's own endpoint. Clear the field and continue to remove it.

You can also override the model id in that dialog. Leave it blank and Stage uses `gemini-2.5-flash` or `gpt-5.6-luna`. This field exists because it bit me: the prototype originally shipped `gemini-2.0-flash` and `gpt-4o-mini`, both of which have since been retired, and because a failed call quietly falls back to demo mode the symptom was not an error message. It was a prompt bar that appeared to do nothing at all. If generation stops working, check the model id first. The Stage AI footer now shows the provider's actual error in amber, and the status pill tells you which model it is calling.

Free-form typing is switched off on purpose. A prototype that invites any sentence and then answers most of them badly is worse than one that offers a dozen starting points and handles every single one properly, so the composer is greyed out and the suggestion chips are the whole input surface.

Without a key those starting points still work. Stage scores them against twelve domains covering banking, crypto, music, fitness, ecommerce, SaaS, travel, food, education, social, real estate, and hiring, and when none of them fit it builds an archetype out of your own words. Ask it for a plant care reminder tool and you get PlantCare, not a placeholder. It is an approximation and it says so, but it is enough to walk the whole demo.

---

## The go-to-market, briefly

| Phase | Strategy | Target |
|---|---|---|
| **Land** | Product-led community blitz: Product Hunt, design Twitter, YouTube design educators | 10M free signups in year one |
| **Expand** | Native embed inside the Creative Cloud desktop app and its 25M+ subscribers | Time to first value under 60 seconds |
| **Enterprise** | PQL trigger at 5+ users on a domain, then sell governance, SSO, and Firefly IP indemnification | $100M ARR |

### Against the field

| | Figma / Canva | Google Stitch / prompt-only UI tools | Adobe Stage |
|---|---|---|---|
| **Philosophy** | Manual, human-led vector authoring | Code generation from prompts | AI-assisted visual system |
| **Surface scope** | UI *or* social, in separate products | Mostly app dashboards | UI/UX and brand in one canvas |
| **Enterprise safety** | Limited AI indemnification | Ambiguous training data provenance | Commercially safe via Firefly |
| **The last 10%** | Manual effort, which is the point | Uncontrollable re-prompting | Direct manipulation |

---

## Where I might be wrong

Two things worth saying out loud.

First, the moat here is thinner than the pitch implies. Nothing stops Figma from shipping a good prompt bar, and they have the distribution to make it stick on day one. Stage wins only if the direct-manipulation layer is genuinely better, not merely present, and that is an execution bet rather than a strategic one.

Second, the wireframe-to-high-fidelity slider is the feature I am least sure about. It demos beautifully. Whether a working designer reaches for it twice in a real project, I honestly don't know. It might turn out to be a lovely idea that nobody uses, and I would want that answered by usage data before it got engineering headcount.

---

## Running it locally

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`. `npm run build` produces the static bundle, `npm run lint` checks the source, and `netlify.toml` holds the deploy config so the hosting setup lives in the repo rather than in a dashboard somewhere.

`./scripts/backup.sh` snapshots the whole repository, every branch and tag, into a single `.bundle` file under `~/Backups/git-bundles/`, along with a tarball of anything git is not tracking. Restoring is `git clone <bundle> recovered-repo`. Worth running before anything that rewrites history.

**Stack:** React 19 and Vite, Tailwind with a design token layer sampled from Adobe's own products, Lucide icons, Source Sans 3, deployed on Netlify. The launch deck is a standalone static page in `public/deck.html`, served at [/deck.html](https://adobestageproto.netlify.app/deck.html).

**Structure:**

```
src/
  App.jsx                      editor shell, gestures, keyboard, orchestration
  state/document.js            the document, the layout registry, undo/redo
  services/aiService.js        Gemini and OpenAI calls, plus the demo generator
  components/
    AIPanel.jsx                the Stage AI bar and its starting points
    GhostDemo.jsx              the scripted first-run walkthrough
    CanvasElement.jsx          selection frame, corner handles, drag targets
    ScrubValue.jsx             drag-to-change numeric values
    PropertiesPanel.jsx        the inspector
    LayersPanel.jsx            the layer tree
    Onboarding.jsx             the guided intro
    primitives.jsx             buttons, layer rows, inline editing
    artboards/
      AppShell.jsx             app chrome, hosts the three app compositions
      DashboardLayout.jsx      KPI row, hero metric, activity list, chart
      PlayerLayout.jsx         artwork, now playing, transport, queue
      CatalogLayout.jsx        promo banner, product grid, order list
      CampaignArtboard.jsx     type poster and product ad compositions
      surfaces.jsx             shared surface treatment for all layouts
      color.js                 accent tinting and shading
```

---

## Credit

Built as a team project for the Product Marketing course at Carnegie Mellon University. The prototype, the deck, and this write-up are the launch artefacts for a product that does not exist yet, which is the fun of the assignment.
