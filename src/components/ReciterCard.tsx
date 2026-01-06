import { Reciter } from "@/data/reciters";
import { cn } from "@/lib/utils";

interface ReciterCardProps {
  reciter: Reciter;
  isSelected: boolean;
  onClick: () => void;
}

const ReciterCard = ({ reciter, isSelected, onClick }: ReciterCardProps) => {
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
      <div className="relative aspect-square overflow-hidden">
        <img
          src={reciter.image}
          alt={reciter.arabicName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        {isSelected && (
          <div className="absolute top-3 left-3 bg-gold text-primary-foreground px-3 py-1 rounded-full text-sm font-bold animate-pulse-slow">
            مُختار
          </div>
        )}
      </div>
      
      <div className="p-4 text-center">
        <h3 className={cn(
          "text-xl font-bold mb-1 transition-colors duration-300",
          isSelected ? "text-gold" : "text-foreground group-hover:text-gold"
        )}>
          {reciter.arabicName}
        </h3>
        <p className="text-muted-foreground text-sm">
          {reciter.description}
        </p>
      </div>
    </button>
  );
};

export default ReciterCard;
