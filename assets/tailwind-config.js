/* ==========================================================================
   Golden Pearl Trading & Contracting — shared Tailwind theme
   --------------------------------------------------------------------------
   SINGLE SOURCE OF TRUTH for the design system.

   This file replaces the ~90-line `tailwind.config` block that used to be
   copy-pasted into all four HTML pages. Those copies had drifted: the brand
   gold was #d4af37 on index.html but #f2ca50 everywhere else, and the page
   background was #000000 on one page and #131313 on the others.

   Load order in every page's <head> matters:
     1. this file
     2. https://cdn.tailwindcss.com
   ========================================================================== */

window.tailwind = window.tailwind || {};
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* --- Obsidian: page and panel surfaces, darkest to lightest --- */
        obsidian: '#0a0a0a',       // page background
        surface: '#0f0f0f',        // default section background
        'surface-2': '#151515',    // raised panel / card
        'surface-3': '#1c1c1c',    // hover state on a card
        'surface-4': '#252525',    // chips, inputs

        /* --- Brushed gold: THE brand colour, defined once --- */
        gold: '#d4af37',           // primary. 9.5:1 on obsidian — AA at all sizes
        'gold-light': '#f2ca50',   // hover / highlight only, never a fill behind text
        'gold-dark': '#8f7420',    // borders, dividers, pressed state
        'on-gold': '#241a00',      // text on a gold fill. 11.8:1 — AA

        /* --- Text. Every value below is AA-compliant on obsidian --- */
        ink: '#ffffff',            // 20.4:1 — headings
        'ink-muted': '#d6d3cd',    // 13.6:1 — body copy
        'ink-subtle': '#a8a29a',   //  7.9:1 — captions, metadata
        /* NOTE: the old design used text at /5 and /40 opacity (roughly
           1.2:1 and 4.1:1). Both failed WCAG AA badly. Use ink-subtle
           instead of an opacity modifier on text. */

        /* --- Lines --- */
        line: '#2a2a28',           // neutral hairline
        'line-gold': '#3d3320',    // gold-tinted hairline

        /* --- Feedback --- */
        error: '#ffb4ab',
        success: '#8fd694',
      },

      /* Fluid type. The old scale was fixed px — a 64px display and a 96px
         about-page h1 overflowed on a 375px phone, and the marquee was 120px.
         clamp() lets the same token work at both ends. */
      fontSize: {
        'display-xl': ['clamp(2.75rem, 7vw, 5.5rem)', { lineHeight: '1.04', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['clamp(2.25rem, 5.5vw, 4rem)', { lineHeight: '1.08', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['clamp(1.75rem, 3.6vw, 3rem)', { lineHeight: '1.14', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-md': ['clamp(1.375rem, 2.4vw, 2rem)', { lineHeight: '1.22', fontWeight: '500' }],
        'headline-sm': ['clamp(1.125rem, 1.6vw, 1.375rem)', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['clamp(1rem, 1.15vw, 1.125rem)', { lineHeight: '1.65', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.65', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],
        'label-caps': ['0.75rem', { lineHeight: '1.1', letterSpacing: '0.15em', fontWeight: '700' }],
        'eyebrow': ['0.6875rem', { lineHeight: '1.1', letterSpacing: '0.3em', fontWeight: '700' }],
        'stat': ['clamp(2.25rem, 4.5vw, 3.5rem)', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
      },

      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
      },

      /* 8px rhythm */
      spacing: {
        gutter: '2rem',
        'margin-mobile': '1.5rem',
        'margin-desktop': '5rem',
        'section-gap': 'clamp(4rem, 9vw, 7.5rem)',
      },

      maxWidth: {
        container: '84rem',   // 1344px
        prose: '42rem',
      },

      borderRadius: {
        /* The README claims "zero border-radius ... architectural rigidity"
           but the old config defined four radii and the markup used them.
           Honouring the stated intent: sharp by default, one soft value for
           pills only. */
        DEFAULT: '0',
        none: '0',
        sm: '0',
        pill: '9999px',
      },

      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },

      zIndex: {
        nav: '50',
        drawer: '90',
        modal: '100',
      },
    },
  },
};
