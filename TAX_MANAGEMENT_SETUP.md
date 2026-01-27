# Tax Management System - Setup Guide

## Overview

A complete tax management system has been implemented with:
- Database storage for tax rates (MongoDB collection: `tax_settings`)
- Admin panel for managing tax rates
- API endpoints for fetching tax rates
- Automatic tax calculation during checkout
- Seed script to populate initial tax values

## Database Collection

**Collection Name:** `tax_settings`

**Schema:**
```typescript
{
  _id: ObjectId
  stateCode: string        // Two-letter state code (e.g., "CA", "NY")
  stateName: string        // Full state name (e.g., "California")
  taxRate: number          // Percentage (e.g., 7.25 for 7.25%)
  enabled: boolean         // Whether tax is enabled for this state
  notes?: string          // Optional notes
  createdAt: Date
  updatedAt: Date
}
```

## API Endpoints

### Public API

**GET `/api/tax?state=CA`**
- Get tax rate for a specific state
- Returns: `{ stateCode, stateName, taxRate, enabled }`
- Used by checkout page for real-time tax calculation

### Admin API

**GET `/api/admin/tax`**
- Fetch all tax settings (admin only)
- Returns: `{ taxSettings: TaxSetting[] }`

**PUT `/api/admin/tax`**
- Bulk update tax settings (admin only)
- Body: `{ taxSettings: TaxSetting[] }`
- Returns: `{ success, modifiedCount, upsertedCount }`

## Admin Panel

**Location:** `/admin/tax`

**Features:**
- View all 50 US states + DC with their tax rates
- Edit tax rates inline
- Enable/disable tax for specific states
- Add notes for each state
- Search and filter functionality
- Bulk save all changes

**Access:** Admin users only

## Seed Script

**File:** `scripts/seed-tax-settings.ts`

**Usage:**
```bash
npx tsx --env-file=.env.local scripts/seed-tax-settings.ts
```

**What it does:**
- Creates/updates tax settings for all 50 US states + DC
- Uses approximate tax rates (you should verify and update these)
- Sets all states to enabled by default
- Uses upsert to avoid duplicates

## How Tax Calculation Works

1. **During Checkout:**
   - User enters shipping address with state code
   - Frontend calls `/api/tax?state=CA` to get tax rate
   - Tax is calculated: `taxAmount = subtotal * (taxRate / 100)`
   - Total = subtotal + taxAmount

2. **Order Creation:**
   - Backend calls `calculateTaxForItems()` which reads from database
   - Falls back to default rates if database lookup fails
   - Tax rate and amount stored in order

3. **Admin Updates:**
   - Admin changes tax rates in `/admin/tax`
   - Changes saved to database
   - New orders use updated rates immediately

## Default Tax Rates

The seed script includes approximate tax rates for all states:
- **0%:** Alaska, Delaware, Montana, New Hampshire, Oregon
- **2.9% - 7.25%:** Most other states

**⚠️ Important:** These are approximate rates. You should:
1. Verify actual tax rates for your business
2. Update rates through admin panel
3. Consider local taxes (county/city) if needed
4. Consult with a tax professional

## Files Created/Modified

### New Files:
- `lib/models/TaxSettings.ts` - Tax settings model
- `app/api/admin/tax/route.ts` - Admin tax API
- `app/api/tax/route.ts` - Public tax API
- `app/admin/tax/page.tsx` - Admin tax management page
- `scripts/seed-tax-settings.ts` - Seed script

### Modified Files:
- `lib/tax.ts` - Updated to read from database
- `app/api/checkout/create-order/route.ts` - Uses async tax calculation
- `app/checkout/page.tsx` - Uses tax API for real-time calculation
- `app/admin/page.tsx` - Added "Tax Settings" card

## Next Steps

1. **Run Seed Script:**
   ```bash
   npx tsx --env-file=.env.local scripts/seed-tax-settings.ts
   ```

2. **Access Admin Panel:**
   - Go to `/admin/tax`
   - Review all tax rates
   - Update rates as needed
   - Save changes

3. **Test Checkout:**
   - Add items to cart
   - Go to checkout
   - Enter different state codes
   - Verify tax calculation updates

4. **Verify Rates:**
   - Check actual tax rates for your business
   - Update through admin panel
   - Consider adding notes for special cases

## Future Enhancements

- County/city level tax rates
- Tax exemption handling
- Tax rate history/audit log
- Import/export tax settings (CSV)
- Tax rate validation
- Integration with tax calculation APIs (if needed)

## Notes

- Tax rates are stored per state (not per product category)
- Disabled states will have 0% tax applied
- Changes take effect immediately after saving
- Database lookup has fallback to default rates for reliability
