import Image from 'next/image';

export default function Logo() {
  return (
    <div className="logo">
      <Image
        src="/logo.png"
        alt="AKBAR Premium Quality Tea"
        width={200}
        height={100}
        priority
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  );
}
