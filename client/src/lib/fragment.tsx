import { type JSX, children } from "solid-js"

export default function Fragment({ children: c }: { children: JSX.Element }) {
  const resolved = children(() => c);
  return <>{resolved()}</>
}
