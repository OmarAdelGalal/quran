import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SurahViewProps {
  surahNumber: number;
}

interface Ayah {
  numberInSurah: number;
  text: string;
}

const SurahView = ({ surahNumber }: SurahViewProps) => {
  // جلب بيانات السورة (النص العثماني) من API خارجي
  const { data, isLoading, error } = useQuery({
    queryKey: ["surah", surahNumber],
    queryFn: async () => {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`);
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-10">
        عذراً، حدث خطأ أثناء تحميل السورة. يرجى التأكد من الاتصال بالإنترنت.
      </div>
    );
  }

  const ayahs: Ayah[] = data?.data?.ayahs || [];
  const surahName = data?.data?.name;

  return (
    <div className="max-w-4xl mx-auto mt-8 mb-20 p-6 md:p-10 bg-card/50 backdrop-blur-md rounded-3xl border border-gold/20 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* رأس السورة */}
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-bold text-gold mb-6 font-amiri">
          {surahName}
        </h2>
        
        {/* البسملة (تظهر في كل السور ما عدا التوبة والفاتحة لأنها آية منها) */}
        {surahNumber !== 9 && surahNumber !== 1 && (
          <div className="text-2xl md:text-3xl text-foreground/80 font-amiri mb-8">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </div>
        )}
      </div>

      {/* نص الآيات */}
      <div 
        className="text-justify leading-[2.5] text-2xl md:text-3xl font-amiri text-foreground/90" 
        dir="rtl"
      >
        {ayahs.map((ayah) => (
          <span key={ayah.numberInSurah} className="inline">
            {ayah.text}
            {/* رقم الآية */}
            <span className="inline-flex items-center justify-center w-8 h-8 mx-2 text-lg text-gold border border-gold/40 rounded-full align-middle select-none font-sans">
              {ayah.numberInSurah}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default SurahView;