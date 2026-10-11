# Thuli Sample Applications

This directory contains standalone reference applications demonstrating how to integrate and use components and utilities from `@comify.art/thuli`.

---

## Available Samples

### 1. [`simple-app`](./simple-app)

A minimal Vite + React + TypeScript application demonstrating:

- **Layout primitives**:
  - `Navbar` with brand logo, links, and action button slot.
  - `Footer` with multi-column links, contact details, and copyright.
- **UI primitives**:
  - `Modal` standard dialog.
  - `ConfirmationModal` dangerous action confirmation dialog.
  - `ComingSoon` stub placeholder component.
- **Utilities**:
  - `copyToClipboard` from `@comify.art/thuli/utils/shareUtils`.
- **Styling**:
  - Integration with `@comify.art/thuli/style.css`.

---

## Running the Sample Application

1. **Navigate to the sample**:
   ```bash
   cd samples/simple-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run local development server**:
   ```bash
   npm run dev
   ```

4. **Build production bundle**:
   ```bash
   npm run build
   ```
