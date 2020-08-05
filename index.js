const core = require('@actions/core');
const github = require('@actions/github');

const docker = require('./docker');

const entrypoint = async function () {

  try {

    let tags;
    let branches;

    // image refs
    const excludes = core.getInput('excludes').split(' ');
    const repository = core.getInput('repository') || process.env.GITHUB_REPOSITORY;

    // instantiate docker hub token
    const DOCKER_TOKEN = await docker.getToken(
      process.env.DOCKER_USERNAME, process.env.DOCKER_PASSWORD);

    if (!DOCKER_TOKEN) {
      throw new Error('Failed to instantiate Docker Hub auth token');
    }

    // instantiate github api client
    const octokit = github.getOctokit(core.getInput('GITHUB_TOKEN', { required: true }));

    // fetch docker hub active image tags
    tags = await docker.getTags(repository);

    // fetch github active branch refs
    branches = await octokit.repos.listBranches({
      owner: repository.replace(/\/.*/, ''), repo: repository.replace(/.*\//, '') });

    if (!tags.length || !branches.data.length) {
      throw new Error('Failed to fetch requisit references');
    }

    // flatten resultset objects
    tags = tags.map(e => e.name);
    branches = branches.data.map(e => e.name);

    core.info('');

    core.info('     Active Github Branches     ');
    core.info('================================');

    for (let tag of branches) {
      tags.includes(tag) ? core.info(`${tag.padEnd(21)} [DEPLOYED]`) : core.info(tag);
    }

    core.info('');

    core.info('    Docker Hub Image Cleanup    ');
    core.info('================================');

    for (let tag of tags) {

      if (branches.includes(tag) || excludes.includes(tag)) {
        core.info(`${tag.padEnd(23)} [SKIPED]`);
        continue;
      }

      (await docker.deleteImage(repository, tag, DOCKER_TOKEN)) ? core.info(`${tag.padEnd(22)} [DELETED]`) : core.info(`${tag.padEnd(23)} [FAILED]`);

    }

    core.info('');

  } catch (error) {
    core.setFailed(error.message);
  }

};

if (require.main === module) {
  entrypoint();
}

// vim: set expandtab shiftwidth=2 syntax=javascript:
