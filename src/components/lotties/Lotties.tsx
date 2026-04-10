'use client';

import dynamic from 'next/dynamic';
import emailJson from './EmailLottie.json';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export const EmailLottie = ({ className = 'size-6', loop = true, autoplay = true }) => <Lottie animationData={emailJson} loop={loop} autoplay={autoplay} className={className} />;