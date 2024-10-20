import type { AddOn } from "../models/addon.ts";
import type { Feature } from "../models/feature.ts";
import type { Plan } from "../models/plan.ts";
import {
  Pricing,
  ExtractedPricing,
  generateEmptyPricing,
} from "../models/pricing.ts";
import type { UsageLimit } from "../models/usage-limit.ts";
import {
  validateName,
  validateVersion,
  validateCreatedAt,
  validateCurrency,
  validateHasAnnualPayment,
  validateDescription,
  validateValueType,
  validateDefaultValue,
  validateExpression,
  validateValue,
  validateFeatureType,
  validateUnit,
  validateUsageLimitType,
  validateLinkedFeatures,
  validateRenderMode,
  validatePlanFeatures,
  validatePlanUsageLimits,
  validatePrice,
  validateAddonFeatures,
  validateAddonUsageLimits
} from "./pricing-validators.ts";

export interface ContainerFeatures{
  [key: string]: Feature;
}

export interface ContainerUsageLimits{
  [key: string]: UsageLimit;
}

export function formatPricing(extractedPricing: ExtractedPricing): Pricing {
  const pricing: Pricing = generateEmptyPricing();

  formatBasicAttributes(extractedPricing, pricing);

  // Format and parse features
  const formattedFeatures = formatObjectToArray(
    extractedPricing.features
  ) as Feature[];
  pricing.features = formattedFeatures.map((f) => formatFeature(f));

  // Format and parse usage limits, considering they can be null/undefined
  if (
    extractedPricing.usageLimits == null ||
    extractedPricing.usageLimits == undefined
  ) {
    pricing.usageLimits = [];
  } else {
    const formattedUsageLimits = formatObjectToArray(
      extractedPricing.usageLimits
    ) as UsageLimit[];
    pricing.usageLimits = formattedUsageLimits.map((u) =>
      formatUsageLimit(u, pricing)
    );
  }

  // Format and parse plans, considering they can be null/undefined
  if (extractedPricing.plans == null || extractedPricing.plans == undefined) {
    pricing.plans = [];
  } else {
    const formattedPlans = formatObjectToArray(
      extractedPricing.plans
    ) as Plan[];
    pricing.plans = formattedPlans.map((p) => formatPlan(p, pricing));
  }

  // Format and parse add-ons, considering they can be null/undefined
  if (extractedPricing.addOns == null || extractedPricing.addOns == undefined) {
    pricing.addOns = [];
  } else {
    const formattedAddOns = formatObjectToArray(
      extractedPricing.addOns
    ) as AddOn[];
    pricing.addOns = formattedAddOns.map((a) => formatAddOn(a, pricing));
  }

  return pricing;
}

// --------- PRICING ELEMENTS FORMATTERS ---------

function formatBasicAttributes(
  extractedPricing: ExtractedPricing,
  pricing: Pricing
): void {
  pricing.version = validateVersion(extractedPricing.version); // Assumes that the version has been processed to be the last one
  pricing.saasName = validateName(extractedPricing.saasName, "SaaS");
  pricing.createdAt = validateCreatedAt(extractedPricing.createdAt);
  pricing.currency = validateCurrency(extractedPricing.currency);
  pricing.hasAnnualPayment = validateHasAnnualPayment(
    extractedPricing.hasAnnualPayment
  );
}

function formatFeature(feature: Feature): Feature {
  const featureName = feature.name;

  try {
    feature.name = validateName(feature.name, "Feature");
    feature.description = validateDescription(feature.description);
    feature.valueType = validateValueType(feature.valueType);
    feature.defaultValue = validateDefaultValue(feature, "feature");
    feature.value = validateValue(feature, "feature");
    feature.expression = validateExpression(feature.expression, "expression");
    feature.serverExpression = validateExpression(feature.serverExpression, "serverExpression");
    feature.type = validateFeatureType(feature.type);
    feature.render = validateRenderMode(feature.render);
  } catch (err) {
    throw new Error(
      `Error parsing feature ${featureName}. Error: ${(err as Error).message}`
    );
  }

  return feature;
}

function formatUsageLimit(
  usageLimit: UsageLimit,
  pricing: Pricing
): UsageLimit {
  
  try{
    usageLimit.name = validateName(usageLimit.name, "Usage Limit");
    usageLimit.description = validateDescription(usageLimit.description);
    usageLimit.valueType = validateValueType(usageLimit.valueType);
    usageLimit.defaultValue = validateDefaultValue(usageLimit, "usage limit");
    usageLimit.value = validateValue(usageLimit, "usage limit");
    usageLimit.unit = validateUnit(usageLimit.unit);
    usageLimit.type = validateUsageLimitType(usageLimit.type);
    usageLimit.linkedFeatures = validateLinkedFeatures(usageLimit.linkedFeatures, pricing);
    usageLimit.render = validateRenderMode(usageLimit.render);
  }catch(err){
    throw new Error(
      `Error parsing usage limit ${usageLimit.name}. Error: ${(err as Error).message}`
    );
  }

  return usageLimit;
}

function formatPlan(plan: Plan, pricing: Pricing): Plan {
  
  try{
    plan.name = validateName(plan.name, "Plan");
    plan.description = validateDescription(plan.description);
    plan.price = validatePrice(plan.price);
    plan.unit = validateUnit(plan.unit);

    if (plan.features!== null && plan.features!== undefined) {
      const planFeatures: ContainerFeatures = formatArrayIntoObject(pricing.features) as ContainerFeatures;
  
      plan.features = formatObject(plan.features) as ContainerFeatures;
      plan.features = validatePlanFeatures(plan, planFeatures);
    }else{
      plan.features = {};
    }

    
    if (plan.usageLimits !== null && plan.usageLimits!== undefined) {
      const planUsageLimits: ContainerUsageLimits = formatArrayIntoObject(pricing.usageLimits!) as ContainerUsageLimits;

      plan.usageLimits = formatObject(plan.usageLimits) as ContainerUsageLimits;
      plan.usageLimits = validatePlanUsageLimits(plan, planUsageLimits);
    }else{
      plan.usageLimits = {};
    }
  }catch(err){
    throw new Error(
      `Error parsing plan ${plan.name}. Error: ${(err as Error).message}`
    );
  }

  return plan;
}

function formatAddOn(addon: AddOn, pricing: Pricing): AddOn {
  
  try{
    addon.name = validateName(addon.name, "Plan");
    addon.description = validateDescription(addon.description);
    addon.price = validatePrice(addon.price);
    addon.unit = validateUnit(addon.unit);

    // Parse Features if provided
    if (addon.features !== null && addon.features!== undefined) {
      const addonFeatures: ContainerFeatures = formatArrayIntoObject(pricing.features) as ContainerFeatures;
  
      addon.features = formatObject(addon.features) as ContainerFeatures;
      addon.features = validateAddonFeatures(addon, addonFeatures);
    }else{
      addon.features = {};
    }
    
    // Parse UsageLimits if provided
    if (addon.usageLimits !== null && addon.usageLimits!== undefined) {
      const addonUsageLimits: ContainerUsageLimits = formatArrayIntoObject(pricing.usageLimits!) as ContainerUsageLimits;

      addon.usageLimits = formatObject(addon.usageLimits) as ContainerUsageLimits;
      addon.usageLimits = validateAddonUsageLimits(addon, addonUsageLimits);
    }else{
      addon.usageLimits = {};
    }

    // Parse usageLimitsExtensions if provided
    if (addon.usageLimitsExtensions !== null && addon.usageLimitsExtensions!== undefined) {
      const addonUsageLimitsExtensions: ContainerUsageLimits = formatArrayIntoObject(pricing.usageLimits!) as ContainerUsageLimits;

      addon.usageLimitsExtensions = formatObject(addon.usageLimitsExtensions) as ContainerUsageLimits;
      addon.usageLimitsExtensions = validateAddonUsageLimits(addon, addonUsageLimitsExtensions);
    }else{
      addon.usageLimitsExtensions = {};
    }
  }catch(err){
    throw new Error(
      `Error parsing addon ${addon.name}. Error: ${(err as Error).message}`
    );
  }

  return addon;
}

// --------- UTILITY FUNCTIONS ---------

function formatObjectToArray<T>(object: object): T[] {
  return Object.entries(object).map(([name, details]) => ({
    name,
    ...details,
  }));
}

function formatObject(object: object): ContainerFeatures | ContainerUsageLimits {
  return Object.entries(object).reduce((acc: ContainerFeatures | ContainerUsageLimits, [key, value]) => {
    acc[key] = { name: key, ...value };
    return acc;
  }, {} as ContainerFeatures | ContainerUsageLimits);
  
}

function formatArrayIntoObject (array: Feature[] | UsageLimit[]): ContainerFeatures | ContainerUsageLimits {
  return array.reduce((acc: ContainerFeatures | ContainerUsageLimits, { name, ...rest }) => {
    acc[name] = {name, ...rest};
    return acc;
  }, {} as ContainerFeatures | ContainerUsageLimits);
}