# Social Media Contest App

A contest-based marketplace for creating Instagram and TikTok content. Business owners create contests, designers submit work, and the platform manages a 3-round selection process similar to 99designs.

## Features

### For Business Owners
- Create contests for Instagram & TikTok content
- Upload brand guidelines (colors, fonts, style)
- Review submissions through 3 rounds
- Accept, pass, or comment on designs
- Download final designs in correct formats
- Contest ends automatically when quota is reached

### For Designers
- Browse and join active contests
- Download brand files and guidelines
- Submit designs through multiple rounds
- Receive feedback and iterate
- Track progress and acceptance

### Technical Features
- Next.js 14 with App Router
- TypeScript for type safety
- NextAuth.js for authentication
- Prisma ORM with PostgreSQL
- TailwindCSS for styling
- Storage abstraction layer (easily switch from Render Disk to AWS S3)
- File serving with proper validation
- Role-based access control

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd social-media-contest-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```bash
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/social_media_contest_app"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"

   # Storage
   STORAGE_DRIVER="render-disk"
   UPLOAD_DIR="/data/uploads"

   # For local development
   LOCAL_UPLOAD_DIR="./uploads"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma db push

   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   └── designer/          # Designer dashboard
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── providers/        # Context providers
├── lib/                   # Utility libraries
│   ├── storage/          # Storage abstraction layer
│   ├── validations/      # Zod schemas
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Helper functions
└── types/                # TypeScript type definitions

prisma/
└── schema.prisma         # Database schema
```

## Database Schema

The application uses the following main entities:

- **User**: Authentication and user management
- **Brand**: Brand guidelines and assets
- **Contest**: Contest information and configuration
- **Submission**: Designer submissions per round
- **Comment**: Feedback on submissions
- **Asset**: File attachments (images/videos)

## Contest Flow

1. **Round 1 - Initial Submissions**
   - Designers submit initial concepts
   - User reviews and selects semi-finalists

2. **Round 2 - Refinement**
   - Selected designers refine their work
   - User provides feedback and selects finalists

3. **Round 3 - Final**
   - Finalists submit polished designs
   - User accepts designs until quota is reached
   - Contest ends automatically

## Storage Configuration

The app uses a storage abstraction layer that supports:

### Render Disk Storage (Default)
- Files stored on local/persistent disk
- Served via `/api/files/[filename]` endpoint
- Good for MVP and development

### AWS S3 Storage (Future)
- Switch by changing `STORAGE_DRIVER=aws-s3`
- Add AWS credentials to environment
- Seamless migration from disk storage

## API Routes

### Authentication
- `POST /api/auth/signup` - Create new account
- `GET/POST /api/auth/[...nextauth]` - NextAuth handlers

### Contests
- `GET /api/contests` - List user's contests
- `POST /api/contests` - Create new contest
- `GET /api/contests/[id]` - Get contest details

### Work
- `GET /api/work` - Get accepted designs

### Files
- `GET /api/files/[filename]` - Serve uploaded files

## Deployment

### Render Deployment

1. **Create services on Render:**
   - Web Service for the Next.js app
   - PostgreSQL database
   - Persistent disk for file storage

2. **Environment variables:**
   ```bash
   DATABASE_URL=<render-postgres-url>
   NEXTAUTH_URL=<your-render-app-url>
   NEXTAUTH_SECRET=<secure-random-string>
   STORAGE_DRIVER=render-disk
   UPLOAD_DIR=/data/uploads
   ```

3. **Build settings:**
   - Build Command: `npm run build`
   - Start Command: `npm start`

### Migrating to AWS S3

When ready to migrate storage:

1. **Add AWS environment variables:**
   ```bash
   STORAGE_DRIVER=aws-s3
   AWS_S3_BUCKET_NAME=your-bucket
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   ```

2. **Implement S3Storage class** (TODO in `src/lib/storage/s3-storage.ts`)

3. **Migrate existing files** (custom script needed)

## Development

### Running Tests
```bash
npm run test
```

### Linting
```bash
npm run lint
```

### Database Management
```bash
# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma db reset

# Generate types after schema changes
npx prisma generate
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Add your license here]