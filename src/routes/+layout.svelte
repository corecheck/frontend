<script>
    import Toasts from "../components/base/Toasts.svelte";
    import tooltip from "@/actions/tooltip";
    import { page } from "$app/stores";
    import Toggler from "../components/base/Toggler.svelte";
    import "../scss/main.scss";
    import { setContext } from 'svelte';

    export let data;
    let { user } = data;

    setContext('user', user);
</script>

<div class="app-layout">
    <aside class="app-sidebar">
        <a href="/" class="logo logo-sm">
            <img
                src="{import.meta.env.BASE_URL}images/logo.png"
                alt="Bitcoin Core Coverage"
                width="40"
                height="40"
            />
        </a>

        <nav class="main-menu">
            <a
                href="/bitcoin/bitcoin/pulls"
                class="menu-item"
                aria-label="Pull requests"
                class:active={$page.url.pathname.includes("/pulls")}
                use:tooltip={{ text: "Pull requests", position: "right" }}
            >
                <img
                    style="text-align: center"
                    height="25"
                    alt="pr"
                    src="/icons/svg/pull-request.svg"
                />
            </a>
        </nav>

        {#key user}
        <a
            href="https://github.com/corecheck/corecheck"
            target="_blank"
            rel="noopener noreferrer"
            class="menu-item"
        >
            <i style="font-size: 50px; margin-bottom: 10px" class="ri-github-fill" />
        </a>
        {/key}
    </aside>

    <div class="app-body">
        <slot />
        <Toasts />
    </div>
</div>
