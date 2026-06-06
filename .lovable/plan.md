## Add Category & Condition to listings

### 1. Database
Add two required `text` columns to `listings` via migration:
- `category` (NOT NULL, with a temporary default `'Other'` to backfill existing rows, then drop default)
- `condition` (NOT NULL, with a temporary default `'Good'` to backfill, then drop default)

### 2. Constants
New file `src/lib/listingOptions.ts` exporting:
- `CATEGORIES`: Dress, Shoes, Bag, Jackets Fleeces & Knitwear, Books, Kids stuff, Tops & T-Shirts, Bottoms, Accessories & Homewares, Stationery, Games, Skirts
- `CONDITIONS`: New with tags, New without tags, Very good, Good, Satisfactory

### 3. Log form (`LogTab.tsx`)
- Add Category `<select>` and Condition `<select>` (full-width rows, placeholder "Select…")
- Both required — Save button stays disabled until both chosen (alongside item + price)
- Reset to unselected on save

### 4. Types & hook
- Add `category: string; condition: string` to `Listing` type in `useListings.ts`
- Pass through `add()` insert payload

### 5. Entry cards (`EntryCard.tsx`)
- Show two small badges (category + condition) under the item name, next to date/price
- Add Category + Condition selects to the `EditForm` so users can fix older entries

### 6. Stats / Insights (`StatsTab.tsx` + `lib/stats.ts`)
- Compute best category (highest avg views) and best condition
- Add two new stat cards: "Best category" and "Best condition"

### 7. AI Advisor (`supabase/functions/advisor/index.ts`)
- Include `category` and `condition` in the per-listing line sent to the model

### Notes
- No filtering UI in Entries tab (per your scope selection)
- Old listings get backfilled with defaults ("Other" / "Good") so nothing breaks; you can edit them via the Edit form
