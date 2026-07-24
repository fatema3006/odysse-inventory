# ODYSSE -- Inventory Management System (AI Agent Specification)

## Project Overview

**Project Name:** ODYSSE

A premium, mobile-first inventory management PWA for internal business
use.

### Tech Stack

-   Next.js 15 (App Router)
-   TypeScript
-   Tailwind CSS
-   shadcn/ui
-   Prisma ORM
-   PostgreSQL (Neon)
-   Framer Motion
-   PWA
-   Deploy on Vercel

## Design

-   Apple-inspired UI
-   Brand color: `#003027`
-   Rounded cards (20px)
-   Soft shadows
-   Glassmorphism (subtle)
-   Mobile-first
-   Dark mode
-   Inter font

## Home Page

Hero: - ODYSSE - Inventory Management - Greeting - Current date

Statistics Grid (2x2): 1. Add Product 2. Total Stock 3. Low Stock 4. Out
of Stock

Quick Access: - All Products - Variants

## Product Creation

Fields: - Product Name (required) - Category (custom) - Description
(optional)

### Variant Entry

Each product can have unlimited variants.

Fields: - Color (select or create custom) - Size (fixed dropdown:
36,37,38,39,40,41) - Initial Stock - SKU (optional)

Button: - **Add Variant**

The Add Variant button creates another variant row without saving.

Save Product saves the product and every variant in a single
transaction.

Prevent duplicate variants: (Product + Color + Size) must be unique.

## Categories

Unlimited custom categories.

CRUD supported.

## Colors

Unlimited custom colors.

Each color stores: - Name - Hex Code

Display a real color square beside the color name.

## All Products

Newest products first.

Each card displays: - Product Name - Category - Description - Total
Colors - Total Variants - Total Stock

Actions: - Edit - Delete

## Variants Page

Top: Product dropdown.

Selecting a product displays:

Example

Ladies Running Shoe

■ Black

Two-column grid:

Size 36 \| Stock 8 \| \[-\] 8 \[+\] Size 37 \| Stock 5 \| \[-\] 5 \[+\]

Size 38 \| Stock 2 \| \[-\] 2 \[+\] Size 39 \| Stock 1 \| \[-\] 1 \[+\]

Size 40 \| Stock 3 \| \[-\] 3 \[+\] Size 41 \| Stock 1 \| \[-\] 1 \[+\]

Repeat for every color.

Use optimistic UI.

No page refresh.

## Reports

-   Total Products
-   Total Variants
-   Total Stock
-   Low Stock
-   Out of Stock
-   Category Summary
-   Most Used Colors

## Database

Tables: - Category - Color - Product - ProductVariant

Relations:

Category -\> Products

Product -\> Variants

Color -\> Variants

Unique: Product + Color + Size

## PWA

Installable.

Standalone.

Offline support.

Splash screen.

App icon.

## Development Rules

-   Strict TypeScript
-   No any
-   Server Actions
-   Reusable components
-   Clean Architecture
-   Responsive
-   Mobile-first
-   Beautiful empty states
-   Skeleton loading
-   Toast notifications
-   Production-ready code

## Final Goal

Build a premium Apple-quality inventory management application optimized
for daily stock management on a smartphone. Every workflow should
require the fewest possible taps and feel polished like a commercial
SaaS product.
