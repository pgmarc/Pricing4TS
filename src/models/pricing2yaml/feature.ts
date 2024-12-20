import { ValueType, FeatureType, RenderMode } from './types';

export type PaymentType = 'CARD' | 'GATEWAY' | 'INVOICE' | 'ACH' | 'WIRE_TRANSFER' | 'OTHER';
export interface Feature {
  name: string;
  description?: string;
  tag?: string;
  valueType: ValueType;
  defaultValue: string | number | boolean | string[];
  value?: string | number | boolean | string[];
  expression?: string;
  serverExpression?: string;
  type: FeatureType;
  render: RenderMode;
}

export function getNumberOfFeatures(features: Feature[]) {
  return features.length;
}

export function getFeatureNames(features: Feature[]) {
  return features.map(feature => feature.name);
}
