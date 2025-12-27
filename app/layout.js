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

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nutopia.md";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Nutopia - Fructe Uscate & Nuci Premium din Moldova",
    template: "%s | Nutopia",
  },
  description: "Nutopia - Magazin online cu fructe uscate, nuci și semințe de cea mai bună calitate. Produse naturale, fără aditivi. Livrare rapidă în toată Moldova.",
  keywords: ["fructe uscate", "nuci", "semințe", "produse naturale", "magazin online", "Moldova", "Chișinău", "livrare", "sănătate", "snackuri sănătoase"],
  authors: [{ name: "Nutopia" }],
  creator: "Nutopia",
  publisher: "Nutopia",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/Nutopia4.png", sizes: "any" },
      { url: "/Nutopia4.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/Nutopia4.png",
    apple: [
      { url: "/Nutopia4.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/Nutopia4.png",
      },
    ],
  },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: baseUrl,
    siteName: "Nutopia",
    title: "Nutopia - Fructe Uscate & Nuci Premium din Moldova",
    description: "Magazin online cu fructe uscate, nuci și semințe de cea mai bună calitate. Produse naturale, fără aditivi. Livrare rapidă în toată Moldova.",
    images: [
      {
        url: "https://nutopia.md/Nutopia4.png",
        width: 512,
        height: 512,
        alt: "Nutopia - Fructe Uscate & Nuci Premium",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nutopia - Fructe Uscate & Nuci Premium din Moldova",
    description: "Magazin online cu fructe uscate, nuci și semințe de cea mai bună calitate. Livrare rapidă în toată Moldova.",
    images: ["https://nutopia.md/Nutopia4.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// JSON-LD Structured Data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Nutopia",
  description: "Magazin online cu fructe uscate, nuci și semințe premium din Moldova",
  url: "https://nutopia.md",
  logo: "https://nutopia.md/Nutopia4.png",
  image: "https://nutopia.md/Nutopia4.png",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Chișinău",
    addressCountry: "MD",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "47.0105",
    longitude: "28.8638",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "09:00",
    closes: "21:00",
  },
  sameAs: [],
  potentialAction: {
    "@type": "SearchAction",
    target: "https://nutopia.md/menu?search={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.className} ${playfair.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
