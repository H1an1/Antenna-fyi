# Antenna Verification Email Template Design

## Goal

Create a paste-ready HTML email template for Antenna verification-code emails. The template should feel like Antenna's current dark console interface while staying practical for email clients.

## Scope

The template is a standalone embedded email HTML artifact, not a Next.js page. It should be suitable for pasting into Supabase Auth email templates or a similar transactional email provider.

The primary verification value is the Supabase token placeholder:

```html
{{ .Token }}
```

The template does not include JavaScript, React, external fonts, animation, or app routing.

## Visual Direction

Use the selected Signal Console direction:

- Dark outer background.
- Dark panel with a subtle ochre/gold border.
- Antenna wordmark in the header.
- Small mono label such as `SIGNAL AUTH`.
- Serif headline: `Verify your signal`.
- Large centered verification code in a mono treatment.
- Muted security/support copy below the code.

The mood should be branded and quiet, not decorative-heavy. The code remains the strongest visual element.

## Brand Asset

Use the Antenna SVG wordmark provided at:

```text
/Users/ekohan/Downloads/Antenna branding/Antenna.svg
```

For production email reliability, the final implementation should use a hosted image URL. The repo already contains `public/brand/antenna.svg`, so the first concrete source can be `https://www.antenna.fyi/brand/antenna.svg`. If delivery testing shows SVG rendering problems, export the same wordmark as PNG under `public/brand/` and update the email image source to that hosted PNG URL. The `img` element must include `alt="Antenna"` so the email still has a meaningful text fallback when images are blocked.

## Layout

Use email-safe table layout:

- Full-width wrapper table with dark page background.
- Centered inner table, approximately 560-600px wide.
- Header section with wordmark and label.
- Body section with headline, explanation, token block, and security note.
- Footer section with product/domain context.

All critical presentation should be inline styles. Any `<style>` block should be limited to safe resets or mobile conveniences that are nonessential if stripped.

## Copy

Suggested English copy:

- Preheader: `Your Antenna verification code is {{ .Token }}.`
- Label: `SIGNAL AUTH`
- Headline: `Verify your signal`
- Body: `Enter this code to continue to Antenna.`
- Code: `{{ .Token }}`
- Note: `This code expires soon. Never share it with anyone. If you did not request this, you can ignore this email.`
- Footer: `Antenna - antenna.fyi`

## Compatibility

The final HTML should avoid:

- CSS gradients as required structure.
- CSS filters for the wordmark.
- SVG-only rendering without fallback.
- Custom web fonts.
- CSS grid/flex as primary layout.
- JavaScript.

The template should render acceptably when images are blocked and when a client strips `<style>` tags.

## Testing

Before considering the template complete:

- Open the HTML locally in a browser to check visual hierarchy and spacing.
- Confirm `{{ .Token }}` appears exactly and has not been escaped or altered.
- Confirm the wordmark has an `alt` fallback.
- Confirm the email body remains readable without external assets.
- Run a lightweight repository check if the template is added to the project.
