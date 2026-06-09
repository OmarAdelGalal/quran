"use client";
import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Reciter } from "@/data/reciters";
import { Surah } from "@/data/surahs";
import { Radio } from "@/data/radios";
import { cn } from "@/lib/utils";
import { ZekrItem } from "@/data/sabahMasaaAzkar";

interface AudioPlayerProps {
  reciter: Reciter | null;
  surah: Surah | null;
  radio?: Radio | null;
  activeZekr?: ZekrItem | null;
  zekrRemainingRepeats?: number;
  setZekrRemainingRepeats?: (val: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

const AudioPlayer = ({
  reciter,
  surah,
  radio,
  activeZekr,
  zekrRemainingRepeats = 0,
  setZekrRemainingRepeats,
  onPrevious,
  onNext,
}: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const onNextRef = useRef(onNext);
  useEffect(() => {
    onNextRef.current = onNext;
  }, [onNext]);

  // Keep references to Zekr states so handleEnded has immediate access without resetting event listeners
  const activeZekrRef = useRef(activeZekr);
  const zekrRemainingRepeatsRef = useRef(zekrRemainingRepeats);
  const setZekrRemainingRepeatsRef = useRef(setZekrRemainingRepeats);

  useEffect(() => {
    activeZekrRef.current = activeZekr;
    zekrRemainingRepeatsRef.current = zekrRemainingRepeats;
    setZekrRemainingRepeatsRef.current = setZekrRemainingRepeats;
  }, [activeZekr, zekrRemainingRepeats, setZekrRemainingRepeats]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hasAudio, setHasAudio] = useState<boolean | null>(null); // null = unknown

  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const buildCandidates = (base: string, num: number) => {
    const n = num.toString().padStart(3, "0");
    return [
      `${base}/${n}.mp3`,
      `${base}/${n}-.mp3`,
      `${base}/${n}.MP3`,
      `${base}/${n}-.MP3`,
    ];
  };

  useEffect(() => {
    if (activeZekr) {
      setAudioUrl(activeZekr.AUDIO);
      setHasAudio(true);
      if (audioRef.current) {
        audioRef.current.src = activeZekr.AUDIO;
        audioRef.current.load();
        const playPromise = audioRef.current.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        } else {
          setIsPlaying(true);
        }
        setCurrentTime(0);
      }
      return;
    }

    if (radio) {
      setAudioUrl(radio.url);
      setHasAudio(true);
      if (audioRef.current) {
        audioRef.current.src = radio.url;
        audioRef.current.load();
        const playPromise = audioRef.current.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        } else {
          setIsPlaying(true);
        }
        setCurrentTime(0);
      }
      return;
    }

    if (!reciter || !surah) {
      setAudioUrl(null);
      setHasAudio(null);
      if (audioRef.current) audioRef.current.src = "";
      return;
    }

    let cancelled = false;
    setAudioUrl(null);
    setHasAudio(null);

    const tryCandidates = async () => {
      const candidates = buildCandidates(reciter.audioBaseUrl, surah.number);
      for (const url of candidates) {
        try {
          const res = await fetch(url, { method: "HEAD" });
          if (res.ok) {
            if (cancelled) return;
            setAudioUrl(url);
            setHasAudio(true);
            if (audioRef.current) {
              audioRef.current.src = url;
              audioRef.current.load();
              const playPromise = audioRef.current.play();
              if (playPromise && typeof playPromise.then === "function") {
                playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
              } else {
                setIsPlaying(true);
              }
              setCurrentTime(0);
            }
            return;
          } else if (res.status === 405) {
            // Some hosts disallow HEAD — try GET for first byte
            try {
              const r = await fetch(url, {
                method: "GET",
                headers: { Range: "bytes=0-0" },
              });
              if (r.ok) {
                if (cancelled) return;
                setAudioUrl(url);
                setHasAudio(true);
                if (audioRef.current) {
                  audioRef.current.src = url;
                  audioRef.current.load();
                  const playPromise = audioRef.current.play();
                  if (playPromise && typeof playPromise.then === "function") {
                    playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
                  } else {
                    setIsPlaying(true);
                  }
                  setCurrentTime(0);
                }
                return;
              }
            } catch (err) {
              console.error("Audio availability check GET failed", err);
            }
          }
        } catch (err) {
          console.error("Audio availability check failed for", url, err);
        }
      }

      if (!cancelled) setHasAudio(false);
    };

    tryCandidates();

    return () => {
      cancelled = true;
    };
  }, [reciter, surah, radio, activeZekr]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      
      // If a Zikr is playing and has remaining repeats > 1, decrement and replay
      if (
        activeZekrRef.current &&
        zekrRemainingRepeatsRef.current !== undefined &&
        zekrRemainingRepeatsRef.current > 1
      ) {
        const nextRemaining = zekrRemainingRepeatsRef.current - 1;
        if (setZekrRemainingRepeatsRef.current) {
          setZekrRemainingRepeatsRef.current(nextRemaining);
        }
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          const playPromise = audioRef.current.play();
          if (playPromise && typeof playPromise.then === "function") {
            playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          } else {
            setIsPlaying(true);
          }
        }
      } else {
        // Otherwise, move to next
        onNextRef.current();
      }
    };
    const handleError = () => {
      setHasAudio(false);
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl || hasAudio === false) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    const playPromise = audioRef.current.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Play failed (autoplay policy, etc.)
          setIsPlaying(false);
        });
    } else {
      setIsPlaying(true);
    }
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
            {activeZekr ? (
              <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center border border-gold/30 text-gold font-bold text-xs font-arabic">
                ذكر
              </div>
            ) : radio ? (
              <img
                src={radio.img}
                alt={radio.name}
                className="w-12 h-12 rounded-lg object-cover border border-gold/30"
              />
            ) : reciter ? (
              <img
                src={reciter.image}
                alt={reciter.arabicName}
                className="w-12 h-12 rounded-lg object-cover border border-gold/30"
              />
            ) : null}
            <div className="text-right max-w-[200px] sm:max-w-[300px] md:max-w-[400px]">
              {activeZekr ? (
                <>
                  <p className="font-bold text-gold truncate" dir="rtl">
                    {activeZekr.ARABIC_TEXT.replace(/[\(\)\d\*\.﴿﴾]+/g, "").substring(0, 35)}...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    تكرار: {zekrRemainingRepeats} من {activeZekr.REPEAT}
                  </p>
                </>
              ) : radio ? (
                <>
                  <p className="font-bold text-gold">{radio.name}</p>
                  <p className="text-sm text-muted-foreground">بث مباشر - إذاعة</p>
                </>
              ) : (
                <>
                  <p className="font-bold text-gold">
                    {surah?.name || "اختر سورة"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {reciter?.arabicName || "اختر قارئ"}
                  </p>
                </>
              )}
              {!activeZekr && hasAudio === false && (
                <p className="text-xs text-destructive mt-1">ملف الصوت غير متوفر لهذه السورة</p>
              )}            </div>
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
            {radio ? "0:00" : formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            disabled={!audioUrl || !!radio}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground w-12 text-right">
            {radio ? "بث" : formatTime(duration)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={!surah && !radio && !activeZekr}
            className="text-muted-foreground hover:text-foreground"
          >
            <SkipForward className="h-6 w-6" />
          </Button>

          <Button
            variant="gold"
            size="xl"
            onClick={togglePlay}
            disabled={!audioUrl || hasAudio === false || hasAudio === null}
            className={cn(
              "rounded-full w-16 h-16",
              (!audioUrl || hasAudio === false || hasAudio === null) && "opacity-50 cursor-not-allowed"
            )}
          >
            {hasAudio === null ? (
              // Checking availability
              <span className="inline-block animate-pulse text-sm">...</span>
            ) : isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 mr-[-2px]" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            disabled={!surah && !radio && !activeZekr}
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
