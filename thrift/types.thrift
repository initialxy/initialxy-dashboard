// Subset of appconfig.json that's meant to be sent to front end.
struct FrontEndConfig {
  1: required string timeFormat,
  2: required string dateFormat,
  3: required string dateShortFormat,
  4: required i32 numDataPointsInDay,
}

struct Task {
  1: required double id, // Use double in place of i64 due to quirks with thrift-typescript
  2: required double ord, // order of tasks in desc. So new task will go to top.
  3: required string desc,
  4: optional double timestamp, // UNIX timestamp.
}

struct Tasks {
  1: required list<Task> tasks,
}

struct StockDataPoint {
  1: required double max;
  2: required double min;
  3: required double open;
  4: required double close;
}

struct Stock {
  1: required double ord, // order of stocks in desc
  2: required string symbol,
  3: optional double curMarketPrice,
  4: optional double preDayClose, // closing price from previous trading day
  5: optional list<StockDataPoint> dataPoints,
}

struct Stocks {
  1: required list<Stock> stocks,
}