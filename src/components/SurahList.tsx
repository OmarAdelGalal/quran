import { surahs, Surah } from "@/data/surahs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface SurahListProps {
  selectedSurah: Surah | null;
  onSurahSelect: (surah: Surah) => void;
}

const SurahList = ({ selectedSurah, onSurahSelect }: SurahListProps) => {
  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <h2 className="text-2xl font-bold text-gold mb-4 text-center">
        السور القرآنية
      </h2>
      <ScrollArea className="h-[500px] pr-4">
        <div className="grid gap-2">
          {surahs.map((surah) => (
            <Button
              key={surah.number}
              variant="surah"
              onClick={() => onSurahSelect(surah)}
              className={cn(
                "w-full h-auto py-3",
                selectedSurah?.number === surah.number &&
                  "border-gold bg-muted"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-gold font-bold text-sm">
                    {surah.number}
                  </span>
                  <div className="text-right">
                    <p className="font-bold text-lg">{surah.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {surah.englishName}
                    </p>
                  </div>
                </div>
                <span className="text-muted-foreground text-sm">
                  {surah.versesCount} آية
                </span>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SurahList;
