class TimeConverter {
  static millisecsToMinuteFormat(millisecs) {
    const minutes = millisecs / 60000;
    return `${minutes}m`;
  }

  static minuteFormatToMillisecs(minuteStr) {
    const minutes = parseFloat(minuteStr.slice(0, -1));
    return minutes * 60000;
  }
}

module.exports = TimeConverter;
