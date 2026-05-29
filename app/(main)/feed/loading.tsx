import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <Image
        src="/assets/logo.svg"
        alt="Instagram"
        width={80}
        height={80}
        priority
      />
      <div className="flex flex-col items-center gap-2 mt-36">
        <span className=" text-2xl">from</span>
        <div className="flex items-center gap-2">
          <Image
            src="/assets/meta-logo-3.png"
            alt="Meta"
            width={64}
            height={20}
            className="object-contain"
          />
          <span className="text-base font-semibold text-gray-700">Meta</span>
        </div>
      </div>
    </div>
  );
}