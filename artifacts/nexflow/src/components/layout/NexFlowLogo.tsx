import logoMark from "@/assets/logo_mark.png";
import logoFull from "@/assets/logo_full.png";

export function NexFlowLogo({ size = 36 }: { size?: number }) {
  return (
    <img
      src={logoMark}
      alt="NexFlow"
      style={{ width: size, height: size, objectFit: "contain", display: "block" }}
    />
  );
}

export function NexFlowWordmark({ className }: { className?: string }) {
  return (
    <img
      src={logoFull}
      alt="NexFlow"
      className={className}
      style={{ width: "160px", height: "auto", display: "block", objectFit: "contain" }}
    />
  );
}
