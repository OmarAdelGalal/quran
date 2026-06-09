import { Radio } from "@/data/radios";
import { cn } from "@/lib/utils";

interface RadioCardProps {
  radio: Radio;
  isSelected: boolean;
  onClick: () => void;
}

const RadioCard = ({ radio, isSelected, onClick }: RadioCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-card border-2 transition-all duration-500 card-glow",
        "hover:scale-105 hover:shadow-[0_8px_32px_hsl(45_80%_55%_/_0.2)]",
        isSelected
          ? "border-gold shadow-[0_4px_20px_hsl(45_80%_55%_/_0.3)]"
          : "border-border hover:border-gold/50"
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted/20">
        {radio.img ? (
          <img
            src={radio.img}
            alt={radio.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
             <span className="text-muted-foreground text-4xl">📻</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        
        {isSelected && (
          <div className="absolute top-3 left-3 bg-gold text-primary-foreground px-3 py-1 rounded-full text-sm font-bold animate-pulse-slow">
            قيد التشغيل
          </div>
        )}
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 p-4 text-center z-10">
        <h3 className={cn(
          "text-lg font-bold mb-1 transition-colors duration-300",
          isSelected ? "text-gold" : "text-foreground group-hover:text-gold"
        )}>
          {radio.name}
        </h3>
      </div>
    </button>
  );
};

export default RadioCard;
