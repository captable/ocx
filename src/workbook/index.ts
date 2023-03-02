import { Borders, Fill, Font, Style } from "exceljs";

// WorkbookWriter is our own interface that reduces / limits
// the interface of ExcelJS to the pieces we use. This means
// there will be less to implement in the future if we need
// to create a different writer.
interface WorkbookWriter {
  addWorksheet: (name?: string) => WorksheetWriter;
  addWorksheet2: (name?: string) => WorksheetLinePrinter;
}

interface WorksheetWriter {
  setDateCell: (address: string, value: Date) => void;
  setStringCell: (address: string, value: string) => void;

  setRowHeight: (row: number, height: number) => void;
}

interface WorksheetLinePrinter {
  nextRow: (opts?: { height?: number }) => WorksheetLinePrinter;
  createRange: (name: string, style?: Partial<Style>) => WorksheetLinePrinter;
  addCell: (
    value: Date | string,
    style?: Partial<Style>
  ) => WorksheetLinePrinter;
  addBlankCell: () => WorksheetLinePrinter;
  addBlankCells: (n: number) => WorksheetLinePrinter;
  rangeComplete: () => void;
}

// This is a case of "the client defines the interface". The
// OCX.Model class is the concrete implementation, but we don't
// want OCX packages to depend directly on one another. So, we
// create the interface we need here.
interface Model {
  asOfDate: Date;
}

class Workbook {
  constructor(private workbook: WorkbookWriter, private model: Model) {
    this.workbook.addWorksheet("Summary Snapshot");
    this.workbook.addWorksheet("Detailed Snapshot");
    this.workbook.addWorksheet("Voting by SH Group");

    this.addContextSheet();
  }

  private addContextSheet() {
    const context = this.workbook.addWorksheet2("Context");

    context.nextRow({ height: 59.5 });

    context
      .createRange("context.header", {
        fill: this.headerFill,
        font: this.headerFont,
        border: this.headerBorder,
      })
      .addCell(this.model.asOfDate, {
        alignment: { vertical: "bottom", horizontal: "right" },
        numFmt: "yyyy.mm.dd;@",
      })
      .addBlankCell()
      .addCell("Context", {
        alignment: { vertical: "middle", horizontal: "left" },
      })
      .addBlankCells(3)
      .rangeComplete();
  }

  private get headerFill(): Fill {
    return {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "2a39c4" },
    };
  }

  private get headerFont(): Partial<Font> {
    return {
      name: "Calibri",
      bold: true,
      color: { argb: "ffffff" },
      size: 10,
    };
  }

  private get headerBorder(): Partial<Borders> {
    return {
      top: { style: "thin" },
      bottom: { style: "double" },
    };
  }
}

export default Workbook;
