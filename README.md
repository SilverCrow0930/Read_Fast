# Read Fast

Read Fast is a modern web application that helps users read faster and more efficiently by converting text into a bionic reading format. The app highlights key parts of words to guide the reader's eyes, making reading quicker and more focused.

## Features

- **Text Conversion**: Convert any text into bionic reading format in real-time
- **File Support**: Convert PDF, EPUB, DOCX, and TXT files (for subscribed users)
- **Google Authentication**: Easy sign-in with Google account
- **Subscription Plans**: Free and Ultimate tiers with different features
- **Modern UI**: Clean and responsive design with Tailwind CSS

## Tech Stack

- Frontend: React with TypeScript
- Styling: Tailwind CSS
- Authentication: Supabase Auth
- Storage: Supabase Storage
- Payments: Stripe

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your API keys:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

MIT License - feel free to use this project for your own purposes. 
