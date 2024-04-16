import Big from "big.js";

interface Issuance {
  object_type: string;
  security_id: string;
  date: string;
  quantity: string;
}

class TrancheCalculator {
  private dirty_: boolean;

  constructor(private issuance_: Issuance) {
    this.dirty_ = true;
  }

  private value_: Array<{
    date: string;
    trancheShares: Big;
    accumulatedShares: Big;
  }> = [];

  public get value(): typeof this.value_ {
    if (this.dirty_) {
      this.recalculate();
    }
    return this.value_;
  }

  private recalculate() {
    this.value_ = [
      {
        date: this.issuance_.date,
        trancheShares: Big(this.issuance_.quantity),
        accumulatedShares: Big(this.issuance_.quantity),
      },
    ];
  }
}

const Vesting = {
  TrancheCalculator,
};

export default Vesting;
