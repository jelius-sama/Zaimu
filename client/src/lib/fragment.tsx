import { type JSX } from "solid-js"

// export default function Fragment({ children: c }: { children: JSX.Element }) {
//   const resolved = children(() => c);
//   return <>{resolved()}</>
// }

export default function Fragment(props: { children: JSX.Element }) {
  return <>{props.children}</>
}
