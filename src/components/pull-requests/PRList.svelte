<script>
    import { createEventDispatcher } from "svelte";
    import CommonHelper from "@/utils/CommonHelper";
    import SortHeader from "@/components/base/SortHeader.svelte";
    import FormattedDate from "@/components/base/FormattedDate.svelte";
    import HorizontalScroller from "@/components/base/HorizontalScroller.svelte";

    export let filter = "";
    export let presets = "";
    export let sort = "-rowid";

    let items = [];
    let currentPage = 1;
    let totalItems = 0;
    let isLoading = false;
    let yieldedItemsId = 0;

    $: if (typeof sort !== "undefined" || typeof filter !== "undefined" || typeof presets !== "undefined") {
        clearList();
        load(1);
    }

    $: canLoadMore = totalItems > items.length;

    export async function load(page = 1, breakTasks = true) {
        isLoading = true;

        fetch("https://api.github.com/repos/bitcoin/bitcoin/pulls?page=" + page)
            .then((res) => res.json())
            .then((res) => {
                items = [...items, ...res];
                currentPage = page;
                totalItems = res.length;
            })
            .catch((err) => {
                console.error(err);
            });

        isLoading = false;
    }

    function clearList() {
        items = [];
        currentPage = 1;
        totalItems = 0;
    }
</script>

<HorizontalScroller class="table-wrapper">
    <table class="table" class:table-loading={isLoading}>
        <thead>
            <tr>
                <SortHeader disable class="col-type-number col-field-status" name="status" bind:sort>
                    <div class="col-header-content">
                        <i class={CommonHelper.getFieldTypeIcon("status")} />
                        <span class="txt">Status</span>
                    </div>
                </SortHeader>
                <SortHeader disable class="col-type-number col-field-number" name="number" bind:sort>
                    <div class="col-header-content">
                        <i class={CommonHelper.getFieldTypeIcon("number")} />
                        <span class="txt">Number</span>
                    </div>
                </SortHeader>
                <SortHeader class="col-type-text col-field-url" name="title" bind:sort>
                    <div class="col-header-content">
                        <i class={CommonHelper.getFieldTypeIcon("text")} />
                        <span class="txt">Title</span>
                    </div>
                </SortHeader>
                <SortHeader disable class="col-field-author" name="author" bind:sort>
                    <div class="col-header-content">
                        <i class="ri-global-line" />
                        <span class="txt">Author</span>
                    </div>
                </SortHeader>

                <SortHeader disable class="col-type-number col-field-number" name="number" bind:sort>
                    <div class="col-header-content">
                        <i class={CommonHelper.getFieldTypeIcon("number")} />
                        <span class="txt">Coverage score</span>
                    </div>
                </SortHeader>
                <SortHeader disable class="col-type-number col-field-number" name="number" bind:sort>
                    <div class="col-header-content">
                        <i class={CommonHelper.getFieldTypeIcon("number")} />
                        <span class="txt">Mutation score</span>
                    </div>
                </SortHeader>


                <SortHeader disable class="col-type-date col-field-created" name="created" bind:sort>
                    <div class="col-header-content">
                        <i class={CommonHelper.getFieldTypeIcon("date")} />
                        <span class="txt">Created</span>
                    </div>
                </SortHeader>
                <SortHeader disable class="col-type-date col-field-updated" name="created" bind:sort>
                    <div class="col-header-content">
                        <i class={CommonHelper.getFieldTypeIcon("date")} />
                        <span class="txt">Updated</span>
                    </div>
                </SortHeader>

                <th class="col-type-action min-width" />
            </tr>
        </thead>
        <tbody>
            {#each items as item (item.id)}
                <tr
                    tabindex="0"
                    class="row-handle"
                    on:click={() => window.open("/pull-requests/" + item.number, "_blank")}
                >
                    <td class="col-type-text col-field-method min-width">
                        <span class="label" class:label-danger={item.state === "closed"} class:label-success={item.state === "open"}>
                            {item.state}
                        </span>
                    </td>
                    <td class="col-type-number col-field-number min-width">
                        <span class="label" class:label-danger={item.status >= 400}>
                            {item.number}
                        </span>
                    </td>
                    <td class="col-type-text col-field-url">
                        <span class="txt txt-ellipsis" title={item.title}>
                            {item.title}
                        </span>
                    </td>

                    <td class="col-type-text col-field-method">
                        <span class="label">
                            {item.user.login}
                        </span>
                    </td>
                    
                    <td class="col-type-number col-field-number min-width">
                        <span class="label" class:label-success={true}>
                            86%
                        </span>
                    </td>
                    <td class="col-type-number col-field-number min-width">
                        <span class="label" class:label-danger={true}>
                            30%
                        </span>
                    </td>

                    <td class="col-type-date col-field-created">
                        <FormattedDate date={item.created_at} />
                    </td>
                    <td class="col-type-date col-field-created">
                        <FormattedDate date={item.updated_at} />
                    </td>

                    <td class="col-type-action min-width">
                        <i class="ri-arrow-right-line" />
                    </td>
                </tr>
            {:else}
                {#if isLoading}
                    <tr>
                        <td colspan="99" class="p-xs">
                            <span class="skeleton-loader m-0" />
                        </td>
                    </tr>
                {:else}
                    <tr>
                        <td colspan="99" class="txt-center txt-hint p-xs">
                            <h6>No logs found.</h6>
                            {#if filter?.length}
                                <button
                                    type="button"
                                    class="btn btn-hint btn-expanded m-t-sm"
                                    on:click={() => (filter = "")}
                                >
                                    <span class="txt">Clear filters</span>
                                </button>
                            {/if}
                        </td>
                    </tr>
                {/if}
            {/each}
        </tbody>
    </table>
</HorizontalScroller>

{#if items.length}
    <small class="block txt-hint txt-right m-t-sm">Showing {items.length} of {totalItems}</small>
{/if}

{#if items.length && canLoadMore}
    <div class="block txt-center m-t-xs">
        <button
            type="button"
            class="btn btn-lg btn-secondary btn-expanded"
            class:btn-loading={isLoading}
            class:btn-disabled={isLoading}
            on:click={() => load(currentPage + 1)}
        >
            <span class="txt">Load more ({totalItems - items.length})</span>
        </button>
    </div>
{/if}
