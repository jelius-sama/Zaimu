import { type JSX, children } from "solid-js"

export default function Fragment({ children: c }: { children: JSX.Element }) {
  const resolved = children(() => c);
  return <>{resolved()}</>
}

// INFO: I have no idea how they differ but I'm using the first once because children must exists for a reason and while I'm not too sure but I think this is the reason
// export default function Fragment(props: { children: JSX.Element }) {
//   return <>{props.children}</>
// }
