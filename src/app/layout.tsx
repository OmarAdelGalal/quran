import "@/index.css";
import { Analytics } from "@vercel/analytics/next";
import Providers from "@/components/Providers";

export const metadata = {
  title: "Beautiful Quran Recitations",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar">
      <body dir="rtl">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
