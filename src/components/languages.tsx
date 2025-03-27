"use client";

import React, { forwardRef, useRef } from "react";

import { cn } from "../lib/utils";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import Image from 'next/image';

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-16 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className,
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export default function Languages() {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative flex h-[350px] w-full items-center justify-center overflow-hidden rounded-lg pl-10 pr-10"
      ref={containerRef}
    >
      <div className="flex size-full flex-col max-w-lg max-h-[230px] items-stretch justify-between gap-10">
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div1Ref}>
            <Icons.googleDrive />
          </Circle>
          <Circle ref={div5Ref}>
            <Icons.googleDocs />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div2Ref}>
            <Icons.notion />
          </Circle>
          <Circle ref={div4Ref} className="size-16">
            <Image src={"/logo.png"} alt="logo" width="60" height="60" className="-mt-1" />
          </Circle>
          <Circle ref={div6Ref}>
            <Icons.zapier />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div3Ref}>
            <Icons.whatsapp />
          </Circle>
          <Circle ref={div7Ref}>
            <Icons.messenger />
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div4Ref}
        curvature={-75}
        endYOffset={-10}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div4Ref}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div4Ref}
        curvature={75}
        endYOffset={10}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={div4Ref}
        curvature={-75}
        endYOffset={-10}
        reverse
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div4Ref}
        reverse
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div7Ref}
        toRef={div4Ref}
        curvature={75}
        endYOffset={10}
        reverse
      />
    </div>
  );
}

const Icons = {
  notion: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="100"
      height="100"
      viewBox="0 0 48 48"
    >
      <path
        fill="#F44336"
        d="M23.65,24.898c-0.998-1.609-1.722-2.943-2.725-5.455C19.229,15.2,31.24,11.366,26.37,3.999c2.111,5.089-7.577,8.235-8.477,12.473C17.07,20.37,23.645,24.898,23.65,24.898z"
      ></path>
      <path
        fill="#F44336"
        d="M23.878,17.27c-0.192,2.516,2.229,3.857,2.299,5.695c0.056,1.496-1.447,2.743-1.447,2.743s2.728-0.536,3.579-2.818c0.945-2.534-1.834-4.269-1.548-6.298c0.267-1.938,6.031-5.543,6.031-5.543S24.311,11.611,23.878,17.27z"
      ></path>
      <g>
        <path
          fill="#1565C0"
          d="M32.084 25.055c1.754-.394 3.233.723 3.233 2.01 0 2.901-4.021 5.643-4.021 5.643s6.225-.742 6.225-5.505C37.521 24.053 34.464 23.266 32.084 25.055zM29.129 27.395c0 0 1.941-1.383 2.458-1.902-4.763 1.011-15.638 1.147-15.638.269 0-.809 3.507-1.638 3.507-1.638s-7.773-.112-7.773 2.181C11.683 28.695 21.858 28.866 29.129 27.395z"
        ></path>
        <path
          fill="#1565C0"
          d="M27.935,29.571c-4.509,1.499-12.814,1.02-10.354-0.993c-1.198,0-2.974,0.963-2.974,1.889c0,1.857,8.982,3.291,15.63,0.572L27.935,29.571z"
        ></path>
        <path
          fill="#1565C0"
          d="M18.686,32.739c-1.636,0-2.695,1.054-2.695,1.822c0,2.391,9.76,2.632,13.627,0.205l-2.458-1.632C24.271,34.404,17.014,34.579,18.686,32.739z"
        ></path>
        <path
          fill="#1565C0"
          d="M36.281,36.632c0-0.936-1.055-1.377-1.433-1.588c2.228,5.373-22.317,4.956-22.317,1.784c0-0.721,1.807-1.427,3.477-1.093l-1.42-0.839C11.26,34.374,9,35.837,9,37.017C9,42.52,36.281,42.255,36.281,36.632z"
        ></path>
        <path
          fill="#1565C0"
          d="M39,38.604c-4.146,4.095-14.659,5.587-25.231,3.057C24.341,46.164,38.95,43.628,39,38.604z"
        ></path>
      </g>
    </svg>
  ),
  openai: () => (
    <svg
      width="800px"
      height="800px"
      viewBox="0 0 24 24"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby="placeholderIconTitle"
      stroke="#000000"
      strokeWidth="1"
      strokeLinecap="square"
      strokeLinejoin="miter"
      fill="none"
      color="#000000"
    >
      {" "}
      <title id="placeholderIconTitle">Placeholder</title>{" "}
      <rect width="18" height="18" x="3" y="3" />{" "}
      <path strokeLinecap="round" d="M21 21L3 3 21 21zM21 3L3 21 21 3z" />{" "}
    </svg>
  ),
  googleDrive: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="100"
      height="100"
      viewBox="0 0 48 48"
    >
      <path
        fill="#0277BD"
        d="M24.047,5c-1.555,0.005-2.633,0.142-3.936,0.367c-3.848,0.67-4.549,2.077-4.549,4.67V14h9v2H15.22h-4.35c-2.636,0-4.943,1.242-5.674,4.219c-0.826,3.417-0.863,5.557,0,9.125C5.851,32.005,7.294,34,9.931,34h3.632v-5.104c0-2.966,2.686-5.896,5.764-5.896h7.236c2.523,0,5-1.862,5-4.377v-8.586c0-2.439-1.759-4.263-4.218-4.672C27.406,5.359,25.589,4.994,24.047,5z M19.063,9c0.821,0,1.5,0.677,1.5,1.502c0,0.833-0.679,1.498-1.5,1.498c-0.837,0-1.5-0.664-1.5-1.498C17.563,9.68,18.226,9,19.063,9z"
      ></path>
      <path
        fill="#FFC107"
        d="M23.078,43c1.555-0.005,2.633-0.142,3.936-0.367c3.848-0.67,4.549-2.077,4.549-4.67V34h-9v-2h9.343h4.35c2.636,0,4.943-1.242,5.674-4.219c0.826-3.417,0.863-5.557,0-9.125C41.274,15.995,39.831,14,37.194,14h-3.632v5.104c0,2.966-2.686,5.896-5.764,5.896h-7.236c-2.523,0-5,1.862-5,4.377v8.586c0,2.439,1.759,4.263,4.218,4.672C19.719,42.641,21.536,43.006,23.078,43z M28.063,39c-0.821,0-1.5-0.677-1.5-1.502c0-0.833,0.679-1.498,1.5-1.498c0.837,0,1.5,0.664,1.5,1.498C29.563,38.32,28.899,39,28.063,39z"
      ></path>
    </svg>
  ),
  whatsapp: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="100"
      height="100"
      viewBox="0 0 48 48"
      className="grayscale opacity-50"
    >
      <path
        fill="#00549d"
        fillRule="evenodd"
        d="M22.903,3.286c0.679-0.381,1.515-0.381,2.193,0 c3.355,1.883,13.451,7.551,16.807,9.434C42.582,13.1,43,13.804,43,14.566c0,3.766,0,15.101,0,18.867 c0,0.762-0.418,1.466-1.097,1.847c-3.355,1.883-13.451,7.551-16.807,9.434c-0.679,0.381-1.515,0.381-2.193,0 c-3.355-1.883-13.451-7.551-16.807-9.434C5.418,34.899,5,34.196,5,33.434c0-3.766,0-15.101,0-18.867 c0-0.762,0.418-1.466,1.097-1.847C9.451,10.837,19.549,5.169,22.903,3.286z"
        clipRule="evenodd"
      ></path>
      <path
        fill="#0086d4"
        fillRule="evenodd"
        d="M5.304,34.404C5.038,34.048,5,33.71,5,33.255 c0-3.744,0-15.014,0-18.759c0-0.758,0.417-1.458,1.094-1.836c3.343-1.872,13.405-7.507,16.748-9.38 c0.677-0.379,1.594-0.371,2.271,0.008c3.343,1.872,13.371,7.459,16.714,9.331c0.27,0.152,0.476,0.335,0.66,0.576L5.304,34.404z"
        clipRule="evenodd"
      ></path>
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M24,10c7.727,0,14,6.273,14,14s-6.273,14-14,14 s-14-6.273-14-14S16.273,10,24,10z M24,17c3.863,0,7,3.136,7,7c0,3.863-3.137,7-7,7s-7-3.137-7-7C17,20.136,20.136,17,24,17z"
        clipRule="evenodd"
      ></path>
      <path
        fill="#0075c0"
        fillRule="evenodd"
        d="M42.485,13.205c0.516,0.483,0.506,1.211,0.506,1.784 c0,3.795-0.032,14.589,0.009,18.384c0.004,0.396-0.127,0.813-0.323,1.127L23.593,24L42.485,13.205z"
        clipRule="evenodd"
      ></path>
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M31 21H33V27H31zM38 21H40V27H38z"
        clipRule="evenodd"
      ></path>
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M29 23H35V25H29zM36 23H42V25H36z"
        clipRule="evenodd"
      ></path>
    </svg>
  ),
  googleDocs: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="100"
      height="100"
      viewBox="0 0 48 48"
    >
      <path
        fill="#283593"
        fillRule="evenodd"
        d="M22.903,3.286c0.679-0.381,1.515-0.381,2.193,0 c3.355,1.883,13.451,7.551,16.807,9.434C42.582,13.1,43,13.804,43,14.566c0,3.766,0,15.101,0,18.867 c0,0.762-0.418,1.466-1.097,1.847c-3.355,1.883-13.451,7.551-16.807,9.434c-0.679,0.381-1.515,0.381-2.193,0 c-3.355-1.883-13.451-7.551-16.807-9.434C5.418,34.899,5,34.196,5,33.434c0-3.766,0-15.101,0-18.867 c0-0.762,0.418-1.466,1.097-1.847C9.451,10.837,19.549,5.169,22.903,3.286z"
        clipRule="evenodd"
      ></path>
      <path
        fill="#5c6bc0"
        fillRule="evenodd"
        d="M5.304,34.404C5.038,34.048,5,33.71,5,33.255 c0-3.744,0-15.014,0-18.759c0-0.758,0.417-1.458,1.094-1.836c3.343-1.872,13.405-7.507,16.748-9.38 c0.677-0.379,1.594-0.371,2.271,0.008c3.343,1.872,13.371,7.459,16.714,9.331c0.27,0.152,0.476,0.335,0.66,0.576L5.304,34.404z"
        clipRule="evenodd"
      ></path>
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M24,10c7.727,0,14,6.273,14,14s-6.273,14-14,14 s-14-6.273-14-14S16.273,10,24,10z M24,17c3.863,0,7,3.136,7,7c0,3.863-3.137,7-7,7s-7-3.137-7-7C17,20.136,20.136,17,24,17z"
        clipRule="evenodd"
      ></path>
      <path
        fill="#3949ab"
        fillRule="evenodd"
        d="M42.485,13.205c0.516,0.483,0.506,1.211,0.506,1.784 c0,3.795-0.032,14.589,0.009,18.384c0.004,0.396-0.127,0.813-0.323,1.127L23.593,24L42.485,13.205z"
        clipRule="evenodd"
      ></path>
    </svg>
  ),
  zapier: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      viewBox="0 0 32 32"
      className="grayscale opacity-30"
    >
      <path d="M15 3.77a.951.951 0 1 1 1.902 0 .951.951 0 0 1-1.902 0M3.654 12.38a.951.951 0 1 1 1.902 0 .951.951 0 0 1-1.902 0m22.692.044a.951.951 0 0 1 1.902 0 .951.951 0 0 1-1.902 0M6.406 13.73a.87.87 0 0 0 .441-1.146l-.422-.954h1.66v7.48H4.736a11.7 11.7 0 0 1-.379-4.47zm6.942.184v-2.205H17.3c.204 0 1.44.236 1.44 1.16 0 .768-.95 1.044-1.73 1.044zM7.952 25.785a.951.951 0 1 1 1.902 0 .951.951 0 0 1-1.902 0m14.093.044a.951.951 0 0 1 1.902 0 .951.951 0 0 1-1.902 0m.294-2.157a.867.867 0 0 0-1.03.667l-.477 2.228a11.71 11.71 0 0 1-9.765-.047l-.477-2.228a.865.865 0 0 0-1.03-.667l-1.967.422a12 12 0 0 1-1.017-1.199h9.57c.108 0 .18-.02.18-.118v-3.385c0-.1-.072-.118-.18-.118h-2.8v-2.146h3.027c.276 0 1.477.08 1.862 1.614l.565 2.5c.18.55.913 1.653 1.693 1.653h4.94a12 12 0 0 1-1.085 1.255zm5.314-8.938a11.7 11.7 0 0 1 .025 2.033h-1.2c-.12 0-.17.08-.17.197v.552c0 1.3-.732 1.58-1.374 1.653-.61.07-1.29-.256-1.372-.63-.36-2.028-.96-2.46-1.9-3.21 1.177-.748 2.402-1.85 2.402-3.327 0-1.594-1.093-2.598-1.838-3.09-1.045-.69-2.202-.827-2.514-.827H7.277a11.7 11.7 0 0 1 6.551-3.697l1.465 1.537c.33.347.88.36 1.226.028l1.64-1.567a11.71 11.71 0 0 1 8.017 5.709l-1.122 2.534a.87.87 0 0 0 .441 1.146zm2.798.04-.038-.392 1.156-1.078c.235-.22.147-.66-.153-.772l-1.477-.552-.116-.38.92-1.28c.188-.26.015-.675-.3-.727l-1.558-.253-.187-.35.655-1.437c.134-.293-.115-.667-.437-.655l-1.58.055-.25-.303.363-1.54c.073-.313-.244-.63-.557-.557l-1.54.363-.304-.25.055-1.58c.012-.32-.362-.57-.654-.437l-1.436.655-.35-.188-.254-1.558c-.05-.316-.467-.488-.727-.3l-1.28.92-.38-.115L19.47.586c-.112-.3-.553-.388-.772-.154L17.62 1.588l-.392-.038-.832-1.345c-.168-.272-.62-.272-.787 0l-.832 1.345-.392.038L13.305.43c-.22-.234-.66-.147-.772.154l-.552 1.477-.38.115-1.28-.92c-.26-.188-.676-.015-.727.3L9.34 3.114l-.35.188-1.436-.655c-.292-.133-.667.117-.654.437l.055 1.58-.304.25-1.54-.363c-.313-.073-.63.244-.557.557l.363 1.54-.25.303-1.58-.055c-.32-.01-.57.362-.437.655l.655 1.437-.188.35-1.558.253c-.316.05-.488.467-.3.727l.92 1.28-.116.38-1.477.552c-.3.112-.388.553-.153.772l1.156 1.078-.038.392-1.345.832c-.272.168-.272.62 0 .787l1.345.832.038.392L.43 18.697c-.234.22-.147.66.153.772l1.477.552.116.38-.92 1.28c-.187.26-.015.676.3.727l1.557.253.188.35-.655 1.436c-.133.292.118.667.437.655l1.58-.055.25.304-.363 1.54c-.073.312.244.63.557.556l1.54-.363.304.25-.055 1.58c-.012.32.362.57.654.437l1.436-.655.35.188.254 1.557c.05.317.467.488.727.302l1.28-.922.38.116.552 1.477c.112.3.553.388.772.153l1.078-1.156.392.04.832 1.345c.168.27.618.272.787 0l.832-1.345.392-.04 1.078 1.156c.22.235.66.147.772-.153l.552-1.477.38-.116 1.28.922c.26.187.676.015.727-.302l.254-1.557.35-.188 1.436.655c.292.133.666-.116.654-.437l-.055-1.58.303-.25 1.54.363c.313.073.63-.244.557-.556l-.363-1.54.25-.304 1.58.055c.32.013.57-.363.437-.655l-.655-1.436.187-.35 1.558-.253c.317-.05.49-.466.3-.727l-.92-1.28.116-.38 1.477-.552c.3-.113.388-.553.153-.772l-1.156-1.078.038-.392 1.345-.832c.272-.168.273-.618 0-.787z" />
    </svg>
  ),
  messenger: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="100"
      height="100"
      viewBox="0 0 48 48"
      className="grayscale opacity-50"
    >
      <path fill="#ffd600" d="M6,42V6h36v36H6z"></path>
      <path
        fill="#000001"
        d="M29.538 32.947c.692 1.124 1.444 2.201 3.037 2.201 1.338 0 2.04-.665 2.04-1.585 0-1.101-.726-1.492-2.198-2.133l-.807-.344c-2.329-.988-3.878-2.226-3.878-4.841 0-2.41 1.845-4.244 4.728-4.244 2.053 0 3.528.711 4.592 2.573l-2.514 1.607c-.553-.988-1.151-1.377-2.078-1.377-.946 0-1.545.597-1.545 1.377 0 .964.6 1.354 1.985 1.951l.807.344C36.452 29.645 38 30.839 38 33.523 38 36.415 35.716 38 32.65 38c-2.999 0-4.702-1.505-5.65-3.368L29.538 32.947zM17.952 33.029c.506.906 1.275 1.603 2.381 1.603 1.058 0 1.667-.418 1.667-2.043V22h3.333v11.101c0 3.367-1.953 4.899-4.805 4.899-2.577 0-4.437-1.746-5.195-3.368L17.952 33.029z"
      ></path>
    </svg>
  ),
};
