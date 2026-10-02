'use client';
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

interface ParallaxComponentProps {
  onCompleteBoot: () => void;
}

export function ParallaxComponent({ onCompleteBoot }: ParallaxComponentProps) {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const parallaxEl = parallaxRef.current;
    if (!parallaxEl) return;

    const triggerElement = parallaxEl.querySelector('[data-parallax-layers]');

    if (triggerElement) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: '0% 0%',
          end: '100% 0%',
          scrub: 0,
        },
      });

      const layers = [
        { layer: '1', yPercent: 70 },
        { layer: '2', yPercent: 55 },
        { layer: '3', yPercent: 40 },
        { layer: '4', yPercent: 10 },
      ];

      layers.forEach((layerObj, idx) => {
        tl.to(
          triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
          {
            yPercent: layerObj.yPercent,
            ease: 'none',
          },
          idx === 0 ? undefined : '<'
        );
      });
    }

    let hasCompleted = false;
    const triggerExitTransition = () => {
      if (hasCompleted) return;
      hasCompleted = true;
      if (parallaxEl) {
        gsap.to(parallaxEl, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          onComplete: () => {
            onCompleteBoot();
          },
        });
      } else {
        onCompleteBoot();
      }
    };

    let isReadyForExit = false;
    const readyTimer = setTimeout(() => {
      isReadyForExit = true;
    }, 1100);

    const handleScrollCheck = () => {
      if (!isReadyForExit || hasCompleted) return;
      // Natural transition when user scrolls past the boot screen into the site
      if (window.scrollY > window.innerHeight * 0.4) {
        triggerExitTransition();
      }
    };
    window.addEventListener('scroll', handleScrollCheck, { passive: true });

    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      clearTimeout(readyTimer);
      window.removeEventListener('scroll', handleScrollCheck);
      ScrollTrigger.getAll().forEach((st) => st.kill());
      if (triggerElement) {
        gsap.killTweensOf(triggerElement);
      }
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
    };
  }, [onCompleteBoot]);

  return (
    <div className="parallax" ref={parallaxRef}>
      <section className="parallax__header">
        <div className="parallax__visuals">
          <div data-parallax-layers className="parallax__layers">
            <img
              src="https://cdn.21st.dev/assets/mirror/a4/a43f4eae3459c461345ee676f12d6e1ddca65e8a5279a5af00d475b17ff83aea.webp"
              loading="eager"
              width="800"
              data-parallax-layer="1"
              alt=""
              className="parallax__layer-img"
            />
            <img
              src="https://cdn.21st.dev/assets/mirror/50/50ca6a0d36d2780bfcb469d6db7eaec0be7e0d2961ba69a63d2a1473b040338d.webp"
              loading="eager"
              width="800"
              data-parallax-layer="2"
              alt=""
              className="parallax__layer-img"
            />
            <div data-parallax-layer="3" className="parallax__layer-title">
              <h2 className="parallax__title">SONIC_LAB</h2>
            </div>
            <img
              src="https://cdn.21st.dev/assets/mirror/e1/e1c8137b5f971c3b3ec1a0f9e79b9c17018767005f844a10082b890472afecfb.webp"
              loading="eager"
              width="800"
              data-parallax-layer="4"
              alt=""
              className="parallax__layer-img"
            />
          </div>
          {/* Natural degrade transitioning into the website background */}
          <div className="parallax__fade" aria-hidden="true" />
        </div>
      </section>
    </div>
  );
}
