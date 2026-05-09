import { execSync } from 'child_process';

function targetFlag() {
  const alias = process.env.SF_ORG_ALIAS;
  return alias ? `--target-org ${alias}` : '';
}

function sf(command) {
  const { FORCE_COLOR: _, ...env } = process.env;
  const raw = execSync(`sf ${command} --json ${targetFlag()}`, { encoding: 'utf8', env });
  return JSON.parse(raw).result;
}

/**
 * Returns a one-time frontdoor URL for the default org.
 * The URL authenticates the browser session on first load.
 * @param {string} [path='/'] - Salesforce path to redirect to after login
 */
export function getFrontdoorUrl(path = '/') {
  return sf(`org open --url-only --path "${path}"`).url;
}

/** Returns the org's instance URL (e.g. https://foo.scratch.my.salesforce.com) */
export function getInstanceUrl() {
  return sf('org display').instanceUrl;
}
