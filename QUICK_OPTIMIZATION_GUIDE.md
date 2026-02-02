# Quick Performance Optimization Guide

## 🚀 Immediate Actions (Do These First)

### 1. Create Database Indexes (5 minutes)
**Impact**: 50-90% faster database queries

```bash
npm run create-indexes
```

Or manually in MongoDB:
```javascript
// Products
db.products.createIndex({ isActive: 1, category: 1 })
db.products.createIndex({ createdAt: -1 })

// Orders
db.orders.createIndex({ customerId: 1, createdAt: -1 })
db.orders.createIndex({ status: 1, createdAt: -1 })

// Users
db.users.createIndex({ email: 1 }, { unique: true })

// Categories
db.categories.createIndex({ slug: 1 }, { unique: true })
```

### 2. Verify Cache Headers (Already Done ✅)
Cache headers have been added to:
- `/api/products` - 60 seconds cache
- `/api/categories` - 5 minutes cache
- `/api/homepage` - 5 minutes cache
- `/api/products/[id]` - 60 seconds cache

### 3. Test Performance
```bash
# Build and analyze bundle
npm run build

# Check Lighthouse scores
# Open Chrome DevTools > Lighthouse > Run audit
```

## 📊 Expected Performance Improvements

| Optimization | Expected Improvement |
|-------------|---------------------|
| Database Indexes | 50-90% faster queries |
| API Caching | 60-80% faster responses (cached) |
| Image Optimization (Next.js) | 30-50% smaller images |
| Bundle Optimization | 20-30% smaller bundles |

## 🔍 Monitoring Performance

### Check Current Performance:
1. **Lighthouse**: Run in Chrome DevTools
2. **Network Tab**: Check API response times
3. **MongoDB**: Check slow query log

### Key Metrics to Watch:
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **API Response Time**: < 200ms (cached: < 50ms)

## ⚠️ Next Steps (Optional but Recommended)

1. **Replace ProductImage with Next.js Image** (Medium effort, High impact)
   - Use Next.js Image component for automatic optimization
   - Enables WebP/AVIF conversion
   - Responsive images

2. **Implement ISR for Product Pages** (Medium effort, Medium impact)
   - Static generation with revalidation
   - Faster page loads

3. **Add Bundle Analyzer** (Low effort, Medium impact)
   - Identify large dependencies
   - Optimize imports

## 📝 Checklist

- [x] Added cache headers to API routes
- [x] Optimized Next.js config (images, compression)
- [x] Created database index script
- [ ] Run database index script
- [ ] Test performance improvements
- [ ] Monitor Lighthouse scores
- [ ] Replace ProductImage with Next.js Image (optional)
- [ ] Implement ISR for product pages (optional)

## 🎯 Quick Wins Summary

✅ **Already Implemented:**
- Image optimization config (AVIF/WebP)
- API route caching
- Compression enabled
- Font optimization

⏳ **To Do:**
- Run database index script
- Test and monitor performance

📈 **Expected Results:**
- 50-70% faster database queries
- 60-80% faster API responses (when cached)
- Better Lighthouse scores
- Improved user experience
