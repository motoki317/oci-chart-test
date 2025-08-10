import * as github from '@actions/github'

const mustGetEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}

const octokit = github.getOctokit(mustGetEnv('GITHUB_TOKEN'))
const context = github.context

export const getSelfWorkflowId = async () => {
  const { data: run } = await octokit.rest.actions.getWorkflowRun({
    owner: context.repo.owner,
    repo: context.repo.repo,
    run_id: context.runId,
  })
  return run.workflow_id
}

export const getAssociatedMergedPr = async () => {
  const { data: pulls } = await octokit.rest.repos.listPullRequestsAssociatedWithCommit({
    owner: context.repo.owner,
    repo: context.repo.repo,
    commit_sha: context.sha,
  });
  return pulls.find(pr => pr.state === 'closed' && pr.merged_at)
}

export const getLatestRunId = async (prHeadSha: string, workflowId: string): Promise<number | undefined> => {
  const { data: runs } = await octokit.rest.actions.listWorkflowRuns({
    owner: context.repo.owner,
    repo: context.repo.repo,
    workflow_id: workflowId,
    head_sha: prHeadSha,
    status: 'success',
    per_page: 1
  })
  return runs.workflow_runs[0]?.id
}
