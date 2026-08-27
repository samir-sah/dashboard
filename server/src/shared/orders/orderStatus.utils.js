const normalizeOrderStatus = (status) => {
  if (status === "Dispatched") return "Shipped";
  return status || "Confirmed";
};

const normalizedLatestStatusExpr = {
  $switch: {
    branches: [
      {
        case: { $eq: [{ $last: "$statusHistory.status" }, "Dispatched"] },
        then: "Shipped",
      },
    ],
    default: { $ifNull: [{ $last: "$statusHistory.status" }, "Confirmed"] },
  },
};

const REAL_ORDER_FILTER = Object.freeze({ isInCart: false });

module.exports = {
  normalizeOrderStatus,
  normalizedLatestStatusExpr,
  REAL_ORDER_FILTER,
};
