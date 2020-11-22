const fs = require("fs");

console.log('Start converter...');

const toCsv = () => {
    const rawJson = fs.readFileSync('../cocktails/cocktails.json');
    const content = JSON.parse(rawJson);
    const { data } = content;
    
    const csv = [
        '品項,中文名,token,key,signature,香氣,,口感,,關鍵字',
    ];
    
    data.map(e => {
        const { igtoken, key, keys, name, signature } = e;
        const { en, zh } = name;
        const item = `${en},${zh},${igtoken},${key},${signature},${keys.toString()}`;
        csv.push(item);
    });
    fs.writeFile("data.csv", csv.join("\r\n"), (err) => {
        console.log(err || "Finished data file");
    });
};

const toJson = () => {
    const rawCsv = fs.readFileSync('csvdata.csv');
    const rows = CSVToArray(rawCsv);

    const json = {
        "info": {
            "code": 0,
            "msg": "Cocktails list"
        },
        "next": null,
        "count": rows.length,
        "data": []
    };

    rows.map(e => {
        if (e[4] === 'TRUE') return;
        const keys = e.slice(5).filter(item => item);
        const itemTemplate =  {
            "igtoken": e[2],
            "key": e[3],
            "keys": [...keys, e[0], e[1]],
            "name": {
                "en": e[0],
                "zh": e[1]
            },
            "signature": e[4] === 'TRUE'
        }
        json.data.push(itemTemplate);
    });
    console.log('end converter...');
    fs.writeFile("data.json", JSON.stringify(json), 'utf8', (err) => {
        console.log(err || "Finished json file");
    });
};

// toCsv();
toJson();

console.log('Converter done');

/**
 * CSVToArray parses any String of Data including '\r' '\n' characters,
 * and returns an array with the rows of data.
 * @param {String} CSV_string - the CSV string you need to parse
 * @param {String} delimiter - the delimeter used to separate fields of data
 * @returns {Array} rows - rows of CSV where first row are column headers
 */
function CSVToArray (CSV_string, delimiter) {
    delimiter = (delimiter || ","); // user-supplied delimeter or default comma
 
    var pattern = new RegExp( // regular expression to parse the CSV values.
      ( // Delimiters:
        "(\\" + delimiter + "|\\r?\\n|\\r|^)" +
        // Quoted fields.
        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
        // Standard fields.
        "([^\"\\" + delimiter + "\\r\\n]*))"
      ), "gi"
    );
 
    var rows = [[]];  // array to hold our data. First row is column headers.
    // array to hold our individual pattern matching groups:
    var matches = false; // false if we don't find any matches
    // Loop until we no longer find a regular expression match
    while (matches = pattern.exec( CSV_string )) {
        var matched_delimiter = matches[1]; // Get the matched delimiter
        // Check if the delimiter has a length (and is not the start of string)
        // and if it matches field delimiter. If not, it is a row delimiter.
        if (matched_delimiter.length && matched_delimiter !== delimiter) {
          // Since this is a new row of data, add an empty row to the array.
          rows.push( [] );
        }
        var matched_value;
        // Once we have eliminated the delimiter, check to see
        // what kind of value was captured (quoted or unquoted):
        if (matches[2]) { // found quoted value. unescape any double quotes.
         matched_value = matches[2].replace(
           new RegExp( "\"\"", "g" ), "\""
         );
        } else { // found a non-quoted value
          matched_value = matches[3];
        }
        // Now that we have our value string, let's add
        // it to the data array.
        rows[rows.length - 1].push(matched_value);
    }
    return rows; // Return the parsed data Array
 }


