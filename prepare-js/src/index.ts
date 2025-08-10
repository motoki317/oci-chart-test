import * as core from '@actions/core'
import { getLatestRunId, getAssociatedMergedPr, getSelfWorkflowId } from "./run-id.js";

const run = async () => {
  // Get associated PR and its latest workflow run ID (if any)
  const pr = await getAssociatedMergedPr()
  if (pr) {
    console.log(`[prepare] Associated merged PR #${pr.number} found`)
    core.setOutput('merged-pr-number', pr.number)

    const workflowId = core.getInput('workflow-id') || '' + (await getSelfWorkflowId())
    console.log(`[prepare] Looking up for workflow ID ${workflowId} ...`)
    const latestRunId = await getLatestRunId(pr.head.sha, workflowId)
    if (latestRunId) {
      console.log(`[prepare] Latest run #${latestRunId} found for PR #${pr.number}`)
      core.setOutput('merged-pr-latest-run-id', latestRunId)
    }
  }
}

run().catch(err => {
  console.error(err)
  process.exit(1)
});
