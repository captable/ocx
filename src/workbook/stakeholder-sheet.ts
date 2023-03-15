import { Model, WorksheetLinePrinter } from "./interfaces";
import Styles from "./styles";

class StakeholderSheet {
  constructor(
    private readonly worksheet: WorksheetLinePrinter,
    private readonly model: Model
  ) {
    worksheet.nextRow({ height: 59.5 });

    worksheet
      .createRange("stakeholders.header", {
        fill: Styles.headerFill,
        font: Styles.headerFont,
        border: Styles.headerBorder,
      })
      .addFormulaCell("Context!A1", {
        alignment: { vertical: "bottom", horizontal: "right" },
        numFmt: "yyyy.mm.dd;@",
      })
      .addBlankCell()
      .addCell(`${this.model.issuerName} Capitalization by Holder`, {
        alignment: { vertical: "middle", horizontal: "left" },
      })
      .addBlankCells(3)
      .rangeComplete();

    worksheet.nextRow();

    const writer = worksheet
      .createRange("stakeholders.holdings")
      .createRange("subheader", {
        fill: Styles.subheaderFill,
        font: Styles.subheaderFont,
        border: Styles.subheaderBorder,
        alignment: { vertical: "bottom", horizontal: "center" },
      })
      .addCell("Stakeholder")
      .addCell("Stakeholder Group");

    for (const stockClass of model.stockClasses || []) {
      if (!stockClass.is_preferred) {
        writer.addCell(stockClass.display_name);
      }
    }

    for (const stakeholder of model.stakeholders || []) {
      writer.nextRow();
      writer.addCell(stakeholder.display_name, Styles.text);
      writer.addBlankCell();
      for (const stockClass of model.stockClasses || []) {
        if (!stockClass.is_preferred && model.getStakeholderStockHoldings) {
          const holdings = model.getStakeholderStockHoldings(
            stakeholder,
            stockClass
          );
          writer.addCell(
            holdings !== undefined ? `${holdings.toString()}` : ""
          );
        }
      }
    }

    worksheet.nextRow();
  }
}

export default StakeholderSheet;
