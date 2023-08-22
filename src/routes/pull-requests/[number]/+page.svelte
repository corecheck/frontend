<script>
    import { page } from '$app/stores';
    const pageTitle = "Pull requests";
    let refreshKey = 1;
    function refresh() {
        refreshKey++;
    }
    let isLoading = false;
    let pr = {};
    export async function load() {
        isLoading = true;

        fetch("https://api.github.com/repos/bitcoin/bitcoin/pulls/" + $page.params.number)
            .then((res) => res.json())
            .then((res) => {
                pr = res;
            })
            .catch((err) => {
                console.error(err);
            });

        isLoading = false;
    }

    load();

</script>
<div class="page-wrapper">
    <main class="page-content">
        <div class="page-header-wrapper m-b-0">
            <header class="page-header">
                <nav class="breadcrumbs">
                    <div class="breadcrumb-item">{pageTitle}</div>
                    <div class="breadcrumb-item">#{$page.params.number}</div>
                </nav>
                <div class="flex-fill" />
            </header>
                <h1>
                    <a href={pr.html_url} target="_blank">
                        {pr.title}
                    </a>
                </h1>
            
            <div class="clearfix m-b-base" />
        <div class="alert alert-info" style="text-align: center">
            <i class="ri-information-line" /> No coverage data available for this PR.
            <button type="button" class="btn btn-primary" on:click={() => refresh()}>
                Start coverage analysis
            </button>
        </div>
        </div>
    </main>
</div>
