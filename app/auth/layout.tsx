import { AmbientBackground } from "@/components/ui/ambient-background";

/** Every auth screen sits on the same soft grid-and-glow atmosphere. */
export default function AuthLayout({ children }: LayoutProps<"/auth">) {
  return (
    <div className="relative isolate flex flex-1 flex-col">
      <AmbientBackground variant="hero" />
      {children}
    </div>
  );
}
