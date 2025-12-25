import { onMount, onCleanup } from "solid-js";
import { useConfig } from "@/contexts/config";
import { setAppState } from "@/contexts/app";

export const Title = () => {
    const config = useConfig();
    let el!: HTMLDivElement;

    onMount(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setAppState("pageTitleVisible", entry.isIntersecting);
            },
            {
                threshold: 0,
            }
        );

        observer.observe(el);

        onCleanup(() => observer.disconnect());
    });

    return (
        <div ref={el} class="mb-8">
            {config.activeTitle() !== null && (
                <h1 class="text-3xl font-bold text-foreground mb-2">
                    {config.activeTitle()}
                </h1>
            )}
            {config.activeDescription() !== null && (
                <p class="text-muted-foreground">
                    {config.activeDescription()}
                </p>
            )}
        </div>
    );
};
