import { Style } from "exceljs";

export interface StakeholderModel {
  id?: string;
  display_name: string;
}

export interface StockClassModel {
  id?: string;
  display_name: string;
  is_preferred?: boolean;
  conversion_ratio?: number;
}

export interface StockPlanModel {
  id?: string;
  plan_name: string;
}

// This is a case of "the client defines the interface". The
// OCX.Model class is the concrete implementation, but we don't
// want OCX packages to depend directly on one another. So, we
// create the interface we need here.
export interface Model {
  asOfDate: Date;
  issuerName: string;
  stakeholders: Array<StakeholderModel>;

  stockClasses?: Array<StockClassModel>;

  getStakeholderStockHoldings?: (
    stakeholder: StakeholderModel,
    stockClass: StockClassModel
  ) => number;
}

export interface WorksheetLinePrinter {
  setCellAtCursor: (
    row: number,
    col: number,
    value: Date | string | number | null,
    style?: Partial<Style>
  ) => void;
  setFormulaCellAtCursor: (
    row: number,
    col: number,
    formula: string,
    style?: Partial<Style>
  ) => void;
  copyFormulaCell: (
    from: string,
    row: number,
    col: number,
    style?: Partial<Style>
  ) => void;
  setRowHeight: (row: number, height: number) => void;
  setColWidth: (col: number, width: number) => void;
}
