'use strict';

var _ = require('lodash');
var Chord = require('./chord.model');
var Crawler = require('./chord.vnmylife.service');
var VnMylifeCrawler = require('./chord.vnmylife.crawl.service');
var VnMylifeMP3Crawler = require('./chord.vnmylife.mp3.crawl.service');
require('mongoose-query-paginate');

// Get list of chords
exports.index = function (req, res) {
  var limit = req.query.limit || 10;

  var sortBy = req.query.sortBy || 'title';
  var sortByAsc = req.query.asc || 1;
  var sort = {};
  sort[sortBy] = sortByAsc;

  var options = {
    perPage: limit,
    delta  : 3,
    page   : req.query.p
  };

  var query = Chord.find().sort(sort);
  query.paginate(options, function(err, chords) {
      if (err) {
        return handleError(res, err);
      }

      return res.status(200).json(chords.results);
  });
};

// Get a single chord
exports.show = function (req, res) {
  Chord.findById(req.params.id, function (err, chord) {
    if (err) {
      return handleError(res, err);
    }
    if (!chord) {
      return res.status(404).send('Not Found');
    }
    return res.json(chord);
  });
};

// Creates a new chord in the DB.
exports.create = function (req, res) {
  console.log("creating...." + req.body.title)
  Chord.create(req.body, function (err, chord) {
    if (err) {
      return handleError(res, err);
    }
    return res.status(201).json(chord);
  });
};

// Updates an existing chord in the DB.
exports.update = function (req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Chord.findById(req.params.id, function (err, chord) {
    if (err) {
      return handleError(res, err);
    }
    if (!chord) {
      return res.status(404).send('Not Found');
    }
    var updated = _.merge(chord, req.body);
    updated.save(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.status(200).json(chord);
    });
  });
};

// Deletes a chord from the DB.
exports.destroy = function (req, res) {
  Chord.findById(req.params.id, function (err, chord) {
    if (err) {
      return handleError(res, err);
    }
    if (!chord) {
      return res.status(404).send('Not Found');
    }
    chord.remove(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}

// anthe
exports.crawlVnMylifeAll = function (req, res) {
  Crawler.crawlAll();
}

exports.crawlVnMylife = function (req, res) {
  Crawler.crawl(req.params.rhythm, req.params.fromPage, req.params.limitPaganiation);
}

exports.recrawl = function (req, res) {
  Crawler.recrawl();
}

exports.crawlMp3 = function (req, res) {
  VnMylifeMP3Crawler.crawlMp3(req.params.fromPage, req.params.limitPaganiation);
}

// exports.cleanData = function (req, res) {
//   Crawler.cleanData();
// }

exports.findAllTitles = function (req, res) {
  Chord.find({}).select({title: 1, _id: 1}).exec(function (err, chords) {
    if (err) {
      return handleError(res, err);
    }

    console.log('findAllTitles: ' + chords);
    var count = 0;
    chords = chords.map(function (item) {
      count++;
      return item.title;
    })

    var resMap = {
      data: chords,
      validCount: count
    };

    return res.status(200).json(resMap);
  });
}

exports.findAllTitlesWithContent = function (req, res) {
  Chord.find({}).select({title: 1, content: 1}).exec(function (err, chords) {
    if (err) {
      return handleError(res, err);
    }

    var count = 0;
    chords = chords.map(function (item) {
      if (item.content.length < 2) return '';

      count++;
      return item.title;
    })


    var resMap = {
      data: chords,
      validCount: count
    };
    return res.status(200).json(resMap);
  });
}

exports.findChordsByGeneric = function (req, res) {
  var limit = req.query.limit || 10;

  var sortBy = req.query.sortBy || 'title';
  var sortByAsc = req.query.asc || 1;
  var sort = {};
  sort[sortBy] = sortByAsc;

  var options = {
    perPage: limit,
    delta  : 3,
    page   : req.query.p
  };
  var params = {}
  params[req.params.category] = req.params.categoryValue;

  var query = Chord.find(params).sort(sort);
  query.paginate(options, function(err, chords) {
      if (err) {
        return handleError(res, err);
      }

      return res.status(200).json(chords.results);
      // console.log(res); // => res = {
        //  options: options,               // paginate options
        //  results: [Document, ...],       // mongoose results
        //  current: 5,                     // current page number
        //  last: 12,                       // last page number
        //  prev: 4,                        // prev number or null
        //  next: 6,                        // next number or null
        //  pages: [ 2, 3, 4, 5, 6, 7, 8 ], // page numbers
        //  count: 125                      // document count
      //};
  });
};

exports.crawlAllValidChordsToUpsert = function(req, res){
  if (req.params.target == 'vnmylife'){
    VnMylifeCrawler.crawlAndPersist();
  }
}
