export function mockData( rows=1000 ){
    return new Array(rows).fill(null).map((_, idx) => {
        return {
            "col1": "column uno",
            "colint": parseInt((Math.random() * 100).toFixed(0)),
            "colFloat": parseFloat((Math.random() * 100).toFixed(3)),
            "colIncr": idx,
            "myPK": Math.random() > .6 ? "1" : "2",
            "myRK": idx.toString()
        }
    })
}