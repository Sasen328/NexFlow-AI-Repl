import logoMark from "@/assets/logo_mark.png";
import logoFull from "@/assets/logo_full.png";

export function NexFlowLogo({ size = 32 }: { size?: number }) {
  return (
    <img
      src={logoMark}
      alt="NexFlow"
      width={size}
      height={size}
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
      style={{ width: "auto", objectFit: "contain", display: "block", maxHeight: "100%" }}
    />
  );
}
