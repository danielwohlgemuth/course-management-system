import { record } from '../helpers/recorder.js';
import { getFrontdoorUrl } from '../../tests/helpers/salesforce.js';

await record('setup-object-manager', async (page) => {
  await page.goto(getFrontdoorUrl('/lightning/setup/SetupOneHome/home'), { waitUntil: 'commit' });

  const objectManager = page.locator('a', { hasText: 'Object Manager' }).first();
  await objectManager.waitFor({ state: 'visible', timeout: 45_000 });
  await objectManager.click();

  await page.waitForTimeout(3000);
});
