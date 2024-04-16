import Vesting from "src/model/vesting";
import Big from "big.js";

import { describe, expect, test } from "@jest/globals";

const ISSUANCE = {
  object_type: "TX_EQUITY_COMPENSATION_ISSUANCE",
  security_id: "the-issuance",
  date: "2021-01-01",
  quantity: "4800",
};

describe("vesting", () => {
  describe("issuance-with-no-vesting-terms", () => {
    const subject = new Vesting.TrancheCalculator(ISSUANCE);

    test("vests 100% with one tranch on issuance date", () => {
      expect(subject.value).toEqual([
        {
          date: ISSUANCE.date,
          trancheShares: Big("4800"),
          accumulatedShares: Big("4800"),
        },
      ]);
    });
  });
});
