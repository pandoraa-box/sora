interface Props {
  size?: number;
  className?: string;
}

export function StellarLogo({ size = 24, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/*
        Stellar mark: three circles arranged at 120° intervals.
        Each circle's center is at distance r from the composition
        centre (50,50), and each has radius r — so all three
        circles intersect exactly at the centre point.
        The opacity stacking produces a natural luminosity gradient:
        single-overlap ≈ 33 %, double ≈ 66 %, triple (centre) ≈ 100 %.
      */}
      <circle cx="50"    cy="25"   r="25" fill="currentColor" opacity="0.35" />
      <circle cx="28.35" cy="62.5" r="25" fill="currentColor" opacity="0.35" />
      <circle cx="71.65" cy="62.5" r="25" fill="currentColor" opacity="0.35" />
    </svg>
  );
}
