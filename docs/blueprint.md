# **App Name**: FundFlow

## Core Features:

- User Authentication & Bonus: User authentication with local storage; first-time users get a bonus of ₹50.
- Investment Plan Display: Display of five fixed investment plans with details like duration and return amount.
- Deposit Functionality: Deposit functionality with fixed amounts, QR code display, and Telegram integration for submitting transaction details. Animated 'waiting for approval' screen.
- Withdrawal Request: Withdrawal page with input for amount and UPI ID; Minimum withdrawal is ₹410. Telegram integration for submitting withdrawal requests.
- User Profile & Investments: Profile page with user details, investment list with progress bars, and promo code input.
- Referral System: Referral system with a shareable link to earn a ₹100 bonus, prompting the user to contact an agent via Telegram if something goes wrong.
- Real-Time Notification Simulation: Simulate activity with randomized, real-time push notifications like, “👤 Ramesh just invested ₹1000” using an AI tool to simulate a list of existing users to build trust with the user.
- Bottom Navigation Bar: Navigation bar at the bottom of the screen
- Transaction History Page: Show all deposit, withdraw, investment records each with status: success / pending, styled layout with icons and colored tags
- Storage & Updates: All user data stored using localStorage (balance, investments, promo usage, etc.) Investment timers update daily to simulate returns. On each login or app visit, user sees updated stats
- Telegram Integration: All user actions (deposit, withdraw, invest, promo issue) redirect to admin’s Telegram link for manual handling. No backend or database needed. Just styled frontend with pre-filled links
- UI/UX & Design: Full TailwindCSS-based responsive design, Dark mode default, Rounded cards, soft shadows, clean spacing, Animated icons & smooth transitions

## Style Guidelines:

- Primary color: Saturated blue (#4285F4) to evoke trust and stability, aligning with financial services aesthetics.
- Background color: Light desaturated blue (#E3F2FD) to provide a calm, trustworthy feel.
- Accent color: Vibrant orange (#FF5722) to highlight key actions, calls to action and important information. A stark departure from the primary color ensures high visibility.
- Body and headline font: 'Inter', a sans-serif font known for its modern and neutral appearance, suitable for both headlines and body text, providing excellent readability across devices.
- Code font: 'Source Code Pro' for displaying UTR/Transaction ID and Promo codes.
- Animated icons from Lucide or Heroicons for the bottom navigation bar and throughout the app.
- TailwindCSS-based responsive layout with rounded cards, soft shadows, and clean spacing, optimized for a native app feel.
- Smooth transitions and animations throughout the app, especially in popups and loading screens, enhancing the user experience.