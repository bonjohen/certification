# Content Security Policy for Static Sites

## The Lesson

A Content Security Policy (CSP) is achievable on a static site without server-side headers by using a `<meta>` tag. The challenge is crafting a policy that's strict enough to block XSS but permissive enough to allow legitimate functionality — especially ES module imports from CDNs and inline styles from design system tokens.

## Context

The quiz application renders user-facing content from JSON data files using `innerHTML`. A code review identified this as an XSS vector. The remediation was two-fold: (1) sanitize HTML before insertion, (2) add CSP as a defense-in-depth layer.

## What Happened

A CSP meta tag was added to `quiz.html` and `results.html`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' https://esm.sh; 
               connect-src 'self' https://esm.sh; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data:;">
```

## Key Insights

- **`<meta>` CSP works for static sites.** You don't need server-side header configuration. The browser respects CSP from meta tags with the same enforcement as headers (with minor exceptions: `frame-ancestors` and `report-uri` are header-only).
- **`script-src 'self'` blocks inline scripts.** This is the primary XSS mitigation. Even if an attacker injects `<script>alert(1)</script>` via innerHTML, the CSP blocks it.
- **CDN imports need explicit allowlisting.** `script-src 'self' https://esm.sh` allows modules from the CDN. Without this, the Ajv schema validator import would be blocked.
- **`'unsafe-inline'` for styles is a pragmatic concession.** Many CSS-in-JS patterns and inline `style` attributes require it. The alternative (`nonce` or `hash`) doesn't work with `<meta>` CSP. This is acceptable because style injection is not an XSS vector in most threat models.
- **CSP and sanitization are complementary, not redundant.** Sanitization prevents the injection. CSP prevents execution if sanitization fails. Both are needed for defense in depth.

## Information Needed to Complete This Document

- [ ] Document the full CSP directive and what each part allows/blocks
- [ ] Show what happens when CSP blocks a violation (browser console error)
- [ ] Discuss CSP reporting: can static sites use report-to or report-uri?
- [ ] Address the `'unsafe-inline'` tradeoff in more detail
- [ ] Test and document which browsers support `<meta>` CSP fully
