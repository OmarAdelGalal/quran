"use client";
import { useState } from "react";
import Header from "@/components/Header";
import ReciterCard from "@/components/ReciterCard";
import SurahList from "@/components/SurahList";
import AudioPlayer from "@/components/AudioPlayer";
import SurahView from "@/components/SurahView";
import RadioCard from "@/components/RadioCard";
import AzkarList from "@/components/AzkarList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { reciters, Reciter } from "@/data/reciters";
import { surahs, Surah } from "@/data/surahs";
import { radios, Radio } from "@/data/radios";
import { sabahMasaaAzkar } from "@/data/sabahMasaaAzkar";

const Index = () => {
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [selectedRadio, setSelectedRadio] = useState<Radio | null>(null);
  
  // Azkar Audio Play States
  const [activeZekrIndex, setActiveZekrIndex] = useState<number | null>(null);
  const [zekrRemainingRepeats, setZekrRemainingRepeats] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("quran");

  const handleSurahSelect = (surah: Surah) => {
    setSelectedSurah(surah);
    setSelectedRadio(null);
    setActiveZekrIndex(null); // Clear Zikr when playing Quran
  };

  const handleRadioSelect = (radio: Radio) => {
    setSelectedRadio(radio);
    setSelectedSurah(null);
    setActiveZekrIndex(null); // Clear Zikr when playing Radio
  };

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

  const handlePreviousRadio = () => {
    if (!selectedRadio) return;
    const currentIndex = radios.findIndex((r) => r.id === selectedRadio.id);
    if (currentIndex > 0) {
      setSelectedRadio(radios[currentIndex - 1]);
    } else {
      setSelectedRadio(radios[radios.length - 1]);
    }
  };

  const handleNextRadio = () => {
    if (!selectedRadio) return;
    const currentIndex = radios.findIndex((r) => r.id === selectedRadio.id);
    if (currentIndex < radios.length - 1) {
      setSelectedRadio(radios[currentIndex + 1]);
    } else {
      setSelectedRadio(radios[0]);
    }
  };

  const handleNextZekr = () => {
    if (activeZekrIndex === null) return;
    if (activeZekrIndex < sabahMasaaAzkar.length - 1) {
      const nextIdx = activeZekrIndex + 1;
      setActiveZekrIndex(nextIdx);
      setZekrRemainingRepeats(sabahMasaaAzkar[nextIdx].REPEAT);
    } else {
      // Completed all Azkar! Transition to playing the Quran.
      setActiveZekrIndex(null);
      setZekrRemainingRepeats(0);
      
      const defaultReciter = selectedReciter || reciters[0];
      const defaultSurah = selectedSurah || surahs[0];
      setSelectedReciter(defaultReciter);
      setSelectedSurah(defaultSurah);
      setSelectedRadio(null);
      setActiveTab("quran");
    }
  };

  const handlePreviousZekr = () => {
    if (activeZekrIndex === null) return;
    if (activeZekrIndex > 0) {
      const prevIdx = activeZekrIndex - 1;
      setActiveZekrIndex(prevIdx);
      setZekrRemainingRepeats(sabahMasaaAzkar[prevIdx].REPEAT);
    } else {
      const lastIdx = sabahMasaaAzkar.length - 1;
      setActiveZekrIndex(lastIdx);
      setZekrRemainingRepeats(sabahMasaaAzkar[lastIdx].REPEAT);
    }
  };


  return (
    <div className="min-h-screen bg-background pb-40">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-12" dir="rtl">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px] mx-auto mb-8">
            <TabsTrigger value="quran" className="text-lg font-bold">القرآن الكريم</TabsTrigger>
            <TabsTrigger value="radio" className="text-lg font-bold">الإذاعات والأذكار</TabsTrigger>
          </TabsList>
          
          <TabsContent value="quran">
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
            <section className="max-w-2xl mx-auto mb-8">
              <SurahList
                selectedSurah={selectedSurah}
                onSurahSelect={handleSurahSelect}
              />
            </section>

            {/* Surah View Section (المصحف المقروء) */}
            {selectedSurah && (
              <section>
                 <SurahView surahNumber={selectedSurah.number} />
              </section>
            )}
          </TabsContent>

          <TabsContent value="radio">
             <section className="mb-12">
               <h2 className="text-3xl font-bold text-center mb-8">
                 <span className="text-gold-gradient">اختر الإذاعة أو الذكر</span>
               </h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                 {radios.map((radio) => (
                   <RadioCard
                     key={radio.id}
                     radio={radio}
                     isSelected={selectedRadio?.id === radio.id}
                     onClick={() => handleRadioSelect(radio)}
                   />
                 ))}
               </div>
             </section>
             
             {/* Azkar Text Section */}
             <section className="mb-12" id="azkar">
               <AzkarList
                 activeZekrIndex={activeZekrIndex}
                 zekrRemainingRepeats={zekrRemainingRepeats}
                 onPlayZekr={(index) => {
                   setActiveZekrIndex(index);
                   setZekrRemainingRepeats(sabahMasaaAzkar[index].REPEAT);
                   setSelectedRadio(null);
                   setSelectedSurah(null);
                 }}
                 onStopZekr={() => {
                   setActiveZekrIndex(null);
                   setZekrRemainingRepeats(0);
                 }}
               />
             </section>
          </TabsContent>
        </Tabs>
      </main>

      <AudioPlayer
        reciter={selectedReciter}
        surah={selectedSurah}
        radio={selectedRadio}
        activeZekr={activeZekrIndex !== null ? sabahMasaaAzkar[activeZekrIndex] : null}
        zekrRemainingRepeats={zekrRemainingRepeats}
        setZekrRemainingRepeats={setZekrRemainingRepeats}
        onPrevious={
          activeZekrIndex !== null
            ? handlePreviousZekr
            : selectedRadio
            ? handlePreviousRadio
            : handlePreviousSurah
        }
        onNext={
          activeZekrIndex !== null
            ? handleNextZekr
            : selectedRadio
            ? handleNextRadio
            : handleNextSurah
        }
      />
    </div>
  );
};

export default Index;