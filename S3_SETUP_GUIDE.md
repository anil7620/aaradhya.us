# AWS S3 Bucket Setup Guide for Image Access


## Step-by-Step Instructions

### Step 1: Disable Block Public Access

**This is CRITICAL - must be done FIRST before adding bucket policy.**

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click on your bucket: `-in-production`
3. Click on the **Permissions** tab
4. Scroll down to **Block Public Access (bucket settings)**
5. Click **Edit**
6. **UNCHECK ALL 4 checkboxes:**
   - ✅ Block public access to buckets and objects granted through new access control lists (ACLs)
   - ✅ Block public access to buckets and objects granted through any access control lists (ACLs)
   - ✅ Block public access to buckets and objects granted through new public bucket or access point policies
   - ✅ Block public and cross-account access to buckets and objects through any public bucket or access point policies
7. Click **Save changes**
8. Type `confirm` in the confirmation dialog
9. Click **Confirm**

**Important:** If you see a warning about public access, that's expected. Click through it.

### Step 2: Add Bucket Policy

1. Still in the **Permissions** tab
2. Scroll down to **Bucket policy**
3. Click **Edit**
4. Copy and paste this EXACT policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
    }
  ]
}
```

5. Click **Save changes**

**Note:** If you get an error saying the policy is invalid, go back to Step 1 and make sure ALL Block Public Access settings are disabled.

### Step 3: Configure CORS (Optional but Recommended)

This helps prevent CORS errors when loading images in browsers.

1. Still in the **Permissions** tab
2. Scroll down to **Cross-origin resource sharing (CORS)**
3. Click **Edit**
4. Copy and paste this CORS configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

5. Click **Save changes**

### Step 4: Verify Object Permissions

1. Go to the **Objects** tab
2. Navigate to the `products/` folder
3. Click on an image file
4. Go to the **Permissions** tab for that object
5. Under **Access control list (ACL)**, you should see:
   - **Public access**: Enabled (if ACLs are enabled)
   - OR the object inherits permissions from the bucket policy

**Note:** If ACLs are disabled (which is common), the bucket policy from Step 2 will handle public access.

### Step 5: Test Image Access

1. Copy a full image URL from your database, for example:
   ```
   ```
2. Paste it directly into your browser's address bar
3. The image should load. If you see:
   - ✅ **Image displays**: Success! Your bucket is configured correctly.
   - ❌ **Access Denied / 403 Forbidden**: Go back to Step 1 and Step 2
   - ❌ **404 Not Found**: The file doesn't exist at that path. Check the URL.

## Troubleshooting

### Error: "Bucket policy is invalid"
- **Cause:** Block Public Access is still enabled
- **Solution:** Go back to Step 1 and disable ALL 4 Block Public Access settings

### Error: "Access Denied" when viewing images
- **Cause:** Bucket policy is missing or incorrect
- **Solution:** 
  1. Verify Step 1 is complete (all Block Public Access disabled)
  2. Verify Step 2 bucket policy is exactly as shown above

### Images upload but don't display
- **Cause:** Bucket policy allows upload but not public read
- **Solution:** Make sure Step 2 bucket policy includes `s3:GetObject` action

### CORS errors in browser console
- **Cause:** CORS not configured
- **Solution:** Complete Step 3 to add CORS configuration

## Quick Checklist

- [ ] All 4 Block Public Access settings are DISABLED
- [ ] Bucket policy is added with `s3:GetObject` permission for `products/*`
- [ ] CORS is configured (optional but recommended)
- [ ] Test image URL loads in browser directly
- [ ] Images display in admin panel

## Security Note

This configuration makes all files in the `products/` folder publicly readable. This is appropriate for product images that need to be displayed on your website. If you need to store private files, create a separate folder (e.g., `private/`) without public access.
