"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";

const defaultMorphTime = 1.5;
const defaultCooldownTime = 0.8;

interface UseMorphingTextOptions {
  texts: string[];
  morphTime?: number;
  cooldownTime?: number;
  autoPlay?: boolean;
  loop?: boolean;
  trigger?: number;
  onComplete?: () => void;
}

const useMorphingText = ({
  texts,
  morphTime = defaultMorphTime,
  cooldownTime = defaultCooldownTime,
  autoPlay = true,
  loop = true,
  trigger = 0,
  onComplete,
}: UseMorphingTextOptions) => {
  const textIndexRef = useRef(0);
  const morphRef = useRef(0);
  const cooldownRef = useRef(0);
  const timeRef = useRef(new Date());

  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);

  const [isAnimating, setIsAnimating] = useState(autoPlay);
  const [session, setSession] = useState(0);

  // External trigger effect (e.g. from parent component clicks)
  const prevTrigger = useRef(trigger);
  useEffect(() => {
    if (prevTrigger.current !== trigger && trigger > 0) {
      prevTrigger.current = trigger;
      textIndexRef.current = 0;
      morphRef.current = 0;
      cooldownRef.current = 0;
      setIsAnimating(true);
      setSession((s) => s + 1);
    }
  }, [trigger]);

  const setStyles = useCallback(
    (fraction: number) => {
      const [current1, current2] = [text1Ref.current, text2Ref.current];
      if (!current1 || !current2) return;

      current2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      current2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

      const invertedFraction = 1 - fraction;
      current1.style.filter = `blur(${Math.min(8 / invertedFraction - 8, 100)}px)`;
      current1.style.opacity = `${Math.pow(invertedFraction, 0.4) * 100}%`;

      current1.textContent = texts[textIndexRef.current % texts.length] || "";
      current2.textContent = texts[(textIndexRef.current + 1) % texts.length] || "";
    },
    [texts],
  );

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current;
    cooldownRef.current = 0;

    let fraction = morphRef.current / morphTime;

    if (fraction > 1) {
      cooldownRef.current = cooldownTime;
      fraction = 1;
    }

    setStyles(fraction);

    if (fraction === 1) {
      textIndexRef.current++;
    }
  }, [setStyles, morphTime, cooldownTime]);

  const doCooldown = useCallback(() => {
    morphRef.current = 0;
    const [current1, current2] = [text1Ref.current, text2Ref.current];
    if (current1 && current2) {
      current2.style.filter = "none";
      current2.style.opacity = "100%";
      current1.style.filter = "none";
      current1.style.opacity = "0%";
    }
  }, []);

  // Main animation frame loop
  useEffect(() => {
    const [current1, current2] = [text1Ref.current, text2Ref.current];

    if (!isAnimating) {
      if (current1 && current2) {
        current1.textContent = texts[0] || "";
        current1.style.filter = "none";
        current1.style.opacity = "100%";
        current2.textContent = "";
        current2.style.filter = "none";
        current2.style.opacity = "0%";
      }
      return;
    }

    let animationFrameId: number;
    timeRef.current = new Date();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const newTime = new Date();
      const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000;
      timeRef.current = newTime;

      cooldownRef.current -= dt;

      if (cooldownRef.current <= 0) {
        doMorph();

        // Check if finished non-looping run
        if (!loop && textIndexRef.current >= texts.length - 1) {
          cancelAnimationFrame(animationFrameId);
          setIsAnimating(false);
          if (text1Ref.current && text2Ref.current) {
            text1Ref.current.textContent = texts[texts.length - 1] || texts[0] || "";
            text1Ref.current.style.filter = "none";
            text1Ref.current.style.opacity = "100%";
            text2Ref.current.textContent = "";
            text2Ref.current.style.filter = "none";
            text2Ref.current.style.opacity = "0%";
          }
          onComplete?.();
          return;
        }
      } else {
        doCooldown();
      }
    };

    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isAnimating, session, loop, doMorph, doCooldown, texts, onComplete]);

  const play = useCallback(() => {
    textIndexRef.current = 0;
    morphRef.current = 0;
    cooldownRef.current = 0;
    setIsAnimating(true);
    setSession((s) => s + 1);
  }, []);

  return { text1Ref, text2Ref, isAnimating, play };
};

export interface MorphingTextProps {
  className?: string;
  texts: string[];
  morphTime?: number;
  cooldownTime?: number;
  autoPlay?: boolean;
  loop?: boolean;
  trigger?: number;
  triggerOnClick?: boolean;
  onComplete?: () => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const Texts: React.FC<{
  texts: string[];
  morphTime?: number;
  cooldownTime?: number;
  autoPlay?: boolean;
  loop?: boolean;
  trigger?: number;
  onComplete?: () => void;
  playRef?: React.MutableRefObject<(() => void) | null>;
}> = ({
  texts,
  morphTime,
  cooldownTime,
  autoPlay,
  loop,
  trigger,
  onComplete,
  playRef,
}) => {
  const { text1Ref, text2Ref, play } = useMorphingText({
    texts,
    morphTime,
    cooldownTime,
    autoPlay,
    loop,
    trigger,
    onComplete,
  });

  if (playRef) {
    playRef.current = play;
  }

  return (
    <>
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full select-none"
        ref={text1Ref}
      >
        {texts[0] || ""}
      </span>
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full select-none"
        ref={text2Ref}
      />
    </>
  );
};

const SvgFilters: React.FC = () => (
  <svg
    id="filters"
    className="absolute w-0 h-0 pointer-events-none opacity-0 overflow-hidden"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <defs>
      <filter id="threshold">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 255 -140"
        />
      </filter>
    </defs>
  </svg>
);

export const MorphingText: React.FC<MorphingTextProps> = ({
  texts,
  className,
  morphTime,
  cooldownTime,
  autoPlay = true,
  loop = true,
  trigger = 0,
  triggerOnClick = false,
  onComplete,
  onClick,
}) => {
  const playRef = useRef<(() => void) | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e);
    if (triggerOnClick && playRef.current) {
      playRef.current();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "relative inline-block font-sans font-extrabold leading-none [filter:url(#threshold)_blur(0.6px)]",
        className || "mx-auto h-16 w-full max-w-screen-md text-center text-[40pt] md:h-24 lg:text-[6rem]",
      )}
    >
      <Texts
        texts={texts}
        morphTime={morphTime}
        cooldownTime={cooldownTime}
        autoPlay={autoPlay}
        loop={loop}
        trigger={trigger}
        onComplete={onComplete}
        playRef={playRef}
      />
      <SvgFilters />
    </div>
  );
};

export default MorphingText;
