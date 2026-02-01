# AARADHYA - Puja Items & Brass Products E-commerce

A Next.js e-commerce platform for selling premium puja items and handcrafted brass products.

## Features

- **Two User Roles:**
  - **Admin**: Full system access and management, can create and manage products
  - **Customer**: Can browse and purchase products

- **Product Management:**
  - Create, edit, and delete products
  - Product categories (puja items, brass products, other)
  - Stock management
  - Product images support

- **Authentication:**
  - JWT-based authentication
  - Role-based access control
  - Secure password hashing

- **Modern UI:**
  - Responsive design with Tailwind CSS
  - Clean and intuitive interface

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** MongoDB
- **Authentication:** JWT tokens

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Copy `.env.local.example` to `.env.local` and update with your configuration:
   ```
   MONGODB_URI=mongodb://localhost:27017/aaradhya
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   JWT_SECRET=your-jwt-secret-here
   AWS_ACCESS_KEY_ID=your-aws-access-key-id
   AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
   AWS_REGION=ap-south-1
   AWS_S3_BUCKET_NAME=aaradhya-in-production
   ```
   
   **Note:** 
   - For AWS S3 integration:
     - Get your AWS credentials from [AWS IAM Console](https://console.aws.amazon.com/iam/)
     - Create an IAM user with S3 upload permissions
     - Set the bucket name and region (default: `ap-south-1` for Mumbai)
     - **IMPORTANT:** See `S3_SETUP_GUIDE.md` for detailed step-by-step instructions
     - **Quick Setup:**
       1. Go to your S3 bucket → **Permissions** tab
       2. **Disable ALL 4 Block Public Access settings** (CRITICAL - must be done first)
       3. Add bucket policy for public read access:
          ```json
          {
            "Version": "2012-10-17",
            "Statement": [
              {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::aaradhya-in-production/products/*"
              }
            ]
          }
          ```
       4. (Optional) Add CORS configuration to prevent browser errors
     - **Note:** Even root accounts need to disable Block Public Access to allow public bucket policies
     - **If images don't load:** Check `S3_SETUP_GUIDE.md` for troubleshooting steps

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

4. **Access the Application:**
   Open [http://localhost:3000](http://localhost:3000)

## Creating an Admin User

To create an admin user, use the provided script:

```bash
npx tsx --env-file=.env.local scripts/create-admin.ts <email> <password> [name]
```

Example:
```bash
npx tsx --env-file=.env.local scripts/create-admin.ts admin@aaradhya.us mypassword123 "Admin User"
```

**Note:** The `--env-file=.env.local` flag is required to load environment variables. Make sure your `.env.local` file exists in the project root with the `MONGODB_URI` set.

Admin users cannot be created through the registration form for security reasons.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── products/          # Product pages
│   └── components/        # React components
├── lib/                   # Utility functions
│   ├── mongodb.ts         # MongoDB connection
│   ├── auth.ts            # Authentication utilities
│   ├── products.ts        # Product operations
│   └── models/            # TypeScript models
└── middleware.ts          # Route protection
```

## License

MIT

