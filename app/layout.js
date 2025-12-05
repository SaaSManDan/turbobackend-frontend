import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";


export const metadata = {
  title: "TurboBackend",
  description: "TurboBackend is a ....",
  icons: {
    icon: [
      { url: '/DDF-favicon-png-2.png', sizes: '32x32', type: 'image/png' }
    ],
    shortcut: '/DDF-favicon-png-2.png',
    apple: '/DDF-favicon-png-2.png',
  }
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {children}
        </body>
      </html>   
    </ClerkProvider>
  );
}
