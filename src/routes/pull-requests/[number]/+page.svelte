<script>
    import { page } from "$app/stores";
    import { _fetchCoverage } from "./+page";
    import Accordion from "../../../components/base/Accordion.svelte";
    import Field from "../../../components/base/Field.svelte";
    import JobList from "../../../components/jobs/JobList.svelte";
    const pageTitle = "Pull requests";
    export let data;
    let { pr, coverage } = data;
    console.log("coverage", coverage);

    function startCoverage() {
        fetch("http://localhost:1323/pr/" + $page.params.number + "/analyze", {
            method: "POST",
        })
            .then((res) => {
                console.log(res);
                window.location.reload();
            })
            .catch((err) => {
                console.error(err);
            });
    }

    function hasRunningJob() {
        return pr.jobs?.some(
            (job) => job.status === "queued" || job.status === "running"
        );
    }

    function hasCoverage() {
        return pr.jobs?.some((job) => job.status === "success");
    }

    let hasExpanded = false;
    function expandAll() {
        const accordions = document.querySelectorAll(".accordion");
        for (const accordion of accordions) {
            if (accordion.classList.contains("active")) {
                continue;
            }

            accordion.querySelector(".accordion-header").click();
        }

        hasExpanded = true;
    }

    function collapseAll() {
        const accordions = document.querySelectorAll(".accordion");
        for (const accordion of accordions) {
            if (!accordion.classList.contains("active")) {
                continue;
            }

            accordion.querySelector(".accordion-header").click();
        }

        hasExpanded = false;
    }

    let fullCoverage = false;

    // detect fullCoverage change
    async function onChangeFullCoverage(e) {
        coverage = await _fetchCoverage(pr.number, e.target.checked);
    }
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
            {#if hasRunningJob()}
                <div class="alert alert-warning" style="text-align: center">
                    <i class="ri-information-line" /> A coverage analysis job is
                    currently running, please come back later.
                </div>
            {/if}

            {#if !hasRunningJob() && !hasCoverage()}
                <div class="alert alert-info" style="text-align: center">
                    <i class="ri-information-line" /> No coverage data available
                    for this PR.
                    <button
                        type="button"
                        class="btn btn-primary"
                        on:click={startCoverage}
                    >
                        Start coverage analysis
                    </button>
                </div>
            {/if}
        </div>
        <div class="clearfix m-b-base" />
        {#if coverage !== null}
            <div style="width: 49%">
                <div class="flex">
                    <h1>Coverage data</h1>
                    {#if hasExpanded}
                        <button
                            type="button"
                            class="btn btn-sm btn-primary"
                            on:click={collapseAll}
                        >
                            <i class="ri-arrow-up-s-line" />
                            Collapse all
                        </button>
                    {:else}
                        <button
                            type="button"
                            class="btn btn-sm btn-primary"
                            on:click={expandAll}
                        >
                            <i class="ri-arrow-down-s-line" />
                            Expand all
                        </button>
                    {/if}
                </div>
                <div class="clearfix m-b-base" />
                <Field class="form-field form-field-toggle" let:uniqueId>
                    <input
                        on:change={onChangeFullCoverage}
                        type="checkbox"
                        id={uniqueId}
                        required
                        bind:checked={fullCoverage}
                    />
                    <label for={uniqueId}>Display full coverage</label>
                </Field>
                {#key coverage}
                    {#if coverage?.length === 0}
                        <div
                            class="alert alert-success"
                            style="text-align: center"
                        >
                            <i class="ri-information-line" /> All added lines in
                            this pull request are covered.
                        </div>
                    {/if}
                    <div class="accordions">
                        {#each coverage as file}
                            <Accordion>
                                <svelte:fragment slot="header">
                                    <div class="inline-flex">
                                        <i class="ri-file-code-line" />
                                        <span class="txt">{file.name}</span>
                                    </div>

                                    <div class="flex-fill" />
                                    <span
                                        class="label"
                                        class:label-success={file.tested_ratio >=
                                            0.8}
                                        class:label-warning={file.tested_ratio >
                                            0.5 && file.tested_ratio < 0.8}
                                        class:label-danger={file.tested_ratio <
                                            0.5}
                                        >{(file.tested_ratio * 100).toFixed(
                                            0
                                        )}%</span
                                    >
                                </svelte:fragment>
                                {#each file.hunks as hunk}
                                    <pre><div
                                            class="code">{#each hunk.lines as line}<div
                                                    class="line"><a
                                                        target="_blank"
                                                        href={`https://github.com/${pr.head_repo}/blob/${pr.head}/${file.name}#L${line.line_number}`}
                                                        class="line-number link-primary txt-mono"
                                                        >{line.line_number} </a><span
                                                        class:line-covered={line.covered &&
                                                            line.changed &&
                                                            line.testable}
                                                        class:line-uncovered={!line.covered &&
                                                            line.changed &&
                                                            line.testable}
                                                        class="txt-mono"
                                                        >{line.line}</span
                                                    ></div>{/each}</div></pre>
                                {/each}
                            </Accordion>
                        {/each}
                    </div>
                {/key}
            </div>
            <div class="clearfix m-b-base" />
        {/if}

        <!-- separator -->
        <h2>Jobs</h2>
        <JobList jobs={pr.jobs?.sort((a, b) => b.id - a.id) || []} />
    </main>
</div>

<style lang="scss">
    .code {
        background-color: #f1f1f1;
        padding: 1rem;
        border-radius: 0.25rem;
        margin-bottom: 1rem;
        overflow: auto;
    }

    .line {
        display: flex;
        align-items: center;

        .line-covered {
            background-color: #a6f2b8;
        }

        .line-uncovered {
            background-color: #efb2b2;
        }
    }
    .line-number {
        text-align: right;
        margin-right: 0.5rem;
        border-right: 1px solid #d0d5db;
    }
</style>
