

// MongoDB remove duplicates
var duplicates = [];
result = db.chords.aggregate([
  { $match: { 
    creditUrl: { "$ne": '' }  
  }},
  { $group: { 
    _id: { creditUrl: "$creditUrl"}, 
    dups: { "$addToSet": "$_id" }, 
    count: { "$sum": 1 } 
  }}, 
  { $match: { 
    count: { "$gt": 1 }   
  }}
])
result.forEach(function(doc) {
    doc.dups.shift();     
    doc.dups.forEach( function(dupId){ 
        duplicates.push(dupId);   
        }
    )    
})
printjson(duplicates);     
db.chords.remove({_id:{$in:duplicates}})


// create unique index on creditUrl - each creditUrl should exist only 1
db.chords.createIndex( { creditUrl:1 }, { unique: true } )