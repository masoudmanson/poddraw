var oDataConfig = {
    oDataService: "http://172.16.110.47:8080/report35/odata2.svc/",
    oDataCollections: {
      tagId: {
        name: "Sensor Ids",
        service: "GetSensorServices",
        attribute: "tagId"
      }
    }
  },
  reservedNames = ['tagId'];

var oDataRequestPromiseBase = function(url, query, format) {
  if (format == "undefined") {
    format = "$format=json";
  }

  return new Promise(function(resolve, reject) {
    o(url + "?" + query + format).get(function(data) {
      resolve(data);
    }, function(status) {
      reject(status);
    });
  });
};

var oDataRequest = function(params, callback) {
  var url = params.url,
    query = params.query,
    format = params.format;

  o(url + "?" + ((query != undefined) ? query : '') + ((format != undefined) ? "$format=" + format : '$format=json')).get(function(data) {
    callback && callback({
      hasError: false,
      data: data
    });
  }, function(status) {
    callback && callback({
      hasError: true,
      errorCode: status
    });
  });
};
