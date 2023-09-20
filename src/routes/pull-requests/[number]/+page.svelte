<script lang="ts">
    import { page } from "$app/stores";
    import { _fetchCoverage, _fetchMutations } from "./+page.server";
    import Accordion from "../../../components/base/Accordion.svelte";
    import Field from "../../../components/base/Field.svelte";
    import JobList from "../../../components/jobs/JobList.svelte";
    import Highlight from "svelte-highlight";
    import diffLanguage, { diff } from "svelte-highlight/languages/diff";
    import github from "svelte-highlight/styles/github";
    import tooltip from "../../../actions/tooltip";
    import { env } from "$env/dynamic/public";
    import { getContext } from 'svelte';
    import { invalidateAll } from "$app/navigation";
    const pageTitle = "Pull requests";
    export let data;
    let { pr, coverage, mutations, votes } = data;

    function startCoverage() {
        fetch(`${env.PUBLIC_ENDPOINT}/pr/${$page.params.number}/analyze`, {
            method: "POST",
            withCredentials: true,
            credentials: "include",
        })
            .then((res) => {
                console.log(res);
                invalidateAll();
                window.location.reload();
            })
            .catch((err) => {
                console.error(err);
            });
    }

    function hasRunningJob() {
        return pr.jobs?.some(
            (job) =>
                job.aws_status !== "SUCCEEDED" && job.aws_status !== "FAILED"
        );
    }

    let hasExpanded = {
        coverage: false,
        mutations: false,
    };

    function expandAll(accType: string) {
        console.log("expandAll", accType);
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

    let fullCoverage = false;

    // detect fullCoverage change
    async function onChangeFullCoverage(e) {
        coverage = await _fetchCoverage(pr.number, e.target.checked);
    }

    function getMutatorDescription(mutator) {
        switch (mutator) {
            case "mutator-true-to-false":
                return "'true' to 'false'";
            case "mutator-false-to-true":
                return "'false' to 'true'";
            case "mutator-or-to-and":
                return "'||' to '&&'";
            case "mutator-and-to-or":
                return "'&&' to '||'";
            case "mutator-greater-to-less":
                return "'>' to '<'";
            case "mutator-less-to-greater":
                return "'<' to '>'";
            case "mutator-eq-to-neq":
                return "'==' to '!='";
            case "mutator-neq-to-eq":
                return "'!=' to '=='";
        }

        return "Unknown";
    }

    function isOutdated() {
        return pr.coverage_commit !== pr.head;
    }

    function voteForMutation(id, vote) {
        if (votes[id] === vote) {
            vote = "none";
        }
        fetch(
            `${env.PUBLIC_ENDPOINT}/pr/${$page.params.number}/mutation/${id}/vote`,
            {
                method: "PUT",
                body: JSON.stringify({
                    vote,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
                credentials: "include",
            }
        )
            .then((res) => {
                console.log(res);
                votes[id] = vote;
            })
            .catch((err) => {
                console.error(err);
            });
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

	const user = getContext('user');
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

                {#if pr.has_coverage}
                    <span
                        class="label"
                        class:label-warning={isOutdated()}
                        class:label-success={!isOutdated()}
                        use:tooltip={{
                            text: isOutdated()
                                ? "Coverage data is out of date"
                                : "Coverage data is up to date",
                            position: "top",
                        }}
                        >{isOutdated()
                            ? "Outdated coverage"
                            : "Up to date"}</span
                    >
                {/if}
            </h1>

            <div class="clearfix m-b-base" />
            {#if hasRunningJob()}
                <div class="alert alert-warning" style="text-align: center">
                    <i class="ri-information-line" /> A coverage analysis job is
                    currently running, please come back later.
                </div>
            {/if}

            {#if !hasRunningJob() && (!pr.has_coverage || isOutdated())}
                <div class="alert alert-info" style="text-align: center">
                    {#if pr.has_coverage && isOutdated()}
                        <i class="ri-information-line" /> Coverage data is out of
                        date. Please re-run the coverage analysis.
                    {:else}
                        <i class="ri-information-line" /> No coverage data available
                        for this PR.
                    {/if}
                    {#if user}
                        <button
                            type="button"
                            class="btn btn-primary"
                            on:click={startCoverage}
                        >
                            Start coverage analysis
                        </button>
                    {:else}
                        <a
                            class="btn btn-primary"
                            href="/login"
                        >
                            Login to start coverage analysis
                        </a>
                    {/if}
                </div>
            {/if}
        </div>
        <div class="clearfix m-b-base" />
        <div class="flex flex-justify-between flex-align-start">
            {#if coverage !== null}
                <div style="width: 48%">
                    <div class="flex">
                        <h1>Coverage data</h1>
                        <span
                            class="label"
                            class:label-success={pr.coverage_ratio >= 0.8}
                            class:label-warning={pr.coverage_ratio > 0.5 &&
                                pr.coverage_ratio < 0.8}
                            class:label-danger={pr.coverage_ratio < 0.5}
                            >{(pr.coverage_ratio * 100).toFixed(2)}%</span
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
                                <i class="ri-information-line" /> All added lines
                                in this pull request are covered.
                            </div>
                        {/if}
                        <div class="accordions coverage">
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
            {/if}
            {#if pr.is_done_mutating}
                <div style="width: 48%">
                    <div class="flex">
                        <h1>Mutation testing</h1>
                        <span
                            class="label"
                            class:label-success={pr.mutation_ratio >= 0.8}
                            class:label-warning={pr.mutation_ratio > 0.5 &&
                                pr.mutation_ratio < 0.8}
                            class:label-danger={pr.mutation_ratio < 0.5}
                            use:tooltip={{
                                text: `${(pr.mutation_ratio * 100).toFixed(
                                    2
                                )}% of generated mutations where killed`,
                                position: "top",
                            }}>{(pr.mutation_ratio * 100).toFixed(2)}%</span
                        >
                        {#if hasExpanded["mutations"]}
                            <button
                                type="button"
                                class="btn btn-sm btn-primary"
                                on:click={() => collapseAll("mutations")}
                            >
                                <i class="ri-arrow-up-s-line" />
                                Collapse all
                            </button>
                        {:else}
                            <button
                                type="button"
                                class="btn btn-sm btn-primary"
                                on:click={() => expandAll("mutations")}
                            >
                                <i class="ri-arrow-down-s-line" />
                                Expand all
                            </button>
                        {/if}
                    </div>
                    <div class="clearfix m-b-base" />
                    {#key mutations}
                        {#if mutations?.length === 0 && pr.has_generated_mutations}
                            <div
                                class="alert alert-success"
                                style="text-align: center"
                            >
                                <i class="ri-information-line" /> No mutations survived
                            </div>
                        {/if}
                        <div class="accordions mutations">
                            {#each mutations as mutation}
                                <Accordion>
                                    <svelte:fragment slot="header">
                                        <div class="inline-flex">
                                            <i class="ri-file-code-line" />
                                            <span class="txt">
                                                Mutating <span
                                                    style="font-weight: bold"
                                                    >{getMutatorDescription(
                                                        mutation.mutator
                                                    )}</span
                                                >
                                                in {mutation.file}:{mutation.line}
                                                does not break the tests
                                            </span>
                                        </div>

                                        <div class="flex-fill" />
                                        <span class="label"
                                            >{mutation.mutator}</span
                                        >
                                    </svelte:fragment>
                                    <div class="form-field">
                                        <Highlight
                                            language={diff}
                                            code={mutation.diff}
                                        />

                                        <a
                                            href={`https://github.com/${pr.head_repo}/blob/${pr.head}/${mutation.file}#L${mutation.line}`}
                                            target="_blank"
                                            class="context-button btn btn-secondary btn-sm"
                                            >Open context</a
                                        >
                                        <div class="help-block m-0">
                                            Apply this patch to your code with <code
                                                >patch -p0 {"<"} patch.diff</code
                                            >.
                                        </div>
                                    </div>

                                    <!-- vote for mutation, good or not -->
                                    {#key mutation.vote}
                                        <div class="form-field m-0">
                                            <button
                                                type="button"
                                                class="btn"
                                                class:btn-primary={votes[
                                                    mutation.id
                                                ] === "must_fix"}
                                                class:btn-secondary={votes[
                                                    mutation.id
                                                ] !== "must_fix"}
                                                use:tooltip={{
                                                    text: "This mutation should be fixed",
                                                    position: "top",
                                                }}
                                                on:click={() =>
                                                    voteForMutation(
                                                        mutation.id,
                                                        "must_fix"
                                                    )}
                                            >
                                                <i class="ri-thumb-up-line" />
                                                Must fix
                                            </button>
                                            <button
                                                type="button"
                                                class="btn"
                                                class:btn-primary={votes[
                                                    mutation.id
                                                ] === "ignore"}
                                                class:btn-secondary={votes[
                                                    mutation.id
                                                ] !== "ignore"}
                                                use:tooltip={{
                                                    text: "This mutation is not relevant for this PR",
                                                    position: "top",
                                                }}
                                                on:click={() =>
                                                    voteForMutation(
                                                        mutation.id,
                                                        "ignore"
                                                    )}
                                            >
                                                <i class="ri-thumb-down-line" />
                                                Ignore
                                            </button>
                                        </div>
                                    {/key}
                                </Accordion>
                            {/each}
                        </div>
                    {/key}
                </div>
            {/if}
        </div>
        <div class="clearfix m-b-base" />
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
