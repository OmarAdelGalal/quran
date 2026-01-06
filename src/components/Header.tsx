import { BookOpen } from "lucide-react";

const Header = () => {
  return (
    <header className="relative py-12 text-center pattern-islamic">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
      
      <div className="relative z-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/10 border-2 border-gold/30 mb-6 animate-float">
          <BookOpen className="w-10 h-10 text-gold" />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          <span className="text-gold-gradient">القرآن الكريم</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          استمع إلى تلاوات خاشعة من أشهر قراء العالم الإسلامي
        </p>
        
        <div className="flex justify-center gap-2 mt-6">
          <span className="inline-block w-2 h-2 rounded-full bg-gold animate-pulse" />
          <span className="inline-block w-2 h-2 rounded-full bg-gold/70 animate-pulse" style={{ animationDelay: "0.2s" }} />
          <span className="inline-block w-2 h-2 rounded-full bg-gold/40 animate-pulse" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>
    </header>
  );
};

export default Header;
