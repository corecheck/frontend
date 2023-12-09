import { env } from '$env/dynamic/public'

export async function _fetchSonarCloudIssues(fetch, number) {
    // https://sonarcloud.io/api/issues/search?metricKeys=sqale_index&projects=aureleoules_bitcoin&types=CODE_SMELL&branch=26415
    return fetch(`https://sonarcloud.io/api/issues/search?metricKeys=sqale_index&resolved=false&projects=aureleoules_bitcoin&types=CODE_SMELL&branch=${number}`)
        .then(async res => {
            if (res.status === 200) {
                const data = await res.json();

                // https://sonarcloud.io/api/sources/issue_snippets?issueKey=AYsFGxvQ890w8U3JDlEV
                // fetch for each issue the source code, with Promise.all

                const promises = data.issues.map(issue => {
                    return fetch(`https://sonarcloud.io/api/sources/issue_snippets?issueKey=${issue.key}`)
                        .then(res => res.json())
                        .then(res => {
                            const key = Object.keys(res)[0];
                            return {
                                ...issue,
                                sources: res[key].sources
                            }
                        })
                        .catch(err => {
                            console.error(err);
                        });
                });

                return {
                    ...data,
                    issues: await Promise.all(promises)
                }
            }
            return null;
        })
        .catch((err) => {
            console.error(err);
        });
}

function getSingleBenchScore(benchmark) {
    const Ir = benchmark.Ir;
    const I1mr = benchmark.I1mr;
    const ILmr = benchmark.ILmr;
    const Dr = benchmark.Dr;
    const D1mr = benchmark.D1mr;
    const DLmr = benchmark.DLmr;
    const Dw = benchmark.Dw;
    const D1mw = benchmark.D1mw;
    const DLmw = benchmark.DLmw;

    const ram_hits = DLmr + DLmw + ILmr;
    const l3_hits = I1mr + D1mw + D1mr - ram_hits;
    const total_memory_rw = Ir + Dr + Dw;
    const l1_hits = total_memory_rw - l3_hits - ram_hits;

    return l1_hits + 5 * l3_hits + 35 * ram_hits;
}

function getBenchScore(benchmarks) {
    if (!benchmarks) return 0;
    let score = 0;
    for (const b of benchmarks) {
        score += getSingleBenchScore(b);
    }

    return score / benchmarks.length;
}

function getCPUInstructionsAverage(report, name) {
    const benchmark = report.benchmarks_grouped[name];
    if (!benchmark) return 0;

    return benchmark.reduce((acc, b) => acc + b.Ir, 0) / benchmark.length;
}

function getDataReadsAverage(report, name) {
    const benchmark = report.benchmarks_grouped[name];
    if (!benchmark) return 0;
    return benchmark.reduce((acc, b) => acc + b.Dr, 0) / benchmark.length;
}

function getDataWritesAverage(report, name) {
    const benchmark = report.benchmarks_grouped[name];
    if (!benchmark) return 0;
    return benchmark.reduce((acc, b) => acc + b.Dw, 0) / benchmark.length;
}

function getDiffMaster(report, benchmark) {
    const masterBenchmark =
        report.base_report.benchmarks_grouped[benchmark];
    if (!masterBenchmark) return 0;

    const averageScorePull = getBenchScore(
        report.benchmarks_grouped[benchmark],
    );
    const averageScoreMaster = getBenchScore(masterBenchmark);

    return (averageScorePull - averageScoreMaster) / averageScoreMaster;
}

export async function _fetchPr(fetch, number) {
    const pr = await fetch(`${env.PUBLIC_ENDPOINT}/pr/${number}`)
        .then((res) => res.json())
        .catch((err) => {
            console.error(err);
        });

    for (let i = 0; i < pr.reports.length; i++) {
        const report = pr.reports[i];
        const benchmarks = report.benchmarks_grouped;
        const benchmarkKeys = Object.keys(benchmarks);
        report.benchmarks_parsed = {};
        for (let j = 0; j < benchmarkKeys.length; j++) {
            const benchmark = benchmarkKeys[j];

            report.benchmarks_parsed[benchmark] = {
                diff: getDiffMaster(report, benchmark),
                Ir: getCPUInstructionsAverage(report, benchmark),
                Dr: getDataReadsAverage(report, benchmark),
                Dw: getDataWritesAverage(report, benchmark),
                score: getBenchScore(report.benchmarks_grouped[benchmark]),
                base: {
                    Ir: getCPUInstructionsAverage(
                        report.base_report,
                        benchmark,
                    ),
                    Dr: getDataReadsAverage(report.base_report, benchmark),
                    Dw: getDataWritesAverage(report.base_report, benchmark),
                    score: getBenchScore(
                        report.base_report.benchmarks_grouped[benchmark],
                    ),
                }
            }
        }

    }

    return pr;
}

export async function load({ params, fetch }) {
    const [pr, sonarcloud] = await Promise.all([
        _fetchPr(fetch, params.number),
        _fetchSonarCloudIssues(fetch, params.number)
    ]);

    return {
        pr,
        sonarcloud,
    }
}