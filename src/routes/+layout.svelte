<script>
    import Toasts from "../components/base/Toasts.svelte";
    import tooltip from "@/actions/tooltip";
    import { page } from "$app/stores";
    import Toggler from "../components/base/Toggler.svelte";
    import "../scss/main.scss";

    export let data;
    let { user } = data;
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
                href="/pull-requests"
                class="menu-item"
                aria-label="Pull requests"
                class:active={$page.url.pathname.startsWith("/pull-requests")}
                use:tooltip={{ text: "Pull requests", position: "right" }}
            >
                <img
                    style="text-align: center"
                    height="25"
                    alt="pr"
                    src="/icons/svg/pull-request.svg"
                />
            </a>
            <a
                href="/jobs"
                class="menu-item"
                aria-label="Job queue"
                class:active={$page.url.pathname.includes("/jobs")}
                use:tooltip={{ text: "Job queue", position: "right" }}
            >
                <img height="25" alt="queue" src="/icons/png/queue.png" />
            </a>
            <a href="/settings" class="menu-item" aria-label="Settings">
                <i class="ri-tools-line" />
            </a>
        </nav>

        {#key user}

        {#if user && user.login}
            <figure class="thumb thumb-circle link-hint closable">
                <img
                    src={`https://github.com/${user.login}.png?size=200`}
                    alt="Avatar"
                />
                <Toggler
                    class="dropdown dropdown-nowrap dropdown-upside dropdown-left"
                >
                <button on:click={() => window.location.href = "/logout"} class="dropdown-item closable">
                    <i class="ri-logout-circle-line" />
                    <span class="txt">Logout</span>
                </button>
                </Toggler>
            </figure>
        {/if}
        {#if !user}
            <a
                href="/login"
                class="menu-item"
                aria-label="Sign in with GitHub"
                use:tooltip={{ text: "Sign in with GitHub", position: "right" }}
            >
                <i style="font-size: 45px" class="ri-github-fill" />
            </a>
        {/if}
        {/key}
    </aside>

    <div class="app-body">
        <slot />
        <Toasts />
    </div>
</div>
