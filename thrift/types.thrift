// Subset of appconfig.json that's meant to be sent to front end.
struct FrontEndConfig {
  1: required string timeFormat,
  2: required string dateFormat,
  3: required string dateShortFormat,
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

struct Stock {
  1: required double ord, // order of stocks in desc
  2: required string symbol,
}

struct Stocks {
  1: required list<Stock> stocks,
}