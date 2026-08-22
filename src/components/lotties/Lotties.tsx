'use client';

import type { LottieProps } from 'lottie-react';
import dynamic from 'next/dynamic';
import emailJson from './EmailLottie.json';

const Lottie = dynamic<LottieProps>(() => import('lottie-react').then((module) => module.Lottie), { ssr: false });

export const EmailLottie = ({ className = 'size-6', loop = false, autoplay = true }) => <Lottie src={emailJson} loop={loop} autoplay={autoplay} className={className} />;