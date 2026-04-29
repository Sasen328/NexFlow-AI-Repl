const KEY = "nf:signedIn";

export function isSignedIn(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}

export function setSignedIn(value: boolean) {
  if (typeof window === "undefined") return;
  if (value) window.localStorage.setItem(KEY, "1");
  else window.localStorage.removeItem(KEY);
}
