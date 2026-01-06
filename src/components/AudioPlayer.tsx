"use client";
import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Reciter } from "@/data/reciters";
import { Surah } from "@/data/surahs";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  reciter: Reciter | null;
  surah: Surah | null;
  onPrevious: () => void;
  onNext: () => void;
}

const AudioPlayer = ({ reciter, surah, onPrevious, onNext }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const audioUrl = reciter && surah
    ? `${reciter.audioBaseUrl}/${surah.number.toString().padStart(3, "0")}.mp3`
    : null;

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border p-4 z-50">
      <audio ref={audioRef} />
      
      <div className="container mx-auto max-w-4xl">
        {/* Current Playing Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {reciter && (
              <img
                src={reciter.image}
                alt={reciter.arabicName}
                className="w-12 h-12 rounded-lg object-cover border border-gold/30"
              />
            )}
            <div className="text-right">
              <p className="font-bold text-gold">
                {surah?.name || "اختر سورة"}
              </p>
              <p className="text-sm text-muted-foreground">
                {reciter?.arabicName || "اختر قارئ"}
              </p>
            </div>
          </div>

          {/* Volume Control */}
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="text-muted-foreground hover:text-foreground"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm text-muted-foreground w-12 text-left">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            disabled={!audioUrl}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground w-12 text-right">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={!surah}
            className="text-muted-foreground hover:text-foreground"
          >
            <SkipForward className="h-6 w-6" />
          </Button>

          <Button
            variant="gold"
            size="xl"
            onClick={togglePlay}
            disabled={!audioUrl}
            className={cn(
              "rounded-full w-16 h-16",
              !audioUrl && "opacity-50 cursor-not-allowed"
            )}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 mr-[-2px]" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            disabled={!surah}
            className="text-muted-foreground hover:text-foreground"
          >
            <SkipBack className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
