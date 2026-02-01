# Instagram Reels Integration Setup Guide

This guide explains how to set up Instagram reels on your homepage.

## Option 1: Instagram Graph API (Recommended - Automatic)

### Prerequisites
1. Instagram Business or Creator account
2. Facebook Page connected to your Instagram account
3. Facebook Developer account

### Setup Steps

1. **Create Facebook App**
   - Go to https://developers.facebook.com/
   - Click "My Apps" → "Create App"
   - Choose "Business" type
   - Fill in app details

2. **Add Instagram Basic Display**
   - In your app dashboard, go to "Add Products"
   - Find "Instagram Basic Display" and click "Set Up"
   - Follow the setup wizard

3. **Get Access Token**
   - Go to "Basic Display" → "User Token Generator"
   - Add Instagram Testers (your account)
   - Generate token
   - For production, submit for App Review

4. **Get Instagram User ID**
   - Use this tool: https://www.instagram.com/{username}/?__a=1&__d=dis
   - Or use Facebook Graph API Explorer

5. **Add to Environment Variables**
   ```env
   INSTAGRAM_ACCESS_TOKEN=your_access_token_here
   INSTAGRAM_USER_ID=your_instagram_user_id
   ```

### Limitations
- Requires app review for production use
- Token expires (need to refresh)
- Rate limits apply

## Option 2: Manual Embed (Simple - No API)

### Steps

1. **Get Reel IDs**
   - Go to Instagram.com
   - Open each reel you want to display
   - Copy the reel ID from URL: `instagram.com/reel/{REEL_ID}/`

2. **Update Component**
   - Edit `app/page.tsx`
   - Replace `InstagramReels` with `InstagramReelsManual`
   - Add reel IDs:
   ```tsx
   <InstagramReelsManual 
     reels={[
       { reelId: 'C1234567890', caption: 'Reel description' },
       { reelId: 'C0987654321', caption: 'Another reel' },
     ]}
   />
   ```

3. **Add Instagram Embed Script**
   - The component includes the embed script automatically
   - Reels will load via Instagram's embed feature

### Pros
- ✅ No API setup needed
- ✅ Works immediately
- ✅ No rate limits
- ✅ No token expiration

### Cons
- ❌ Manual updates required
- ❌ Need to add each reel manually

## Option 3: Third-Party Service (Easiest)

### Services Available
- **EmbedSocial** - https://embedsocial.com/
- **Tagembed** - https://tagembed.com/
- **SnapWidget** - https://snapwidget.com/

### Steps
1. Sign up for service
2. Connect Instagram account
3. Get embed code/widget
4. Add to homepage

### Pros
- ✅ Easiest setup
- ✅ Auto-updates
- ✅ Good customization
- ✅ Analytics included

### Cons
- ❌ Usually paid service
- ❌ External dependency

## Current Implementation

The homepage currently uses **Option 1 (Graph API)** with fallback to follow button.

If API is not configured, users will see:
- Follow button linking to Instagram
- Message to check Instagram for latest reels

## Testing

1. **With API configured:**
   - Reels should load automatically
   - Check `/api/instagram/reels` endpoint

2. **Without API:**
   - Should show follow button
   - No errors in console

## Troubleshooting

### "Unable to load Instagram reels"
- Check if `INSTAGRAM_ACCESS_TOKEN` is set
- Verify token is valid and not expired
- Check Instagram account is connected to Facebook Page

### Reels not showing
- Verify user ID is correct
- Check API response in Network tab
- Ensure reels exist on account

### Rate limit errors
- Instagram has rate limits
- Implement caching (recommended)
- Consider manual embeds for important reels

## Recommended Approach

For production, I recommend:
1. **Start with Option 2 (Manual Embed)** - Quick setup, reliable
2. **Add 3-6 featured reels** manually
3. **Update monthly** with new reels
4. **Consider Option 3** if you want auto-updates and have budget

This gives you control and reliability without API complexity.
