<script lang="ts">
    import { page } from "$app/stores";
    import Accordion from "../../../../../components/base/Accordion.svelte";
    import Field from "../../../../../components/base/Field.svelte";
    import Highlight from "svelte-highlight";
    import { diff } from "svelte-highlight/languages/diff";
    import github from "svelte-highlight/styles/github";
    import tooltip from "../../../../../actions/tooltip";
    import { env } from "$env/dynamic/public";
    import { getContext } from "svelte";
    import { invalidateAll } from "$app/navigation";
    const pageTitle = "Pull requests";
    export let data;
    let { pr, sonarcloud } = data;
    console.log(pr);
    const coverage = pr.reports.length > 0 ? pr.reports.find((r) => r.commit === pr.head) || pr.reports[0] : {};

    function hasRunningJob() {
        return pr.jobs?.some(
            (job) =>
                job.aws_status !== "SUCCEEDED" && job.aws_status !== "FAILED"
        );
    }

    let hasExpanded = {
        coverage: false,
    };

    function expandAll(accType: string) {
        const accordionsDiv = document.querySelector(".accordions." + accType);
        const accordions = accordionsDiv?.querySelectorAll(".accordion");
        for (const accordion of accordions) {
            if (accordion.classList.contains("active")) {
                continue;
            }

            accordion.querySelector(".accordion-header").click();
        }

        hasExpanded[accType] = true;
    }

    function collapseAll(accType) {
        const accordionsDiv = document.querySelector(".accordions." + accType);
        const accordions = accordionsDiv?.querySelectorAll(".accordion");
        for (const accordion of accordions) {
            if (!accordion.classList.contains("active")) {
                continue;
            }

            accordion.querySelector(".accordion-header").click();
        }

        hasExpanded[accType] = false;
    }

    function getLineTooltip(line) {
        if (!line.testable) return "Not testable";
        if (line.covered) {
            if (line.changed) return "Covered and changed";

            return "Covered and unchanged";
        }

        if (line.changed) return "Uncovered and changed";
        return "Uncovered and unchanged";
    }

    const user = getContext("user");
</script>

<svelte:head>
    {@html github}
</svelte:head>

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
            <h1 class="flex">
                <a
                    href={"https://github.com/bitcoin/bitcoin/pull/" +
                        pr.number}
                    target="_blank"
                    use:tooltip={{
                        text: pr.head.substr(0, 7),
                        position: "right",
                    }}
                >
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
        </div>
        <div class="clearfix m-b-base" />
        <div class="cov-container flex flex-justify-between flex-align-start">
            {#if pr.reports.length > 0}
                <div class="cov-col">
                    <div class="flex">
                        <h1>Coverage</h1>
                        <span
                            class="label"
                            class:label-success={coverage.coverage_ratio >= 0.8}
                            class:label-warning={coverage.coverage_ratio > 0.5 &&
                                coverage.coverage_ratio < 0.8}
                            class:label-danger={coverage.ratio < 0.5}
                            >{(coverage.coverage_ratio * 100).toFixed(2)}%</span
                        >
                        {#if hasExpanded["coverage"]}
                            <button
                                type="button"
                                class="btn btn-sm btn-primary"
                                on:click={() => collapseAll("coverage")}
                            >
                                <i class="ri-arrow-up-s-line" />
                                Collapse all
                            </button>
                        {:else}
                            <button
                                type="button"
                                class="btn btn-sm btn-primary"
                                on:click={() => expandAll("coverage")}
                            >
                                <i class="ri-arrow-down-s-line" />
                                Expand all
                            </button>
                        {/if}
                    </div>
                    <div class="clearfix m-b-base" />
                    {#key coverage}
                        {#if coverage.coverage_lines?.length === 0}
                            <div
                                class="alert alert-success"
                                style="text-align: center"
                            >
                                <i class="ri-information-line" /> All added lines
                                in this pull request are covered.
                            </div>
                        {/if}
                        <div class="accordions coverage">
                            {#each coverage.coverage_files as file}
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
                                                            use:tooltip={{
                                                                text: getLineTooltip(
                                                                    line
                                                                ),
                                                                position: "top",
                                                            }}
                                                            class:line-changed-covered={line.covered &&
                                                                line.changed &&
                                                                line.testable}
                                                            class:line-unchanged-covered={line.covered &&
                                                                !line.changed &&
                                                                line.testable}
                                                            class:line-changed-uncovered={!line.covered &&
                                                                line.changed &&
                                                                line.testable}
                                                            class:line-unchanged-uncovered={!line.covered &&
                                                                !line.changed &&
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
                <div class="cov-col">
                    <h1>
                        Sonarcloud <span class="label label-secondary"
                            >Experimental</span
                        >
                    </h1>
                    <div class="clearfix m-b-base" />

                    <div class="accordions sonarcloud">
                        {#each sonarcloud.issues.sort((a, b) => {
                            if (a.severity === "BLOCKER") return -1;
                            if (b.severity === "BLOCKER") return 1;
                            if (a.severity === "CRITICAL") return -1;
                            if (b.severity === "CRITICAL") return 1;
                            if (a.severity === "MAJOR") return -1;
                            if (b.severity === "MAJOR") return 1;
                            if (a.severity === "MINOR") return -1;
                            if (b.severity === "MINOR") return 1;
                            if (a.severity === "INFO") return -1;
                            if (b.severity === "INFO") return 1;
                            return 0;
                        }) as issue}
                            <Accordion>
                                <svelte:fragment slot="header">
                                    <div class="inline-flex">
                                        <i class="ri-file-code-line" />
                                        <span class="txt">
                                            {issue.message}
                                        </span>
                                    </div>

                                    <div class="flex-fill" />
                                    <span
                                        class="label"
                                        class:label-success={issue.severity ===
                                            "BLOCKER"}
                                        class:label-warning={issue.severity ===
                                            "CRITICAL"}
                                        class:label-danger={issue.severity ===
                                            "MAJOR"}
                                        class:label-info={issue.severity ===
                                            "MINOR"}
                                        class:label-secondary={issue.severity ===
                                            "INFO"}>{issue.severity}</span
                                    >
                                </svelte:fragment>
                                <div class="form-field m-b-0">
                                    <pre><div class="code"><span
                                                class="filename"
                                                >{issue.component.split(
                                                    ":"
                                                )[1]}</span
                                            >
{#each issue.sources as line}<div class="line"><span
                                                        class="line-number txt-mono"
                                                        >{line.line}</span
                                                    ><span
                                                        class="txt-mono"
                                                        class:highlight={line.line >=
                                                            issue.textRange
                                                                .startLine &&
                                                            line.line <=
                                                                issue.textRange
                                                                    .endLine}
                                                        >{@html line.code}</span
                                                    ></div>{/each}</div></pre>

                                    <!-- https://sonarcloud.io/project/issues?&sinceLeakPeriod=true&branch=26415&id=aureleoules_bitcoin&open=AYsFGxvQ890w8U3JDlEV -->
                                    <a
                                        class="btn btn-primary btn-sm"
                                        href="https://sonarcloud.io/project/issues?id=aureleoules_bitcoin&branch={$page
                                            .params
                                            .number}&resolved=false&open={issue.key}"
                                        target="_blank">Open in SonarCloud</a
                                    >
                                </div>
                            </Accordion>
                        {/each}
                    </div>
                </div>
            {/if}
            {#if coverage === null && !hasRunningJob()}
                <div class="alert alert-info" style="text-align: center">
                    <i class="ri-information-line" /> No coverage data available
                    for this pull request and commit.
                </div>
            {/if}
        </div>
        <div class="clearfix m-b-base" />
    </main>
</div>

<style lang="scss">
    .cov-container {
        @media (max-width: 1100px) {
            flex-direction: column;

            .cov-col {
                width: 100% !important;
            }
        }
        .cov-col {
            width: 48%;
        }
    }

    .code {
        background-color: #f1f1f1;
        padding: 1rem;
        border-radius: 0.25rem;
        margin-bottom: 1rem;
        overflow: auto;
    }

    .highlight {
        background-color: #e97373;
    }

    .filename {
        margin-bottom: 0.5rem;
        background-color: #2f2f30;
        color: #fff;
        padding: 0.1rem 0.5rem;
        font-size: 0.8rem;
        border-radius: 0.5rem;
        display: inline-block;
    }

    .line {
        display: flex;
        align-items: center;

        .line-changed-covered {
            background-color: #66ee86;
        }

        .line-changed-uncovered {
            background-color: #e97373;
        }

        .line-unchanged-covered {
            background-color: #bbf1c8;
        }

        .line-unchanged-uncovered {
            background-color: #f1c7c7;
        }
    }
    .line-number {
        text-align: right;
        margin-right: 0.5rem;
        border-right: 1px solid #d0d5db;
    }

    .context-button {
        position: absolute;
        top: 0px;
        right: 15px;
    }

    :global(pre code.hljs) {
        white-space: pre-wrap;
    }
</style>
