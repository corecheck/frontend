<script lang="ts">
    import { page } from "$app/stores";
    import Accordion from "../../../../../components/base/Accordion.svelte";
    import Field from "../../../../../components/base/Field.svelte";
    import github from "svelte-highlight/styles/github";
    import tooltip from "../../../../../actions/tooltip";
    import { getContext } from "svelte";
    import Select from "@/components/base/Select.svelte";
    import CoverageReportSelectOption from "./CoverageReportSelectOption.svelte";
    import SortHeader from "@/components/base/SortHeader.svelte";
    const pageTitle = "Pull requests";
    export let data;
    let { pr, sonarcloud } = data;

    let coverage =
        pr.reports.length > 0
            ? pr.reports.find((r) => r.commit === pr.head) || pr.reports[0]
            : null;

    let hasExpanded = {
        coverage: false,
    };

    let sort = "-diff";

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

    function displayBenchNumber(n, showSign = false) {
        return Math.round(n).toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    }

    function displayPercentage(n) {
        const r = (n * 100).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        if (n > 0) return "+" + r;
        return r;
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

            <Field class="form-field" name="coverage" let:uniqueId>
                <label for={uniqueId}>
                    <i class="ri-file-code-line" />
                    <span class="txt">Coverage report</span>
                </label>
                <Select
                    id={uniqueId}
                    toggle={true}
                    items={pr.reports}
                    bind:selected={coverage}
                    labelComponent={CoverageReportSelectOption}
                    optionComponent={CoverageReportSelectOption}
                />
            </Field>
        </div>
        <div class="clearfix m-b-base" />
        <div class="cov-container flex flex-justify-between flex-align-start">
            {#if coverage && coverage.status !== "pending"}
                <div class="cov-col">
                    <div class="flex">
                        <h1>Coverage</h1>
                        <span
                            class="label"
                            class:label-success={coverage.coverage_ratio >= 0.8}
                            class:label-warning={coverage.coverage_ratio >
                                0.5 && coverage.coverage_ratio < 0.8}
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
                        {#if coverage && coverage.coverage_lines?.length === 0}
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
                                                0,
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
                                                                    line,
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
                    <h1>Sonarcloud</h1>
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
                                                    ":",
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
            {#if coverage && coverage.status === "pending"}
                <div class="alert alert-warning" style="text-align: center">
                    <i class="ri-information-line" /> Coverage report is currently
                    being generated, please come back later.
                </div>
            {/if}
            {#if !coverage}
                <div class="alert alert-info" style="text-align: center">
                    <i class="ri-information-line" /> No coverage data available.
                </div>
            {/if}
        </div>
        <div class="clearfix m-b-base" />
        {#if coverage.base_report && coverage && coverage.status !== "pending"}
            <div
                class="cov-container flex flex-justify-between flex-align-start"
            >
                <div class="cov-col full-width">
                    <div class="flex">
                        <h1>
                            Benchmarks <span class="label label-success"
                                >Beta</span
                            >
                        </h1>
                    </div>
                    <div class="clearfix m-b-base" />
                    <p>
                        Benchmarks are executed on ARM64 CPUs using Cachegrind
                        to analyze cache and memory interactions for consistent
                        results.
                    </p>
                    <p>
                        Score is computed by combining Level 1 (L1) cache hits,
                        Level 3 (L3) cache hits multiplied by 5, and RAM hits
                        multiplied by 35, the lower the better.
                    </p>
                    <div class="clearfix m-b-base" />
                    {#if coverage.benchmark_status === "pending"}
                        <div
                            class="alert alert-warning"
                            style="text-align: center"
                        >
                            <i class="ri-information-line" /> Benchmarks are currently
                            being generated, please come back later.
                        </div>
                    {:else}
                        <table class="table">
                            <thead>
                                <tr>
                                    <SortHeader
                                        class="col-type-url"
                                        name="name"
                                        bind:sort
                                    >
                                        <div class="col-header-content">
                                            <i class="ri-text" />
                                            <span class="txt">Name</span>
                                        </div>
                                    </SortHeader>
                                    <SortHeader
                                        class="col-type-number col-field-type"
                                        name="score"
                                        bind:sort
                                    >
                                        <div class="col-header-content">
                                            <i class="ri-percent-line" />
                                            <span class="txt">Score</span>
                                        </div>
                                    </SortHeader>
                                    <SortHeader
                                        class="col-type-number col-field-type"
                                        name="score-master"
                                        bind:sort
                                    >
                                        <div class="col-header-content">
                                            <i class="ri-percent-line" />
                                            <span class="txt">Score master</span
                                            >
                                        </div>
                                    </SortHeader>
                                    <SortHeader
                                        class="col-type-number col-field-type"
                                        name="diff"
                                        bind:sort
                                    >
                                        <div class="col-header-content">
                                            <i class="ri-percent-line" />
                                            <span class="txt">Diff score</span>
                                        </div>
                                    </SortHeader>
                                    <SortHeader
                                        class="col-type-number col-field-type"
                                        name="cpu-refs"
                                        bind:sort
                                    >
                                        <div class="col-header-content">
                                            <i class="ri-cpu-line" />
                                            <span class="txt">CPU refs</span>
                                        </div>
                                    </SortHeader>
                                    <SortHeader
                                        class="col-type-number col-field-type"
                                        name="cpu-refs-master"
                                        bind:sort
                                    >
                                        <div class="col-header-content">
                                            <i class="ri-cpu-line" />
                                            <span class="txt"
                                                >CPU refs master</span
                                            >
                                        </div>
                                    </SortHeader>
                                    <SortHeader
                                        class="col-type-number col-field-type"
                                        name="data-reads"
                                        bind:sort
                                    >
                                        <div class="col-header-content">
                                            <i class="ri-database-2-line" />
                                            <span class="txt">Data reads</span>
                                        </div>
                                    </SortHeader>
                                    <SortHeader
                                        class="col-type-number col-field-type"
                                        name="data-reads-master"
                                        bind:sort
                                    >
                                        <div class="col-header-content">
                                            <i class="ri-database-2-line" />
                                            <span class="txt"
                                                >Data reads master</span
                                            >
                                        </div>
                                    </SortHeader>

                                    <SortHeader
                                        class="col-type-number col-field-type"
                                        name="data-writes"
                                        bind:sort
                                    >
                                        <div class="col-header-content">
                                            <i class="ri-database-2-line" />
                                            <span class="txt">Data writes</span>
                                        </div>
                                    </SortHeader>
                                    <SortHeader
                                        class="col-type-number col-field-type"
                                        name="data-writes-master"
                                        bind:sort
                                    >
                                        <div class="col-header-content">
                                            <i class="ri-database-2-line" />
                                            <span class="txt"
                                                >Data writes master</span
                                            >
                                        </div>
                                    </SortHeader>
                                </tr></thead
                            >

                            <tbody>
                                {#each Object.keys(coverage.benchmarks_parsed).sort( (a, b) => {
                                        const benchA = coverage.benchmarks_parsed[a];
                                        const benchB = coverage.benchmarks_parsed[b];

                                        if (sort === "+name") return benchA.name.localeCompare(benchB.name);
                                        if (sort === "-name") return benchB.name.localeCompare(benchA.name);

                                        if (sort === "+score") return benchA.score - benchB.score;
                                        if (sort === "-score") return benchB.score - benchA.score;

                                        if (sort === "+score-master") return benchA.base.score - benchB.base.score;
                                        if (sort === "-score-master") return benchB.base.score - benchA.base.score;

                                        if (sort === "+diff") return benchA.diff - benchB.diff;
                                        if (sort === "-diff") return benchB.diff - benchA.diff;

                                        if (sort === "+cpu-refs") return benchA.Ir - benchB.Ir;
                                        if (sort === "-cpu-refs") return benchB.Ir - benchA.Ir;
                                        if (sort === "+cpu-refs-master") return benchA.base.Ir - benchB.base.Ir;
                                        if (sort === "-cpu-refs-master") return benchB.base.Ir - benchA.base.Ir;

                                        if (sort === "+data-reads") return benchA.Dr - benchB.Dr;
                                        if (sort === "-data-reads") return benchB.Dr - benchA.Dr;
                                        if (sort === "+data-reads-master") return benchA.base.Dr - benchB.base.Dr;
                                        if (sort === "-data-reads-master") return benchB.base.Dr - benchA.base.Dr;

                                        if (sort === "+data-writes") return benchA.Dw - benchB.Dw;
                                        if (sort === "-data-writes") return benchB.Dw - benchA.Dw;
                                        if (sort === "+data-writes-master") return benchA.base.Dw - benchB.base.Dw;
                                        if (sort === "-data-writes-master") return benchB.base.Dw - benchA.base.Dw;

                                        return 0;
                                    }, ) as benchmark}
                                    <tr>
                                        <td class="col-type-url col-field-id">
                                            <p>{benchmark}</p>
                                        </td>
                                        <td
                                            class="col-type-number col-field-pr"
                                        >
                                            {displayBenchNumber(
                                                coverage.benchmarks_parsed[
                                                    benchmark
                                                ].score / 1000000,
                                            )}
                                        </td>
                                        <td
                                            class="col-type-number col-field-pr"
                                        >
                                            {displayBenchNumber(
                                                coverage.benchmarks_parsed[
                                                    benchmark
                                                ].base.score / 1000000,
                                            )}
                                        </td>
                                        <td
                                            class="col-type-number col-field-pr"
                                            class:txt-danger={benchmark.diff >
                                                0.06}
                                            class:txt-success={benchmark.diff <
                                                -0.06}
                                            class:txt-hint={benchmark.diff >
                                                -0.06 && benchmark.diff < 0.06}
                                        >
                                            {displayPercentage(
                                                coverage.benchmarks_parsed[
                                                    benchmark
                                                ].diff,
                                            )}<small style="opacity: 0.5"
                                                >%</small
                                            >
                                        </td>
                                        <td
                                            class="col-type-number col-field-pr"
                                        >
                                            {displayBenchNumber(
                                                coverage.benchmarks_parsed[
                                                    benchmark
                                                ].Ir,
                                            )}
                                        </td>
                                        <td
                                            class="col-type-number col-field-pr"
                                        >
                                            {displayBenchNumber(
                                                coverage.benchmarks_parsed[
                                                    benchmark
                                                ].base.Ir,
                                            )}
                                        </td>

                                        <td
                                            class="col-type-number col-field-pr"
                                        >
                                            {displayBenchNumber(
                                                coverage.benchmarks_parsed[
                                                    benchmark
                                                ].Dr,
                                            )}
                                        </td>
                                        <td
                                            class="col-type-number col-field-pr"
                                        >
                                            {displayBenchNumber(
                                                coverage.benchmarks_parsed[
                                                    benchmark
                                                ].base.Dr,
                                            )}
                                        </td>
                                        <td
                                            class="col-type-number col-field-pr"
                                        >
                                            {displayBenchNumber(
                                                coverage.benchmarks_parsed[
                                                    benchmark
                                                ].Dw,
                                            )}
                                        </td>
                                        <td
                                            class="col-type-number col-field-pr"
                                        >
                                            {displayBenchNumber(
                                                coverage.benchmarks_parsed[
                                                    benchmark
                                                ].base.Dw,
                                            )}
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    {/if}
                </div>
            </div>
        {/if}
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

    .full-width {
        width: 100% !important;
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
