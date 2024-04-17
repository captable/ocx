import Vesting from "src/model/vesting";
import OCX from "src";

import Big from "big.js";

import { describe, expect, test, jest } from "@jest/globals";

// This will be our base issuance for testing. All ISSUANCE types that support vesting will work
// the same way, so we will not test all `object_type` options.
const ISSUANCE = {
  object_type: "TX_EQUITY_COMPENSATION_ISSUANCE",
  security_id: "the-issuance",
  date: "2021-01-01",
  quantity: "4800",
};

describe(Vesting.TrancheCalculator, () => {
  // First we want to look at the simplest case: No Vesting Terms at all
  describe("No Vesting Terms - 100% vested on issuance", () => {
    const subject = new Vesting.TrancheCalculator(ISSUANCE);

    // When there are no VestingTerms, the security is assumed to be fully vested immediately upon
    // issuance
    test("Returns one tranche on date of issuance", () => {
      expect(subject.value).toEqual([
        {
          date: ISSUANCE.date,
          trancheShares: Big("4800"),
          accumulatedShares: Big("4800"),
        },
      ]);
    });

    // With no VestingTerms, there also should not be any TX_VESTING_EVENT transactions for
    // this security. Since this library assumes that OCF data has already been validated, we
    // simply ignore the vesting event.
    //
    // We could emit a warning message, but once we go down that road, how many validations
    // do we duplicate in this code? Thought: Maybe we add a `.unexpected` or some such method
    // to the Logger interface for tracking validations that aren't yet validations?
    test("Ignores vesting events", () => {
      subject.apply({
        object_type: "TX_VESTING_EVENT",
        security_id: ISSUANCE.security_id,
        quantity: "100",
        date: ISSUANCE.date,
      });

      expect(subject.value).toEqual([
        {
          date: ISSUANCE.date,
          trancheShares: Big("4800"),
          accumulatedShares: Big("4800"),
        },
      ]);
    });

    // This calculator is expected to also return tranches that have not yet been vested.
    // For starters we'll test this by setting the security's issuance date far in the future.
    // Eventually we'll add the ability to ask the TrancheCalculator to give us the tranches
    // "as of" a particular date.
    test("Includes unvested tranches", () => {
      const subject = new Vesting.TrancheCalculator({
        ...ISSUANCE,
        date: "9999-12-31",
      });

      expect(subject.value).toEqual([
        {
          date: "9999-12-31",
          trancheShares: Big("4800"),
          accumulatedShares: Big("0"),
        },
      ]);
    });
  });

  describe("Misuse conditions", () => {
    const subject = new Vesting.TrancheCalculator(ISSUANCE);

    // While our calculator pattern generally ignores Transactions that aren't relevant,
    // we still want to report certain cases through the Logger interface. In this case,
    // a Vesting Event associated with a different security matches an object type of
    // interest (TX_VESTING_EVENT), but not the security itself.
    test("Logs if vesting event associated with a different security is applied", () => {
      const mockLogger = {
        debug: jest.fn<typeof console.debug>(),
        info: jest.fn<typeof console.info>(),
        warn: jest.fn<typeof console.warn>(),
        error: jest.fn<typeof console.error>(),
      };

      OCX.Logger.logUsing(mockLogger);

      subject.apply({
        object_type: "TX_VESTING_EVENT",
        security_id: `not-${ISSUANCE.security_id}`,
        quantity: "100",
        date: ISSUANCE.date,
      });

      expect(subject.value).toEqual([
        {
          date: ISSUANCE.date,
          trancheShares: Big("4800"),
          accumulatedShares: Big("4800"),
        },
      ]);

      // eslint-disable-next-line no-console
      console.table(
        subject.value.map((row) => {
          return {
            date: row.date,
            trancheShares: row.trancheShares.toNumber(),
            accumulatedShares: row.accumulatedShares.toNumber(),
          };
        })
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Ignoring TX_VESTING_EVENT for other security"
      );
    });
  });
});
