import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Group Stay Planner',
  description: 'Compare stays suggested in WhatsApp group chats'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
