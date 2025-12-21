import { Geist, Geist_Mono, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata = {
  title: "Nutopia - Fructe Uscate & Nuci Premium",
  description: "Nutopia - Magazin online cu fructe uscate, nuci și semințe de cea mai bună calitate. Livrare în toată Moldova.",
  icons: {
    icon: "/Nutopia4.png",
    shortcut: "/Nutopia4.png",
    apple: "/Nutopia4.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.className} ${playfair.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
