import "@/index.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "Beautiful Quran Recitations",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar">
      <body dir="rtl">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
