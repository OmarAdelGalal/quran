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
import { toast } from "sonner";

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
  const radioRef = useRef(radio);
  const reciterRef = useRef(reciter);
  const surahRef = useRef(surah);

  useEffect(() => {
    activeZekrRef.current = activeZekr;
    zekrRemainingRepeatsRef.current = zekrRemainingRepeats;
    setZekrRemainingRepeatsRef.current = setZekrRemainingRepeats;
    radioRef.current = radio;
    reciterRef.current = reciter;
    surahRef.current = surah;
  }, [activeZekr, zekrRemainingRepeats, setZekrRemainingRepeats, radio, reciter, surah]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hasAudio, setHasAudio] = useState<boolean | null>(null); // null = unknown
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Reconnection and retry states
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryMessage, setRetryMessage] = useState("");

  const lastKnownTimeRef = useRef(0);
  const isPlayingRef = useRef(false);
  const audioUrlRef = useRef<string | null>(null);
  const recoveryAttemptRef = useRef(0);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    audioUrlRef.current = audioUrl;
  }, [audioUrl]);

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
    // Reset recovery attempts and last known time when track source changes
    lastKnownTimeRef.current = 0;
    recoveryAttemptRef.current = 0;
    setIsRetrying(false);
    setRetryMessage("");

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
      let success = false;
      const maxAttempts = 3;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        if (cancelled) return;

        if (attempt > 1) {
          setIsRetrying(true);
          setRetryMessage(`جارٍ الاتصال بالخادم (محاولة ${attempt} من ${maxAttempts})...`);
          await new Promise((resolve) => setTimeout(resolve, 3000));
          if (cancelled) return;
        }

        for (const url of candidates) {
          try {
            const res = await fetch(url, { method: "HEAD" });
            if (res.ok) {
              if (cancelled) return;
              setAudioUrl(url);
              setHasAudio(true);
              setIsRetrying(false);
              setRetryMessage("");
              recoveryAttemptRef.current = 0;
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
              success = true;
              return;
            } else if (res.status === 405) {
              try {
                const r = await fetch(url, {
                  method: "GET",
                  headers: { Range: "bytes=0-0" },
                });
                if (r.ok) {
                  if (cancelled) return;
                  setAudioUrl(url);
                  setHasAudio(true);
                  setIsRetrying(false);
                  setRetryMessage("");
                  recoveryAttemptRef.current = 0;
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
                  success = true;
                  return;
                }
              } catch (err) {
                console.error("Audio availability check GET failed", err);
              }
            }
          } catch (err) {
            console.error(`Audio availability check failed for ${url} (Attempt ${attempt})`, err);
          }
        }
      }

      if (!cancelled && !success) {
        setHasAudio(false);
        setIsRetrying(false);
        setRetryMessage("");
      }
    };

    tryCandidates();

    return () => {
      cancelled = true;
    };
  }, [reciter, surah, radio, activeZekr]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let stallWatchdog: NodeJS.Timeout | null = null;

    const attemptRecovery = async () => {
      const currentUrl = audioUrlRef.current;
      if (!audio || !currentUrl) return;

      if (recoveryAttemptRef.current >= 3) {
        console.error("Max recovery attempts reached");
        setHasAudio(false);
        setIsPlaying(false);
        setIsRetrying(false);
        setRetryMessage("");
        toast.error("تعذر الاتصال بالخادم لتشغيل الصوت.");
        return;
      }

      recoveryAttemptRef.current += 1;
      setIsRetrying(true);
      setRetryMessage(`انقطع الاتصال. جارٍ إعادة الاتصال (محاولة ${recoveryAttemptRef.current} من 3)...`);

      const wasPlaying = isPlayingRef.current;
      const restoreTime = lastKnownTimeRef.current;

      audio.pause();
      setIsPlaying(false);

      // Wait 2.5 seconds before reconnecting
      await new Promise((resolve) => setTimeout(resolve, 2500));

      audio.src = currentUrl;
      audio.load();

      const onCanPlay = () => {
        if (restoreTime > 0) {
          audio.currentTime = restoreTime;
        }
        if (wasPlaying) {
          audio.play()
            .then(() => {
              setIsPlaying(true);
              setIsRetrying(false);
              setRetryMessage("");
              recoveryAttemptRef.current = 0;
              toast.success("تم استعادة الاتصال بنجاح واستئناف التلاوة.");
            })
            .catch((err) => {
              console.error("Play failed after recovery:", err);
            });
        } else {
          setIsRetrying(false);
          setRetryMessage("");
        }
        audio.removeEventListener("canplay", onCanPlay);
      };

      audio.addEventListener("canplay", onCanPlay);
    };

    const updateTime = () => {
      const time = audio.currentTime;
      setCurrentTime(time);
      if (time > 0) {
        lastKnownTimeRef.current = time;
      }
    };

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
      console.error("Audio error event triggered.");
      if (audioUrlRef.current && recoveryAttemptRef.current < 3) {
        attemptRecovery();
      } else {
        setHasAudio(false);
        setIsPlaying(false);
        setIsRetrying(false);
        setRetryMessage("");
      }
    };

    const startStallWatchdog = () => {
      if (!stallWatchdog && isPlayingRef.current && audioUrlRef.current) {
        setIsRetrying(true);
        setRetryMessage("ضعف في الاتصال. جارٍ الانتظار...");
        stallWatchdog = setTimeout(() => {
          console.warn("Stall watchdog triggered. Attempting recovery...");
          attemptRecovery();
          stallWatchdog = null;
        }, 8000);
      }
    };

    const clearStallWatchdog = () => {
      if (stallWatchdog) {
        clearTimeout(stallWatchdog);
        stallWatchdog = null;
      }
      if (recoveryAttemptRef.current === 0) {
        setIsRetrying(false);
        setRetryMessage("");
      }
    };

    const handleWaiting = () => {
      startStallWatchdog();
    };

    const handleStalled = () => {
      startStallWatchdog();
    };

    const handlePlaying = () => {
      clearStallWatchdog();
      recoveryAttemptRef.current = 0;
    };

    const handlePause = () => {
      clearStallWatchdog();
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("stalled", handleStalled);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("stalled", handleStalled);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      if (stallWatchdog) clearTimeout(stallWatchdog);
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
              {isRetrying && (
                <p className="text-xs text-amber-500 animate-pulse mt-1" dir="rtl">
                  {retryMessage}
                </p>
              )}
              {!activeZekr && !isRetrying && hasAudio === false && (
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
            {hasAudio === null || isRetrying ? (
              // Checking availability or reconnecting
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
