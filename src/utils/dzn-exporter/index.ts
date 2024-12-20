import path from 'node:path';
import { Pricing, pricing2DZN, retrievePricingFromPath } from '../../main';
import fs from 'node:fs';

export interface Chunk {
  left: DZNKeywords;
  value: string;
  row?: DZNKeywords;
  col?: DZNKeywords;
}

export enum DZNKeywords {
  NumberOfFeatures = 'num_features',
  NumberOfUsageLimits = 'num_usage_limits',
  NumberOfPlans = 'num_plans',
  NumberOfAddOns = 'num_addons',
  Features = 'features',
  UsageLimits = 'usage_limits',
  Plans = 'plans',
  AddOns = 'addons',
  PlansPrices = 'plans_prices',
  AddOnsPrices = 'addons_prices',
  PlansFeatures = 'plans_features',
  PlansUsageLimits = 'plans_usage_limits',
  LinkedFeatures = 'linked_features',
  AddOnsFeatures = 'addons_features',
  AddOnsUsageLimits = 'addons_usage_limits',
  AddOnsUsageLimitsExtensions = 'addons_usage_limits_extensions',
  AddOnsAvailableFor = 'addons_available_for',
  AddOnsDependsOn = 'addons_depends_on',
}

export function saveDZNfile(source: string, savePath: string): void {
  const pricing: Pricing = retrievePricingFromPath(path.resolve(source));
  const file = pricing2DZN(pricing);

  const dznFolder = path.resolve(savePath);

  try {
    if (!fs.existsSync(dznFolder)) {
      console.log(`Creating folder ${dznFolder}...`);
      fs.mkdirSync(savePath);
    }

    const filename = `${pricing.saasName.split(' ')[0]}.dzn`;

    fs.writeFileSync(path.join(savePath, filename), file);
    console.log(`------- File Saved in ${dznFolder} --------`);
    console.log('Filename: ' + filename);
  } catch (err) {
    console.error(`Error while parsing file '${source}'. Error: ${err}`);
  }
}
