import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AZKAR_ENDPOINTS, ZekrContent, AzkarCategory } from "@/data/azkar";
import { toast } from "sonner";
import { sabahMasaaAzkar } from "@/data/sabahMasaaAzkar";
import { Play, Pause, Square } from "lucide-react";
import { cn } from "@/lib/utils";

// Hisn Muslim categories mapping for fallback/direct use
const HISN_MUSLIM_CATEGORIES = [
  { id: "audio", title: "أذكار الصباح والمساء (بالصوت) 🎧" },
  { id: 27, title: "أذكار الصباح والمساء (بدون صوت)" },
  { id: 1, title: "أذكار الاستيقاظ من النوم" },
  { id: 2, title: "دعاء لبس الثوب" },
  { id: 75, title: "أذكار النوم" }
];

interface AzkarListProps {
  activeZekrIndex: number | null;
  zekrRemainingRepeats: number;
  onPlayZekr: (index: number) => void;
  onStopZekr: () => void;
}

export default function AzkarList({
  activeZekrIndex,
  zekrRemainingRepeats,
  onPlayZekr,
  onStopZekr
}: AzkarListProps) {
  const [selectedCategory, setSelectedCategory] = useState<AzkarCategory | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAudioCategory = () => {
    setSelectedCategory({
      title: "أذكار الصباح والمساء (بالصوت)",
      content: sabahMasaaAzkar.map((item) => ({
        zekr: item.ARABIC_TEXT,
        repeat: item.REPEAT,
        bless: "",
        source: ""
      }))
    });
  };

  // Fetch from Hisn Muslim as a reliable fallback since github raw might 404 sometimes
  const fetchCategory = async (id: number, title: string) => {
    setLoading(true);
    try {
      const res = await fetch(AZKAR_ENDPOINTS.HISN_MUSLIM_CATEGORY(id));
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
      // Map HisnMuslim format to the generic format
      const key = Object.keys(data)[0];
      const items = data[key] || [];
      
      const mappedContent: ZekrContent[] = items.map((item: any) => ({
        zekr: item.ARABIC_TEXT,
        repeat: item.REPEAT,
        bless: "",
        source: ""
      }));
      
      setSelectedCategory({
        title: key || title,
        content: mappedContent
      });
    } catch (err) {
      console.error(err);
      toast.error("فشل في تحميل الأذكار. يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load audio category by default on mount
    fetchAudioCategory();
  }, []);

  useEffect(() => {
    // Smooth scroll the active zekr card into view
    if (activeZekrIndex !== null && selectedCategory?.title.includes("بالصوت")) {
      const activeCard = document.getElementById(`zekr-card-${activeZekrIndex}`);
      if (activeCard) {
        activeCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [activeZekrIndex, selectedCategory]);

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 bg-card rounded-xl border border-border shadow-sm p-6 overflow-hidden">
      <h2 className="text-2xl font-bold text-center mb-6 text-gold-gradient">
        الأذكار المقروءة والمسموعة
      </h2>
      
      {/* Category Selection */}
      <div className="flex flex-wrap gap-3 justify-center mb-8" dir="rtl">
        {HISN_MUSLIM_CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            variant={
              (cat.id === "audio" && selectedCategory?.title.includes("بالصوت")) ||
              (cat.id !== "audio" && selectedCategory?.title === cat.title)
                ? "gold"
                : "outline"
            }
            onClick={() => {
              if (cat.id === "audio") {
                fetchAudioCategory();
              } else {
                fetchCategory(cat.id as number, cat.title);
              }
            }}
            className="text-lg rounded-full px-6"
            disabled={loading}
          >
            {cat.title}
          </Button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Azkar Content Display */}
      {selectedCategory && !loading && (
        <ScrollArea className="h-[60vh] pr-4" dir="rtl">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center border-b border-border/50 pb-4 mb-6 gap-4">
              <h3 className="text-xl font-bold text-gold">{selectedCategory.title}</h3>
              {selectedCategory.title.includes("بالصوت") && (
                <Button
                  variant={activeZekrIndex !== null ? "destructive" : "gold"}
                  className="rounded-full flex items-center gap-2 px-6"
                  onClick={() => {
                    if (activeZekrIndex !== null) {
                      onStopZekr();
                    } else {
                      onPlayZekr(0); // Start from first Zikr
                    }
                  }}
                >
                  {activeZekrIndex !== null ? (
                    <>
                      <Square className="h-4 w-4 fill-white" />
                      <span>إيقاف التشغيل التلقائي</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-white animate-pulse" />
                      <span>تشغيل الأذكار متتالية</span>
                    </>
                  )}
                </Button>
              )}
            </div>

            {selectedCategory.content.map((item, index) => {
              const isAudioCat = selectedCategory.title.includes("بالصوت");
              const isCurrentlyPlaying = isAudioCat && activeZekrIndex === index;

              return (
                <Card
                  key={index}
                  id={`zekr-card-${index}`}
                  className={cn(
                    "p-6 bg-card/50 hover:bg-card/80 transition-all duration-300 border-gold/20 relative",
                    isCurrentlyPlaying && "border-gold bg-gold/5 shadow-[0_0_15px_rgba(212,175,55,0.1)] scale-[1.01]"
                  )}
                >
                  <p className="text-2xl leading-[2.5] text-center font-arabic text-foreground/90 select-all">
                    {item.zekr}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-border/50 text-sm text-muted-foreground gap-4">
                    {isAudioCat && (
                      <Button
                        variant={isCurrentlyPlaying ? "gold" : "outline"}
                        size="sm"
                        className="rounded-full flex items-center gap-2 w-full sm:w-auto"
                        onClick={() => {
                          if (isCurrentlyPlaying) {
                            onStopZekr();
                          } else {
                            onPlayZekr(index);
                          }
                        }}
                      >
                        {isCurrentlyPlaying ? (
                          <>
                            <Pause className="h-4 w-4" />
                            <span>إيقاف</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            <span>تشغيل صوتي</span>
                          </>
                        )}
                      </Button>
                    )}
                    
                    {item.source && <span>{item.source}</span>}
                    {item.bless && <span className="flex-1 text-center px-4">{item.bless}</span>}
                    
                    {isCurrentlyPlaying ? (
                      <span className="bg-gold/20 text-gold border border-gold/30 px-4 py-1.5 rounded-full font-bold min-w-28 text-center shadow-sm">
                        المتبقي: {zekrRemainingRepeats} / {item.repeat}
                      </span>
                    ) : (
                      <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full font-bold min-w-28 text-center shadow-sm">
                        التكرار: {item.repeat}
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
