// Subset of appconfig.json that's meant to be sent to front end.
struct FrontEndConfig {
  1: required string timeFormat,
  2: required string dateFormat,
}

struct Task {
  1: required string desc,
  2: required i16 pri, // 0 being highest priority
  3: required double time, // UNIX timestamp. 0 to indicate unset
}