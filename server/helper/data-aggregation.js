module.exports = class DataAggregation {
  constructor(data, column = "letter") {
    this.data = data;
    this.column = column;
  }

  aggregateGroup(aggregation, groupBy) {
    if (groupBy) {
      return aggregation
        .group({
          _id: `$${groupBy}`,
          minFreq: { $min: "$frequency" },
          maxFreq: { $max: "$frequency" },
          sumFreq: { $sum: "$frequency" },
          avgFreq: { $avg: "$frequency" },
          countFreq: { $sum: 1 }
        })
        .collation({ locale: "id" })
        .sort({ _id: 1 });
    }
    let sort = {};
    sort[this.column] = 1;
    return aggregation.collation({ locale: "id" }).sort(sort);
  }

  aggregateFilter(aggregation, filter) {
    if (filter) {
      return aggregation.match(filter);
    }
    return aggregation;
  }

  countData(groupBy, filter) {
    let aggregation = this.data.aggregate();
    aggregation = this.aggregateGroup(aggregation, groupBy);
    aggregation = this.aggregateFilter(aggregation, filter);
    return aggregation.count("count").exec();
  }

  getData(groupBy, limit, skip, filter) {
    let aggregation = this.data.aggregate();
    aggregation = this.aggregateGroup(aggregation, groupBy);
    aggregation = this.aggregateFilter(aggregation, filter);
    return aggregation
      .skip(skip)
      .limit(limit)
      .exec();
  }
};
