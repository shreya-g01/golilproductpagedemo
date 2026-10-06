# Gulf Product Page 2.0 – Prototype

Concept prototype for the Gulf Oil Lubricants India website revamp. **All product data is prototype / demonstration data.**

## What the prototype demonstrates
One product-page template that turns every product into a search entry point, an answer source, a technical
knowledge asset, an entity hub and a conversion point. Five demo products share the same template; switch
between them with "View another product" in the top bar.

## How to run
Unzip and double-click `index.html` (Chrome recommended). No server, install or internet connection is needed.

## The 16 product-page bands
| # | Band | Where |
|---|---|---|
| 1 | Product name | Hero: name, description, product code, status |
| 2 | Product category | Clickable taxonomy and the page's unique URL |
| 3 | Application | Recommended applications, each linking to an application page |
| 4 | Industry | Industries, each linking to an industry page |
| 5 | Vehicle / equipment | Searchable manufacturer and model list (illustrative) |
| 6 | OEM / specifications | HTML table; each row opens "What does this specification mean?" |
| 7 | Approvals | Placeholder approval cards with a details view |
| 8 | Key technical data | HTML table of typical properties |
| 9 | Benefits | Benefit cards |
| 10 | TDS / SDS | Document preview, download, and an on-page summary |
| 11 | FAQs | Eight questions, generated from the product record |
| 12 | Related products | Cards that load the same template with another product |
| 13 | Related applications | Links to application pages |
| 14 | Technical articles | Article cards linking to article pages that link back |
| 15 | Distributor / Buy / Enquire | Pincode distributor finder, enquiry and quote forms |
| 16 | Talk to a Gulf Expert | Form with the product pre-filled |

Also on the page: Quick Answer, "Explore this product through" with a clickable knowledge graph,
"Search this product" long-tail queries, sticky conversion bar, Ask Gulf AI, product comparison.
"Band numbers" in the top bar hides or shows the numbered labels.

## SEO architecture
- Unique URL per product: `/products/[category]/[product-slug]`, simulated with hash routes
- Title, meta description, canonical and Open Graph tags generated per page (`setMeta`)
- Semantic HTML with one H1 per page and H2/H3 beneath it
- Clickable breadcrumbs plus BreadcrumbList JSON-LD
- Technical data, specifications and approvals in HTML, with the PDF as supporting evidence
- "SEO / GEO inspector" in the top bar shows the tags, heading outline and JSON-LD for the current page

## GEO architecture
- Quick Answer block: a short, self-contained definition of the product
- FAQ answers written to stand alone, published as FAQPage JSON-LD
- Product JSON-LD with properties, specifications, related products and related articles
- Article JSON-LD on knowledge pages
- No ranking or citation outcome is claimed; the page shows the structure

## Entity relationships
Product ↔ Application ↔ Industry ↔ Vehicle / Equipment ↔ OEM ↔ Specification ↔ Technical Article ↔ Related Product.
Every entity is a link. Application, industry, OEM and article pages list the products that reference them.

## Conversion architecture
Hero CTAs, sticky bar, band 15 and band 16 all lead to the same three actions: find a distributor, enquire,
talk to an expert. Forms carry the product of interest. Submissions are stored in the browser (`localStorage`, key `gpp_leads`).

## Product data model
`data.js` holds `PRODUCTS`, each with: `id, name, sku, status, category, categoryPath, tagline, description, grade, keySpec,
applications, industries, vehicles, equipment, specifications, approvals, technicalData, benefits, documents,
relatedProducts, relatedApplications, technicalArticles`. `url`, `oems` and `faqs` are derived automatically.
Shared entities: `APPLICATIONS`, `INDUSTRIES`, `ARTICLES`, `SPEC_TYPES`, `DISTRIBUTORS`, `FINDER_TYPES`.

## How to add another product
Copy one object in `PRODUCTS`, change its fields, and reference existing application, industry and article ids.
The page, URL, FAQs, metadata, JSON-LD, internal links, switcher entry and footer link appear without further work.

## How this could connect to a CMS
The product record becomes a CMS content type (or a feed from the product information system). The template
is rendered server-side so crawlers receive the HTML and JSON-LD without JavaScript. TDS fields are entered as
structured data once and reused on the page, in the PDF and in structured data.

## How this could connect to the Product Finder
A recommendation in the Finder links to the product URL; the product page links back with "Find the Right Gulf Product".
This prototype includes a simplified four-step finder to show the loop.

## How this could connect to Gulf Lubrication Intelligence
The product record is the same entity used by the AI Advisor, equipment database, oil analysis, TCO calculator
and Lubrication Passport. "Ask Gulf AI" on this page answers only from the product record, which is the pattern
a grounded advisor would follow.

## Prototype limitations
- Product names, codes, specifications, technical values, benefits and compatibility are illustrative
- No real approvals are shown; manufacturer names do not imply approval or compatibility; model names are placeholders
- TDS and SDS are simulated previews; "Download" saves a labelled text file, not a PDF
- Ask Gulf AI is rule-based with no AI service behind it
- Distributors are invented; forms are not sent anywhere
- The canonical domain is a placeholder and the page is set to `noindex`
- Analytics events stay in the browser tab
- Header, footer and styling follow the brief and the logo colours, not an audit of the live Gulf site
- Hash routes stand in for real URLs; production needs server-side rendering
