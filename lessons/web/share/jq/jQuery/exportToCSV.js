// 11/02/2016 Utility to export CSV file directly from LessonPast.
// Requires HTML 5
// http://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
function exportToCSV(filename, rows) {
        var processRow = function (row) {
            var finalVal = '';
            for (var j = 0; j < row.length; j++) {
                var innerValue = row[j] === null ? '' : row[j].toString();
                if (row[j] instanceof Date) {
                    innerValue = row[j].toLocaleString();
                };
                var result = innerValue.replace(/"/g, '""');
                if (result.search(/("|,|\n)/g) >= 0)
                    result = '"' + result + '"';
                if (j > 0)
                    finalVal += ',';
                finalVal += result;
            }
            return finalVal + '\n';
        };

        var csvFile = '';
        for (var i = 0; i < rows.length; i++) {
            csvFile += processRow(rows[i]);
        }

			if (navigator.msSaveBlob) { // IE 10+
				var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
				navigator.msSaveBlob(blob, filename);
        } else {
            var link = document.createElement("a");
				var url;
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
					var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
					url = URL.createObjectURL(blob);
				}
				else{ // Safari
					url = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csvFile);
				}
				link.setAttribute("href", url);
				link.setAttribute("download", filename);
				link.setAttribute("target", "_blank");
				link.style.visibility = 'hidden';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
        }
    }
	 