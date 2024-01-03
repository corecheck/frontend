<script lang="ts">
    import SortHeader from "@/components/base/SortHeader.svelte";
    let sort = "-diff";

    export let report: any;

    function displayBenchNumber(n, showSign = false) {
        if(!n) return 0;
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
</script>
<div class="flex">
    <h1>
        Benchmarks <span class="label label-success">Beta</span>
    </h1>
</div>
<div class="clearfix m-b-base" />
<p>
    Benchmarks are executed on ARM64 CPUs using Cachegrind to analyze cache and
    memory interactions for consistent results.
</p>
<p>
    Score is computed by combining Level 1 (L1) cache hits, Level 3 (L3) cache
    hits multiplied by 5, and RAM hits multiplied by 35, the lower the better.
</p>
<div class="clearfix m-b-base" />
{#if report.benchmark_status === "pending"}
    <div class="alert alert-warning" style="text-align: center">
        <i class="ri-information-line" /> Benchmarks are currently being generated,
        please come back later.
    </div>
{:else}
    <table class="table">
        <thead>
            <tr>
                <SortHeader class="col-type-url" name="name" bind:sort>
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
                        <span class="txt">Score master</span>
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
                        <span class="txt">CPU refs master</span>
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
                        <span class="txt">Data reads master</span>
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
                        <span class="txt">Data writes master</span>
                    </div>
                </SortHeader>
            </tr></thead
        >

        <tbody>
            {#each Object.keys(report.benchmarks_parsed).sort((a, b) => {
                const benchA = report.benchmarks_parsed[a];
                const benchB = report.benchmarks_parsed[b];

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
            }) as benchmark}
                <tr>
                    <td class="col-type-url col-field-id">
                        <p>{benchmark}</p>
                    </td>
                    <td class="col-type-number col-field-pr">
                        {displayBenchNumber(
                            report.benchmarks_parsed[benchmark].score / 1000000,
                        )}
                    </td>
                    <td class="col-type-number col-field-pr">
                        {displayBenchNumber(
                            report.benchmarks_parsed[benchmark].base.score /
                                1000000,
                        )}
                    </td>
                    <td
                        class="col-type-number col-field-pr"
                        class:txt-danger={report.benchmarks_parsed[benchmark]
                            .diff > 0.06}
                        class:txt-success={report.benchmarks_parsed[benchmark]
                            .diff < -0.06}
                        class:txt-hint={report.benchmarks_parsed[benchmark]
                            .diff > -0.06 &&
                            report.benchmarks_parsed[benchmark].diff < 0.06}
                    >
                        {displayPercentage(
                            report.benchmarks_parsed[benchmark].diff,
                        )}<small style="opacity: 0.5">%</small>
                    </td>
                    <td class="col-type-number col-field-pr">
                        {displayBenchNumber(
                            report.benchmarks_parsed[benchmark].Ir,
                        )}
                    </td>
                    <td class="col-type-number col-field-pr">
                        {displayBenchNumber(
                            report.benchmarks_parsed[benchmark].base?.Ir,
                        )}
                    </td>

                    <td class="col-type-number col-field-pr">
                        {displayBenchNumber(
                            report.benchmarks_parsed[benchmark].Dr,
                        )}
                    </td>
                    <td class="col-type-number col-field-pr">
                        {displayBenchNumber(
                            report.benchmarks_parsed[benchmark].base?.Dr,
                        )}
                    </td>
                    <td class="col-type-number col-field-pr">
                        {displayBenchNumber(
                            report.benchmarks_parsed[benchmark].Dw,
                        )}
                    </td>
                    <td class="col-type-number col-field-pr">
                        {displayBenchNumber(
                            report.benchmarks_parsed[benchmark].base?.Dw,
                        )}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
{/if}
