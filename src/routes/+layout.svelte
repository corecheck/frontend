<script>
	import Toasts from '../components/base/Toasts.svelte';
    import tooltip from "@/actions/tooltip";
  	import { page } from '$app/stores';
import Toggler from '../components/base/Toggler.svelte';
import '../scss/main.scss'
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
				class:active="{$page.url.pathname.startsWith("/pull-requests")}"
				use:tooltip={{ text: "Pull requests", position: "right" }}
            >
				<img style="text-align: center" height="25" alt="pr" src="/icons/svg/pull-request.svg" />
            </a>
            <a
                href="/jobs"
                class="menu-item"
                aria-label="Job queue"
				class:active="{$page.url.pathname.includes("/jobs")}"
				use:tooltip={{ text: "Job queue", position: "right" }}
            >
				<img height="25" alt="queue" src="/icons/png/queue.png" />
            </a>
            <a
                href="/settings"
                class="menu-item"
                aria-label="Settings"
            >
                <i class="ri-tools-line" />
            </a>
        </nav>

        <figure class="thumb thumb-circle link-hint closable">
            <img
                src="{import.meta.env.BASE_URL}images/avatars/avatar0.svg"
                alt="Avatar"
            />
            <Toggler class="dropdown dropdown-nowrap dropdown-upside dropdown-left">
                <a href="/settings/admins" class="dropdown-item closable">
                    <i class="ri-shield-user-line" />
                    <span class="txt">Manage admins</span>
                </a>
                <hr />
                <button type="button" class="dropdown-item closable">
                    <i class="ri-logout-circle-line" />
                    <span class="txt">Logout</span>
                </button>
            </Toggler>
        </figure>
    </aside>

    <div class="app-body">
		<slot/>
		<Toasts />
    </div>
</div>