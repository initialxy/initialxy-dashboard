// Subset of appconfig.json that's meant to be sent to front end.
struct FrontEndConfig {
  1: required string timeFormat,
  2: required string dateFormat,
}

struct Task {
  1: required i64 id,
  2: required i64 ord, // order of tasks in desc. So new task will go to top.
  3: required string desc,
  4: optional i64 time, // UNIX timestamp. 0 to indicate unset
}

struct Tasks {
  1: required list<Task> tasks,
}

struct Stock {
  1: required i64 ord, // order of stocks in desc
  2: required string symbol,
}

struct Stocks {
  1: required list<Stock> stocks,
}