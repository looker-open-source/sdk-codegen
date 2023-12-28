/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */

import type { Row } from '../tile';

/**
 * Callback that is invoked when visualization data is received
 * <code>Looker >=22.8</code>
 */
export type VisualizationDataReceivedCallback = (
  visualizationData: RawVisualizationData
) => void;

/**
 * Raw visualization data. Basic typing for configuration data
 * and query data.
 * <code>Looker >=22.8</code>
 */
export interface RawVisualizationData {
  visConfig: RawVisConfig;
  queryResponse: RawVisQueryResponse;
}

/**
 * Visualization configuration. Configuration data set in the
 * explore.
 * <code>Looker >=22.8</code>
 */
export interface RawVisConfig {
  [key: string]: RawVisConfigValue;
}

export type RawVisConfigValue = any;

/**
 * Query response data
 * <code>Looker >=22.8</code>
 */
export interface RawVisQueryResponse {
  [key: string]: any;
  data: RawVisData;
  fields: {
    [key: string]: any[];
  };
  pivots: RawPivotConfig[];
}

export type RawVisData = Row[];

export interface RawPivotConfig {
  key: string;
  is_total: boolean;
  data: { [key: string]: string };
  metadata: { [key: string]: { [key: string]: string } };
}

export interface Measure extends RawVisConfig {
  [key: string]: any;
}

export interface Dimension extends RawVisConfig {
  [key: string]: any;
}

export interface TableCalculation {
  [key: string]: any;
}

export interface PivotConfig extends RawPivotConfig {
  [key: string]: any;
}

/**
 * Visualization configuration data.
 */
export interface VisualizationConfig {
  /**
   * Measure information
   */
  queryFieldMeasures: Measure[];
  /**
   * Dimension information
   */
  queryFieldDimensions: Dimension[];
  /**
   * Table calculation information
   */
  queryFieldTableCalculations: TableCalculation[];
  /**
   * Pivot information
   */
  queryFieldPivots: PivotConfig[];
  /**
   * Visual configuration data. This should be merged with the default
   * configuration and applied to the visualization rendered by the
   * extension.
   */
  visConfig: RawVisConfig;
}

export interface QueryResponse {
  /**
   * Row data.
   */
  data: Row[];
  /**
   * Field measure information
   */
  fieldMeasures: Measure[];
  /**
   * Field dimension information
   */
  fieldDimensions: Dimension[];
  /**
   * Field table calculation information
   */
  fieldTableCalculations: TableCalculation[];
  /**
   * Field pivot information
   */
  fieldPivots: PivotConfig[];
  /*
   * A concatenated array of field measure information and table calculations
   * that behave like measures.
   */
  fieldMeasureLike: Measure[];
  /*
   * A concatenated array of field dimension information and table calculations
   * that behave like dimensions.
   */
  fieldDimensionLike: Dimension[];
}

/**
 * For internal use only.
 */
export interface VisualizationSDKInternal extends VisualizationSDK {
  updateVisData: (rawVisData: RawVisualizationData) => void;
}

/**
 * Extension visualization SDK
 */
export interface VisualizationSDK {
  /**
   * Visualization (combination of visConfig and queryResponse data)
   */
  visualizationData?: RawVisualizationData;
  /**
   * Visualization configuration data.
   * - measure configurations
   * - dimension configurations
   * - table calculations
   * - pivot configurations
   * - visualization configurations. These would be used to customize
   *   the look and feel of a visualization in an explore.
   */
  visConfig: VisualizationConfig;
  /**
   * Response data from query.
   * - row data
   * - field measures
   * - field table calculations
   * - field pivots
   * - field measure like
   * - field dimension like
   */
  queryResponse: QueryResponse;
  /**
   * Set the default configurations for an extension visualization.
   * The configurations will be rendered inside of the explore
   * visualization editor. This should only be called once.
   */
  configureVisualization: (options: VisOptions) => void;
  /**
   * Update the visualization configuration.
   */
  setVisConfig: (config: RawVisConfig) => void;
  /**
   * Update the query row limit.
   */
  updateRowLimit: (rowLimit: number) => void;
}

export interface VisOptionValue {
  [label: string]: string;
}

export interface VisOption {
  type: string;
  values?: VisOptionValue[];
  display?: string;
  default?: any;
  label?: string;
  section?: string;
  placeholder?: string;
  display_size?: 'half' | 'third' | 'normal';
  order?: number;
  hidden?: (setOptions: RawVisConfig) => boolean;
  disabledReason?: (
    setOptions: RawVisConfig,
    queryResponse: QueryResponse
  ) => string | null;
  min?: number;
  max?: number;
  required?: boolean;
  words?: VisOptionValue[];
  supports?: string[];
  color_application?: string;
  sublabel?: string;
}

export interface VisOptions {
  [optionName: string]: VisOption;
}
