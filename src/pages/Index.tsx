"use client";
import { useState } from "react";
import Header from "@/components/Header";
import ReciterCard from "@/components/ReciterCard";
import SurahList from "@/components/SurahList";
import AudioPlayer from "@/components/AudioPlayer";
import { reciters, Reciter } from "@/data/reciters";
import { surahs, Surah } from "@/data/surahs";

const Index = () => {
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);

  const handlePreviousSurah = () => {
    if (!selectedSurah) return;
    const currentIndex = surahs.findIndex((s) => s.number === selectedSurah.number);
    if (currentIndex > 0) {
      setSelectedSurah(surahs[currentIndex - 1]);
    } else {
      setSelectedSurah(surahs[surahs.length - 1]);
    }
  };

  const handleNextSurah = () => {
    if (!selectedSurah) return;
    const currentIndex = surahs.findIndex((s) => s.number === selectedSurah.number);
    if (currentIndex < surahs.length - 1) {
      setSelectedSurah(surahs[currentIndex + 1]);
    } else {
      setSelectedSurah(surahs[0]);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-40">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Reciters Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            <span className="text-gold-gradient">اختر القارئ</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {reciters.map((reciter) => (
              <ReciterCard
                key={reciter.id}
                reciter={reciter}
                isSelected={selectedReciter?.id === reciter.id}
                onClick={() => setSelectedReciter(reciter)}
              />
            ))}
          </div>
        </section>

        {/* Surahs Section */}
        <section className="max-w-2xl mx-auto">
          <SurahList
            selectedSurah={selectedSurah}
            onSurahSelect={setSelectedSurah}
          />
        </section>
      </main>

      <AudioPlayer
        reciter={selectedReciter}
        surah={selectedSurah}
        onPrevious={handlePreviousSurah}
        onNext={handleNextSurah}
      />
      <div className="mt-0 text-center bottom-15 p-6">
      <h3 className="text-lg font-semibold">created by </h3>       <a href="https://github.com/OmarAdelGalal" className="text-blue-500 hover:underline">omar adel </a>
      <h3 className="text-lg font-semibold">صدقه جاريه عني و عن كل واحد ينشر الويب سايت </h3>
      <h3 className="text-lg font-semibold">Sponsored by </h3> <a href="https://waquakcode.com" className="text-blue-500 hover:underline">Waquak the new code </a>
      </div>
    </div>
  );
};

export default Index;
